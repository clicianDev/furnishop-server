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

/**
 * Helper function to sanitize product name for S3 key
 * Removes special characters and replaces spaces with hyphens
 */
const sanitizeProductName = (productName) => {
  return productName
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

/**
 * Configure multer to upload product images to S3
 * Format: models/Product-Name/images/image-1.jpg
 */
const uploadProductImage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const productName = req.body.name || 'Product';
      const sanitizedName = sanitizeProductName(productName);
      const fileIndex = req.body.imageIndex || '1';
      const ext = path.extname(file.originalname).toLowerCase();
      const key = `models/${sanitizedName}/images/image-${fileIndex}${ext}`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    // Accept only jpg, jpeg, png
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG files are allowed for images!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

/**
 * Configure multer to upload product 3D models to S3
 * Format: models/Product-Name/product-name-1.glb
 */
const uploadProductModel = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const productName = req.body.productName || req.body.name || 'Product';
      const sanitizedName = sanitizeProductName(productName);
      const modelIndex = req.body.modelIndex || '1';
      const lowercaseName = sanitizedName.toLowerCase();
      const key = `models/${sanitizedName}/${lowercaseName}-${modelIndex}.glb`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE
  }),
  fileFilter: (req, file, cb) => {
    // Accept only .glb files
    if (file.mimetype === 'model/gltf-binary' || path.extname(file.originalname).toLowerCase() === '.glb') {
      cb(null, true);
    } else {
      cb(new Error('Only GLB files are allowed for 3D models!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit per file
  }
});

module.exports = {
  createS3Upload,
  uploadCustomOrderImages,
  uploadModels,
  uploadTextures,
  uploadProductImage,
  uploadProductModel,
  sanitizeProductName
};
