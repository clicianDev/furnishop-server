const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImage, uploadProductModel, sanitizeProductName } = require('../middleware/s3Upload');
const multer = require('multer');

// Configure multer for handling multiple file uploads
const uploadFields = multer().fields([
  { name: 'image', maxCount: 1 },
  { name: 'modelFiles', maxCount: 10 }
]);

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product with file uploads
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, category, stock, image, models } = req.body;

    // Parse models if it's a string
    let parsedModels = [];
    if (models) {
      parsedModels = typeof models === 'string' ? JSON.parse(models) : models;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
      models: parsedModels
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/upload-image
// @desc    Upload product image to S3
// @access  Private/Admin
router.post('/upload-image', protect, authorize('admin'), uploadProductImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.location,
      key: req.file.key
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products/upload-model
// @desc    Upload product 3D model to S3
// @access  Private/Admin
router.post('/upload-model', protect, authorize('admin'), uploadProductModel.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'Model uploaded successfully',
      modelUrl: req.file.location,
      key: req.file.key
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.image = req.body.image || product.image;
    product.models = req.body.models !== undefined ? req.body.models : product.models;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
