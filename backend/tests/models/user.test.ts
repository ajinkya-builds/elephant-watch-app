import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserModel, User } from '../app/models/user';
import { supabase } from '../app/index';
import { AppError } from '../app/middleware/error';

// Mock the Supabase client
vi.mock('../app/index', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}));

describe('UserModel', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null })
      });

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      });

      const result = await UserModel.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if user already exists', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { id: '1' } })
      });

      await expect(
        UserModel.create({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      });

      const result = await UserModel.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should return null if user not found', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      });

      const result = await UserModel.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by id successfully', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
      });

      const result = await UserModel.findById('1');

      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should return null if user not found', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      });

      const result = await UserModel.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updatedUser: User = { ...mockUser, name: 'Updated Name' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedUser, error: null })
      });

      const result = await UserModel.update('1', { name: 'Updated Name' });

      expect(result).toEqual(updatedUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if update fails', async () => {
      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Update failed') })
      });

      await expect(
        UserModel.update('1', { name: 'Updated Name' })
      ).rejects.toThrow(AppError);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ error: null })
      });

      await UserModel.delete('1');

      expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should throw error if delete fails', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ error: new Error('Delete failed') })
      });

      await expect(UserModel.delete('1')).rejects.toThrow(AppError);
    });
  });

  describe('verifyPassword', () => {
    it('should verify password successfully', async () => {
      const result = await UserModel.verifyPassword(mockUser, 'password123');

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const result = await UserModel.verifyPassword(mockUser, 'wrongpassword');

      expect(result).toBe(false);
    });
  });
}); 