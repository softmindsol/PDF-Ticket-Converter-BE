import httpStatus from "http-status";
// utils/api.utils.js
class ApiError extends Error {
  constructor(
    code,
    message = "Something went wrong",
    errors = [],
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.code = code;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;

class ApiResponse {
  constructor(res, code, data = null, message = "Success") {
    this.code = code;
    this.data = data;
    this.message = message;
    this.success = code < 400;

    // ✅ automatically send response
    res.status(this.code).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      if (err.isJoi) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: err.details[0].message,
        });
      }
      next(err);
    });
  };
};

export { ApiError, ApiResponse, asyncHandler };
