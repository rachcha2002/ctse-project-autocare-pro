import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders confirmed status', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });

  it('renders in_progress status', () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders completed status', () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('renders cancelled status', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders paid status', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders created status', () => {
    render(<StatusBadge status="created" />);
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('renders waiting_parts status', () => {
    render(<StatusBadge status="waiting_parts" />);
    expect(screen.getByText('Waiting Parts')).toBeInTheDocument();
  });

  it('renders active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders in_service status', () => {
    render(<StatusBadge status="in_service" />);
    expect(screen.getByText('In Service')).toBeInTheDocument();
  });

  it('renders inactive status', () => {
    render(<StatusBadge status="inactive" />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('renders unknown status with fallback', () => {
    render(<StatusBadge status="unknown_status" />);
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<StatusBadge status="pending" />);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('text-xs');
  });
});
