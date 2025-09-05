// Test file for FamilyMemberAvatar Component
// Story 1.4: Basic Family Dashboard

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FamilyMemberAvatar, FamilyMemberAvatarGroup } from '@/components/family/FamilyMemberAvatar';
import { FamilyMember } from '@/types/family';
import '@testing-library/jest-dom';

// Mock family member data
const mockMember: FamilyMember = {
  id: 'user-1',
  familyId: 'family-1',
  email: 'test@example.com',
  name: 'John Doe',
  role: 'admin',
  avatarColor: '#3B82F6',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSeenAt: new Date(),
};

const mockMembers: FamilyMember[] = [
  mockMember,
  {
    ...mockMember,
    id: 'user-2',
    name: 'Jane Smith',
    role: 'member',
    avatarColor: '#EF4444',
  },
  {
    ...mockMember,
    id: 'user-3',
    name: 'Bob Wilson',
    role: 'member',
    avatarColor: '#10B981',
  },
  {
    ...mockMember,
    id: 'user-4',
    name: 'Alice Johnson',
    role: 'member',
    avatarColor: '#F59E0B',
  },
];

describe('FamilyMemberAvatar', () => {
  it('renders member initials correctly', () => {
    render(<FamilyMemberAvatar member={mockMember} />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies correct background color', () => {
    render(<FamilyMemberAvatar member={mockMember} />);
    
    const avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveStyle({ backgroundColor: '#3B82F6' });
  });

  it('handles single name correctly', () => {
    const singleNameMember = {
      ...mockMember,
      name: 'Madonna',
    };

    render(<FamilyMemberAvatar member={singleNameMember} />);
    
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('handles long names by taking first two initials', () => {
    const longNameMember = {
      ...mockMember,
      name: 'John Michael Smith Wilson',
    };

    render(<FamilyMemberAvatar member={longNameMember} />);
    
    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<FamilyMemberAvatar member={mockMember} size="sm" />);
    let avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveClass('w-6', 'h-6', 'text-xs');

    rerender(<FamilyMemberAvatar member={mockMember} size="md" />);
    avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveClass('w-8', 'h-8', 'text-sm');

    rerender(<FamilyMemberAvatar member={mockMember} size="lg" />);
    avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveClass('w-10', 'h-10', 'text-base');
  });

  it('shows name when showName is true', () => {
    render(<FamilyMemberAvatar member={mockMember} showName={true} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows role when showRole is true', () => {
    render(<FamilyMemberAvatar member={mockMember} showRole={true} showName={true} />);
    
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('shows admin role icon for admin members', () => {
    render(<FamilyMemberAvatar member={mockMember} showRole={true} />);
    
    // Check for admin icon (crown/star icon)
    const adminIcon = document.querySelector('svg');
    expect(adminIcon).toBeInTheDocument();
  });

  it('does not show role icon for regular members', () => {
    const regularMember = {
      ...mockMember,
      role: 'member' as const,
    };

    render(<FamilyMemberAvatar member={regularMember} showRole={true} />);
    
    // Should not show admin icon for regular members
    const roleIcon = document.querySelector('.absolute');
    expect(roleIcon).not.toBeInTheDocument();
  });

  it('handles click events when clickable', () => {
    const mockOnClick = jest.fn();
    render(<FamilyMemberAvatar member={mockMember} onClick={mockOnClick} />);
    
    const avatar = screen.getByText('JD').parentElement;
    if (avatar) {
      fireEvent.click(avatar);
    }
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when clickable', () => {
    const mockOnClick = jest.fn();
    render(<FamilyMemberAvatar member={mockMember} onClick={mockOnClick} />);
    
    const avatar = screen.getByText('JD').parentElement;
    
    // Test Enter key
    if (avatar) {
      fireEvent.keyDown(avatar, { key: 'Enter' });
    }
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    if (avatar) {
      fireEvent.keyDown(avatar, { key: ' ' });
    }
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('has proper accessibility attributes', () => {
    render(<FamilyMemberAvatar member={mockMember} />);
    
    const avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveAttribute('aria-label', 'John Doe');
  });

  it('includes role in aria-label when showRole is true', () => {
    render(<FamilyMemberAvatar member={mockMember} showRole={true} />);
    
    const avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveAttribute('aria-label', 'John Doe (admin)');
  });

  it('applies custom className', () => {
    render(<FamilyMemberAvatar member={mockMember} className="custom-class" />);
    
    const avatar = screen.getByText('JD').parentElement;
    expect(avatar).toHaveClass('custom-class');
  });
});

describe('FamilyMemberAvatarGroup', () => {
  it('renders all members when count is within maxVisible', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 2)} />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('shows overflow count when members exceed maxVisible', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers} maxVisible={2} />);
    
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('applies ring styling to overlapping avatars', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 2)} />);
    
    const avatars = screen.getAllByText(/[A-Z]{1,2}/);
    avatars.forEach(avatar => {
      expect(avatar.parentElement).toHaveClass('ring-2', 'ring-white');
    });
  });

  it('uses negative space for overlapping effect', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 2)} />);
    
    const container = screen.getByText('JD').closest('.flex');
    expect(container).toHaveClass('-space-x-1');
  });

  it('handles empty members array', () => {
    render(<FamilyMemberAvatarGroup members={[]} />);
    
    // Should not render anything
    expect(screen.queryByText(/[A-Z]/)).not.toBeInTheDocument();
  });

  it('respects different sizes', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 2)} size="lg" />);
    
    const avatars = screen.getAllByText(/[A-Z]{1,2}/);
    avatars.forEach(avatar => {
      expect(avatar.parentElement).toHaveClass('w-10', 'h-10');
    });
  });

  it('shows exact count for overflow when count is exactly maxVisible + 1', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 4)} maxVisible={3} />);
    
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('applies custom className to container', () => {
    render(<FamilyMemberAvatarGroup members={mockMembers.slice(0, 2)} className="custom-group" />);
    
    const container = screen.getByText('JD').closest('.flex');
    expect(container).toHaveClass('custom-group');
  });
});