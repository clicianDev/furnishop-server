const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'orderType',
    required: true
  },
  orderType: {
    type: String,
    enum: ['Transaction', 'CustomOrder'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  media: [{
    type: String, // S3 URLs for images/videos
    required: false
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'in-repair', 'completed', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  termsAccepted: {
    type: Boolean,
    required: true,
    default: false
  },
  termsAcceptedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
repairRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
