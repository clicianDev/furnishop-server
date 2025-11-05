require('dotenv').config();

module.exports = {
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME
  },
  s3: {
    // S3 folder paths
    folders: {
      models: 'models',
      textures: 'textures',
      customOrders: 'uploads/custom-orders'
    },
    // File upload limits
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    },
    // Allowed file types
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    allowedModelTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    
    // Generate full S3 URL
    getUrl: (key) => {
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d'
  },
  server: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  cors: {
    origins: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://furnishop-client.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean)
  }
};
