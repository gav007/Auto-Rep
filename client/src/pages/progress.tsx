import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/bottom-nav';
import { ProgressChart } from '@/components/progress-chart';
import { Share2, TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import type { ProgressRecord, WorkoutSet, Workout } from '@shared/schema';

export default function Progress() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('autorep_user_id');
    if (!storedUserId) {
      setLocation('/');
      return;
    }
    setUserId(parseInt(storedUserId));
  }, [setLocation]);

  const { data: progressRecords = [] } = useQuery<ProgressRecord[]>({
    queryKey: ['/api/progress', userId],
    enabled: !!userId
  });

  const { data: workouts = [] } = useQuery<Workout[]>({
    queryKey: ['/api/workouts', userId],
    enabled: !!userId
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['/api/exercises']
  });

  // Calculate weekly stats
  const weeklyStats = {
    workoutsCompleted: workouts.filter(w => w.completedAt).length,
    totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
    averageSession: workouts.length > 0 
      ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length)
      : 0,
    personalRecords: 2 // This would be calculated from actual data
  };

  // AI insights (simplified)
  const aiInsights = [
    "Your squat progression is ahead of schedule. Consider increasing volume.",
    "Bench press stalled for 2 weeks. Try deloading 10% next session.",
    "Consistency is excellent - you've hit 95% of planned workouts.",
    "Your overhead press could benefit from more accessory work."
  ];

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Progress Tracking</h2>
          <Button variant="ghost" size="sm">
            <Share2 className="text-primary" size={20} />
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strength">Strength</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* This Week's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Calendar className="mr-2" size={16} />
                  This Week's Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{weeklyStats.workoutsCompleted}</div>
                    <div className="text-sm text-neutral">Workouts</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{weeklyStats.personalRecords}</div>
                    <div className="text-sm text-neutral">PRs</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral">Total Volume</span>
                    <span className="font-semibold">{weeklyStats.totalVolume.toLocaleString()} kg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral">Average Session</span>
                    <span className="font-semibold">{weeklyStats.averageSession} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral">Consistency</span>
                    <span className="font-semibold text-secondary">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Zap className="mr-2" size={16} />
                  AI Insights
                </h3>
                <div className="space-y-2 text-blue-100 text-sm">
                  {aiInsights.map((insight, index) => (
                    <p key={index}>• {insight}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="mx-auto mb-2 text-primary" size={24} />
                  <div className="text-lg font-bold">15kg</div>
                  <div className="text-sm text-neutral">Strength Gained</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="mx-auto mb-2 text-secondary" size={24} />
                  <div className="text-lg font-bold">12</div>
                  <div className="text-sm text-neutral">Goals Achieved</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strength" className="space-y-6">
            {/* Strength Progress Chart */}
            <ProgressChart 
              progressRecords={progressRecords}
              exerciseName="Bench Press"
              className="mb-6"
            />

            {/* Exercise Progress List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exercise Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exercises.slice(0, 5).map((exercise: any) => {
                    const record = progressRecords.find(r => r.exerciseId === exercise.id);
                    const bestSet = record?.bestSet as any;
                    
                    return (
                      <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-sm text-neutral">
                            {bestSet ? `Best: ${bestSet.weight}kg × ${bestSet.reps}` : 'No data'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-primary">
                            {record?.oneRepMax ? `${Math.round(record.oneRepMax)}kg` : '-'}
                          </div>
                          <div className="text-xs text-neutral">1RM Est.</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume" className="space-y-6">
            {/* Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
                  {[1800, 2100, 2450, 2200, 2650, 2400].map((volume, index) => {
                    const height = (volume / 2650) * 100;
                    return (
                      <div
                        key={index}
                        className="w-8 bg-primary rounded-t-sm"
                        style={{ height: `${height}%` }}
                        title={`${volume}kg`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-neutral mt-2">
                  <span>6w ago</span>
                  <span>This week</span>
                </div>
              </CardContent>
            </Card>

            {/* Volume by Exercise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Volume by Exercise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {progressRecords.slice(0, 5).map((record, index) => {
                    const exercise = exercises.find((e: any) => e.id === record.exerciseId);
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-neutral">{exercise?.name || 'Unknown'}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full"
                              style={{ width: `${Math.min((record.totalVolume / 1000) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-16 text-right">
                            {Math.round(record.totalVolume)}kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
