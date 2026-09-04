export const errorHandler = (err, req, res, next) => {
  console.error('[API Error]', err.stack || err.message || err);

  const statusCode = err.status || err.statusCode || 400;
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode
    }
  });
};
