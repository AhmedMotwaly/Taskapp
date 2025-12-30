const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', { message: err.message, stack: err.stack, path: req.path, method: req.method });
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, error: message });
};

module.exports = errorHandler;
