const ApiError = require('../utils/ApiError');
const MongooseQuery = require('../utils/MongooseQuery');
const Product = require('../models/product.model');
const Image = require('../models/image.model');

exports.searchProduct = async (req, res, next) => {
  try {
    req.query.slug = { $regex: req.query.slug, $options: 'i' };
    next();
  } catch (err) {
    return next(err);
  }
};

exports.getAllProduct = async (req, res, next) => {
  try {
    let mongooseQuery = new MongooseQuery(Product.find(), { ...req.query });
    mongooseQuery.filter().sort().paginate();

    const products = await mongooseQuery.query;

    res.status(200).json({
      status: 'success',
      data: products,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId).populate({ path: 'createdBy' });

    if (!product) {
      return next(new ApiError(404, 'No product found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = { ...req.body, createdBy: userId };
    payload.images = [];

    const product = await Product.create(payload);

    res.status(201).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!product) {
      return next(new ApiError(404, 'No product found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return next(new ApiError(404, 'No product found with that ID'));
    }

    product.images.forEach(async (image) => {
      await Image.findByIdAndDelete(image);
    });

    res.status(204).json({
      status: 'success',
      data: product,
    });
  } catch (err) {
    return next(err);
  }
};
