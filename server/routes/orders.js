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
// Accepts multipart/form-data: stlFile (File) + screenshotFile (optional image) + orderData (JSON string).
//
// Key schema facts this code respects:
//   - orders.id            → we supply a server-generated UUID so it matches
//                            the Storage folder name (orders/{id}/original.stl)
//   - orders.reference_number → SERIAL — never passed in; returned by .select()
//   - order_status_log columns: from_status / to_status / changed_by / note
//   - All price columns are INTEGER (CRC) — floats are rounded
//   - metadata column is JSONB — optional, added non-fatally
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', upload.fields([{ name:'stlFile', maxCount:1 }, { name:'screenshotFile', maxCount:1 }]), async (req, res) => {
  try {
    // ── 1. Parse & validate payload ───────────────────────────────────────────
    const stlFile = req.files?.stlFile?.[0];
    if (!stlFile)            return res.status(400).json({ error: 'stlFile is required' });
    if (!req.body.orderData) return res.status(400).json({ error: 'orderData is required' });

    let order;
    try { order = JSON.parse(req.body.orderData); }
    catch { return res.status(400).json({ error: 'orderData is not valid JSON' }); }

    const { scalePct = 100 } = order;

    // ── 2. Single UUID for BOTH the DB row and the Storage folder ────────────
    const orderId = randomUUID();

    // ── 3. Upload original STL ───────────────────────────────────────────────
    const ext = (stlFile.originalname || 'model.stl').split('.').pop().toLowerCase();
    const originalPath = `orders/${orderId}/original.${ext}`;
    let storedOriginalPath = null;

    try {
      const uploadResult = await supabase.storage
        .from(BUCKET)
        .upload(originalPath, stlFile.buffer, {
          contentType: stlFile.mimetype || 'application/octet-stream',
          upsert: true,
        });

      if (uploadResult.error) {
        console.error('[STL Upload] FAILED:', uploadResult.error.message);
        return res.status(500).json({
          error: 'No se pudo guardar el archivo STL. Por favor intentá de nuevo.',
          detail: uploadResult.error.message,
        });
      }

      storedOriginalPath = originalPath;
    } catch (ex) {
      console.error('[STL Upload] EXCEPTION:', ex.message);
      return res.status(500).json({
        error: 'No se pudo guardar el archivo STL. Por favor intentá de nuevo.',
        detail: ex.message,
      });
    }

    // ── 4. Upload scaled copy — non-fatal, only if original succeeded ─────────
    let scaledPath = null;
    if (storedOriginalPath && scalePct !== 100 && isSTL(stlFile.originalname)) {
      try {
        const scaledBuffer = scaleSTL(stlFile.buffer, scalePct / 100);
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

    // ── 4b. Upload SINPE screenshot — non-fatal ───────────────────────────────
    let screenshotStoragePath = null;
    const screenshotFile = req.files?.screenshotFile?.[0];
    if (screenshotFile) {
      try {
        const ssExt  = (screenshotFile.originalname || 'screenshot.jpg').split('.').pop().toLowerCase();
        const ssPath = `orders/${orderId}/sinpe_screenshot.${ssExt}`;
        const { error: ssErr } = await supabase.storage
          .from(BUCKET)
          .upload(ssPath, screenshotFile.buffer, {
            contentType: screenshotFile.mimetype || 'image/jpeg',
            upsert: true,
          });
        if (ssErr) console.warn('[Screenshot upload failed — non-fatal]', ssErr.message);
        else       screenshotStoragePath = ssPath;
      } catch (ex) {
        console.warn('[Screenshot upload exception — non-fatal]', ex.message);
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
      sinpe_screenshot_path: screenshotStoragePath,

      requires_invoice:    order.invoice?.requiresInvoice || false,
      invoice_type:        order.invoice?.type            || null,
      invoice_name:        order.invoice?.name            || null,
      invoice_id_number:   order.invoice?.idNumber        || null,
      invoice_email:       order.invoice?.email           || null,
      tax_crc:             Math.round(order.quote?.taxCrc || 0),

      delivery_cost_crc:  Math.round(delivery.cost_crc || 0),

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
    const { data, error: dbErr } = await supabase
      .from('orders')
      .insert(insertData)
      .select('id, reference_number')
      .single();

    if (dbErr) {
      console.error('[DB insert failed]', dbErr.message);
      const toRemove = [storedOriginalPath, scaledPath].filter(Boolean);
      if (toRemove.length) await supabase.storage.from(BUCKET).remove(toRemove);
      return res.status(502).json({ error: 'Failed to save order: ' + dbErr.message });
    }

    // ── 7. Log initial status ─────────────────────────────────────────────────
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
