import { supabaseAdmin } from './admin'

const BUCKET = 'stl-files'

export async function uploadSTL(
  file: File,
  orderId: string,
  type: 'original' | 'scaled'
): Promise<string> {
  const path = `orders/${orderId}/${type}.stl`
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: 'application/octet-stream',
      upsert: true,
    })
  if (error) throw new Error(`STL upload failed: ${error.message}`)
  return path
}

export async function getSignedDownloadUrl(path: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60) // 60 seconds expiry
  if (error || !data) throw new Error(`Failed to get signed URL: ${error?.message}`)
  return data.signedUrl
}
