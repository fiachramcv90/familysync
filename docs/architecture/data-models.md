# Data Models

## Family

**Purpose:** Core entity representing a household coordination unit with shared access to tasks and events

**Key Attributes:**
- id: string (UUID) - Unique family identifier for data isolation
- name: string - Family display name for UI personalization
- createdAt: Date - Audit trail for family creation
- inviteCode: string - Secure invitation mechanism for family member joining
- settings: FamilySettings - Customization preferences for coordination workflows

### TypeScript Interface

```typescript
interface Family {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  inviteCode: string;
  settings: {
    weekStartDay: 'sunday' | 'monday';
    timezone: string;
    notifications: {
      taskDue: boolean;
      taskAssigned: boolean;
      taskCompleted: boolean;
    };
  };
}
```

### Relationships
- Has many FamilyMembers (1-4 members per PRD requirements)
- Has many Tasks through FamilyMembers
- Has many Events through FamilyMembers

## FamilyMember

**Purpose:** Individual user account within a family context, enabling task assignment and ownership tracking

**Key Attributes:**
- id: string (UUID) - Unique user identifier
- familyId: string - Foreign key for family data isolation
- email: string - Authentication credential and invitation target
- name: string - Display name for task ownership visual identification
- role: string - Admin vs Member permissions for family management
- avatarColor: string - Consistent color coding per front-end spec requirements

### TypeScript Interface

```typescript
interface FamilyMember {
  id: string;
  familyId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'member';
  avatarColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date;
}
```

### Relationships
- Belongs to Family
- Has many Tasks (as assignee)
- Has many Events (as assignee)
- Has many audit logs for coordination tracking

## Task

**Purpose:** Core coordination entity representing family responsibilities with assignment, due dates, and completion tracking

**Key Attributes:**
- id: string (UUID) - Unique task identifier
- familyId: string - Data isolation enforcement
- title: string - Primary task description for weekly dashboard display
- assigneeId: string - Ownership for visual identification and workload distribution
- dueDate: Date - Optional deadline for priority ordering
- status: TaskStatus - Completion state for visual indicators
- category: string - Grouping for weekly dashboard organization

### TypeScript Interface

```typescript
interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assigneeId: string;
  createdById: string;
  dueDate?: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  category: 'task' | 'event';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  syncVersion: number; // For offline conflict resolution
}
```

### Relationships
- Belongs to Family
- Assigned to FamilyMember
- Created by FamilyMember
- Has many TaskNotes for detailed coordination

## Event

**Purpose:** Time-specific family coordination item with scheduling and calendar integration requirements

**Key Attributes:**
- id: string (UUID) - Unique event identifier
- familyId: string - Family data isolation
- title: string - Event name for calendar display
- assigneeId: string - Event responsibility assignment
- startDateTime: Date - Scheduled time for weekly dashboard positioning
- endDateTime: Date - Duration calculation for family workload view
- location: string - Optional location for coordination context

### TypeScript Interface

```typescript
interface Event {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assigneeId: string;
  createdById: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  syncVersion: number;
}
```

### Relationships
- Belongs to Family
- Assigned to FamilyMember
- Created by FamilyMember
