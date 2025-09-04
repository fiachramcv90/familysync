// React Query hook for creating tasks
// Story 2.1: Task Creation and Basic Management

import { Task } from '@/types/task';
import { useCreateTaskMutation } from './useFamilyTasks';

interface CreateTaskMutationParams {
  onSuccess?: (task: Task) => void;
  onError?: (error: Error) => void;
}

export const useCreateTask = (params?: CreateTaskMutationParams) => {
  const mutation = useCreateTaskMutation();

  return {
    mutateAsync: mutation.mutateAsync,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
    
    // Custom success and error handlers
    onSuccess: params?.onSuccess,
    onError: params?.onError,
  };
};