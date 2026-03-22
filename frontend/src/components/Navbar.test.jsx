import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import * as AuthContext from '../context/AuthContext';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the logo import
vi.mock('../assets/logo.png', () => ({
  default: 'mock-logo.png',
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderNavbar = (route = '/') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('unauthenticated state', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: null,
        logout: vi.fn(),
        isAuthenticated: false,
      });
    });

    it('renders logo and brand name', () => {
      renderNavbar();

      expect(screen.getByAltText('AutoCare Pro Logo')).toBeInTheDocument();
      expect(screen.getByText('AutoCare')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
    });

    it('renders login and signup links', () => {
      renderNavbar();

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('does not render navigation links', () => {
      renderNavbar();

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('My Vehicles')).not.toBeInTheDocument();
    });

    it('does not render sign out button', () => {
      renderNavbar();

      expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
    });
  });

  describe('customer authenticated state', () => {
    const mockLogout = vi.fn();

    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'John Customer', role: 'customer' },
        logout: mockLogout,
        isAuthenticated: true,
      });
    });

    it('renders customer navigation links', () => {
      renderNavbar();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('My Vehicles')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
    });

    it('renders user avatar with first letter', () => {
      renderNavbar();

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders user name and role', () => {
      renderNavbar();

      expect(screen.getByText('John Customer')).toBeInTheDocument();
      expect(screen.getByText('customer')).toBeInTheDocument();
    });

    it('renders sign out button', () => {
      renderNavbar();

      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });

    it('calls logout and navigates on sign out', () => {
      renderNavbar();

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('does not render admin-only links', () => {
      renderNavbar();

      expect(screen.queryByText('Staff')).not.toBeInTheDocument();
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
    });
  });

  describe('admin authenticated state', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'Admin User', role: 'admin' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('renders admin navigation links', () => {
      renderNavbar();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
      expect(screen.getByText('Jobs')).toBeInTheDocument();
      expect(screen.getByText('Customers')).toBeInTheDocument();
      expect(screen.getByText('Staff')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
    });

    it('renders admin user info', () => {
      renderNavbar();

      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('mechanic authenticated state', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'John Mechanic', role: 'mechanic' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('renders jobs link for mechanic', () => {
      renderNavbar();

      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });

    it('does not render admin-only links for mechanic', () => {
      renderNavbar();

      // Mechanic should see Jobs but not admin dashboard
      expect(screen.queryByText('Customers')).not.toBeInTheDocument();
      expect(screen.queryByText('Staff')).not.toBeInTheDocument();
    });
  });

  describe('staff type user', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'Staff User', type: 'staff' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('renders staff navigation', () => {
      renderNavbar();

      expect(screen.getByText('Jobs')).toBeInTheDocument();
    });
  });

  describe('user with name property instead of fullName', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, name: 'Named User', role: 'customer' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('uses name when fullName is not available', () => {
      renderNavbar();

      expect(screen.getByText('Named User')).toBeInTheDocument();
      expect(screen.getByText('N')).toBeInTheDocument();
    });
  });

  describe('user without fullName or name', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, role: 'customer' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('uses U as default avatar letter', () => {
      renderNavbar();

      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('user without role', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'No Role User' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('shows customer as default role', () => {
      renderNavbar();

      expect(screen.getByText('customer')).toBeInTheDocument();
    });
  });

  describe('active link highlighting', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({
        user: { id: 1, fullName: 'Test User', role: 'customer' },
        logout: vi.fn(),
        isAuthenticated: true,
      });
    });

    it('highlights dashboard link when on dashboard route', () => {
      renderNavbar('/dashboard');

      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink).toHaveClass('text-orange-400');
    });

    it('highlights vehicles link when on vehicles route', () => {
      renderNavbar('/vehicles');

      const vehiclesLink = screen.getByText('My Vehicles');
      expect(vehiclesLink).toHaveClass('text-orange-400');
    });
  });
});
