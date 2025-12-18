import React, { useState, useEffect } from 'react';

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 11,
    seconds: 48,
    milliseconds: 14,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds, milliseconds } = prev;

        milliseconds -= 1;
        if (milliseconds < 0) {
          milliseconds = 99;
          seconds -= 1;
        }
        if (seconds < 0) {
          seconds = 59;
          minutes -= 1;
        }
        if (minutes < 0) {
          minutes = 59;
          hours -= 1;
        }
        if (hours < 0) {
          hours = 1;
          minutes = 11;
          seconds = 48;
        }

        return { hours, minutes, seconds, milliseconds };
      });
    }, 10); 

    return () => clearInterval(timer);
  }, []);

  const format = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center space-x-1 font-mono text-sm md:text-base font-bold text-white tracking-widest">
      <div className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
        {format(timeLeft.hours)}
      </div>
      <span className="text-orange-500/50">:</span>
      <div className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
        {format(timeLeft.minutes)}
      </div>
      <span className="text-orange-500/50">:</span>
      <div className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
        {format(timeLeft.seconds)}
      </div>
      <span className="text-orange-500/50">:</span>
      <div className="bg-orange-500/20 text-orange-400 w-8 text-center py-0.5 rounded border border-orange-500/30">
        {format(timeLeft.milliseconds)}
      </div>
    </div>
  );
};