import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExerciseCard } from '@/components/exercise-card';
import { RestTimer } from '@/components/rest-timer';
import { VoiceIndicator } from '@/components/voice-indicator';
import { useSpeech } from '@/hooks/use-speech';
import { useWorkout } from '@/hooks/use-workout';
import { workoutAI } from '@/lib/workout-ai';
import { X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Exercise } from '@shared/schema';

export default function WorkoutSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { status, startListening, speak } = useSpeech();
  
  const [userId, setUserId] = useState<number | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showRestTimer, setShowRestTimer] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('autorep_user_id');
    if (!storedUserId) {
      setLocation('/');
      return;
    }
    setUserId(parseInt(storedUserId));
  }, [setLocation]);

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises']
  });

  const {
    activeWorkout,
    workoutSets,
    endWorkout,
    logSet,
    processVoiceCommand,
    isLogging,
    isProcessingVoice,
    voiceResult
  } = useWorkout(userId || 0);

  // Generate workout plan for the session
  const { data: user } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId
  });

  const workoutPlan = user && exercises.length > 0 
    ? workoutAI.generateWorkoutPlan(user, exercises)
    : null;

  const currentExercise = workoutPlan?.exercises[currentExerciseIndex];
  const currentExerciseData = exercises.find(e => e.id === currentExercise?.exerciseId);

  useEffect(() => {
    if (voiceResult && voiceResult.success) {
      toast({
        title: "Set Logged!",
        description: voiceResult.response,
      });
      speak(voiceResult.response);
      setShowRestTimer(true);
    } else if (voiceResult && !voiceResult.success) {
      toast({
        title: "Voice Command Error",
        description: voiceResult.response,
        variant: "destructive"
      });
    }
  }, [voiceResult, toast, speak]);

  const handleVoiceCommand = () => {
    startListening((result) => {
      processVoiceCommand(result);
    });
  };

  const handleLogSet = (setData: { weight?: number; reps: number }) => {
    if (!currentExercise) return;

    logSet({
      exerciseId: currentExercise.exerciseId,
      setNumber: currentSet,
      weight: setData.weight,
      reps: setData.reps
    });

    setShowRestTimer(true);
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    
    if (currentSet < (currentExercise?.sets || 1)) {
      setCurrentSet(prev => prev + 1);
    } else {
      // Move to next exercise
      if (currentExerciseIndex < (workoutPlan?.exercises.length || 0) - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        speak(`Great work! Moving on to ${workoutPlan?.exercises[currentExerciseIndex + 1]?.name}`);
      } else {
        // Workout complete
        handleWorkoutComplete();
      }
    }
  };

  const handleWorkoutComplete = () => {
    endWorkout();
    toast({
      title: "Workout Complete!",
      description: "Great job finishing your session!",
    });
    speak("Excellent work! Your workout is complete. Great job today!");
    setLocation('/dashboard');
  };

  const handleEndWorkout = () => {
    if (confirm('Are you sure you want to end your workout?')) {
      endWorkout();
      setLocation('/dashboard');
    }
  };

  if (!activeWorkout || !workoutPlan || !currentExercise || !currentExerciseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Loading your workout...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentExerciseIndex + (currentSet / (currentExercise.sets || 1))) / workoutPlan.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activeWorkout.name}</h2>
              <p className="text-neutral text-sm">
                Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length} • 
                {workoutPlan.estimatedDuration} min estimated
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEndWorkout}
              className="text-red-500 hover:text-red-600"
            >
              <X size={20} />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Voice Command Status */}
        <Card className="bg-primary text-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <VoiceIndicator status={status} className="mr-3" />
                <span className="font-medium">
                  {status === 'listening' ? 'Listening for commands...' : 'Voice commands ready'}
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleVoiceCommand}
                disabled={isProcessingVoice}
                className="bg-white bg-opacity-20 hover:bg-opacity-30"
              >
                {isProcessingVoice ? 'Processing...' : 'Voice Command'}
              </Button>
            </div>
            <p className="text-blue-100 text-sm mt-2">
              Say: "{currentExerciseData.name}, {currentExercise.weight || 20} kilos for {currentExercise.reps} reps"
            </p>
          </CardContent>
        </Card>

        {/* Current Exercise */}
        <ExerciseCard
          exercise={{
            id: currentExercise.exerciseId,
            name: currentExerciseData.name,
            sets: currentExercise.sets,
            reps: currentExercise.reps,
            weight: currentExercise.weight,
            restTime: currentExercise.restTime
          }}
          currentSet={currentSet}
          onLogSet={handleLogSet}
          onVoiceCommand={handleVoiceCommand}
          isActive={true}
          className="mb-6"
        />

        {/* Rest Timer */}
        {showRestTimer && (
          <RestTimer
            initialTime={currentExercise.restTime}
            onComplete={handleRestComplete}
            className="mb-6"
          />
        )}

        {/* Exercise List */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today's Exercises</h3>
            <div className="space-y-3">
              {workoutPlan.exercises.map((exercise, index) => {
                const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
                const isCompleted = index < currentExerciseIndex;
                const isCurrent = index === currentExerciseIndex;
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCurrent 
                        ? 'bg-secondary bg-opacity-10 border-l-4 border-secondary'
                        : isCompleted
                        ? 'bg-green-50 border-l-4 border-green-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      {isCompleted && <CheckCircle className="text-green-500 mr-2" size={16} />}
                      <span className={`${isCurrent ? 'font-medium text-gray-900' : 'text-neutral'}`}>
                        {exerciseData?.name}
                      </span>
                    </div>
                    <span className="text-sm text-neutral">
                      {exercise.sets} × {exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Workout Complete Check */}
        {currentExerciseIndex >= workoutPlan.exercises.length - 1 && 
         currentSet > (currentExercise?.sets || 1) && (
          <Alert className="mt-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Workout complete! Tap the finish button when you're ready.
              <Button
                onClick={handleWorkoutComplete}
                className="ml-4 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                Finish Workout
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
}
