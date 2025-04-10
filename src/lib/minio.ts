import * as Minio from "minio";

// Initialize MinIO Client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
});

// Default bucket name for storing note images
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "notes-app";

// Ensures the bucket exists before operations
export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`Bucket '${BUCKET_NAME}' created successfully`);

      // Set bucket policy to public (for easy access to images)
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };

      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    }
  } catch (err) {
    console.error("Error ensuring bucket exists:", err);
    throw err;
  }
}

// Upload a file to MinIO
export async function uploadFile(
  file: Buffer | string,
  fileName: string,
  mimeType: string
): Promise<string> {
  await ensureBucket();

  // Generate a unique object name
  const objectName = `${Date.now()}-${fileName}`;

  await minioClient.putObject(
    BUCKET_NAME,
    objectName,
    file,
    file instanceof Buffer ? file.length : Buffer.from(file).length,
    { "Content-Type": mimeType }
  );

  // Return the path to the uploaded file
  return `${BUCKET_NAME}/${objectName}`;
}

// Get a pre-signed URL for a file (useful for temporary access)
export async function getFileUrl(
  objectName: string,
  expiryInSeconds = 60 * 60
): Promise<string> {
  return await minioClient.presignedGetObject(
    BUCKET_NAME,
    objectName,
    expiryInSeconds
  );
}

// Delete a file from MinIO
export async function deleteFile(objectName: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, objectName);
}

export default minioClient;
