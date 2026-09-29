'use client';

import useSWR from 'swr';
import React, { useEffect, useState } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AnimatedNumber = ({ value }: { value: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;
    const duration = 3000;

    const tick = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = currentTime - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progressRatio, 3);
      setCount(Math.floor(value * easeOut));

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setCount(value);
      }
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <>{count}</>;
};



const StatBar = ({ label, val1, val2 }: { label: string, val1: number, val2: number }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = val1 + val2 || 1; // avoid division by zero
  const p1Width = (val1 / total) * 100;
  const p2Width = (val2 / total) * 100;

  return (
    <div className="flex flex-col items-center w-full my-6 relative">
      {/* Bar Container */}
      <div 
        className="w-full flex h-14 bg-gray-900 border-2 border-[#004b87] shadow-2xl relative overflow-hidden"
        style={{
          clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)'
        }}
      >
        {/* Left Bar (Dark Blue) */}
        <div 
          className="h-full bg-[#004b87] flex items-center px-4 transition-all duration-[3000ms] ease-out"
          style={{ width: animated ? `${p1Width}%` : '50%' }}
        >
          <span 
            className="text-[#fbd120] font-black text-3xl" 
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            <AnimatedNumber value={val1} />
          </span>
        </div>

        {/* Right Bar (Yellow) */}
        <div 
          className="h-full bg-[#fbd120] flex items-center justify-end px-4 transition-all duration-[3000ms] ease-out"
          style={{ width: animated ? `${p2Width}%` : '50%' }}
        >
          <span className="text-[#004b87] font-black text-3xl">
            <AnimatedNumber value={val2} />
          </span>
        </div>
        
        {/* Center Divider Slant */}
        <div 
          className="absolute h-full w-2 bg-[#00000030] top-0 transition-all duration-[3000ms] ease-out"
          style={{ 
            left: animated ? `${p1Width}%` : '50%',
            transform: 'translateX(-50%) skewX(-15deg)'
          }}
        />
      </div>
    </div>
  );
};

export default function HeadToHead() {
  const { data, error, isLoading } = useSWR('/api/sheet7', fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return null;
  if (error || !data?.player1 || !data?.player2) return <div className="flex h-screen items-center justify-center text-red-500">Error loading data.</div>;

  const p1 = data.player1;
  const p2 = data.player2;

  const stats = [
    { label: 'ELIMS', val1: parseFloat(p1[3]) || 0, val2: parseFloat(p2[3]) || 0 },
    { label: 'DAMAGE', val1: parseFloat(p1[4]) || 0, val2: parseFloat(p2[4]) || 0 },
    { label: 'ASSISTS', val1: parseFloat(p1[5]) || 0, val2: parseFloat(p2[5]) || 0 },
    { label: 'HEADSHOT', val1: parseFloat(p1[8]) || 0, val2: parseFloat(p2[8]) || 0 },
  ];

  return (
    <div className="w-full min-h-screen p-8 flex flex-col items-center justify-center bg-transparent overflow-hidden">
      
      {/* Players Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4">
        <div className="text-4xl font-black text-[#004b87] bg-white px-6 py-2 rounded shadow-xl uppercase border-4 border-[#004b87]">
          {p1[2]}
        </div>
        <div className="text-3xl font-black text-white italic">VS</div>
        <div className="text-4xl font-black text-[#004b87] bg-[#fbd120] px-6 py-2 rounded shadow-xl uppercase border-4 border-[#004b87]">
          {p2[2]}
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center z-10 px-8 py-6 rounded-xl bg-gradient-to-b from-[#00000000] to-[#00000000]">
        {stats.map((s, i) => (
          <StatBar key={i} label={s.label} val1={s.val1} val2={s.val2} />
        ))}
      </div>
    </div>
  );
}
