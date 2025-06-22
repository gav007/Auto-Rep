import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Workout, WorkoutSet, Exercise } from '@shared/schema';

export function useWorkout(userId: number) {
  const queryClient = useQueryClient();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Get active workout
  const { data: activeWorkoutData, isLoading: loadingActive } = useQuery({
    queryKey: [`/api/workouts/${userId}/active`],
    enabled: !!userId
  });

  // Get workout sets for active workout
  const { data: workoutSets = [], isLoading: loadingSets } = useQuery({
    queryKey: [`/api/workout-sets/${activeWorkoutData?.id}`],
    enabled: !!activeWorkoutData?.id
  });

  // Start new workout
  const startWorkoutMutation = useMutation({
    mutationFn: async (workoutData: { name: string; templateId?: number }) => {
      const response = await apiRequest('POST', '/api/workouts', {
        userId,
        name: workoutData.name,
        templateId: workoutData.templateId,
        startedAt: new Date().toISOString()
      });
      return response.json();
    },
    onSuccess: (workout) => {
      setActiveWorkout(workout);
      queryClient.invalidateQueries({ queryKey: ['/api/workouts', userId, 'active'] });
    }
  });

  // End workout
  const endWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const response = await apiRequest('PUT', `/api/workouts/${workoutId}`, {
        completedAt: new Date().toISOString(),
        duration: calculateWorkoutDuration(activeWorkoutData?.startedAt)
      });
      return response.json();
    },
    onSuccess: () => {
      setActiveWorkout(null);
      queryClient.invalidateQueries({ queryKey: ['/api/workouts'] });
    }
  });

  // Log workout set
  const logSetMutation = useMutation({
    mutationFn: async (setData: {
      exerciseId: number;
      setNumber: number;
      weight?: number;
      reps: number;
      rpe?: number;
    }) => {
      if (!activeWorkoutData) throw new Error('No active workout');
      
      const response = await apiRequest('POST', '/api/workout-sets', {
        workoutId: activeWorkoutData.id,
        ...setData
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-sets', activeWorkoutData?.id] });
    }
  });

  // Process voice command
  const processVoiceCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      if (!activeWorkoutData) throw new Error('No active workout');
      
      const response = await apiRequest('POST', '/api/voice-command', {
        command,
        workoutId: activeWorkoutData.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workout-sets', activeWorkoutData?.id] });
    }
  });

  const startWorkout = useCallback((name: string, templateId?: number) => {
    startWorkoutMutation.mutate({ name, templateId });
  }, [startWorkoutMutation]);

  const endWorkout = useCallback(() => {
    if (activeWorkoutData) {
      endWorkoutMutation.mutate(activeWorkoutData.id);
    }
  }, [activeWorkoutData, endWorkoutMutation]);

  const logSet = useCallback((setData: {
    exerciseId: number;
    setNumber: number;
    weight?: number;
    reps: number;
    rpe?: number;
  }) => {
    logSetMutation.mutate(setData);
  }, [logSetMutation]);

  const processVoiceCommand = useCallback((command: string) => {
    processVoiceCommandMutation.mutate(command);
  }, [processVoiceCommandMutation]);

  return {
    activeWorkout: activeWorkoutData || activeWorkout,
    workoutSets,
    isLoading: loadingActive || loadingSets,
    startWorkout,
    endWorkout,
    logSet,
    processVoiceCommand,
    isStarting: startWorkoutMutation.isPending,
    isEnding: endWorkoutMutation.isPending,
    isLogging: logSetMutation.isPending,
    isProcessingVoice: processVoiceCommandMutation.isPending,
    voiceResult: processVoiceCommandMutation.data
  };
}

function calculateWorkoutDuration(startTime?: string): number {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const end = new Date();
  return Math.floor((end.getTime() - start.getTime()) / 1000 / 60); // minutes
}
