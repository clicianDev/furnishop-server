const mongoose = require('mongoose');
const Product = require('../models/Product');
const CustomOrder = require('../models/CustomOrder');
require('dotenv').config();

/**
 * Fix double slashes in S3 URLs
 */
async function fixDoubleSlashes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB\n');

    // Fix Products
    console.log('Fixing Products...');
    const products = await Product.find({});
    let productCount = 0;

    for (let product of products) {
      let updated = false;

      // Fix main image
      if (product.image && product.image.includes('//models') || product.image.includes('//textures') || product.image.includes('//uploads')) {
        product.image = product.image.replace(/([^:])\/\//g, '$1/');
        updated = true;
      }

      // Fix model URLs
      if (product.models && product.models.length > 0) {
        product.models = product.models.map(model => {
          if (model.modelUrl && (model.modelUrl.includes('//models') || model.modelUrl.includes('//textures'))) {
            return {
              ...model,
              modelUrl: model.modelUrl.replace(/([^:])\/\//g, '$1/')
            };
          }
          return model;
        });
        updated = true;
      }

      if (updated) {
        await product.save();
        productCount++;
        console.log(`✓ Fixed product: ${product.name}`);
      }
    }
    console.log(`✓ Fixed ${productCount} products\n`);

    // Fix Custom Orders
    console.log('Fixing Custom Orders...');
    const customOrders = await CustomOrder.find({});
    let orderCount = 0;

    for (let order of customOrders) {
      let updated = false;

      if (order.images && order.images.length > 0) {
        order.images = order.images.map(imagePath => {
          if (imagePath.includes('//uploads')) {
            return imagePath.replace(/([^:])\/\//g, '$1/');
          }
          return imagePath;
        });
        updated = true;
      }

      if (updated) {
        await order.save();
        orderCount++;
        console.log(`✓ Fixed custom order: ${order._id}`);
      }
    }
    console.log(`✓ Fixed ${orderCount} custom orders\n`);

    console.log('✅ Cleanup completed successfully!');
    console.log('\nSample fixed URL:');
    const sampleProduct = await Product.findOne();
    if (sampleProduct && sampleProduct.models && sampleProduct.models.length > 0) {
      console.log(sampleProduct.models[0].modelUrl);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

// Run cleanup
fixDoubleSlashes();
