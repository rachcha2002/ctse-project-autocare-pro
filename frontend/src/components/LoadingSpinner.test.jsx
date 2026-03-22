import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders spinner without fullPage', () => {
    render(<LoadingSpinner />);
    // Should not show "Loading..." text when not fullPage
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders fullPage spinner with loading text', () => {
    render(<LoadingSpinner fullPage={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.w-4');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with medium size (default)', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.w-8');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.w-12');
    expect(spinner).toBeInTheDocument();
  });

  it('renders fullPage with correct background', () => {
    const { container } = render(<LoadingSpinner fullPage={true} />);
    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
  });
});
