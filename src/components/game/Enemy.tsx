"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ENEMY_TYPES } from '@/lib/game-data.tsx';

interface EnemyProps {
  word: string;
  x: number;
  y: number;
  type: keyof typeof ENEMY_TYPES;
}

const EnemyComponent: React.FC<EnemyProps> = ({ word, x, y, type }) => {
  const typeData = ENEMY_TYPES[type] || ENEMY_TYPES['Malware'];
  const Icon = typeData.icon;

  return (
    <div
      className="absolute flex flex-col items-center group"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={cn("relative w-24 h-16 flex items-center justify-center", typeData.className)}>
        <Icon className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 5px currentColor)`}} />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center font-mono font-bold tracking-widest text-foreground text-sm",
          )}
          style={{
            textShadow: `0 0 8px currentColor`,
          }}
        >
          {word}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EnemyComponent);
