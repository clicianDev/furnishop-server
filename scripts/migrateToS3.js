const mongoose = require('mongoose');
const Product = require('../models/Product');
const CustomOrder = require('../models/CustomOrder');
require('dotenv').config();

const AWS_REGION = process.env.AWS_REGION;
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

/**
 * Migrate local file paths to S3 URLs
 */
async function migrateToS3() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Migrate Products
    console.log('\nMigrating Products...');
    const products = await Product.find({});
    let productCount = 0;

    for (let product of products) {
      let updated = false;

      // Update main image
      if (product.image && !product.image.startsWith('http')) {
        // Remove leading slash if present
        const imagePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
        product.image = `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${imagePath}`;
        updated = true;
      }

      // Update model URLs
      if (product.models && product.models.length > 0) {
        product.models = product.models.map(model => {
          if (model.modelUrl && !model.modelUrl.startsWith('http')) {
            // Remove leading slash if present
            const modelPath = model.modelUrl.startsWith('/') ? model.modelUrl.substring(1) : model.modelUrl;
            return {
              ...model,
              modelUrl: `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${modelPath}`
            };
          }
          return model;
        });
        updated = true;
      }

      if (updated) {
        await product.save();
        productCount++;
        console.log(`Updated product: ${product.name}`);
      }
    }
    console.log(`✓ Migrated ${productCount} products`);

    // Migrate Custom Orders
    console.log('\nMigrating Custom Orders...');
    const customOrders = await CustomOrder.find({});
    let orderCount = 0;

    for (let order of customOrders) {
      let updated = false;

      if (order.images && order.images.length > 0) {
        order.images = order.images.map(imagePath => {
          if (!imagePath.startsWith('http')) {
            // Remove leading slash if present
            const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
            return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${cleanPath}`;
          }
          return imagePath;
        });
        updated = true;
      }

      if (updated) {
        await order.save();
        orderCount++;
        console.log(`Updated custom order: ${order._id}`);
      }
    }
    console.log(`✓ Migrated ${orderCount} custom orders`);

    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToS3();
