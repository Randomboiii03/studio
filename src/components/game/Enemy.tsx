
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ENEMY_TYPES } from '@/lib/game-data';

interface EnemyProps {
  word: string;
  x: number;
  y: number;
  type: keyof typeof ENEMY_TYPES;
  status: 'alive' | 'dying' | 'targeted';
}

const EnemyComponent: React.FC<EnemyProps> = ({ word, x, y, type, status }) => {
  const typeData = ENEMY_TYPES[type] || ENEMY_TYPES['Malware'];
  const Icon = typeData.icon;

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center group transition-opacity duration-300",
        status === 'dying' ? 'opacity-0' : 'opacity-100',
        status === 'targeted' && 'opacity-70'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={cn("relative w-auto h-16 flex items-center justify-center px-4 rounded-md", typeData.className)} style={{ filter: `drop-shadow(0 0 8px currentColor)`}}>
        <Icon className="w-8 h-8 mr-3 text-white" />
        <div
          className={cn(
            "font-mono font-bold tracking-widest text-lg text-white"
          )}
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

export default React.memo(EnemyComponent);
