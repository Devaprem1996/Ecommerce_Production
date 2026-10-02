import * as fs from "node:fs";
import * as path from "node:path";
import { uploadToCloudinary } from "../config/cloudinary.js";
import logger from "../logger/index.js";

export class StorageService {
  /**
   * Upload an image file buffer.
   * If STORAGE_DRIVER is "cloudinary" and credentials exist, uploads to Cloudinary.
   * Otherwise (or on Cloudinary failure), saves locally to LOCAL_UPLOAD_PATH (/var/www/uploads)
   * which is directly served by Nginx with aggressive caching.
   */
  static async uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    folder: string = "products"
  ): Promise<string> {
    const driver = process.env.STORAGE_DRIVER || "local";
    const hasCloudinary = Boolean(
      process.env.CLOUDINARY_URL ||
        (process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET)
    );

    if (driver === "cloudinary" && hasCloudinary) {
      try {
        const cloudUrl = await uploadToCloudinary(fileBuffer, folder);
        logger.info(`Uploaded image to Cloudinary: ${cloudUrl}`);
        return cloudUrl;
      } catch (cloudErr: any) {
        logger.warn(
          `Cloudinary upload failed: ${cloudErr?.message}. Falling back to local VPS disk storage.`
        );
      }
    }

    // Local VPS Disk Storage (Zero external cost, served directly by Nginx)
    const basePath = process.env.LOCAL_UPLOAD_PATH || "/var/www/uploads";
    const targetDir = path.join(basePath, folder);

    await fs.promises.mkdir(targetDir, { recursive: true });

    const ext = path.extname(originalName).toLowerCase() || ".webp";
    const baseRaw = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
    const cleanBase = baseRaw.length > 0 ? baseRaw : "img";
    const uniqueFileName = `${cleanBase}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
    const fullPath = path.join(targetDir, uniqueFileName);

    await fs.promises.writeFile(fullPath, fileBuffer);
    logger.info(`Saved image asynchronously to local VPS disk: ${fullPath}`);

    // Return URL path routed by Nginx
    return `/uploads/${folder}/${uniqueFileName}`;
  }
}
