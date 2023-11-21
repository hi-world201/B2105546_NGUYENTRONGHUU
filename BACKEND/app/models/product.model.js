const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
      minlength: [5, 'Product name must have at least 5 charaters'],
      maxlength: [200, 'Product name cannot be more than 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [0, 'Product price cannot be less than 0'],
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be less than 0'],
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
      type: String, // Can be use for JSON.stringify
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'A product must be created by someone!'],
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
