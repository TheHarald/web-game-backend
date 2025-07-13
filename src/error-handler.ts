import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

export const defasultErrorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values if not provided
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the error for debugging
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Send error response
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
