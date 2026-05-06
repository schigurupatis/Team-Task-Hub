import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/task.types';

export const notFound = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    process.stderr.write(`[Error] ${err.message}\n${err.stack ?? ''}\n`);
  }
  const response: ApiResponse = {
    success: false,
    error: 'Internal Server Error',
    message: isDev ? err.message : 'Something went wrong',
  };
  res.status(500).json(response);
};

export const validateIdParam = (req: Request, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id === 'string' && !uuidRegex.test(id)) {
    const response: ApiResponse = { success: false, error: 'Invalid task ID format' };
    res.status(400).json(response);
    return;
  }
  next();
};