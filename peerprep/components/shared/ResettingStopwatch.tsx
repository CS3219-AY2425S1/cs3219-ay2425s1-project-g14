import React, { useState, useEffect } from "react";

interface ResettingStopwatchProps {
  isActive: boolean;
}

// pass isActive from parent component
//
const ResettingStopwatch: React.FC<ResettingStopwatchProps> = ({
  isActive,
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      setElapsedTime(0);
    };
  }, [isActive]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return <div>{formatTime(elapsedTime)}</div>;
};

export default ResettingStopwatch;
