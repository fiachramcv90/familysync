// React Query hook for Family Tasks
// Story 1.4: Basic Family Dashboard

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Task, Event, WeeklyDashboardData, WeeklyTaskView, UpdateTaskInput, CreateTaskInput } from '@/types/task';
import { FamilyMember } from '@/types/family';

// Mock data for development until backend is ready
const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    familyId: 'family-1',
    email: 'mom@family.com',
    name: 'Mom',
    role: 'admin',
    avatarColor: '#EF4444', // red-500
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastSeenAt: new Date(),
  },
  {
    id: '2',
    familyId: 'family-1',
    email: 'dad@family.com',
    name: 'Dad',
    role: 'admin',
    avatarColor: '#3B82F6', // blue-500
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastSeenAt: new Date(),
  },
  {
    id: '3',
    familyId: 'family-1',
    email: 'teen@family.com',
    name: 'Alex',
    role: 'member',
    avatarColor: '#10B981', // emerald-500
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastSeenAt: new Date(),
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    familyId: 'family-1',
    title: 'Buy groceries',
    description: 'Get items for dinner this week',
    assigneeId: '1',
    createdById: '2',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    completedAt: null,
    status: 'pending',
    category: 'task',
    priority: 'high',
    syncVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: mockFamilyMembers[0],
    createdBy: mockFamilyMembers[1],
  },
  {
    id: '3',
    familyId: 'family-1',
    title: 'Clean garage',
    description: 'Organize tools and storage',
    assigneeId: '2',
    createdById: '1',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    completedAt: null,
    status: 'in_progress',
    category: 'task',
    priority: 'low',
    syncVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: mockFamilyMembers[1],
    createdBy: mockFamilyMembers[0],
  },
];

const mockEvents: Event[] = [
  {
    id: '2',
    familyId: 'family-1',
    title: 'Soccer practice',
    description: 'Team practice at the park',
    assigneeId: '3',
    createdById: '1',
    startDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    location: 'Community Park',
    status: 'scheduled',
    syncVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: mockFamilyMembers[2],
    createdBy: mockFamilyMembers[0],
  },
];

// Task service with real API calls
const taskService = {
  async getTasksForWeek(weekStart: Date): Promise<WeeklyDashboardData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); // Monday start
    const days: WeeklyTaskView[] = [];

    // Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      
      // Filter tasks for this day
      const dayTasks = mockTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = format(task.dueDate, 'yyyy-MM-dd');
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');
        return taskDate === currentDateStr;
      });

      // Filter events for this day
      const dayEvents = mockEvents.filter(event => {
        const eventDate = format(event.startDateTime, 'yyyy-MM-dd');
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');
        return eventDate === currentDateStr;
      });

      days.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        dayName: format(currentDate, 'EEEE'),
        tasks: dayTasks,
        events: dayEvents,
        taskCount: dayTasks.length,
        eventCount: dayEvents.length,
        completedTaskCount: dayTasks.filter(t => t.status === 'completed').length,
        overdueTaskCount: dayTasks.filter(t => 
          t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
        ).length,
      });
    }

    const allTasks = mockTasks;
    const allEvents = mockEvents;
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const completedEvents = allEvents.filter(e => e.status === 'completed');
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    );

    const totalItems = allTasks.length + allEvents.length;
    const completedItems = completedTasks.length + completedEvents.length;

    return {
      weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
      days,
      summary: {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        overdueTasks: overdueTasks.length,
        pendingTasks: allTasks.filter(t => t.status === 'pending').length,
        totalEvents: allEvents.length,
        completedEvents: completedEvents.length,
        upcomingEvents: allEvents.filter(e => 
          e.startDateTime > new Date() && e.status === 'scheduled'
        ).length,
        completionRate: totalItems > 0 ? 
          Math.round((completedItems / totalItems) * 100) : 0,
      },
      members: mockFamilyMembers.map(member => {
        const memberTasks = allTasks.filter(t => t.assigneeId === member.id);
        const memberEvents = allEvents.filter(e => e.assigneeId === member.id);
        const memberTasksCompleted = memberTasks.filter(t => t.status === 'completed');
        const memberEventsCompleted = memberEvents.filter(e => e.status === 'completed');
        const memberOverdue = memberTasks.filter(t => 
          t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
        );
        
        const totalAssigned = memberTasks.length + memberEvents.length;
        const totalCompleted = memberTasksCompleted.length + memberEventsCompleted.length;
        
        return {
          memberId: member.id,
          memberName: member.name,
          avatarColor: member.avatarColor,
          tasksAssigned: memberTasks.length,
          tasksCompleted: memberTasksCompleted.length,
          eventsAssigned: memberEvents.length,
          eventsCompleted: memberEventsCompleted.length,
          completionRate: totalAssigned > 0 ? 
            Math.round((totalCompleted / totalAssigned) * 100) : 0,
          overdueCount: memberOverdue.length,
        };
      }),
    };
  },

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 409) {
        // Conflict - task has been modified
        throw new Error(`Conflict: ${errorData.error || 'Task has been modified by another user'}`);
      }
      throw new Error(errorData.error || `Failed to update task: ${response.status}`);
    }

    return await response.json();
  },

  async getFamilyMembers(): Promise<FamilyMember[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...mockFamilyMembers];
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Create new task with generated ID
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      familyId: 'family-1',
      title: input.title,
      description: input.description || null,
      assigneeId: input.assigneeId,
      createdById: '2', // Current user mock
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      completedAt: null,
      status: 'pending',
      category: input.category || 'task',
      priority: input.priority || 'medium',
      syncVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignee: mockFamilyMembers.find(m => m.id === input.assigneeId),
      createdBy: mockFamilyMembers.find(m => m.id === '2'),
    };

    // Add to mock tasks array
    mockTasks.push(newTask);

    return newTask;
  },
};

// React Query hook for fetching weekly tasks
export const useFamilyTasks = (weekStart: Date) => {
  const weekString = format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['tasks', 'week', weekString],
    queryFn: () => taskService.getTasksForWeek(startOfWeek(weekStart, { weekStartsOn: 1 })),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
  });
};

// React Query hook for fetching family members
export const useFamilyMembers = () => {
  return useQuery({
    queryKey: ['family', 'members'],
    queryFn: () => taskService.getFamilyMembers(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Mutation hook for updating tasks with optimistic updates
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) =>
      taskService.updateTask(taskId, updates),
    
    onMutate: async ({ taskId, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousData = queryClient.getQueriesData({ queryKey: ['tasks'] });

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (oldData: WeeklyDashboardData | undefined) => {
        if (!oldData) return oldData;

        const newData = { ...oldData };
        
        // Apply optimistic updates to tasks
        newData.days = newData.days.map(day => ({
          ...day,
          tasks: day.tasks.map(task => {
            if (task.id !== taskId) return task;

            const updatedTask = { ...task };

            // Apply all provided updates
            Object.keys(updates).forEach(key => {
              const value = updates[key as keyof UpdateTaskInput];
              if (value !== undefined) {
                if (key === 'dueDate' && value) {
                  updatedTask.dueDate = typeof value === 'string' ? new Date(value) : value instanceof Date ? value : new Date(value);
                } else if (key === 'completedAt' && value) {
                  updatedTask.completedAt = typeof value === 'string' ? new Date(value) : value instanceof Date ? value : new Date(value);
                } else {
                  // Type-safe assignment for other fields
                  Object.assign(updatedTask, { [key]: value });
                }
              }
            });

            // Auto-set completion timestamp when marking as completed
            if (updates.status === 'completed' && !updatedTask.completedAt) {
              updatedTask.completedAt = new Date();
            } else if (updates.status && updates.status !== 'completed') {
              updatedTask.completedAt = null;
            }

            updatedTask.updatedAt = new Date();
            updatedTask.syncVersion = (updatedTask.syncVersion || 1) + 1;

            return updatedTask;
          }),
          // Recalculate day summary counts
          completedTaskCount: day.tasks.filter(t => 
            t.id === taskId 
              ? (updates.status === 'completed' || (updates.status === undefined && t.status === 'completed'))
              : t.status === 'completed'
          ).length,
        }));

        // Update overall summary counts
        if (newData.summary && updates.status) {
          const originalTask = newData.days
            .flatMap(day => day.tasks)
            .find(task => task.id === taskId);

          if (originalTask) {
            const wasCompleted = originalTask.status === 'completed';
            const willBeCompleted = updates.status === 'completed';
            const wasPending = originalTask.status === 'pending';
            const willBePending = updates.status === 'pending';

            newData.summary = {
              ...newData.summary,
              completedTasks: newData.summary.completedTasks + 
                (willBeCompleted && !wasCompleted ? 1 : 0) +
                (!willBeCompleted && wasCompleted ? -1 : 0),
              pendingTasks: newData.summary.pendingTasks +
                (willBePending && !wasPending ? 1 : 0) +
                (!willBePending && wasPending ? -1 : 0),
            };

            // Recalculate completion rate
            const totalItems = newData.summary.totalTasks + newData.summary.totalEvents;
            const completedItems = newData.summary.completedTasks + newData.summary.completedEvents;
            newData.summary.completionRate = totalItems > 0 
              ? Math.round((completedItems / totalItems) * 100) 
              : 0;
          }
        }

        return newData;
      });

      // Return context with previous data for rollback
      return { previousData };
    },

    onError: (err, variables, context) => {
      // Rollback the optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      // Refetch tasks after mutation completes
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Mutation hook for creating tasks with optimistic updates
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    
    onMutate: async (newTaskInput) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ['tasks'] });

      // Generate optimistic task ID
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create optimistic task
      const optimisticTask: Task = {
        id: optimisticId,
        familyId: 'family-1',
        title: newTaskInput.title,
        description: newTaskInput.description || null,
        assigneeId: newTaskInput.assigneeId,
        createdById: '2', // Current user mock
        dueDate: newTaskInput.dueDate ? new Date(newTaskInput.dueDate) : null,
        completedAt: null,
        status: 'pending',
        category: newTaskInput.category || 'task',
        priority: newTaskInput.priority || 'medium',
        syncVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignee: mockFamilyMembers.find(m => m.id === newTaskInput.assigneeId),
        createdBy: mockFamilyMembers.find(m => m.id === '2'),
      };

      // Optimistically update all relevant weekly queries
      queryClient.setQueriesData(
        { queryKey: ['tasks', 'week'] },
        (oldData: WeeklyDashboardData | undefined) => {
          if (!oldData) return oldData;

          // Find the appropriate day to add the task to
          const taskDate = optimisticTask.dueDate 
            ? format(optimisticTask.dueDate, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'); // Default to today if no due date

          const newData = { ...oldData };
          newData.days = newData.days.map((day: WeeklyTaskView) => {
            if (day.date === taskDate) {
              return {
                ...day,
                tasks: [...day.tasks, optimisticTask],
                events: day.events, // Events are separate, don't add tasks here
                taskCount: day.taskCount + 1,
                eventCount: day.eventCount, // Event count unchanged
              };
            }
            return day;
          });

          // Update summary counts
          if (newData.summary) {
            newData.summary = {
              ...newData.summary,
              totalTasks: newData.summary.totalTasks + 1,
              totalEvents: newData.summary.totalEvents, // Events unchanged
              pendingTasks: newData.summary.pendingTasks + 1,
            };
          }

          return newData;
        }
      );

      return { previousQueries, optimisticTask };
    },

    onError: (error, variables, context) => {
      console.error('Task creation failed:', error);
      
      // Rollback optimistic updates on error
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSuccess: (newTask, variables, context) => {
      console.log('Task created successfully:', newTask);

      // Update the optimistic task with the real task data
      queryClient.setQueriesData(
        { queryKey: ['tasks', 'week'] },
        (oldData: WeeklyDashboardData | undefined) => {
          if (!oldData || !context?.optimisticTask) return oldData;

          const newData = { ...oldData };
          newData.days = newData.days.map((day: WeeklyTaskView) => ({
            ...day,
            tasks: day.tasks.map((task: Task) =>
              task.id === context.optimisticTask.id ? newTask : task
            ),
            events: day.events, // Events don't need updating when creating tasks
          }));

          return newData;
        }
      );
    },

    onSettled: () => {
      // Always refetch tasks after mutation completes (success or error)
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};