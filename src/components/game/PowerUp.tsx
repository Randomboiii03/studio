
"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { POWER_UP_TYPES } from '@/lib/game-data';
import type { PowerUpType } from '@/lib/game-data';

interface PowerUpProps {
  id: number;
  type: PowerUpType;
  word: string;
  x: number;
  y: number;
  status: 'alive' | 'dying';
}

const PowerUpComponent: React.FC<PowerUpProps> = ({ type, x, y, word, status }) => {
  const [visible, setVisible] = useState(false);
  const typeData = POWER_UP_TYPES[type];
  const Icon = typeData.icon;

  useEffect(() => {
    const fadeInTimer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(fadeInTimer);
  }, []);

  const isDying = status === 'dying';
  
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center group transition-all duration-500 ease-out",
        visible && !isDying ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div 
        className={cn(
            "relative w-auto flex items-center justify-center px-4 h-16 rounded-md",
            typeData.className
        )}
        style={{
            filter: `drop-shadow(0 0 12px currentColor)`,
        }}
      >
        <Icon className="w-8 h-8 mr-3 text-white" />
        <div 
            className="font-mono font-bold tracking-widest text-lg text-white"
            style={{
                textShadow: `
                0 0 2px #000, 
                0 0 5px #000, 
                0 0 10px #000`
            }}
        >
          {word}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PowerUpComponent);
