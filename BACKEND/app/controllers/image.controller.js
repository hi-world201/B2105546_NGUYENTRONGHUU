const Image = require('../models/image.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const fs = require('fs').promises;

exports.createProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new ApiError(404, 'No product found with that ID!'));
    }
    // Get image buffers and remove from the file system
    const imageBuffers = await Promise.all(
      req.files.map(async (file) => {
        const fileBuffer = await fs.readFile(file.path);
        return {
          name: file.filename,
          data: Buffer.from(fileBuffer),
        };
      }),
    );

    // Insert images into the database
    const images = await Image.create(imageBuffers);

    // // Insert image IDs into the product
    product.images.push(...images.map((image) => image._id));
    await product.save();

    res.status(201).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await Promise.all(
      req.files.map(async (file) => {
        return await fs.rm(file.path);
      }),
    );
  }
};

exports.deleteProductImage = async (req, res, next) => {
  try {
    await Image.findByIdAndDelete(req.params.imageId);
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new ApiError(404, 'No product found with that ID!'));
    }

    product.images = product.images.filter((imageId) => imageId.toString() !== req.params.imageId);
    await product.save();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.getImage = async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.imageId);

    if (!image) {
      return next(new ApiError(404, 'No image found with that ID!'));
    }

    res.contentType('image/jpeg');
    res.send(image.data);
  } catch (error) {
    next(error);
  }
};

