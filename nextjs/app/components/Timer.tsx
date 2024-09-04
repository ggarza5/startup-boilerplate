import React, { useState, useEffect } from 'react';

interface TimerProps {
  startTimer: boolean;
}

const Timer: React.FC<TimerProps> = ({ startTimer }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (startTimer) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTimer]);

  return <div>Time: {time}s</div>;
};

export default Timer;