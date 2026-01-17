// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose/MongoDB errors
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid ID format' 
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false,
      message: 'Token expired' 
    });
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(400).json({ 
      success: false,
      message: 'Duplicate entry. Record already exists.' 
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({ 
      success: false,
      message: 'Foreign key constraint failed' 
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
};
