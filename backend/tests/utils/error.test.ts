import { describe, it, expect } from 'vitest';
import { AppError } from '../../app/utils/error';

describe('AppError', () => {
  it('should create error with default status code', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(true);
  });

  it('should create error with custom status code', () => {
    const error = new AppError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should create error with custom status', () => {
    const error = new AppError('Bad request', 400);
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should create error with isOperational flag', () => {
    const error = new AppError('Server error', 500, false);
    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
    expect(error.status).toBe('error');
    expect(error.isOperational).toBe(false);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Test error');
    expect(error.stack).toBeDefined();
  });

  it('should handle different error types', () => {
    const errors = [
      new AppError('Bad Request', 400),
      new AppError('Unauthorized', 401),
      new AppError('Forbidden', 403),
      new AppError('Not Found', 404),
      new AppError('Internal Server Error', 500),
    ];

    errors.forEach((error) => {
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBeDefined();
      expect(error.status).toBeDefined();
      expect(error.isOperational).toBeDefined();
    });
  });
}); 