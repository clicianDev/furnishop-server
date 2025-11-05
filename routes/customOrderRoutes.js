const express = require('express');
const router = express.Router();
const CustomOrder = require('../models/CustomOrder');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/custom-orders';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'custom-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// @route   POST /api/custom-orders
// @desc    Create a new custom furniture order
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { furnitureType, width, height, woodType, varnishType, totalPrice, notes } = req.body;

    // Validate required fields
    if (!furnitureType || !width || !height || !woodType || !varnishType || !totalPrice) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Get uploaded image paths
    const images = req.files ? req.files.map(file => file.path) : [];

    const customOrder = new CustomOrder({
      userId: req.user.id,
      furnitureType,
      dimensions: {
        width: parseFloat(width),
        height: parseFloat(height)
      },
      woodType,
      varnishType,
      totalPrice: parseFloat(totalPrice),
      notes: notes || '',
      images
    });

    await customOrder.save();

    res.status(201).json({
      message: 'Custom order created successfully',
      order: customOrder
    });
  } catch (error) {
    console.error('Error creating custom order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/custom-orders
// @desc    Get all custom orders (admin) or user's custom orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's own orders
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const customOrders = await CustomOrder.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(customOrders);
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/custom-orders/:id
// @desc    Get a specific custom order
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const customOrder = await CustomOrder.findById(req.params.id)
      .populate('userId', 'name email');

    if (!customOrder) {
      return res.status(404).json({ message: 'Custom order not found' });
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && customOrder.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(customOrder);
  } catch (error) {
    console.error('Error fetching custom order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/custom-orders/:id
// @desc    Update custom order status (admin only)
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    // Only admin can update orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, adminNotes } = req.body;

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({ message: 'Custom order not found' });
    }

    if (status) customOrder.status = status;
    if (adminNotes !== undefined) customOrder.adminNotes = adminNotes;

    await customOrder.save();

    res.json({
      message: 'Custom order updated successfully',
      order: customOrder
    });
  } catch (error) {
    console.error('Error updating custom order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/custom-orders/:id
// @desc    Delete a custom order (admin only)
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const customOrder = await CustomOrder.findById(req.params.id);

    if (!customOrder) {
      return res.status(404).json({ message: 'Custom order not found' });
    }

    // Delete associated images
    if (customOrder.images && customOrder.images.length > 0) {
      customOrder.images.forEach(imagePath => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await CustomOrder.findByIdAndDelete(req.params.id);

    res.json({ message: 'Custom order deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
