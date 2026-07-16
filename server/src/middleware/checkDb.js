import mongoose from 'mongoose';

export function requireDb(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Check MongoDB Atlas Network Access, then restart the server.',
    error: 'DB_NOT_CONNECTED',
  });
}
