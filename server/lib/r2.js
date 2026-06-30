import { S3Client, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;

// Path prefix stored in DB so routing logic can detect provider without a schema change.
// All R2 uploads use 'r2/' prefix; Supabase-era paths have no prefix.
export const R2_PREFIX = 'r2/';

export async function uploadFile(storagePath, buffer, contentType) {
  // Upload handles multipart automatically for large files (recommended for > 5MB).
  // PutObjectCommand with chunked Transfer-Encoding is rejected by R2 for large buffers.
  const upload = new Upload({
    client: r2,
    params: {
      Bucket: BUCKET,
      Key:    storagePath,
      Body:   buffer,
      ContentType: contentType,
    },
  });
  await upload.done();
  return storagePath;
}

export async function getSignedDownloadUrl(storagePath, expiresInSeconds) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: storagePath });
  return getSignedUrl(r2, cmd, { expiresIn: expiresInSeconds });
}

export async function deleteFiles(storagePaths) {
  if (!storagePaths.length) return;
  const cmd = new DeleteObjectsCommand({
    Bucket: BUCKET,
    Delete: { Objects: storagePaths.map(Key => ({ Key })) },
  });
  await r2.send(cmd);
}
