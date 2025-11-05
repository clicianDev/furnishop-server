const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequest');
const Transaction = require('../models/Transaction');
const CustomOrder = require('../models/CustomOrder');
const { protect, authorize } = require('../middleware/auth');
const { createS3Upload } = require('../middleware/s3Upload');

// Configure upload for repair request media
const uploadRepairMedia = createS3Upload('uploads/repair-requests');

// @route   GET /api/repair-requests
// @desc    Get all repair requests (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const repairRequests = await RepairRequest.find({})
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json(repairRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/repair-requests/my-requests
// @desc    Get logged in user's repair requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
  try {
    const repairRequests = await RepairRequest.find({ userId: req.user.id })
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.json(repairRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/repair-requests/order/:orderId
// @desc    Get repair requests for a specific order
// @access  Private
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const repairRequests = await RepairRequest.find({ orderId: req.params.orderId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    // Check if user owns the order or is admin
    if (repairRequests.length > 0 && 
        repairRequests[0].userId._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these repair requests' });
    }

    res.json(repairRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/repair-requests/upload-media
// @desc    Upload repair request media (images/videos) to S3
// @access  Private
router.post('/upload-media', protect, uploadRepairMedia.array('media', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const mediaUrls = req.files.map(file => file.location);

    res.status(200).json({
      message: 'Media uploaded successfully',
      mediaUrls: mediaUrls
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/repair-requests
// @desc    Create a new repair request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { orderId, orderType, description, media } = req.body;

    if (!orderId || !orderType || !description) {
      return res.status(400).json({ message: 'Order ID, order type, and description are required' });
    }

    // Verify that the order exists and belongs to the user
    let order;
    if (orderType === 'Transaction') {
      order = await Transaction.findById(orderId);
    } else if (orderType === 'CustomOrder') {
      order = await CustomOrder.findById(orderId);
    } else {
      return res.status(400).json({ message: 'Invalid order type' });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to create repair request for this order' });
    }

    const repairRequest = await RepairRequest.create({
      userId: req.user.id,
      orderId,
      orderType,
      description,
      media: media || []
    });

    const populatedRequest = await RepairRequest.findById(repairRequest._id)
      .populate('userId', 'name email')
      .populate('orderId');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error('Error creating repair request:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/repair-requests/:id
// @desc    Update repair request (status or admin notes)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const repairRequest = await RepairRequest.findById(req.params.id);
    
    if (!repairRequest) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    // Update fields
    if (req.body.status) {
      repairRequest.status = req.body.status;
    }
    if (req.body.adminNotes !== undefined) {
      repairRequest.adminNotes = req.body.adminNotes;
    }

    const updatedRequest = await repairRequest.save();
    
    const populatedRequest = await RepairRequest.findById(updatedRequest._id)
      .populate('userId', 'name email')
      .populate('orderId');

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/repair-requests/:id
// @desc    Delete repair request
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const repairRequest = await RepairRequest.findById(req.params.id);
    
    if (!repairRequest) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    await RepairRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Repair request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
