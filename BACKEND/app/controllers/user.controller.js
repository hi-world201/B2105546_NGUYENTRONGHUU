const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const MongooseQuery = require('../utils/MongooseQuery');
const { filterPayload } = require('../utils/extractPayload');

// For admin

exports.getAllUser = async (req, res, next) => {
  try {
    let mongooseQuery = new MongooseQuery(User.find(), { ...req.query, isAdminAccess: true });
    mongooseQuery.filter().sort().paginate();

    const users = await mongooseQuery.query.select('-password +active');

    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.userId, isAdminAccess: true }).select(
      '+active',
    );

    if (!user) {
      return next(new ApiError(404, 'No user found with that ID!'));
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    const user = await User.create(payload);

    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, isAdminAccess: true },
      { ...req.body },
      { new: true, runValidators: true },
    ).select('+active');

    if (!user) {
      return next(new ApiError(404, 'No user found with that ID'));
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // Remove user
    const user = await User.findOneAndUpdate(
      { _id: req.params.userId },
      { active: false },
      { new: true, runValidators: true },
    ).select('+active');

    if (!user) {
      return next(new ApiError(404, 'No User found with that ID'));
    }

    res.status(204).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

// For user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      '-active -__v -password -passwordChangedAt',
    );

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    // Not for password update
    if (req.body.password || req.body.confirmPassword) {
      return next(
        new ApiError(400, 'This route is not for password update. Please use /changePassword'),
      );
    }

    // Remove field from req.body
    const excludedFields = ['role', 'passwordChangedAt', 'email', 'active', 'id', '_id'];
    const filtered = filterPayload(req.body, excludedFields);

    // Update data
    const user = await User.findByIdAndUpdate(req.user.id, filtered, {
      new: true,
      runValidators: true,
    }).select('-active -__v -password -passwordChangedAt');

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteMe = async (req, res, next) => {
  try {
    // Unactive user
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};
