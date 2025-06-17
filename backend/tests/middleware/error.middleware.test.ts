import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { AppError, errorHandler } from '../app/middleware/error';
import { config } from '../app/config/config';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('should handle AppError correctly', () => {
    const error = new AppError('Test error', 400);

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Test error'
    });
  });

  it('should handle 500 errors correctly', () => {
    const error = new Error('Internal server error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });
  });

  it('should hide error details in production', () => {
    // Mock config to return production environment
    vi.spyOn(config, 'nodeEnv', 'get').mockReturnValue('production');

    const error = new Error('Internal server error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });

    // Restore config
    vi.restoreAllMocks();
  });

  it('should handle errors with stack trace in development', () => {
    // Mock config to return development environment
    vi.spyOn(config, 'nodeEnv', 'get').mockReturnValue('development');

    const error = new Error('Internal server error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal server error'
    });

    // Restore config
    vi.restoreAllMocks();
  });
}); 