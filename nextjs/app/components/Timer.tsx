import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTimer: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTimer }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (startTimer) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTimer]);

  return <div>Time: {time.toFixed(1)}s</div>; // Updated to show 2 decimal places
};

export default Timer;
