import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../app/routes/auth';
import { register, login, getMe } from '../app/controllers/auth';
import { auth } from '../app/middleware/auth';

// Mock the controllers
vi.mock('../app/controllers/auth', () => ({
  register: vi.fn(),
  login: vi.fn(),
  getMe: vi.fn()
}));

// Mock the auth middleware
vi.mock('../app/middleware/auth', () => ({
  auth: vi.fn()
}));

describe('Auth Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('should call register controller', async () => {
      const mockRegister = register as jest.Mock;
      mockRegister.mockImplementation((req, res) => {
        res.status(201).json({ message: 'User registered' });
      });

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });

      expect(mockRegister).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should call login controller', async () => {
      const mockLogin = login as jest.Mock;
      mockLogin.mockImplementation((req, res) => {
        res.status(200).json({ message: 'User logged in' });
      });

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(mockLogin).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should call auth middleware and getMe controller', async () => {
      const mockAuth = auth as jest.Mock;
      const mockGetMe = getMe as jest.Mock;

      mockAuth.mockImplementation((req, res, next) => {
        req.user = { id: '1', email: 'test@example.com' };
        next();
      });

      mockGetMe.mockImplementation((req, res) => {
        res.status(200).json({ message: 'User profile' });
      });

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token');

      expect(mockAuth).toHaveBeenCalled();
      expect(mockGetMe).toHaveBeenCalled();
    });
  });
}); 