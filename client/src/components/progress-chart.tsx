import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ProgressRecord, WorkoutSet } from '@shared/schema';

interface ProgressChartProps {
  progressRecords: ProgressRecord[];
  recentSets?: WorkoutSet[];
  exerciseName?: string;
  className?: string;
}

export function ProgressChart({ progressRecords, recentSets = [], exerciseName, className }: ProgressChartProps) {
  // Simple bar chart visualization
  const renderSimpleChart = () => {
    if (recentSets.length === 0) {
      return (
        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      );
    }

    const maxWeight = Math.max(...recentSets.map(set => set.weight || 0));
    const weights = recentSets.slice(-6).map(set => set.weight || 0); // Last 6 sets

    return (
      <div className="h-32 bg-gray-50 rounded-lg p-4 overflow-hidden">
        <div className="flex items-end justify-between h-full">
          {weights.map((weight, index) => {
            const height = maxWeight > 0 ? (weight / maxWeight) * 100 : 0;
            const isRecent = index >= weights.length - 2;
            
            return (
              <div
                key={index}
                className={`w-8 rounded-t-sm transition-all duration-300 ${
                  isRecent ? 'bg-secondary' : 'bg-primary'
                }`}
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${weight}kg`}
              />
            );
          })}
        </div>
        {exerciseName && (
          <div className="absolute top-2 left-4 text-xs text-neutral">
            {exerciseName} (kg)
          </div>
        )}
      </div>
    );
  };

  const getCurrentStats = () => {
    if (progressRecords.length === 0) {
      return { current: 0, progress: 0, timeFrame: '0 weeks' };
    }

    const record = progressRecords[0];
    const bestSet = record.bestSet as any;
    
    return {
      current: bestSet?.weight || 0,
      progress: 15, // This would be calculated from historical data
      timeFrame: '6 weeks'
    };
  };

  const stats = getCurrentStats();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          {exerciseName ? `${exerciseName} Progress` : 'Strength Progress'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderSimpleChart()}
        
        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary">{stats.current}kg</div>
            <div className="text-xs text-neutral">Current</div>
          </div>
          <div>
            <div className="text-lg font-bold text-secondary">+{stats.progress}kg</div>
            <div className="text-xs text-neutral">Progress</div>
          </div>
          <div>
            <div className="text-lg font-bold text-accent">{stats.timeFrame}</div>
            <div className="text-xs text-neutral">Time</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
