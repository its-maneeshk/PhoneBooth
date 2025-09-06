export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    status,
    message: err.message || "Server Error"
  });
};
