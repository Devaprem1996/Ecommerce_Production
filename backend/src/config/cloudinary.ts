import { v2 as cloudinary } from "cloudinary";

// Cloudinary SDK automatically configures itself if CLOUDINARY_URL is present in process.env
cloudinary.config();

/**
 * Uploads a file buffer directly to Cloudinary using streams.
 * Bypasses writing files to local disk.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "products"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Upload result was empty from Cloudinary."));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export default cloudinary;
