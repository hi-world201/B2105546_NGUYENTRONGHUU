const mongoose = require('mongoose');
const slugify = require('slugify');

const { productMessage } = require('../languages');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, productMessage.requiredName],
      unique: true,
      trim: true,
      minlength: [5, productMessage.minlengthName],
      maxlength: [200, productMessage.maxlengthName],
    },
    price: {
      type: Number,
      required: [true, productMessage.requiredPrice],
      min: [0, productMessage.minPrice],
    },
    stockQuantity: {
      type: Number,
      required: [true, productMessage.requiredStockQuantity],
      min: [1, productMessage.minStockQuantity],
    },
    categories: {
      type: [{ type: String }],
    },
    images: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'Image' }],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      required: [true, productMessage.requiredCreatedBy],
      ref: 'User',
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    id: false,
  },
);

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

