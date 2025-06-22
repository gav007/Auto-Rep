import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/bottom-nav';
import { VoiceIndicator } from '@/components/voice-indicator';
import { useSpeech } from '@/hooks/use-speech';
import { useWorkout } from '@/hooks/use-workout';
import { workoutAI } from '@/lib/workout-ai';
import { Play, TrendingUp, Calendar, Brain } from 'lucide-react';
import type { User, Exercise } from '@shared/schema';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { status } = useSpeech();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('autorep_user_id');
    if (!storedUserId) {
      setLocation('/');
      return;
    }
    setUserId(parseInt(storedUserId));
  }, [setLocation]);

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users', userId],
    enabled: !!userId
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ['/api/exercises']
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['/api/progress', userId],
    enabled: !!userId
  });

  const { startWorkout, isStarting } = useWorkout(userId || 0);

  // Generate today's workout recommendation
  const todaysWorkout = user && exercises.length > 0 
    ? workoutAI.generateWorkoutPlan(user, exercises)
    : null;

  const handleStartWorkout = () => {
    if (todaysWorkout) {
      startWorkout(`${todaysWorkout.focus} Workout`);
      setLocation('/workout');
    }
  };

  if (!userId || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const weeklyStats = {
    workoutsThisWeek: 3,
    totalVolume: 2450,
    averageSession: 42
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AR</span>
            </div>
            <h1 className="text-xl font-bold text-primary">AutoRep</h1>
          </div>
          <VoiceIndicator status={status} />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user.name}!
          </h2>
          <p className="text-neutral">
            {todaysWorkout ? `Ready for your ${todaysWorkout.focus} workout?` : 'Let\'s plan your next workout!'}
          </p>
        </div>

        {/* Today's Workout Card */}
        {todaysWorkout && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Today's Workout</h3>
                <span className="text-sm text-neutral">
                  {todaysWorkout.estimatedDuration} min • {todaysWorkout.difficulty}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                {todaysWorkout.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-neutral">{exercise.name}</span>
                    <span className="text-sm font-medium">
                      {exercise.sets} × {exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </span>
                  </div>
                ))}
                {todaysWorkout.exercises.length > 3 && (
                  <div className="text-center">
                    <span className="text-xs text-neutral">
                      + {todaysWorkout.exercises.length - 3} more exercises
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleStartWorkout}
                disabled={isStarting}
                className="w-full bg-secondary hover:bg-green-600"
                size="lg"
              >
                <Play className="mr-2" size={20} />
                {isStarting ? 'Starting...' : 'Start Workout'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{weeklyStats.workoutsThisWeek}</div>
              <div className="text-sm text-neutral">Workouts This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">{weeklyStats.totalVolume.toLocaleString()}</div>
              <div className="text-sm text-neutral">Total Volume (kg)</div>
            </CardContent>
          </Card>
        </div>

        {/* AI Feedback Card */}
        <Card className="bg-gradient-to-r from-accent to-orange-500 text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI Coach Says:</h3>
                <p className="text-orange-100 text-sm">
                  "You've been consistent with your training! Your bench press has improved by 15kg over the last 6 weeks. Keep up the momentum!"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setLocation('/progress')}
            className="h-20 flex flex-col items-center space-y-2"
          >
            <TrendingUp className="text-primary" size={24} />
            <span className="text-sm font-medium">View Progress</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center space-y-2"
          >
            <Calendar className="text-primary" size={24} />
            <span className="text-sm font-medium">Schedule</span>
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
