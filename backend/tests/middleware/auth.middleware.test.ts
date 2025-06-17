import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../app/middleware/auth';
import { config } from '../app/config/config';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

describe('Auth Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
  });

  it('should return 401 if no authorization header', async () => {
    await auth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No authorization header'
    });
  });

  it('should return 401 if no token provided', async () => {
    mockReq.headers = {
      authorization: 'Bearer '
    };

    await auth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'No token provided'
    });
  });

  it('should return 401 if token is invalid', async () => {
    mockReq.headers = {
      authorization: 'Bearer invalid-token'
    };

    await auth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
  });

  it('should return 401 if token is expired', async () => {
    const expiredToken = jwt.sign(
      { id: '1', email: 'test@example.com' },
      config.jwt.secret,
      { expiresIn: '0s' }
    );

    mockReq.headers = {
      authorization: `Bearer ${expiredToken}`
    };

    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 1000));

    await auth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Token expired'
    });
  });

  it('should set user in request and call next if token is valid', async () => {
    const token = jwt.sign(
      { id: '1', email: 'test@example.com' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    mockReq.headers = {
      authorization: `Bearer ${token}`
    };

    await auth(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockReq.user).toEqual({
      id: '1',
      email: 'test@example.com'
    });
    expect(mockNext).toHaveBeenCalled();
  });
}); 