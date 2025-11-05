const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  furnitureType: {
    type: String,
    required: [true, 'Please provide furniture type'],
    enum: ['Door', 'Table', 'Cabinet', 'Chair', 'Bed']
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Please provide width'],
      min: 0
    },
    height: {
      type: Number,
      required: [true, 'Please provide height'],
      min: 0
    }
  },
  woodType: {
    type: String,
    required: [true, 'Please provide wood type'],
    enum: ['Mahogany', 'Gmelina']
  },
  varnishType: {
    type: String,
    required: [true, 'Please provide varnish type'],
    enum: ['Plywood', 'Dark Wood', 'Oak Veneer', 'Plywood Varnished']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Please provide total price'],
    min: 0
  },
  notes: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'approved', 'in-production', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
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
customOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);
