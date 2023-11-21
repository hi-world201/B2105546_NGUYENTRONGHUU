const ApiError = require('../utils/ApiError');
const MongooseQuery = require('../utils/MongooseQuery');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

const extractOrderItems = async (items, next) => {
  let totalPrice = 0;
  const orderItems = await Promise.all(
    items.map(async (item) => {
      if (!item.product || !item.quantity) {
        return next(new ApiError(400, 'Invalid order items!'));
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ApiError(400, `Product ${item.product} not found!`));
      }

      if (item.quantity > product.stockQuantity) {
        return next(
          new ApiError(400, `Product "${product.name}" has only ${product.stockQuantity} left!`),
        );
      }

      totalPrice += product.price * item.quantity;

      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
      };
    }),
  );
  return { totalPrice, orderItems };
};

exports.getAllOrders = async (req, res, next) => {
  try {
    if (req.user.role === 'customer') {
      req.query.user = req.user.id;
    }

    let mongooseQuery = new MongooseQuery(Order.find(), { ...req.query });
    mongooseQuery.filter().sort().paginate();

    const orders = await mongooseQuery.query.populate([
      {
        path: 'orderItems.product',
        select: 'name price images categories',
      },
      {
        path: 'user',
        select: 'email address _id active order fullname',
      },
      {
        path: 'status.updatedBy',
        select: 'role email _id',
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate([
        {
          path: 'orderItems.product',
          select: 'name price discount images',
        },
        {
          path: 'user',
          select: 'email address _id active order',
        },
        {
          path: 'status.updatedBy',
          select: 'role email _id',
        },
      ])
      .select('-__v');

    if (!order) {
      return next(new ApiError(404, 'Order not found!'));
    }

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    if (!payload.orderItems || payload.orderItems.length === 0) {
      return next(new ApiError(400, 'Invalid order items!'));
    }

    // Extract order items
    const { totalPrice, orderItems } = await extractOrderItems(payload.orderItems, next);

    const order = await Order.create({
      user: req.user.id,
      shippingAddress: payload.shippingAddress,
      telephone: payload.telephone,
      fullname: payload.fullname,
      totalPrice: totalPrice,
      orderItems: orderItems,
      status: [{ status: 'pending', updatedBy: req.user.id }],
    });

    // Remove stock quantity
    orderItems.forEach(async (item) => {
      const product = await Product.findById(item.product);
      product.stockQuantity -= item.quantity;
      await product.save();
    });

    res.status(200).json({
      status: 'success',
      data: order,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    if (!req.body.status) {
      return next(new ApiError(400, 'Invalid status! Please provide status!'));
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new ApiError(404, 'Order not found!'));
    }

    if (order.currentStatus === 'cancelled' || order.currentStatus === 'delivered') {
      return next(new ApiError(400, `Order is ${order.currentStatus}!`));
    }

    order.status.push({
      status: req.body.status,
      updatedBy: req.user.id,
    });

    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Update order status successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.deliverOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (order.currentStatus !== 'shipping') {
      return next(new ApiError(400, `Order is ${order.currentStatus}!`));
    }

    order.status.push({
      status: 'delivered',
      updatedBy: req.user.id,
    });

    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Update order status successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return next(new ApiError(404, 'Order not found!'));
    }

    if (order.currentStatus !== 'pending') {
      return next(new ApiError(400, 'Order cannot be cancelled!'));
    }

    order.status.push({
      status: 'cancelled',
      updatedBy: req.user.id,
    });
    await order.save();

    // Add stock quantity
    order.orderItems.forEach(async (item) => {
      const product = await Product.findById(item.product);
      product.stockQuantity += item.quantity;
      await product.save();
    });

    res.status(200).json({
      status: 'success',
      message: 'Cancel order successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

