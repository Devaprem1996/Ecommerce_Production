import multer from "multer";
import { Request } from "express";
import { ApiError } from "../exceptions/api-error.js";

// Store file in memory buffer
const storage = multer.memoryStorage();

// Validate file type
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(ApiError.badRequest("Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed."));
  }
};

// Expose multer upload middleware instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
