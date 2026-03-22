import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing api
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('api service', () => {
  let mockApi;
  let requestInterceptor;
  let responseInterceptor;
  let originalLocation;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Save original location
    originalLocation = window.location;

    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    // Reset modules to re-import api
    vi.resetModules();

    // Get the mock axios instance
    mockApi = axios.create();

    // Capture interceptors
    mockApi.interceptors.request.use.mockImplementation((successFn, errorFn) => {
      requestInterceptor = { success: successFn, error: errorFn };
    });

    mockApi.interceptors.response.use.mockImplementation((successFn, errorFn) => {
      responseInterceptor = { success: successFn, error: errorFn };
    });
  });

  afterEach(() => {
    window.location = originalLocation;
    localStorage.clear();
  });

  describe('axios instance creation', () => {
    it('creates axios instance with correct base configuration', async () => {
      await import('./api');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('request interceptor', () => {
    it('adds Authorization header when token exists', async () => {
      await import('./api');

      localStorage.setItem('token', 'test-token');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('does not add Authorization header when no token', async () => {
      await import('./api');

      const config = { headers: {} };
      const result = requestInterceptor.success(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('rejects on request error', async () => {
      await import('./api');

      const error = new Error('Request error');
      await expect(requestInterceptor.error(error)).rejects.toThrow('Request error');
    });
  });

  describe('response interceptor', () => {
    it('passes through successful responses', async () => {
      await import('./api');

      const response = { data: { success: true }, status: 200 };
      const result = responseInterceptor.success(response);

      expect(result).toEqual(response);
    });

    it('clears storage and redirects on 401 error', async () => {
      await import('./api');

      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const error = {
        response: { status: 401 },
      };

      await expect(responseInterceptor.error(error)).rejects.toEqual(error);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });

    it('does not redirect on non-401 errors', async () => {
      await import('./api');

      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      const error = {
        response: { status: 500 },
      };

      await expect(responseInterceptor.error(error)).rejects.toEqual(error);
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(window.location.href).toBe('');
    });

    it('handles errors without response object', async () => {
      await import('./api');

      localStorage.setItem('token', 'test-token');

      const error = new Error('Network error');

      await expect(responseInterceptor.error(error)).rejects.toThrow('Network error');
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });
});
