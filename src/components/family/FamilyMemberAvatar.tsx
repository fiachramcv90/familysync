// Family Member Avatar Component
// Story 1.4: Basic Family Dashboard

import { FamilyMember } from '@/types/family';
import { clsx } from 'clsx';

interface FamilyMemberAvatarProps {
  member: FamilyMember;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showRole?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: {
    avatar: 'w-6 h-6 text-xs',
    name: 'text-xs',
  },
  md: {
    avatar: 'w-8 h-8 text-sm',
    name: 'text-sm',
  },
  lg: {
    avatar: 'w-10 h-10 text-base',
    name: 'text-base',
  },
};

const roleIcons = {
  admin: (
    <svg 
      className="w-3 h-3 absolute -top-1 -right-1 bg-white rounded-full p-0.5" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11S11 10.1 11 9V7.5L5 7V9C5 10.1 4.1 11 3 11S1 10.1 1 9V7L12 5.5L23 7V9C23 10.1 22.1 11 21 11S19 10.1 19 9Z" />
    </svg>
  ),
  member: null,
};

export function FamilyMemberAvatar({ 
  member, 
  size = 'md', 
  showName = false, 
  showRole = false,
  className,
  onClick,
}: FamilyMemberAvatarProps) {
  const initials = member.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarClasses = clsx(
    'relative inline-flex items-center justify-center rounded-full font-medium text-white',
    sizeClasses[size].avatar,
    onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
    className
  );

  const roleIcon = showRole ? roleIcons[member.role] : null;

  const avatarElement = (
    <div
      className={avatarClasses}
      style={{ backgroundColor: member.avatarColor }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      aria-label={`${member.name}${showRole ? ` (${member.role})` : ''}`}
    >
      <span className="select-none">{initials}</span>
      {roleIcon && (
        <div className="text-gray-600">
          {roleIcon}
        </div>
      )}
    </div>
  );

  if (!showName) {
    return avatarElement;
  }

  return (
    <div className="flex items-center gap-2">
      {avatarElement}
      <div className="flex flex-col">
        <span className={clsx(sizeClasses[size].name, 'font-medium text-gray-900')}>
          {member.name}
        </span>
        {showRole && (
          <span className="text-xs text-gray-500 capitalize">
            {member.role}
          </span>
        )}
      </div>
    </div>
  );
}

// Component for showing multiple avatars (for tasks assigned to multiple people)
interface FamilyMemberAvatarGroupProps {
  members: FamilyMember[];
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  className?: string;
}

export function FamilyMemberAvatarGroup({ 
  members, 
  size = 'md', 
  maxVisible = 3,
  className 
}: FamilyMemberAvatarGroupProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);

  return (
    <div className={clsx('flex -space-x-1', className)}>
      {visibleMembers.map((member) => (
        <FamilyMemberAvatar
          key={member.id}
          member={member}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remainingCount > 0 && (
        <div 
          className={clsx(
            'relative inline-flex items-center justify-center rounded-full bg-gray-100 ring-2 ring-white',
            sizeClasses[size].avatar
          )}
        >
          <span className={clsx('font-medium text-gray-600', sizeClasses[size].name)}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}

// Hook for consistent avatar colors
export function useAvatarColors() {
  const colors = [
    '#EF4444', // red-500
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
    '#6366F1', // indigo-500
  ];

  const getColorForMember = (memberId: string) => {
    const index = memberId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return { colors, getColorForMember };
}