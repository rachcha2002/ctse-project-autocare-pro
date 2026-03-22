import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../context/AuthContext';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock LoadingSpinner
vi.mock('./LoadingSpinner', () => ({
  default: ({ fullPage }) => (
    <div data-testid="loading-spinner" data-fullpage={fullPage}>
      Loading...
    </div>
  ),
}));

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('ProtectedRoute', () => {
  describe('loading state', () => {
    it('renders loading spinner when loading', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: true,
        user: null,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('unauthenticated state', () => {
    it('redirects to login when not authenticated', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: false,
        loading: false,
        user: null,
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    it('renders children when authenticated', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'customer' },
      });

      renderWithRouter(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('adminOnly prop', () => {
    it('renders children when user is admin', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'admin' },
      });

      renderWithRouter(
        <ProtectedRoute adminOnly>
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('renders children when user is mechanic', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'mechanic' },
      });

      renderWithRouter(
        <ProtectedRoute adminOnly>
          <div>Staff Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Staff Content')).toBeInTheDocument();
    });

    it('renders children when user has type staff', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, type: 'staff' },
      });

      renderWithRouter(
        <ProtectedRoute adminOnly>
          <div>Staff Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Staff Content')).toBeInTheDocument();
    });

    it('redirects customer to dashboard', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'customer' },
      });

      renderWithRouter(
        <ProtectedRoute adminOnly>
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });

  describe('superAdminOnly prop', () => {
    it('renders children when user is admin', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'admin' },
      });

      renderWithRouter(
        <ProtectedRoute superAdminOnly>
          <div>Super Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
    });

    it('shows unauthorized message for mechanic', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'mechanic' },
      });

      renderWithRouter(
        <ProtectedRoute superAdminOnly>
          <div>Super Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Super Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      expect(screen.getByText(/You do not have permission/)).toBeInTheDocument();
    });

    it('shows unauthorized message for customer', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1, role: 'customer' },
      });

      renderWithRouter(
        <ProtectedRoute superAdminOnly>
          <div>Super Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Super Admin Content')).not.toBeInTheDocument();
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles null user gracefully', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: null,
      });

      renderWithRouter(
        <ProtectedRoute adminOnly>
          <div>Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('handles undefined role gracefully', () => {
      AuthContext.useAuth.mockReturnValue({
        isAuthenticated: true,
        loading: false,
        user: { id: 1 },
      });

      renderWithRouter(
        <ProtectedRoute superAdminOnly>
          <div>Super Admin Content</div>
        </ProtectedRoute>
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });
  });
});
