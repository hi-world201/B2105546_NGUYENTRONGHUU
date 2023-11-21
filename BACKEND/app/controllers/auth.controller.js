const { filterPayload } = require('../utils/extractPayload');
const { setCookie, getCookie, clearCookie } = require('../utils/cookie');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');

// Send mail based on environment
const sendMail =
  process.env.NODE_ENV === 'development'
    ? require('../utils/sendMail')
    : require('../utils/sendMail.gmail');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//  Create link to send mail
const createActiveLink = (req, activeToken) => {
  return `${process.env.FRONTEND_ACTIVE_URL}/${activeToken}
  or ${req.protocol}://${req.headers.host}/api/v1/users/active/${activeToken}`;
};

const createResetLink = (req, resetToken) => {
  return `${process.env.FRONTEND_RESET_PASSWORD_URL}/${resetToken}
  or ${req.protocol}://${req.headers.host}/api/v1/users/resetPassword/${resetToken}`;
};

exports.signup = async (req, res, next) => {
  try {
    // Remove fields from req.body
    const excludedFields = ['role', 'active'];
    const filtered = filterPayload(req.body, excludedFields);

    // Create user
    const user = await User.create(filtered);

    // Send activate mail
    const activeLink = createActiveLink(req, user.userActiveToken);
    const mail = {
      to: user.email,
      subject: 'Activate your account',
      text: `Please click on the following link to activate your account:
      ${activeLink}`,
    };
    await sendMail(mail);

    // Send response
    res.status(201).json({
      status: 'success',
      message:
        'Your active token has been sent to your email! Please check it to complete sign up!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.activeUser = async (req, res, next) => {
  try {
    // Find user in database by active token
    const user = await User.findOne({ userActiveToken: req.params.activeToken });

    // Token is not valid
    if (!user) {
      return next(new ApiError(400, 'Your token is not valid! Please provide a valid token!'));
    }

    // Active user and save
    user.active = true;
    user.userActiveToken = undefined;
    await user.save({
      validateBeforeSave: false,
    });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Your account has been activated!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Empty email
    if (!email || !password) {
      return next(new ApiError(400, 'Please provide your email and password!'));
    }

    // Get user from database
    const user = await User.findOne({ email }).select('+password');

    // User not found or password not correct
    if (!user || !(await user.comparePassword(password, user.password))) {
      return next(new ApiError(401, 'Incorrect email and password!'));
    }

    const token = signToken(user._id);

    // Send response
    setCookie(res, token);
    res.status(200).json({
      status: 'success',
      message: 'Login sucessfully!',
      data: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    /* bearer token
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
      return next(new ApiError(401, 'Please login before accessing this route'));
    }
    const token = req.headers.authorization.split(' ')[1];
    */
    const token = getCookie(req);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Get user from database by Id
    const user = await User.findById(decodedToken.id);

    // Check user exist
    if (!user) {
      return next(new ApiError(404, 'User does not exist! Please try again!'));
    }

    // Check if user has changed password after creating token
    if (user.passwordChangedAfter(decodedToken.iat)) {
      return next(new ApiError(401, 'Your password has been changed! Please login again!'));
    }

    // Grant access to protected route
    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (err) {
    return next(err);
  }
};

exports.restrictTo = (...roles) => {
  // Return a callback function (middleware)
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return next(new ApiError(403, 'You do not have permission for this action!'));
    }
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // find user in database by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ApiError(404, 'Cannot found any user! Please provide a correct email!'));
    }

    // Save passwordResetToken and ExpiresTime into user
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset password mail
    const resetLink = createResetLink(req, resetToken);
    const mail = {
      to: user.email,
      subject: 'Reset your password',
      text: `Please click on the following link to reset your password:
      ${resetLink}`,
    };
    await sendMail(mail);

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Your reset token has been sent to your email! Please check your email to complete!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // find user by reset token
    const { resetToken } = req.params;
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetTokenExpiresIn: { $gte: Date.now() },
    });

    if (!user) {
      return next(new ApiError(400, 'Your token is not valid! Please provide a valid token!'));
    }

    // Update user password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save();

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Your password has been changed successfully!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // Find user in database
    const user = await User.findById(req.user.id).select('+password');

    // Empty or incorrect old password
    if (
      !req.body.oldPassword ||
      !(await user.comparePassword(req.body.oldPassword, user.password))
    ) {
      return next(new ApiError(401, 'Your password is wrong. Please provide a correct password!'));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    const token = signToken(user._id);

    // Send response
    setCookie(res, token);
    res.status(200).json({
      status: 'success',
      message: 'Update password sucessfully!',
    });
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res, next) => {
  try {
    clearCookie(res);
    res.status(200).json({
      status: 'success',
      message: 'Logout successfully!',
    });
  } catch (err) {
    return next(err);
  }
};
