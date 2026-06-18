import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// R2 is S3-compatible — we use the AWS SDK pointed at Cloudflare's endpoint
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

/**
 * Generate a short-lived signed URL for streaming audio.
 * The URL expires after `expiresInSeconds` (default 2h).
 * It is NOT a download link — the browser streams directly from R2.
 */
export async function getSignedStreamUrl(
  r2Key: string,
  expiresInSeconds = 7200 // 2 hours
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    // Force inline rendering (streaming), not attachment (download)
    ResponseContentDisposition: "inline",
  });

  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed URL that allows the admin to PUT (upload)
 * a file directly from their browser to R2 — no file touches the server.
 */
export async function getUploadUrl(
  r2Key: string,
  mimeType: string,
  expiresInSeconds = 3600 // 1 hour to complete upload
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: r2Key,
    ContentType: mimeType,
  });

  return getSignedUrl(r2, command, { expiresIn: expiresInSeconds });
}

/**
 * Delete a file from R2 (admin only, used when removing a session).
 */
export async function deleteFile(r2Key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: r2Key })
  );
}

/**
 * Sanitize a filename into a safe R2 key.
 * e.g. "My Session! 2019.mp3" → "audio/2019/my-session-2019.mp3"
 */
export function buildR2Key(
  year: number,
  title: string,
  ext: string = "mp3"
): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `audio/${year}/${slug}.${ext}`;
}
