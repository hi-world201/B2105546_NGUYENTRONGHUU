const ApiError = require('../utils/ApiError');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.getCartItems = async (req, res, next) => {
  try {
    const cartItems = await Cart.find({ user: req.user.id }).populate({
      path: 'product',
    });

    // Set quantity <= Stock quantity
    cartItems.forEach(async (item) => {
      if (item.quantity > item.product.stockQuantity) {
        item.quantity = item.product.stockQuantity;
        await item.save();
      }
    });

    res.status(200).json({
      status: 'success',
      data: cartItems,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);

    // ProductId is not exist
    if (!product) {
      return next(new ApiError(400, 'Cannot found any product with that ID!'));
    }

    // quantity > stockQuantity
    if (quantity > product.stockQuantity) {
      return next(
        new ApiError(400, `Product "${product.name}" has only ${product.stockQuantity} left!`),
      );
    }

    // Create new or override
    const item = await Cart.findOneAndUpdate(
      {
        product: productId,
        user: req.user.id,
      },
      { quantity: quantity },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(201).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { cartItemId } = req.params;

    // Find cart item by ID
    const item = await Cart.findById(cartItemId);
    if (!item) {
      return next(new ApiError(400, 'Cannot found any item with that ID!'));
    }

    // Find product by ID
    const product = await Product.findById(item.product);
    if (!product) {
      await item.remove();
      return next(new ApiError(400, 'This product is not exist anymore!'));
    }

    // quantity > stockQuantity
    if (!product || quantity > product.stockQuantity) {
      return next(
        new ApiError(400, `Product "${product.name}" has only ${product.stockQuantity} left!`),
      );
    }

    // Update quantity
    item.quantity = quantity;
    await item.save();

    res.status(201).json({
      status: 'success',
      data: item,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;

    await Cart.findOneAndDelete({
      _id: cartItemId,
      user: req.user.id,
    });

    res.status(204).json({
      status: 'success',
      message: 'Cart item has been deleted successfully!',
    });
  } catch (err) {
    return next(err);
  }
};
