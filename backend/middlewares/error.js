import ErrorHandler from "../Utils/errorHandler.js";

export default (err, req, res, next) => {
  let error = {
    statusCode: err?.statusCode || 500,
    message: err?.message || "Internal Server Error",
  };

  // Handle invalid or incorrect Mongoose id Error
  if (err.name === "CastError") {
    const message = `Resource not found, Invalid: ${err?.path}`;
    error = new ErrorHandler(message, 404);
  }

  

  // Handle Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((value) => value.message);
    error = new ErrorHandler(message, 400);
  }

  // Handle Mongoose duplicate key Error
  if (err.code === 11000) {
    const message = `${Object.keys(err.keyValue)} already exists`;
    error = new ErrorHandler(message, 400);
  }

   // Handle wrong JWT Error
   if (err.code === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Please try again !!!`;
    error = new ErrorHandler(message, 400);
  }

   // Handle expire JWT Error
   if (err.code === "TokenExpiredError") {
    const message = `JSON Web Token is expired. Please try again !!!`;
    error = new ErrorHandler(message, 400);
  }

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(error.statusCode).json({
      message: error.message,
      error: err,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(error.statusCode).json({
      message: error.message,
    });
  }
};
