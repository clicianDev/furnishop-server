const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3Client } = require('../services/s3Service');
const path = require('path');

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Configure multer to upload directly to S3
 * @param {string} folder - S3 folder path (e.g., 'uploads/custom-orders')
 * @returns {multer.Multer}
 */
const createS3Upload = (folder) => {
  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'custom-' + uniqueSuffix + path.extname(file.originalname);
        const key = `${folder}/${filename}`;
        cb(null, key);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE
    }),
    fileFilter: (req, file, cb) => {
      // Accept images only
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit per file
    }
  });

  return upload;
};

// Export pre-configured upload for custom orders
const uploadCustomOrderImages = createS3Upload('uploads/custom-orders');

// Export pre-configured upload for models
const uploadModels = createS3Upload('models');

// Export pre-configured upload for textures
const uploadTextures = createS3Upload('textures');

module.exports = {
  createS3Upload,
  uploadCustomOrderImages,
  uploadModels,
  uploadTextures
};
