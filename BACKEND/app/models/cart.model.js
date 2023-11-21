const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A cart item must belong to a user!'],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'A cart item must be a product!'],
  },
  quantity: {
    type: Number,
    required: [true, 'A cart item must have quantity!'],
    min: [0, 'Quantity must be at least 0!'],
  },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
