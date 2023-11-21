const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const statusSchema = mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'shipping', 'delivered', 'cancelled', 'accepted'],
    default: 'pending',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

const order = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function (val) {
        return val.length > 0;
      },
      message: 'An order must have at least one item!',
    },
  },
  fullname: {
    type: String,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: [statusSchema],
  },
  currentStatus: {
    type: String,
    enum: ['pending', 'shipping', 'delivered', 'cancelled', 'accepted'],
    default: 'pending',
  },
  updatedAt: Date,
});

// Set currentStatus
order.pre('save', async function (next) {
  this.currentStatus = this.status[this.status.length - 1].status;
  this.updatedAt = this.status[this.status.length - 1].updatedAt;
  next();
});

const Order = mongoose.model('Order', order);

module.exports = Order;

