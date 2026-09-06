import { v2 as cloudinary } from "cloudinary";

// Cloudinary SDK automatically configures itself if CLOUDINARY_URL is present in process.env
cloudinary.config();

/**
 * Uploads a file buffer directly to Cloudinary using streams with automatic format and quality optimization.
 * Bypasses writing files to local disk.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "products"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `yathu/${folder}`,
        transformation: [
          { fetch_format: "auto", quality: "auto", width: 800, crop: "limit" },
        ],
      },
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

/**
 * Deletes an asset from Cloudinary using its public ID or secure URL.
 */
export async function deleteFromCloudinary(publicIdOrUrl: string): Promise<boolean> {
  try {
    let publicId = publicIdOrUrl;
    if (publicIdOrUrl.startsWith("http://") || publicIdOrUrl.startsWith("https://")) {
      // Extract public ID from Cloudinary URL format: .../upload/v12345/folder/file.jpg
      const parts = publicIdOrUrl.split("/upload/");
      if (parts.length > 1) {
        const pathAfterUpload = parts[1].replace(/^v\d+\//, ""); // Remove version prefix
        publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf("."));
      }
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    return false;
  }
}

export default cloudinary;
