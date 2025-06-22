import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, SkipForward } from 'lucide-react';

interface RestTimerProps {
  initialTime: number; // seconds
  onComplete?: () => void;
  className?: string;
}

export function RestTimer({ initialTime, onComplete, className }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false);
            setIsCompleted(true);
            onComplete?.();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const startTimer = () => {
    setIsRunning(true);
    setIsCompleted(false);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setIsCompleted(false);
  };

  const skipRest = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsCompleted(true);
    onComplete?.();
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-green-500';
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-orange-500';
    return 'text-accent';
  };

  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <h3 className="font-semibold text-gray-900 mb-2">Rest Timer</h3>
        
        <div className={`text-4xl font-bold mb-4 ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>

        {isCompleted && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
            Rest complete! Ready for next set.
          </div>
        )}

        <div className="flex justify-center space-x-4">
          {!isRunning && !isCompleted && (
            <Button
              onClick={startTimer}
              className="bg-accent hover:bg-orange-600"
            >
              <Play size={16} className="mr-1" />
              Start
            </Button>
          )}
          
          {isRunning && (
            <Button
              onClick={stopTimer}
              variant="outline"
            >
              <Square size={16} className="mr-1" />
              Pause
            </Button>
          )}

          {(isCompleted || isRunning) && (
            <Button
              onClick={resetTimer}
              variant="outline"
            >
              Reset
            </Button>
          )}

          <Button
            onClick={skipRest}
            variant="outline"
            className="text-gray-700 hover:bg-gray-50"
          >
            <SkipForward size={16} className="mr-1" />
            Skip Rest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
