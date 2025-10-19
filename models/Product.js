const mongoose = require('mongoose');

const modelVariantSchema = new mongoose.Schema({
  modelUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  variantName: {
    type: String,
    required: true
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide a product category'],
    enum: ['Sofas', 'Beds', 'Chairs', 'Tables', 'Cabinets', 'Wardrobes', 'Doors']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  models: {
    type: [modelVariantSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
