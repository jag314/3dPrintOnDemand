import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { getSignedDownloadUrl } from "@/utils/supabase/storage";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/orders/[id]/download/[type]
//
// Returns a 60-second signed Supabase Storage URL for an STL file.
// The client opens the URL directly — the file is served by Supabase CDN,
// not streamed through this server.
//
// Auth:  Authorization: Bearer <admin-jwt>
//        JWT verified against ADMIN_JWT_SECRET (server-side env var only).
//
// Params:
//   id   – order UUID
//   type – "original" | "scaled"
//
// Response:
//   200  { url: string, fileName: string }
//   401  Unauthorized (missing/invalid JWT)
//   404  Order not found, or requested file not stored
//   500  Internal error
// ─────────────────────────────────────────────────────────────────────────────

type RouteParams = { params: { id: string; type: string } };

function verifyAdminJWT(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    console.error("ADMIN_JWT_SECRET is not set — download endpoint will always deny");
    return false;
  }
  try {
    const payload = jwt.verify(auth.slice(7), secret) as { role?: string };
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!verifyAdminJWT(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, type } = params;

  if (type !== "original" && type !== "scaled") {
    return NextResponse.json(
      { error: 'type must be "original" or "scaled"' },
      { status: 400 }
    );
  }

  // ── Fetch the storage path from DB ────────────────────────────────────────
  const pathColumn = type === "original" ? "stl_original_path" : "stl_scaled_path";

  const { data: row, error: dbError } = await supabaseAdmin
    .from("orders")
    .select(`ref, ${pathColumn}, metadata`)
    .eq("id", id)
    .single();

  if (dbError || !row) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const storagePath = row[pathColumn as keyof typeof row] as string | null;
  if (!storagePath) {
    return NextResponse.json(
      { error: `No ${type} file stored for this order` },
      { status: 404 }
    );
  }

  // ── Build a human-readable file name ─────────────────────────────────────
  const meta      = row.metadata as Record<string, unknown> | null;
  const modelFile = meta?.modelFile as Record<string, unknown> | null;
  const baseName  = (modelFile?.name as string | undefined)?.replace(/\.[^.]+$/, "") ?? "model";
  const scalePct  = modelFile?.scalePct as number | undefined;

  const fileName =
    type === "original"
      ? `${baseName}_original.stl`
      : `${baseName}_scaled_${scalePct ?? "?"}pct.stl`;

  // ── Generate signed URL (Content-Disposition set server-side on Supabase) ─
  // Passing fileName here means Supabase attaches it as Content-Disposition:
  // attachment; filename="..." so cross-origin downloads work in all browsers.
  let url: string;
  try {
    url = await getSignedDownloadUrl(storagePath, fileName);
  } catch (err: unknown) {
    console.error("Signed URL generation failed:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ url, fileName });
}
