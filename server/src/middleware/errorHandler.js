export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    error: 'NOT_FOUND',
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  const isDbTimeout =
    err?.name === 'MongooseError' &&
    String(err.message || '').toLowerCase().includes('buffering timed out');

  if (isDbTimeout) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Check MongoDB Atlas Network Access, then restart the server.',
      error: 'DB_NOT_CONNECTED',
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong on the server.',
    error: err.code || 'SERVER_ERROR',
  });
}
