"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ENEMY_TYPES, type EnemyTypeData } from '@/lib/game-data';

interface EnemyProps {
  id: number;
  word: string;
  x: number;
  y: number;
  type: keyof typeof ENEMY_TYPES;
}

const EnemyComponent: React.FC<EnemyProps> = ({ word, x, y, type }) => {
  const typeData = ENEMY_TYPES[type] || { className: 'text-foreground', speed: 1 };

  return (
    <div
      className={cn(
        "absolute font-mono font-bold tracking-widest px-2 py-1 rounded",
        typeData.className
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        textShadow: `0 0 8px currentColor`,
      }}
    >
      {word}
    </div>
  );
};

export default React.memo(EnemyComponent);
