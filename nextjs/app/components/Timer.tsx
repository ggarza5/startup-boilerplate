import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  startTimer: boolean;
  resetKey?: string | number;
}

const Timer: React.FC<TimerProps> = ({ startTimer, resetKey }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setTimeElapsed(0);

    if (startTimer) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTimer, resetKey]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="text-center p-2 rounded-md">
      <p className="text-med font-semibold text-foreground">
        {formatTime(timeElapsed)}
      </p>
    </div>
  );
};

export default Timer;
