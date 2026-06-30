import { Router }    from 'express';
import multer         from 'multer';
import { randomUUID } from 'crypto';
import path           from 'path';
import { Resend }     from 'resend';
import supabase, { BUCKET } from '../lib/supabase.js';
import { R2_PREFIX, uploadFile as r2Upload, getSignedDownloadUrl as r2SignedUrl } from '../lib/r2.js';

const USE_R2 = process.env.STORAGE_PROVIDER === 'r2';

const router = Router();

const ALLOWED_EXTS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'stl', 'obj', '3mf',
  'pdf',
]);

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (ALLOWED_EXTS.has(ext)) return cb(null, true);
    cb(Object.assign(new Error(`Tipo de archivo no permitido: .${ext}`), { code: 'INVALID_EXT' }));
  },
});

// Promisify multer so errors land in our try/catch
function runMulter(req, res) {
  return new Promise((resolve, reject) => {
    upload.array('attachments', 5)(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function sanitizeFilename(name) {
  const base = path.basename(name);
  return base
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .slice(0, 100);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── POST /api/contact ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  // Run multer first so file-level errors (size, ext) are caught below
  try {
    await runMulter(req, res);
  } catch (multerErr) {
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Archivo demasiado grande. Máximo 50 MB por archivo.' });
    }
    if (multerErr.code === 'INVALID_EXT') {
      return res.status(400).json({ error: multerErr.message });
    }
    console.error('[contact] multer error:', multerErr.message);
    return res.status(400).json({ error: 'Error al procesar el archivo adjunto.' });
  }

  try {
    const { nombre, email, empresa, servicio, mensaje } = req.body;

    if (!nombre?.trim())  return res.status(400).json({ error: 'Nombre es requerido.' });
    if (!email?.trim())   return res.status(400).json({ error: 'Email es requerido.' });
    if (!mensaje?.trim()) return res.status(400).json({ error: 'Mensaje es requerido.' });
    if (!EMAIL_RE.test(email.trim())) return res.status(400).json({ error: 'Formato de email inválido.' });

    // ── Double-check extensions server-side (belt + suspenders) ──────────────
    for (const file of req.files || []) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTS.has(ext)) {
        return res.status(400).json({ error: `Tipo de archivo no permitido: .${ext}` });
      }
    }

    // ── Upload each attachment to Supabase Storage ────────────────────────────
    const attachments = [];

    for (const file of req.files || []) {
      const safeFilename  = sanitizeFilename(file.originalname);
      const uuid          = randomUUID();
      const storagePath   = `${USE_R2 ? R2_PREFIX : ''}contact/${uuid}/${safeFilename}`;

      if (USE_R2) {
        try {
          await r2Upload(storagePath, file.buffer, file.mimetype || 'application/octet-stream');
        } catch (ex) {
          console.error('[contact] R2 upload failed:', ex.message);
          return res.status(500).json({ error: 'Error al guardar el archivo adjunto.' });
        }
        let signedUrl;
        try {
          signedUrl = await r2SignedUrl(storagePath, 7 * 24 * 60 * 60);
        } catch (ex) {
          console.error('[contact] R2 signed URL failed:', ex.message);
          return res.status(500).json({ error: 'Error al generar link de descarga.' });
        }
        attachments.push({ name: safeFilename, url: signedUrl });
      } else {
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            upsert: false,
          });

        if (uploadErr) {
          console.error('[contact] Supabase upload failed:', uploadErr.message);
          return res.status(500).json({ error: 'Error al guardar el archivo adjunto.' });
        }

        // 7-day signed URL — long enough to survive email delivery + reading delay
        const { data: urlData, error: urlErr } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(storagePath, 7 * 24 * 60 * 60);

        if (urlErr) {
          console.error('[contact] Signed URL failed:', urlErr.message);
          return res.status(500).json({ error: 'Error al generar link de descarga.' });
        }

        attachments.push({ name: safeFilename, url: urlData.signedUrl });
      }
    }

    // ── Send email via Resend ──────────────────────────────────────────────────
    if (!process.env.RESEND_API_KEY) {
      console.error('[contact] Missing RESEND_API_KEY env var');
      return res.status(500).json({ error: 'Configuración de correo incompleta en el servidor.' });
    }

    const attachmentBlock = attachments.length > 0
      ? `\n\n━━━ ARCHIVOS ADJUNTOS (links válidos 7 días) ━━━\n` +
        attachments.map((a, i) => `${i + 1}. ${a.name}\n   ${a.url}`).join('\n\n')
      : '';

    const textBody = [
      `De:       ${nombre.trim()} <${email.trim()}>`,
      empresa?.trim() ? `Empresa:  ${empresa.trim()}` : null,
      `Servicio: ${servicio || '—'}`,
      ``,
      `━━━ MENSAJE ━━━`,
      mensaje.trim(),
      attachmentBlock,
    ].filter((l) => l !== null).join('\n');

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: emailData, error: emailErr } = await resend.emails.send({
      from:     `Inity 3D Formulario <${process.env.CONTACT_EMAIL || 'info@inity3d.com'}>`,
      to:       [process.env.CONTACT_EMAIL || 'info@inity3d.com'],
      reply_to: `${nombre.trim()} <${email.trim()}>`,
      subject:  `[Inity 3D] ${servicio || 'Consulta'} — ${nombre.trim()}`,
      text:     textBody,
    });

    if (emailErr) {
      console.error('[contact] Resend error:', JSON.stringify(emailErr));
      return res.status(500).json({ error: 'Error al enviar el correo. Intentá de nuevo en unos minutos.' });
    }

    console.log('[contact] Email sent via Resend, id:', emailData?.id);
    res.json({ ok: true });

  } catch (err) {
    console.error('[contact] Unhandled error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
