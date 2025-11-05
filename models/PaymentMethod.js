const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  serviceProvider: {
    type: String,
    required: true,
    enum: ['GCash', 'PayMaya'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['eWallet'],
    default: 'eWallet'
  },
  accountNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate Philippine phone number format (+63)
        return /^\+63\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Philippine phone number! Format: +63XXXXXXXXXX`
    }
  },
  accountName: {
    type: String,
    required: true,
    trim: true
  },
  qrImage: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
