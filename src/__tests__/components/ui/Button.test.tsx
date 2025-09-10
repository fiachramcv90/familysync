// Button Component Tests
// Story S1.1: Fix Dashboard Component Architecture

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, FloatingActionButton } from '@/components/ui/Button';

describe('Button', () => {
  it('renders without errors', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const mockClick = jest.fn();
    render(<Button onClick={mockClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('accepts custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});

describe('FloatingActionButton', () => {
  const mockIcon = <div data-testid="mock-icon">+</div>;

  it('renders without errors', () => {
    render(
      <FloatingActionButton
        onClick={jest.fn()}
        icon={mockIcon}
        label="Add item"
      />
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const mockClick = jest.fn();
    render(
      <FloatingActionButton
        onClick={mockClick}
        icon={mockIcon}
        label="Add item"
      />
    );
    
    await user.click(screen.getByRole('button'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('displays provided icon', () => {
    render(
      <FloatingActionButton
        onClick={jest.fn()}
        icon={mockIcon}
        label="Add item"
      />
    );
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('accepts size prop', () => {
    render(
      <FloatingActionButton
        onClick={jest.fn()}
        icon={mockIcon}
        label="Add item"
        size="lg"
      />
    );
    expect(screen.getByRole('button')).toHaveClass('w-16', 'h-16');
  });

  it('accepts custom className', () => {
    render(
      <FloatingActionButton
        onClick={jest.fn()}
        icon={mockIcon}
        label="Add item"
        className="custom-class"
      />
    );
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});