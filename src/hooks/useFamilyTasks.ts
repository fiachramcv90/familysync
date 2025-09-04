// React Query hook for Family Tasks
// Story 1.4: Basic Family Dashboard

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Task, WeeklyDashboardData, WeeklyTaskView, UpdateTaskInput, CreateTaskInput } from '@/types/task';
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
    id: '2',
    familyId: 'family-1',
    title: 'Soccer practice',
    description: 'Team practice at the park',
    assigneeId: '3',
    createdById: '1',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    completedAt: null,
    status: 'pending',
    category: 'event',
    priority: 'medium',
    syncVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    assignee: mockFamilyMembers[2],
    createdBy: mockFamilyMembers[0],
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

// Task service mock (will be replaced with real API calls)
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
      
      const dayTasks = mockTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = format(task.dueDate, 'yyyy-MM-dd');
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');
        return taskDate === currentDateStr;
      });

      const events = dayTasks.filter(task => task.category === 'event');
      const tasks = dayTasks.filter(task => task.category === 'task');

      days.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        dayName: format(currentDate, 'EEEE'),
        tasks,
        events,
        taskCount: tasks.length,
        eventCount: events.length,
        completedTaskCount: tasks.filter(t => t.status === 'completed').length,
        overdueTaskCount: tasks.filter(t => 
          t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
        ).length,
      });
    }

    const allTasks = mockTasks;
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const overdueTasks = allTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
    );

    return {
      weekStartDate: format(weekStart, 'yyyy-MM-dd'),
      weekEndDate: format(weekEnd, 'yyyy-MM-dd'),
      days,
      summary: {
        totalTasks: allTasks.filter(t => t.category === 'task').length,
        completedTasks: completedTasks.filter(t => t.category === 'task').length,
        overdueTasks: overdueTasks.filter(t => t.category === 'task').length,
        pendingTasks: allTasks.filter(t => t.status === 'pending' && t.category === 'task').length,
        totalEvents: allTasks.filter(t => t.category === 'event').length,
        completedEvents: completedTasks.filter(t => t.category === 'event').length,
        upcomingEvents: allTasks.filter(t => 
          t.category === 'event' && t.dueDate && t.dueDate > new Date()
        ).length,
        completionRate: allTasks.length > 0 ? 
          Math.round((completedTasks.length / allTasks.length) * 100) : 0,
      },
      members: mockFamilyMembers.map(member => {
        const memberTasks = allTasks.filter(t => t.assigneeId === member.id);
        const memberCompleted = memberTasks.filter(t => t.status === 'completed');
        const memberOverdue = memberTasks.filter(t => 
          t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
        );
        
        return {
          memberId: member.id,
          memberName: member.name,
          avatarColor: member.avatarColor,
          tasksAssigned: memberTasks.filter(t => t.category === 'task').length,
          tasksCompleted: memberCompleted.filter(t => t.category === 'task').length,
          eventsAssigned: memberTasks.filter(t => t.category === 'event').length,
          eventsCompleted: memberCompleted.filter(t => t.category === 'event').length,
          completionRate: memberTasks.length > 0 ? 
            Math.round((memberCompleted.length / memberTasks.length) * 100) : 0,
          overdueCount: memberOverdue.length,
        };
      }),
    };
  },

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const task = mockTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Update the task with new values
    Object.assign(task, updates);
    task.updatedAt = new Date();
    
    if (updates.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    } else if (updates.status !== 'completed') {
      task.completedAt = null;
    }

    return task;
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
        newData.days = newData.days.map(day => ({
          ...day,
          tasks: day.tasks.map(task => 
            task.id === taskId 
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));

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
                tasks: optimisticTask.category === 'task' 
                  ? [...day.tasks, optimisticTask] 
                  : day.tasks,
                events: optimisticTask.category === 'event' 
                  ? [...day.events, optimisticTask] 
                  : day.events,
                taskCount: optimisticTask.category === 'task' 
                  ? day.taskCount + 1 
                  : day.taskCount,
                eventCount: optimisticTask.category === 'event' 
                  ? day.eventCount + 1 
                  : day.eventCount,
              };
            }
            return day;
          });

          // Update summary counts
          if (newData.summary) {
            newData.summary = {
              ...newData.summary,
              totalTasks: optimisticTask.category === 'task' 
                ? newData.summary.totalTasks + 1 
                : newData.summary.totalTasks,
              totalEvents: optimisticTask.category === 'event' 
                ? newData.summary.totalEvents + 1 
                : newData.summary.totalEvents,
              pendingTasks: optimisticTask.category === 'task' 
                ? newData.summary.pendingTasks + 1 
                : newData.summary.pendingTasks,
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
            events: day.events.map((event: Task) =>
              event.id === context.optimisticTask.id ? newTask : event
            ),
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