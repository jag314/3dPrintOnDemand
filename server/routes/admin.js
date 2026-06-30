import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import supabase, { BUCKET } from '../lib/supabase.js';

const router = Router();

// All /api/admin/* routes require a valid admin JWT
router.use(requireAdmin);

// ── Helpers ───────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Look up an order by UUID (id) or by integer (reference_number). */
async function findOrder(paramId, columns) {
  const base = supabase.from('orders').select(columns);
  const isUUID = UUID_RE.test(paramId);
  const { data, error } = isUUID
    ? await base.eq('id', paramId).single()
    : await base.eq('reference_number', Number(paramId)).single();
  return { row: data, error };
}

async function getSignedUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60);  // 60-second expiry
  if (error) throw new Error('Signed URL error: ' + error.message);
  return data.signedUrl;
}

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select([
        'id',
        'reference_number',
        'order_status',
        'created_at',
        'customer_email',
        'customer_name',
        'total_price_crc',
        'scale_applied',
        'stl_original_path',
        'stl_scaled_path',
        'sinpe_screenshot_path',
        'metadata',
      ].join(', '))
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    const orders = (data || []).map(row => ({
      // Spread stored payload first, then override with authoritative DB values
      ...(row.metadata || {}),
      id:     row.id,
      ref:    row.reference_number != null ? `#${row.reference_number}` : (row.metadata?.ref || '—'),
      status: row.order_status,
      stlOriginalPath:  row.stl_original_path,
      stlScaledPath:    row.stl_scaled_path,
      screenshotPath:   row.sinpe_screenshot_path || null,
    }));

    res.json({ orders });
  } catch (err) {
    console.error('[GET /api/admin/orders]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/orders/:id/download/:type ──────────────────────────────────
// :id  can be a UUID or a reference_number integer
// :type  "original" | "scaled" | "screenshot"
router.get('/orders/:id/download/:type', requireAdmin, async (req, res) => {
  try {
    const { id, type } = req.params;

    if (type !== 'original' && type !== 'scaled' && type !== 'screenshot') {
      return res.status(400).json({ error: 'type must be "original", "scaled", or "screenshot"' });
    }

    const cols = 'id, reference_number, stl_original_path, stl_scaled_path, sinpe_screenshot_path, original_filename, scale_applied, metadata';

    const { row, error } = await findOrder(id, cols);

    if (error || !row) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const storagePath = type === 'original'    ? row.stl_original_path
                      : type === 'scaled'      ? row.stl_scaled_path
                      : row.sinpe_screenshot_path;

    if (!storagePath) {
      return res.status(404).json({
        error: type === 'screenshot'
          ? 'No hay comprobante de pago almacenado para este pedido.'
          : type === 'original'
          ? 'El archivo STL no fue almacenado para este pedido.'
          : 'No hay versión escalada almacenada para este pedido.',
      });
    }

    const url = await getSignedUrl(storagePath);

    let fileName;
    if (type === 'screenshot') {
      const ext = storagePath.split('.').pop() || 'jpg';
      fileName = `comprobante_${row.reference_number || row.id.slice(-6)}.${ext}`;
    } else {
      const baseName = (row.original_filename || row.metadata?.modelFile?.name || 'model')
        .replace(/\.[^.]+$/, '');
      fileName = type === 'original'
        ? `${baseName}_original.stl`
        : `${baseName}_scaled_${row.scale_applied}pct.stl`;
    }

    res.json({ url, fileName });
  } catch (err) {
    console.error('DOWNLOAD ERROR:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/admin/orders/:id/status ────────────────────────────────────────
router.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    // Fetch current status before updating (needed for the log row)
    const { row: current } = await findOrder(req.params.id, 'id, order_status');
    if (!current) return res.status(404).json({ error: 'Order not found' });

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ order_status: status })
      .eq('id', current.id);

    if (updateErr) throw updateErr;

    // Append transition to status log
    await supabase.from('order_status_log').insert({
      order_id:    current.id,
      from_status: current.order_status || null,
      to_status:   status,
      changed_by:  req.admin?.sub || 'admin',
      note:        `Status changed to ${status}`,
    });

    res.json({ success: true, orderId: current.id, newStatus: status });
  } catch (err) {
    console.error('[PATCH /api/admin/orders/:id/status]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/settings ───────────────────────────────────────────────────
router.put('/settings', async (req, res) => {
  const allowed = [
    'business_name','email','whatsapp','address','currency',
    'apply_vat','vat_rate','commercial_markup','urgency_semi','urgency_urgent',
    'minimum_price','quote_valid_days','welcome_message','response_time_h',
    'notification_email','low_stock_alert',
    'support_light_mat','support_light_time',
    'support_moderate_mat','support_moderate_time',
    'support_heavy_mat','support_heavy_time',
    'infill_weight_factor',
  ];
  const update = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
  );
  update.updated_at = new Date().toISOString();
  try {
    const { data, error } = await supabase.from('settings').update(update).eq('id', 1).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[PUT /api/admin/settings]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/printers ───────────────────────────────────────────────────
router.get('/printers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('printers').select('*').order('sort_order');
    if (error) throw error;
    res.json({ printers: data || [] });
  } catch (err) {
    console.error('[GET /api/admin/printers]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/printers ──────────────────────────────────────────────────
router.post('/printers', async (req, res) => {
  const { created_at: _ca, ...row } = req.body || {};
  row.updated_at = new Date().toISOString();
  try {
    const { data, error } = await supabase.from('printers').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/admin/printers]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/printers/:id ───────────────────────────────────────────────
router.put('/printers/:id', async (req, res) => {
  const { id } = req.params;
  const { id: _id, created_at: _ca, ...updates } = req.body || {};
  updates.updated_at = new Date().toISOString();
  try {
    const { data, error } = await supabase.from('printers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Printer not found' });
    res.json(data);
  } catch (err) {
    console.error('[PUT /api/admin/printers/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/printers/:id ───────────────────────────────────────────
router.delete('/printers/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('printers').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/printers/:id]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/materials ──────────────────────────────────────────────────
router.get('/materials', async (req, res) => {
  try {
    const { data, error } = await supabase.from('materials').select('*').order('sort_order');
    if (error) throw error;
    res.json({ materials: data || [] });
  } catch (err) {
    console.error('[GET /api/admin/materials]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/admin/materials ─────────────────────────────────────────────────
router.post('/materials', async (req, res) => {
  const { created_at: _ca, ...row } = req.body || {};
  row.updated_at = new Date().toISOString();
  try {
    const { data, error } = await supabase.from('materials').insert(row).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[POST /api/admin/materials]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/materials/:name ────────────────────────────────────────────
router.put('/materials/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const { name: _n, created_at: _ca, ...updates } = req.body || {};
  updates.updated_at = new Date().toISOString();
  try {
    const { data, error } = await supabase.from('materials').update(updates).eq('name', name).select().single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Material not found' });
    res.json(data);
  } catch (err) {
    console.error('[PUT /api/admin/materials/:name]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/admin/materials/:name ─────────────────────────────────────────
router.delete('/materials/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  try {
    const { error } = await supabase.from('materials').delete().eq('name', name);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/materials/:name]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/shipping/config ───────────────────────────────────────────
router.get('/shipping/config', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipping_config')
      .select('*')
      .eq('carrier', 'correos_cr')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[GET /api/admin/shipping/config]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/admin/shipping/config ───────────────────────────────────────────
router.put('/shipping/config', async (req, res) => {
  const { margin_percent, packaging_weight_g } = req.body || {};
  if (margin_percent == null || packaging_weight_g == null) {
    return res.status(400).json({ error: 'margin_percent and packaging_weight_g are required' });
  }
  try {
    const { data, error } = await supabase
      .from('shipping_config')
      .update({
        margin_percent:     Number(margin_percent),
        packaging_weight_g: Number(packaging_weight_g),
        updated_at:         new Date().toISOString(),
        updated_by:         req.admin?.sub || 'admin',
      })
      .eq('carrier', 'correos_cr')
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[PUT /api/admin/shipping/config]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/shipping/rates ────────────────────────────────────────────
router.get('/shipping/rates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('carrier', 'correos_cr')
      .order('destination_zone');
    if (error) throw error;
    res.json({ rates: data || [] });
  } catch (err) {
    console.error('[GET /api/admin/shipping/rates]', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
