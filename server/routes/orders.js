import { Router } from 'express';
import multer from 'multer';
import supabase, { BUCKET } from '../lib/supabase.js';
import { scaleSTL, isSTL } from '../lib/stlUtils.js';

const router = Router();

// Keep uploaded file in memory (never written to disk).
// 100 MB cap — adjust if customers have larger files.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * POST /api/orders
 * multipart/form-data fields:
 *   stlFile   – the 3D model file (required)
 *   orderData – JSON string of the order payload (required)
 *
 * On success saves the file to Supabase Storage and the order to the DB.
 * Returns { orderId, ref, stlOriginalPath, stlScaledPath }.
 *
 * If anything fails the order is NOT saved — the client should show an error.
 */
router.post('/', upload.single('stlFile'), async (req, res) => {
  try {
    // ── 1. Parse payload ─────────────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({ error: 'stlFile is required' });
    }
    if (!req.body.orderData) {
      return res.status(400).json({ error: 'orderData is required' });
    }

    let order;
    try {
      order = JSON.parse(req.body.orderData);
    } catch {
      return res.status(400).json({ error: 'orderData is not valid JSON' });
    }

    const { id, ref, scalePct = 100 } = order;
    if (!id || !ref) {
      return res.status(400).json({ error: 'orderData must include id and ref' });
    }

    // ── 2. Upload original STL ────────────────────────────────────────────────
    const originalPath = `orders/${id}/original.${req.file.originalname.split('.').pop().toLowerCase()}`;

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(originalPath, req.file.buffer, {
        contentType: req.file.mimetype || 'model/stl',
        upsert: true,
      });

    if (uploadErr) {
      console.error('Supabase Storage upload error:', uploadErr);
      return res.status(502).json({ error: 'Failed to upload file to storage: ' + uploadErr.message });
    }

    // ── 3. Upload scaled STL (only if scale ≠ 100% and file is STL) ──────────
    let scaledPath = null;
    if (scalePct !== 100 && isSTL(req.file.originalname)) {
      try {
        const scaledBuffer = scaleSTL(req.file.buffer, scalePct / 100);
        scaledPath = `orders/${id}/scaled_${scalePct}pct.stl`;

        const { error: scaledErr } = await supabase.storage
          .from(BUCKET)
          .upload(scaledPath, scaledBuffer, {
            contentType: 'model/stl',
            upsert: true,
          });

        if (scaledErr) {
          // Non-fatal: log and continue without scaled file
          console.warn('Scaled STL upload failed (non-fatal):', scaledErr.message);
          scaledPath = null;
        }
      } catch (scaleErr) {
        console.warn('STL scaling failed (non-fatal):', scaleErr.message);
        scaledPath = null;
      }
    }

    // ── 4. Build final metadata (strip in-memory base64, add storage paths) ───
    const metadata = {
      ...order,
      stlOriginalPath: originalPath,
      stlScaledPath:   scaledPath,
      modelFile: order.modelFile
        ? {
            name:       order.modelFile.name,
            sizeBytes:  order.modelFile.sizeBytes,
            sizeMB:     order.modelFile.sizeMB,
            scale:      order.modelFile.scale,
            scalePct:   order.modelFile.scalePct,
            stored:     true,
            // data field intentionally omitted — file lives in Supabase Storage
          }
        : null,
    };

    // ── 5. Insert order row ───────────────────────────────────────────────────
    const { error: dbErr } = await supabase
      .from('orders')
      .insert({
        id,
        ref,
        status:           'pending_verification',
        customer_email:   order.customer?.email || null,
        total_price_crc:  order.quote?.totalPrice || 0,
        scale_pct:        scalePct,
        stl_original_path: originalPath,
        stl_scaled_path:   scaledPath,
        metadata,
      });

    if (dbErr) {
      // DB insert failed — try to remove uploaded files to avoid orphans
      await supabase.storage.from(BUCKET).remove([originalPath]);
      if (scaledPath) await supabase.storage.from(BUCKET).remove([scaledPath]);
      console.error('DB insert error:', dbErr);
      return res.status(502).json({ error: 'Failed to save order: ' + dbErr.message });
    }

    // ── 6. Log initial status ─────────────────────────────────────────────────
    await supabase
      .from('order_status_log')
      .insert({ order_id: id, old_status: null, new_status: 'pending_verification', changed_by: 'system' });

    res.status(201).json({
      orderId:         id,
      ref,
      stlOriginalPath: originalPath,
      stlScaledPath:   scaledPath,
    });

  } catch (err) {
    console.error('Unexpected error in POST /api/orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
