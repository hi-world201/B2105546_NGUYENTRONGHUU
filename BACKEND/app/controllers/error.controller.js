const ApiError = require('../utils/ApiError');

// Handle mongoose error

const handleDuplicateKeyErrorDB = (err) => {
  let duplicatedField = Object.keys(err.keyValue);
  if (duplicatedField.includes('username', 'email')) {
    duplicatedField = duplicatedField.join(', ');

    return new ApiError(
      400,
      `${duplicatedField} has been used! Please use another ${duplicatedField}`,
    );
  }
  duplicatedField = duplicatedField.join(', ');
  return new ApiError(
    400,
    `Duplicate field value: '${duplicatedField}. Please use another value!'`,
  );
};

const handleValidationErrorDB = (err) => {
  const message = Object.keys(err.errors)
    .map((field) => err.errors[field].message)
    .join('. ');
  return new ApiError(400, message);
};

const handleCastErrorDB = (err) => {
  return new ApiError(400, `Invalid field '${err.path}': '${err.value}'`);
};

// Handle JWT error

const handleJWTExpiredError = (err) => {
  return new ApiError(401, 'Your login has expired! Please login again to access this route!');
};

const handleJWTError = (err) => {
  return new ApiError(400, 'Your login is not valid! Please login again!');
};

// Methods send error

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack, // where error happened
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  let error = { ...err };

  if (err.code === 11000) error = handleDuplicateKeyErrorDB(error);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (err.name === 'CastError') error = handleCastErrorDB(error);
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
  if (err.name === 'JsonWebTokenError') error = handleJWTError(error);

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message || err.message,
  });
};

// Global error handler

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') sendErrorProd(err, res);
  next();
};
