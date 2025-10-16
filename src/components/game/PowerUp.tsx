
"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { POWER_UP_TYPES } from '@/lib/game-data';
import type { PowerUpType } from '@/lib/game-data';

interface PowerUpProps {
  id: number;
  type: PowerUpType;
  x: number;
  y: number;
  createdAt: number;
  onClick: () => void;
}

const PowerUpComponent: React.FC<PowerUpProps> = ({ type, x, y, createdAt, onClick }) => {
  const [visible, setVisible] = useState(false);
  const typeData = POWER_UP_TYPES[type];
  const Icon = typeData.icon;

  useEffect(() => {
    // Fade in
    const fadeInTimer = setTimeout(() => setVisible(true), 100);
    
    // Fade out
    const fadeOutTimer = setTimeout(() => setVisible(false), 6000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
    };
  }, []);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ease-out cursor-pointer",
        "bg-background/50 backdrop-blur-sm border-2",
        typeData.className.replace('text-', 'border-'),
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        boxShadow: `0 0 20px currentColor`,
      }}
      aria-label={`Activate ${type} power-up`}
    >
      <Icon className={cn("w-8 h-8", typeData.className)} />
    </button>
  );
};

export default React.memo(PowerUpComponent);

    