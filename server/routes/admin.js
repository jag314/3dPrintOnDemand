import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import supabase, { BUCKET } from '../lib/supabase.js';

const router = Router();

// All /api/admin/* routes require a valid admin JWT.
router.use(requireAdmin);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSignedUrl(storagePath, expiresIn = 60) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw new Error('Storage signed-URL error: ' + error.message);
  return data.signedUrl;
}

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
// Returns all orders, newest first, in the frontend-compatible shape.
router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, ref, status, created_at, customer_email, total_price_crc, scale_pct, stl_original_path, stl_scaled_path, metadata')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    // Reshape: merge DB columns into the metadata object so the frontend
    // receives a uniform order shape regardless of how it was originally saved.
    const orders = (data || []).map(row => ({
      ...row.metadata,
      id:     row.id,
      ref:    row.ref,
      status: row.status,            // always use DB status (may have been updated)
      stlOriginalPath: row.stl_original_path,
      stlScaledPath:   row.stl_scaled_path,
    }));

    res.json({ orders });
  } catch (err) {
    console.error('GET /api/admin/orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/orders/:id/download/original ───────────────────────────────
// Returns a 60-second signed URL to download the original STL from Supabase Storage.
router.get('/orders/:id/download/original', async (req, res) => {
  try {
    const { data: row, error } = await supabase
      .from('orders')
      .select('ref, stl_original_path, metadata')
      .eq('id', req.params.id)
      .single();

    if (error || !row) return res.status(404).json({ error: 'Order not found' });
    if (!row.stl_original_path) return res.status(404).json({ error: 'No original file stored for this order' });

    const signedUrl = await getSignedUrl(row.stl_original_path);
    const fileName  = row.metadata?.modelFile?.name || `${row.ref}_original.stl`;

    res.json({ url: signedUrl, fileName });
  } catch (err) {
    console.error('download/original error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/orders/:id/download/scaled ─────────────────────────────────
// Returns a 60-second signed URL to download the scale-baked STL.
// Returns 404 if no scaled file exists (scale was 100% or file was non-STL).
router.get('/orders/:id/download/scaled', async (req, res) => {
  try {
    const { data: row, error } = await supabase
      .from('orders')
      .select('ref, stl_scaled_path, scale_pct, metadata')
      .eq('id', req.params.id)
      .single();

    if (error || !row) return res.status(404).json({ error: 'Order not found' });
    if (!row.stl_scaled_path) return res.status(404).json({ error: 'No scaled file stored for this order' });

    const signedUrl = await getSignedUrl(row.stl_scaled_path);
    const baseName  = (row.metadata?.modelFile?.name || 'model').replace(/\.[^.]+$/, '');
    const fileName  = `${baseName}_scaled_${row.scale_pct}pct.stl`;

    res.json({ url: signedUrl, fileName });
  } catch (err) {
    console.error('download/scaled error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/admin/orders/:id/status ────────────────────────────────────────
// Updates order status and appends a row to order_status_log.
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status is required' });

    // Fetch current status for the log
    const { data: current } = await supabase
      .from('orders')
      .select('status')
      .eq('id', req.params.id)
      .single();

    const { error: updateErr } = await supabase
      .from('orders')
      .update({ status, metadata: supabase.rpc ? undefined : undefined })  // status column update
      .eq('id', req.params.id);

    if (updateErr) throw updateErr;

    // Also update status inside metadata so the frontend object stays consistent
    await supabase.rpc('update_order_status_in_metadata', {
      p_id: req.params.id,
      p_status: status,
    }).catch(() => {
      // If the RPC doesn't exist yet, do a raw JSONB update
      return supabase.from('orders')
        .update({ metadata: supabase.sql`metadata || jsonb_build_object('status', ${status})` })
        .eq('id', req.params.id);
    });

    // Log the transition
    await supabase.from('order_status_log').insert({
      order_id:   req.params.id,
      old_status: current?.status || null,
      new_status: status,
      changed_by: req.admin?.sub || 'admin',
    });

    res.json({ success: true, orderId: req.params.id, newStatus: status });
  } catch (err) {
    console.error('PATCH /api/admin/orders/:id/status error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
