const express = require('express');
const router = express.Router();
const { uploadModels, uploadTextures } = require('../middleware/s3Upload');
const { deleteFromS3, extractKeyFromUrl } = require('../services/s3Service');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/assets/upload-model
// @desc    Upload a 3D model file to S3
// @access  Private/Admin
router.post('/upload-model', protect, authorize('admin'), uploadModels.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'Model uploaded successfully',
      url: req.file.location,
      key: req.file.key,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading model:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets/upload-texture
// @desc    Upload a texture file to S3
// @access  Private/Admin
router.post('/upload-texture', protect, authorize('admin'), uploadTextures.single('texture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.status(201).json({
      message: 'Texture uploaded successfully',
      url: req.file.location,
      key: req.file.key,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading texture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/assets/upload-multiple-models
// @desc    Upload multiple 3D model files to S3
// @access  Private/Admin
router.post('/upload-multiple-models', protect, authorize('admin'), uploadModels.array('models', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      url: file.location,
      key: file.key,
      size: file.size,
      originalName: file.originalname
    }));

    res.status(201).json({
      message: `${uploadedFiles.length} models uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Error uploading models:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/assets/delete
// @desc    Delete a file from S3
// @access  Private/Admin
router.delete('/delete', protect, authorize('admin'), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'File URL is required' });
    }

    const key = extractKeyFromUrl(url);
    await deleteFromS3(key);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
