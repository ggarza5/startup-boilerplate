import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface TestTimerProps {
  isActive: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  duration?: number; // Duration in seconds, optional
}

const TestTimer: React.FC<TestTimerProps> = ({
  isActive,
  isPaused,
  onPause,
  onResume,
  onComplete,
  duration
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => {
          const newTime = prevTime + 1;

          // If duration is provided and time has exceeded it, call onComplete
          if (duration && newTime >= duration) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onComplete();
            return duration;
          }

          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, duration, onComplete]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate percentage for progress bar
  const getProgressPercentage = () => {
    if (duration) {
      return Math.min((timeElapsed / duration) * 100, 100);
    }
    return 0;
  };

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold">{formatTime(timeElapsed)}</p>
        <div className="flex gap-2">
          {isActive && !isPaused ? (
            <Button variant="outline" onClick={onPause} size="sm">
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={onResume}
              size="sm"
              disabled={!isActive}
            >
              Resume
            </Button>
          )}
        </div>
      </div>

      {duration && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default TestTimer;
