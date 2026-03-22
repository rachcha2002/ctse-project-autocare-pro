import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Test component to access auth context
function TestComponent() {
  const { user, token, isAuthenticated, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
      <span data-testid="token">{token || 'null'}</span>
      <button data-testid="login-btn" onClick={() => login({ id: 1, name: 'Test' }, 'test-token')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AuthProvider', () => {
    it('renders children', () => {
      render(
        <AuthProvider>
          <div data-testid="child">Child content</div>
        </AuthProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('initializes with no user when localStorage is empty', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Wait for loading to finish
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });

    it('loads user from localStorage on mount', async () => {
      const storedUser = { id: 1, name: 'Stored User' };
      localStorage.setItem('token', 'stored-token');
      localStorage.setItem('user', JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(storedUser));
      expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
    });

    it('clears storage when stored user is invalid JSON', async () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('user', 'invalid-json{');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('does not load user when only token is present', async () => {
      localStorage.setItem('token', 'orphan-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  describe('login function', () => {
    it('sets user and token state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent('{"id":1,"name":"Test"}');
      expect(screen.getByTestId('token')).toHaveTextContent('test-token');
    });

    it('stores user and token in localStorage', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('user')).toBe('{"id":1,"name":"Test"}');
    });
  });

  describe('logout function', () => {
    it('clears user and token state', async () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });

    it('removes user and token from localStorage', async () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });

  describe('isAuthenticated computed property', () => {
    it('returns true when both user and token are present', async () => {
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    it('returns false when token is missing', async () => {
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    it('returns false when user is missing', async () => {
      localStorage.setItem('token', 'valid-token');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});
