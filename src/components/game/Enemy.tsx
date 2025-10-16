
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ENEMY_TYPES } from '@/lib/game-data.tsx';

interface EnemyProps {
  word: string;
  x: number;
  y: number;
  type: keyof typeof ENEMY_TYPES;
  status: 'alive' | 'dying';
}

const EnemyComponent: React.FC<EnemyProps> = ({ word, x, y, type, status }) => {
  const typeData = ENEMY_TYPES[type] || ENEMY_TYPES['Malware'];
  const Icon = typeData.icon;

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center group transition-opacity duration-300",
        status === 'dying' ? 'opacity-0' : 'opacity-100'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={cn("relative w-auto h-16 flex items-center justify-center px-4 rounded-md", typeData.className)} style={{ filter: `drop-shadow(0 0 8px currentColor)`}}>
        <Icon className="w-8 h-8 mr-3" />
        <div
          className={cn(
            "font-mono font-bold tracking-widest text-foreground text-lg"
          )}
          style={{
            textShadow: `
              0 0 5px #fff,
              0 0 10px #fff,
              0 0 15px hsl(var(--primary)),
              0 0 20px hsl(var(--primary))`
          }}
        >
          {word}
        </div>
      </div>
    </div>
  );
};

export default React.memo(EnemyComponent);

    