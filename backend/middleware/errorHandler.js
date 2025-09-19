function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  requestLogger
};