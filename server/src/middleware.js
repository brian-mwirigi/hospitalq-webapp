import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please log in.',
        error: 'NO_TOKEN',
      });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.',
        error: 'INVALID_USER',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid or expired.',
      error: 'INVALID_TOKEN',
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to do this.',
        error: 'FORBIDDEN',
      });
    }
    next();
  };
}

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