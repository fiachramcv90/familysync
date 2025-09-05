// React Query hook for creating tasks
// Story 2.1: Task Creation and Basic Management

import { Task, CreateTaskInput } from '@/types/task';
import { useCreateTaskMutation } from './useFamilyTasks';

interface CreateTaskMutationParams {
  onSuccess?: (task: Task) => void;
  onError?: (error: Error) => void;
}

export const useCreateTask = (params?: CreateTaskMutationParams) => {
  const baseMutation = useCreateTaskMutation();
  
  // Create a wrapper that handles the callbacks
  const mutateAsync = async (input: CreateTaskInput) => {
    try {
      const result = await baseMutation.mutateAsync(input);
      if (params?.onSuccess) {
        params.onSuccess(result);
      }
      return result;
    } catch (error) {
      if (params?.onError && error instanceof Error) {
        params.onError(error);
      }
      throw error;
    }
  };

  const mutate = (input: CreateTaskInput) => {
    baseMutation.mutate(input, {
      onSuccess: params?.onSuccess,
      onError: (error: unknown) => {
        if (params?.onError && error instanceof Error) {
          params.onError(error);
        }
      }
    });
  };

  return {
    mutateAsync,
    mutate,
    isLoading: baseMutation.isPending,
    error: baseMutation.error,
    reset: baseMutation.reset,
  };
};