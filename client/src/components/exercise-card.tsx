import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseCardProps {
  exercise: {
    id: number;
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restTime: number;
  };
  currentSet: number;
  onLogSet: (data: { weight?: number; reps: number }) => void;
  onVoiceCommand?: () => void;
  isActive?: boolean;
  className?: string;
}

export function ExerciseCard({
  exercise,
  currentSet,
  onLogSet,
  onVoiceCommand,
  isActive = false,
  className
}: ExerciseCardProps) {
  const [weight, setWeight] = useState(exercise.weight?.toString() || '');
  const [reps, setReps] = useState(exercise.reps.toString());

  const handleLogSet = () => {
    onLogSet({
      weight: weight ? parseFloat(weight) : undefined,
      reps: parseInt(reps)
    });
  };

  return (
    <Card className={cn(
      'transition-all duration-200',
      isActive && 'ring-2 ring-primary border-primary',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
          <span className="text-sm text-neutral">
            Set {currentSet} of {exercise.sets}
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-primary mb-2">
            {exercise.weight ? `${exercise.weight}kg × ${exercise.reps}` : `${exercise.reps} reps`}
          </div>
          <div className="text-neutral text-sm">Target</div>
        </div>

        {/* Manual Set Logging */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-neutral">Set {currentSet}</span>
            <div className="flex items-center space-x-4">
              {exercise.weight && (
                <>
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={exercise.weight.toString()}
                    className="w-16 text-center text-sm"
                    step="0.5"
                  />
                  <span className="text-neutral text-sm">kg ×</span>
                </>
              )}
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder={exercise.reps.toString()}
                className="w-12 text-center text-sm"
              />
              <Button
                onClick={handleLogSet}
                size="sm"
                className="bg-secondary hover:bg-green-600"
              >
                <Check size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Voice Input Alternative */}
        {onVoiceCommand && (
          <div 
            onClick={onVoiceCommand}
            className="p-4 bg-gradient-to-r from-primary to-blue-600 rounded-lg text-white text-center cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Mic className="mx-auto mb-2" size={20} />
            <p className="text-sm">
              Or say: "{exercise.weight ? `${exercise.weight} kilos for ${exercise.reps} reps` : `${exercise.reps} reps`}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
