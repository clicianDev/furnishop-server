const express = require('express');
const router = express.Router();
const PaymentMethod = require('../models/PaymentMethod');
const { protect, authorize } = require('../middleware/auth');
const { uploadPaymentQR } = require('../middleware/s3Upload');
const { deleteFromS3, extractKeyFromUrl } = require('../services/s3Service');

// @route   GET /api/payment-methods
// @desc    Get all payment methods
// @access  Public
router.get('/', async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({ isActive: true });
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payment-methods/all
// @desc    Get all payment methods (including inactive) - Admin only
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({});
    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching all payment methods:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payment-methods/:id
// @desc    Get payment method by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    res.json(paymentMethod);
  } catch (error) {
    console.error('Error fetching payment method:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payment-methods/upload-qr
// @desc    Upload QR code image to S3
// @access  Private/Admin
router.post('/upload-qr', protect, authorize('admin'), uploadPaymentQR.single('qrImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'QR code uploaded successfully',
      qrImageUrl: req.file.location,
      key: req.file.key
    });
  } catch (error) {
    console.error('Error uploading QR code:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payment-methods
// @desc    Create a new payment method
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { serviceProvider, type, accountNumber, accountName, qrImage } = req.body;

    // Validate required fields
    if (!serviceProvider || !accountNumber || !accountName || !qrImage) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate account number format
    if (!/^\+63\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ 
        message: 'Invalid account number format. Must be +63 followed by 10 digits (e.g., +639123456789)' 
      });
    }

    const paymentMethod = await PaymentMethod.create({
      serviceProvider,
      type: type || 'eWallet',
      accountNumber,
      accountName,
      qrImage
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error('Error creating payment method:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/payment-methods/:id
// @desc    Update a payment method
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const { serviceProvider, type, accountNumber, accountName, qrImage, isActive } = req.body;

    // Validate account number format if provided
    if (accountNumber && !/^\+63\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ 
        message: 'Invalid account number format. Must be +63 followed by 10 digits (e.g., +639123456789)' 
      });
    }

    // If QR image is being updated, delete the old one from S3
    if (qrImage && qrImage !== paymentMethod.qrImage) {
      try {
        const oldKey = extractKeyFromUrl(paymentMethod.qrImage);
        if (oldKey) {
          await deleteFromS3(oldKey);
        }
      } catch (deleteError) {
        console.error('Error deleting old QR image:', deleteError);
        // Continue with update even if delete fails
      }
    }

    paymentMethod.serviceProvider = serviceProvider || paymentMethod.serviceProvider;
    paymentMethod.type = type || paymentMethod.type;
    paymentMethod.accountNumber = accountNumber || paymentMethod.accountNumber;
    paymentMethod.accountName = accountName || paymentMethod.accountName;
    paymentMethod.qrImage = qrImage || paymentMethod.qrImage;
    paymentMethod.isActive = isActive !== undefined ? isActive : paymentMethod.isActive;

    const updatedPaymentMethod = await paymentMethod.save();
    res.json(updatedPaymentMethod);
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/payment-methods/:id
// @desc    Delete a payment method
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Delete QR image from S3
    try {
      const key = extractKeyFromUrl(paymentMethod.qrImage);
      if (key) {
        await deleteFromS3(key);
      }
    } catch (deleteError) {
      console.error('Error deleting QR image from S3:', deleteError);
      // Continue with deletion even if S3 delete fails
    }

    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment method removed' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
