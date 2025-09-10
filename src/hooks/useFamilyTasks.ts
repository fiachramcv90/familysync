// React Query hook for Family Tasks with Real Supabase Integration
// Story S1.2: Replace Mock Data with Real Supabase Integration

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Task, Event, WeeklyDashboardData, WeeklyTaskView, UpdateTaskInput, CreateTaskInput } from '@/types/task';
import { FamilyMember } from '@/types/family';
import { db, supabase } from '@/lib/supabase';
import { useAuthenticatedUser, requireFamilyContext, requireUserId } from '@/hooks/useAuthenticatedUser';

// Data transformation functions from database to domain models
const transformTaskFromDB = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    familyId: dbTask.family_id,
    title: dbTask.title,
    description: dbTask.description,
    assigneeId: dbTask.assignee_id,
    createdById: dbTask.created_by,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : null,
    completedAt: dbTask.completed_at ? new Date(dbTask.completed_at) : null,
    status: dbTask.status || 'pending',
    category: 'task',
    priority: dbTask.priority || 'medium',
    syncVersion: dbTask.sync_version || 1,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    assignee: dbTask.assignee ? transformFamilyMemberFromDB(dbTask.assignee) : undefined,
    createdBy: dbTask.created_by_member ? transformFamilyMemberFromDB(dbTask.created_by_member) : undefined,
  };
};

const transformEventFromDB = (dbEvent: any): Event => {
  return {
    id: dbEvent.id,
    familyId: dbEvent.family_id,
    title: dbEvent.title,
    description: dbEvent.description,
    assigneeId: dbEvent.assignee_id,
    createdById: dbEvent.created_by,
    startDateTime: new Date(dbEvent.start_datetime),
    endDateTime: new Date(dbEvent.end_datetime || dbEvent.start_datetime),
    location: dbEvent.location,
    status: dbEvent.status || 'scheduled',
    syncVersion: dbEvent.sync_version || 1,
    createdAt: new Date(dbEvent.created_at),
    updatedAt: new Date(dbEvent.updated_at),
    assignee: dbEvent.assignee ? transformFamilyMemberFromDB(dbEvent.assignee) : undefined,
    createdBy: dbEvent.created_by_member ? transformFamilyMemberFromDB(dbEvent.created_by_member) : undefined,
  };
};

const transformFamilyMemberFromDB = (dbMember: any): FamilyMember => {
  return {
    id: dbMember.id,
    familyId: dbMember.family_id,
    email: dbMember.email,
    name: dbMember.display_name || dbMember.name,
    role: dbMember.role || 'member',
    avatarColor: dbMember.avatar_color || '#3B82F6',
    isActive: dbMember.is_active !== false,
    createdAt: new Date(dbMember.created_at),
    updatedAt: new Date(dbMember.updated_at),
    lastSeenAt: dbMember.last_seen_at ? new Date(dbMember.last_seen_at) : new Date(),
  };
};

// Task service with real Supabase queries
const taskService = {
  async getTasksForWeek(weekStart: Date, familyId: string): Promise<WeeklyDashboardData> {
    try {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 }); // Monday start
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

      // Fetch tasks for the week with family_id filtering
      const { data: tasksData, error: tasksError } = await db.tasks.getByFamilyId(familyId, {
        due_date_from: weekStartStr,
        due_date_to: weekEndStr
      });

      if (tasksError) {
        throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
      }

      // Fetch events for the week with family_id filtering
      const { data: eventsData, error: eventsError } = await db.events.getByFamilyId(familyId, {
        start_date_from: weekStartStr,
        start_date_to: weekEndStr
      });

      if (eventsError) {
        throw new Error(`Failed to fetch events: ${eventsError.message}`);
      }

      // Fetch family members for the family
      const { data: membersData, error: membersError } = await db.familyMembers.getByFamilyId(familyId);

      if (membersError) {
        throw new Error(`Failed to fetch family members: ${membersError.message}`);
      }

      // Transform database records to domain models
      const allTasks = (tasksData || []).map(transformTaskFromDB);
      const allEvents = (eventsData || []).map(transformEventFromDB);
      const familyMembers = (membersData || []).map(transformFamilyMemberFromDB);

      // Generate 7 days for the week
      const days: WeeklyTaskView[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Filter tasks for this day
        const dayTasks = allTasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = format(task.dueDate, 'yyyy-MM-dd');
          return taskDate === currentDateStr;
        });

        // Filter events for this day
        const dayEvents = allEvents.filter(event => {
          const eventDate = format(event.startDateTime, 'yyyy-MM-dd');
          return eventDate === currentDateStr;
        });

        days.push({
          date: currentDateStr,
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

      const completedTasks = allTasks.filter(t => t.status === 'completed');
      const completedEvents = allEvents.filter(e => e.status === 'completed');
      const overdueTasks = allTasks.filter(t => 
        t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
      );

      const totalItems = allTasks.length + allEvents.length;
      const completedItems = completedTasks.length + completedEvents.length;

      return {
        weekStartDate: weekStartStr,
        weekEndDate: weekEndStr,
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
        members: familyMembers.map(member => {
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
    } catch (error) {
      console.error('Error fetching weekly tasks:', error);
      throw error;
    }
  },

  async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.dueDate !== undefined) {
        updateData.due_date = updates.dueDate ? format(new Date(updates.dueDate), 'yyyy-MM-dd') : null;
      }
      if (updates.completedAt !== undefined) {
        updateData.completed_at = updates.completedAt ? new Date(updates.completedAt).toISOString() : null;
      }
      
      // Auto-set completion timestamp when marking as completed
      if (updates.status === 'completed' && !updates.completedAt) {
        updateData.completed_at = new Date().toISOString();
      } else if (updates.status && updates.status !== 'completed') {
        updateData.completed_at = null;
      }

      const { data, error } = await db.tasks.update(taskId, updateData);
      
      if (error) {
        if (error.message.includes('conflict') || error.message.includes('version')) {
          throw new Error(`Conflict: Task has been modified by another user`);
        }
        throw new Error(`Failed to update task: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from task update');
      }

      // Fetch the complete updated task with relationships
      const { data: completeTask, error: fetchError } = await db.tasks.getById(taskId);
      
      if (fetchError || !completeTask) {
        throw new Error('Failed to fetch updated task details');
      }

      return transformTaskFromDB(completeTask);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    try {
      const { data, error } = await db.familyMembers.getByFamilyId(familyId);
      
      if (error) {
        throw new Error(`Failed to fetch family members: ${error.message}`);
      }

      return (data || []).map(transformFamilyMemberFromDB);
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },

  async createTask(input: CreateTaskInput, familyId: string, createdById: string): Promise<Task> {
    try {
      const taskData = {
        family_id: familyId,
        title: input.title,
        description: input.description || null,
        assignee_id: input.assigneeId,
        created_by: createdById,
        due_date: input.dueDate ? format(new Date(input.dueDate), 'yyyy-MM-dd') : null,
        status: 'pending' as const,
        // Note: category and priority may need to be added to database schema
      };

      const { data, error } = await db.tasks.create(taskData);
      
      if (error) {
        throw new Error(`Failed to create task: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from task creation');
      }

      // Fetch the complete task with relationships
      const { data: completeTask, error: fetchError } = await db.tasks.getById(data.id);
      
      if (fetchError || !completeTask) {
        throw new Error('Failed to fetch created task details');
      }

      return transformTaskFromDB(completeTask);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
};

// React Query hook for fetching weekly tasks
export const useFamilyTasks = (weekStart: Date) => {
  const { familyId, isAuthenticated, isLoading, error } = useAuthenticatedUser();
  const weekString = format(startOfWeek(weekStart, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['tasks', 'week', weekString, familyId],
    queryFn: () => {
      if (!familyId) {
        throw new Error('Family context required');
      }
      return taskService.getTasksForWeek(startOfWeek(weekStart, { weekStartsOn: 1 }), familyId);
    },
    enabled: isAuthenticated && !!familyId && !isLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    throwOnError: false, // Handle errors in components
  });
};

// React Query hook for fetching family members
export const useFamilyMembers = () => {
  const { familyId, isAuthenticated, isLoading, error } = useAuthenticatedUser();
  
  return useQuery({
    queryKey: ['family', 'members', familyId],
    queryFn: () => {
      if (!familyId) {
        throw new Error('Family context required');
      }
      return taskService.getFamilyMembers(familyId);
    },
    enabled: isAuthenticated && !!familyId && !isLoading,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    throwOnError: false, // Handle errors in components
  });
};

// Mutation hook for updating tasks with optimistic updates
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, familyId } = useAuthenticatedUser();

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) => {
      if (!isAuthenticated || !familyId) {
        throw new Error('Authentication and family context required');
      }
      return taskService.updateTask(taskId, updates);
    },
    
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
  const { familyId, user } = useAuthenticatedUser();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!familyId || !user) {
        throw new Error('Authentication and family context required');
      }
      return taskService.createTask(input, familyId, user.id);
    },
    
    onMutate: async (newTaskInput) => {
      if (!familyId || !user) {
        throw new Error('Authentication and family context required for optimistic update');
      }
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ['tasks'] });

      // Generate optimistic task ID
      const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create optimistic task
      const optimisticTask: Task = {
        id: optimisticId,
        familyId: familyId || '',
        title: newTaskInput.title,
        description: newTaskInput.description || null,
        assigneeId: newTaskInput.assigneeId,
        createdById: user?.id || '',
        dueDate: newTaskInput.dueDate ? new Date(newTaskInput.dueDate) : null,
        completedAt: null,
        status: 'pending',
        category: newTaskInput.category || 'task',
        priority: newTaskInput.priority || 'medium',
        syncVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Note: assignee and createdBy will be populated by the server response
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