// Family Member Selection Component
// Story 2.1: Task Creation and Basic Management

// import { Select } from '@/components/ui/Input'; // Not needed for current implementation
import { FamilyMemberAvatar } from '@/components/family/FamilyMemberAvatar';
import { useFamilyMembers } from '@/hooks/useFamilyTasks';
import { clsx } from 'clsx';

interface FamilyMemberSelectProps {
  value: string;
  onChange: (memberId: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  label?: string;
}

export function FamilyMemberSelect({
  value,
  onChange,
  error,
  className,
  placeholder = "Select family member", // Currently unused in this implementation
  label = "Assign to",
}: FamilyMemberSelectProps) {
  const { data: familyMembers = [], isLoading, isError } = useFamilyMembers();
  
  // Find the selected member for avatar display
  const selectedMember = familyMembers.find(member => member.id === value);

  if (isError) {
    return (
      <div className={clsx('space-y-1', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="text-sm text-red-600">
          Failed to load family members
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Selected member display */}
        {selectedMember && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <FamilyMemberAvatar 
              member={selectedMember} 
              size="sm" 
              showName={true}
            />
            <span className="text-sm text-blue-700">
              Assigned
            </span>
          </div>
        )}

        {/* Member selection grid */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Choose assignee
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              role="radiogroup" 
              aria-label="Family member selection"
              className="grid grid-cols-1 gap-2"
            >
              {familyMembers.map((member) => {
                const isSelected = value === member.id;
                
                return (
                  <button
                    key={member.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onChange(member.id)}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                      // Touch-friendly minimum size
                      'min-h-[44px]',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <FamilyMemberAvatar 
                      member={member} 
                      size="sm" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {member.name}
                      </div>
                      <div className={clsx(
                        'text-xs capitalize',
                        isSelected ? 'text-blue-600' : 'text-gray-500'
                      )}>
                        {member.role}
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className="flex-shrink-0">
                      <div
                        className={clsx(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        )}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}