import { Router }    from 'express';
import multer         from 'multer';
import { randomUUID } from 'crypto';
import supabase, { BUCKET } from '../lib/supabase.js';
import { scaleSTL, isSTL }  from '../lib/stlUtils.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 100 * 1024 * 1024 },
});

// ── POST /api/orders ──────────────────────────────────────────────────────────
// Accepts multipart/form-data: stlFile (File) + orderData (JSON string).
//
// Key schema facts this code respects:
//   - orders.id            → we supply a server-generated UUID so it matches
//                            the Storage folder name (orders/{id}/original.stl)
//   - orders.reference_number → SERIAL — never passed in; returned by .select()
//   - order_status_log columns: from_status / to_status / changed_by / note
//   - All price columns are INTEGER (CRC) — floats are rounded
//   - metadata column is JSONB — optional, added non-fatally
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', upload.single('stlFile'), async (req, res) => {
  try {
    // ── 1. Parse & validate payload ───────────────────────────────────────────
    if (!req.file)           return res.status(400).json({ error: 'stlFile is required' });
    if (!req.body.orderData) return res.status(400).json({ error: 'orderData is required' });

    let order;
    try { order = JSON.parse(req.body.orderData); }
    catch { return res.status(400).json({ error: 'orderData is not valid JSON' }); }

    const { scalePct = 100 } = order;

    // ── 2. Single UUID for BOTH the DB row and the Storage folder ────────────
    // Using the same value guarantees: DB.id === Storage path prefix, so the
    // download endpoint can always reconstruct or verify the path from the id.
    const orderId = randomUUID();

    // ── 3. Upload original STL — instrumented for debugging ──────────────────
    const ext = (req.file.originalname || 'model.stl').split('.').pop().toLowerCase();
    const originalPath = `orders/${orderId}/original.${ext}`;
    let storedOriginalPath = null;

    console.log('\n[STL Upload] ═══ Starting upload ═══')
    console.log('[STL Upload] req.file exists:', !!req.file)
    console.log('[STL Upload] File name:', req.file?.originalname)
    console.log('[STL Upload] File size (bytes):', req.file?.buffer?.length)
    console.log('[STL Upload] BUCKET value:', BUCKET)
    console.log('[STL Upload] Target path:', originalPath)
    console.log('[STL Upload] Supabase client exists:', !!supabase)
    console.log('[STL Upload] Supabase storage exists:', !!supabase?.storage)

    try {
      const uploadResult = await supabase.storage
        .from(BUCKET)
        .upload(originalPath, req.file.buffer, {
          contentType: req.file.mimetype || 'application/octet-stream',
          upsert: true,
        })

      console.log('[STL Upload] Full result:', JSON.stringify(uploadResult, null, 2))

      if (uploadResult.error) {
        console.error('[STL Upload] ❌ FAILED:', uploadResult.error.message)
        console.error('[STL Upload] Error details:', JSON.stringify(uploadResult.error))
        storedOriginalPath = null
      } else {
        storedOriginalPath = originalPath
        console.log('[STL Upload] ✅ SUCCESS — stored at:', storedOriginalPath)
      }
    } catch (ex) {
      console.error('[STL Upload] ❌ EXCEPTION:', ex.message)
      console.error('[STL Upload] Stack:', ex.stack)
      storedOriginalPath = null
    }

    console.log('[STL Upload] Final storedOriginalPath:', storedOriginalPath)
    console.log('[STL Upload] ═══════════════════════════\n')

    // ── 4. Upload scaled copy — non-fatal, only if original succeeded ─────────
    let scaledPath = null;
    if (storedOriginalPath && scalePct !== 100 && isSTL(req.file.originalname)) {
      try {
        const scaledBuffer = scaleSTL(req.file.buffer, scalePct / 100);
        const candidate    = `orders/${orderId}/scaled_${scalePct}pct.stl`;
        const { error: scaledErr } = await supabase.storage
          .from(BUCKET)
          .upload(candidate, scaledBuffer, { contentType: 'model/stl', upsert: true });
        if (scaledErr) console.warn('[Scaled STL upload failed — non-fatal]', scaledErr.message);
        else           scaledPath = candidate;
      } catch (ex) {
        console.warn('[STL scaling exception — non-fatal]', ex.message);
      }
    }

    // ── 5. Build flat insert object — only valid schema columns ──────────────
    const breakdown = order.admin?.breakdown || {};
    const delivery  = order.delivery || {};

    const dimRaw = (order.quote?.dimensions || '').replace(' mm', '').split(' × ').map(Number);
    const [dimX, dimY, dimZ] = dimRaw.length === 3 ? dimRaw : [null, null, null];

    const technology = (order.quote?.material || '').toLowerCase().includes('resina')
      ? 'sla' : 'fdm';

    // id supplied explicitly so DB row and Storage path share the same UUID;
    // reference_number is SERIAL — never passed in, returned by .select()
    const insertData = {
      id:             orderId,
      order_status:   'pending_verification',
      payment_status: 'pending',

      customer_email:   order.customer?.email   || null,
      customer_name:    order.customer?.name    || null,
      customer_phone:   order.customer?.phone   || null,
      customer_company: order.customer?.company || null,

      original_filename:  order.modelFile?.name || null,
      scale_applied:      scalePct,
      dimensions_x_mm:    Number.isNaN(dimX) ? null : dimX,
      dimensions_y_mm:    Number.isNaN(dimY) ? null : dimY,
      dimensions_z_mm:    Number.isNaN(dimZ) ? null : dimZ,
      weight_original_g:  order.admin?.weightG          || null,
      weight_effective_g: order.admin?.effectiveWeightG || null,

      stl_original_path: storedOriginalPath,
      stl_scaled_path:   scaledPath,

      technology,
      material:          order.quote?.material || null,
      color:             order.quote?.color    || null,
      quantity:          order.quote?.quantity || 1,
      supports_required: order.admin?.needsSupports || false,
      printer_assigned:  order.admin?.printer?.name || null,
      print_time_min:    Math.round((order.admin?.printHours || 0) * 60),

      unit_price_crc:        Math.round(order.quote?.unitPrice  || 0),
      total_price_crc:       Math.round(order.quote?.totalPrice || 0),
      cost_material_crc:     Math.round(breakdown.materialBase  || 0),
      cost_support_crc:      Math.round(breakdown.supportMat    || 0),
      cost_electricity_crc:  Math.round(breakdown.electricity   || 0),
      cost_labor_crc:        Math.round(breakdown.labor         || 0),
      cost_amortization_crc: Math.round(breakdown.amortization  || 0),
      cost_failures_crc:     Math.round(breakdown.failureCost   || 0),
      is_urgent: (order.quote?.urgency || 'normal') !== 'normal',

      payment_method:       order.payment?.method            || 'sinpe',
      sinpe_number:         order.payment?.sinpeConfirmation || null,
      sinpe_screenshot_path: null,

      delivery_type:      delivery.method       || null,
      delivery_province:  delivery.province     || null,
      delivery_canton:    delivery.canton       || null,
      delivery_district:  delivery.district     || null,
      delivery_address:   delivery.exactAddress || delivery.branchAddress || null,
      delivery_branch:    delivery.branch       || null,
      delivery_recipient: delivery.fullName     || null,
      delivery_cedula:    delivery.cedula       || null,
      delivery_notes:     delivery.additionalNotes || null,
    };

    // metadata is JSONB — add non-fatally in case the column was added later
    try { insertData.metadata = order; } catch { /* column may not exist yet */ }

    // ── 6. Insert and get back DB-generated id + reference_number ────────────
    console.log('[DB insert] columns:', Object.keys(insertData).join(', '));

    const { data, error: dbErr } = await supabase
      .from('orders')
      .insert(insertData)
      .select('id, reference_number')
      .single();

    if (dbErr) {
      console.error('[DB insert failed]', dbErr.message);
      console.error('[DB insert data]\n', JSON.stringify(insertData, null, 2));
      const toRemove = [storedOriginalPath, scaledPath].filter(Boolean);
      if (toRemove.length) await supabase.storage.from(BUCKET).remove(toRemove);
      return res.status(502).json({ error: 'Failed to save order: ' + dbErr.message });
    }

    // ── 7. Log initial status (correct column names: from_status / to_status) ─
    await supabase.from('order_status_log').insert({
      order_id:    data.id,
      from_status: null,
      to_status:   'pending_verification',
      changed_by:  'system',
      note:        'Order created',
    });

    res.status(201).json({
      orderId:         data.id,
      referenceNumber: data.reference_number,
      stlOriginalPath: storedOriginalPath,
      stlScaledPath:   scaledPath,
    });

  } catch (err) {
    console.error('[POST /api/orders unexpected error]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
