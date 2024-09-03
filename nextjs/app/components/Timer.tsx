import React, { useState, useEffect } from 'react';

interface TimerProps {
  start: boolean;
}

const Timer: React.FC<TimerProps> = ({ start }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (start) {
      const interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [start]);

  return <div>Time: {time}s</div>;
};

export default Timer;