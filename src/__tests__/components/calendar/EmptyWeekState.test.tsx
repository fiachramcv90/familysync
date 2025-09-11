// EmptyWeekState Component Tests
// Story S1.1: Fix Dashboard Component Architecture

import { render, screen } from '@testing-library/react';
import { EmptyWeekState, LoadingState, ErrorState } from '@/components/calendar/EmptyWeekState';

// Mock the app-store
jest.mock('@/stores/app-store', () => ({
  useUIActions: () => ({
    setShowQuickAdd: jest.fn(),
  }),
}));

describe('EmptyWeekState', () => {
  it('renders without errors', () => {
    render(<EmptyWeekState />);
    expect(screen.getByText('No Tasks This Week')).toBeInTheDocument();
  });

  it('shows first-time user experience when isFirstTime is true', () => {
    render(<EmptyWeekState isFirstTime={true} />);
    expect(screen.getByText('Welcome to Your Family Dashboard!')).toBeInTheDocument();
    expect(screen.getByText('Add Your First Task')).toBeInTheDocument();
  });

  it('shows regular empty state when isFirstTime is false', () => {
    render(<EmptyWeekState isFirstTime={false} />);
    expect(screen.getByText('No Tasks This Week')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<EmptyWeekState className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('LoadingState', () => {
  it('renders without errors', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<LoadingState message="Loading dashboard..." />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<LoadingState className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('ErrorState', () => {
  it('renders without errors', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    render(<ErrorState message="Failed to load data" />);
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const mockRetry = jest.fn();
    render(<ErrorState onRetry={mockRetry} />);
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<ErrorState className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});