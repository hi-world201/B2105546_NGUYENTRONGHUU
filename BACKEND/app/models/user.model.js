const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { createToken } = require('../utils/createRandomToken');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email! Please use a valid email!',
      },
    },
    password: {
      type: String,
      required: [true, 'Password cannot be empty!'],
      minlength: [8, 'Password must be at least 8 charactrers!'],
      // validate: {
      //   validator: validator.isStrongPassword,
      //   message:
      //     'Password must be at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 symbol!',
      // },
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please confirm your password!'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Invalid password confirm. Please try again!',
      },
    },
    fullname: {
      type: String,
    },
    telephone: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },
    active: {
      type: Boolean,
      default: false,
      select: false,
    },

    // Addition Field for auth (user cannot access)
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiresIn: {
      type: Date,
      select: false,
    },
    userActiveToken: {
      type: String,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

// Compare login password
userSchema.methods.comparePassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};

// Check token is valid
userSchema.methods.passwordChangedAfter = function (timestamp) {
  return this.passwordChangedAt / 1000 > timestamp;
};

// Forgot password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = createToken();

  this.passwordResetToken = resetToken;
  this.passwordResetTokenExpiresIn =
    Date.now() + process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN * 60 * 1000;

  return resetToken;
};

// Create user active token when user sign up
userSchema.methods.createUserActiveToken = function () {
  const activeToken = createToken();

  this.userActiveToken = activeToken;

  return activeToken;
};

// Hash password and set passwordChangedAt (if create new or update password)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // If user has already created or has changed password
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
  this.passwordChangedAt = Date.now();
  next();
});

// Create user activeToken when create new user
userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.createUserActiveToken();
  }
  next();
});

// Only allow user active login
userSchema.pre(/^find/, function () {
  // For order route (trick -> FIXME: find another way)
  if (this._fields && this._fields.active === 1 && this._fields.order === 1) return;
  // If using for activating user, find all
  if (!this._conditions.userActiveToken && !this._conditions.isAdminAccess)
    this.find({ active: true });
  // For admin access
  if (this._conditions.isAdminAccess) {
    this._conditions.isAdminAccess = undefined;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
