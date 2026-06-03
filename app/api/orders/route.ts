import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { uploadSTL } from "@/utils/supabase/storage";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders
//
// Accepts:  multipart/form-data
//   stlFile   – the 3D model file (File)
//   orderData – JSON string of the full order payload
//
// Flow:
//   1. Parse FormData
//   2. Upload original STL to Supabase Storage via uploadSTL()
//   3. If scale ≠ 100%, scale the geometry server-side and upload scaled copy
//   4. Insert order + metadata row into Supabase DB
//   5. Log initial status in order_status_log
//
// If anything after the storage upload fails the uploaded files are removed
// before returning an error so storage doesn't accumulate orphans.
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Parse multipart body ─────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart/form-data body" }, { status: 400 });
  }

  const stlFile    = formData.get("stlFile") as File | null;
  const rawPayload = formData.get("orderData") as string | null;

  if (!stlFile)    return NextResponse.json({ error: "stlFile is required" },    { status: 400 });
  if (!rawPayload) return NextResponse.json({ error: "orderData is required" },  { status: 400 });

  let orderData: Record<string, unknown>;
  try {
    orderData = JSON.parse(rawPayload);
  } catch {
    return NextResponse.json({ error: "orderData must be valid JSON" }, { status: 400 });
  }

  const id       = orderData.id as string | undefined;
  const ref      = orderData.ref as string | undefined;
  const scalePct = (orderData.scalePct as number | undefined) ?? 100;

  if (!id || !ref) {
    return NextResponse.json({ error: "orderData must include id and ref" }, { status: 400 });
  }

  // ── 2. Upload original STL ──────────────────────────────────────────────
  let stlOriginalPath: string;
  try {
    stlOriginalPath = await uploadSTL(stlFile, id, "original");
  } catch (err: unknown) {
    console.error("STL original upload failed:", err);
    return NextResponse.json(
      { error: `Failed to upload file to storage: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  // ── 3. Scale and upload scaled copy (non-fatal if it fails) ────────────
  let stlScaledPath: string | null = null;

  if (scalePct !== 100 && stlFile.name.toLowerCase().endsWith(".stl")) {
    try {
      const { scaleSTLFile } = await import("@/utils/stlScale");
      const scaledFile = await scaleSTLFile(stlFile, scalePct / 100);
      stlScaledPath = await uploadSTL(scaledFile, id, "scaled");
    } catch (scaleErr) {
      // Non-fatal: log and continue without the scaled copy.
      // The order is still saved; admin can regenerate if needed.
      console.warn("Scaled STL upload failed (non-fatal):", scaleErr);
    }
  }

  // ── 4. Build metadata (strip any raw file data; add storage paths) ──────
  const modelFileRaw = orderData.modelFile as Record<string, unknown> | null;
  const metadata = {
    ...orderData,
    stlOriginalPath,
    stlScaledPath,
    modelFile: modelFileRaw
      ? {
          name:      modelFileRaw.name,
          sizeBytes: modelFileRaw.sizeBytes,
          sizeMB:    modelFileRaw.sizeMB,
          scale:     modelFileRaw.scale,
          scalePct:  modelFileRaw.scalePct,
          stored:    true,
          // 'data' (base64) intentionally omitted — file lives in Supabase Storage
        }
      : null,
  };

  const customer = orderData.customer as Record<string, unknown> | undefined;
  const quote    = orderData.quote    as Record<string, unknown> | undefined;

  // ── 5. Insert order row into DB ─────────────────────────────────────────
  const { error: dbError } = await supabaseAdmin.from("orders").insert({
    id,
    ref,
    status:            "pending_verification",
    customer_email:    customer?.email ?? null,
    total_price_crc:   (quote?.totalPrice as number | undefined) ?? 0,
    scale_pct:         scalePct,
    stl_original_path: stlOriginalPath,
    stl_scaled_path:   stlScaledPath,
    metadata,
  });

  if (dbError) {
    // Roll back the uploaded files so storage doesn't accumulate orphans.
    await supabaseAdmin.storage
      .from("stl-files")
      .remove([stlOriginalPath, ...(stlScaledPath ? [stlScaledPath] : [])]);

    console.error("DB insert error:", dbError);
    return NextResponse.json(
      { error: `Failed to save order: ${dbError.message}` },
      { status: 502 }
    );
  }

  // ── 6. Append initial status log entry ─────────────────────────────────
  await supabaseAdmin.from("order_status_log").insert({
    order_id:   id,
    old_status: null,
    new_status: "pending_verification",
    changed_by: "system",
  });

  return NextResponse.json(
    { orderId: id, referenceNumber: ref, stlOriginalPath, stlScaledPath },
    { status: 201 }
  );
}
