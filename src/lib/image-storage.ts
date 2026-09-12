import path from "path";
import { randomUUID } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

export type StoredImage = { url: string; publicId: string | null };

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

async function uploadToCloudinary(buffer: Buffer): Promise<StoredImage> {
  const client = getCloudinary();
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder: "elarenza/products" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function saveToLocalDisk(buffer: Buffer, originalName: string): Promise<StoredImage> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return { url: `/uploads/${filename}`, publicId: null };
}

export async function saveUploadedImages(files: File[]): Promise<StoredImage[]> {
  const results: StoredImage[] = [];
  const useCloudinary = cloudinaryConfigured();

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const buffer = Buffer.from(await file.arrayBuffer());
    results.push(
      useCloudinary
        ? await uploadToCloudinary(buffer)
        : await saveToLocalDisk(buffer, file.name)
    );
  }

  return results;
}

export async function deleteStoredImage(image: { url: string; publicId: string | null }) {
  if (image.publicId && cloudinaryConfigured()) {
    await getCloudinary().uploader.destroy(image.publicId).catch(() => {});
    return;
  }
  const filePath = path.join(process.cwd(), "public", image.url);
  await unlink(filePath).catch(() => {});
}
