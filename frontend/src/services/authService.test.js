import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginCustomer, loginStaff, registerCustomer } from './authService';
import api from './api';

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginCustomer', () => {
    it('calls api.post with correct parameters', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          customer: { id: 1, email: 'test@example.com' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await loginCustomer('test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error when login fails', async () => {
      api.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(loginCustomer('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('loginStaff', () => {
    it('calls api.post with correct parameters', async () => {
      const mockResponse = {
        data: {
          token: 'staff-token',
          staff: { id: 1, email: 'admin@autocare.com', role: 'admin' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await loginStaff('admin@autocare.com', 'Admin@2026');

      expect(api.post).toHaveBeenCalledWith('/api/auth/staff/login', {
        email: 'admin@autocare.com',
        password: 'Admin@2026',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error when staff login fails', async () => {
      api.post.mockRejectedValue(new Error('Staff not found'));

      await expect(loginStaff('unknown@autocare.com', 'password')).rejects.toThrow('Staff not found');
    });
  });

  describe('registerCustomer', () => {
    it('calls api.post with correct parameters', async () => {
      const formData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '0771234567',
        password: 'Password123!',
      };
      const mockResponse = {
        data: {
          token: 'new-token',
          customer: { id: 1, ...formData },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await registerCustomer(formData);

      expect(api.post).toHaveBeenCalledWith('/api/auth/register', formData);
      expect(result).toEqual(mockResponse.data);
    });

    it('throws error when registration fails', async () => {
      api.post.mockRejectedValue(new Error('Email already exists'));

      await expect(registerCustomer({ email: 'existing@example.com' })).rejects.toThrow('Email already exists');
    });
  });
});
