const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Multer configuration for file upload
 * Stores files in memory buffer before uploading to Cloudinary
 * Validates file type and size
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept any image type (jpeg, png, webp, heic/heif from Apple devices,
  // gif, avif, etc.). Cloudinary normalises the format on upload.
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB max
  },
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - The file buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, folder = 'gymbuddy') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'jpg' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by public ID
 * @param {string} publicId - The Cloudinary public ID of the image
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
