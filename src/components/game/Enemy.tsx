
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ENEMY_TYPES } from '@/lib/game-data';

interface EnemyProps {
  word: string;
  words: string[];
  currentWordIndex: number;
  x: number;
  y: number;
  type: keyof typeof ENEMY_TYPES;
  status: 'alive' | 'dying' | 'targeted';
  isBoss: boolean;
  isStealthed?: boolean;
  isSplitterChild?: boolean;
}

const EnemyComponent: React.FC<EnemyProps> = ({ word, words, currentWordIndex, x, y, type, status, isBoss, isStealthed, isSplitterChild }) => {
  const typeData = ENEMY_TYPES[type] || ENEMY_TYPES['Malware'];
  const Icon = typeData.icon;

  const healthPercentage = isBoss ? ((words.length - currentWordIndex) / words.length) * 100 : 100;

  const enemySizeClass = isBoss ? 'h-24' : isSplitterChild ? 'h-12' : 'h-16';
  const iconSizeClass = isBoss ? 'w-12 h-12' : isSplitterChild ? 'w-6 h-6' : 'w-8 h-8';
  const textSizeClass = isBoss ? 'text-2xl' : isSplitterChild ? 'text-base' : 'text-lg';

  return (
    <div
      className={cn(
        "absolute flex flex-col items-center group transition-opacity duration-300",
        status === 'dying' ? 'opacity-0' : 'opacity-100',
        status === 'targeted' && 'opacity-70',
        isStealthed && 'opacity-10'
      )}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={cn(
          "relative w-auto flex items-center justify-center px-4 rounded-md", 
          enemySizeClass,
          typeData.className
        )} 
        style={{ filter: `drop-shadow(0 0 8px currentColor)`}}
      >
        <Icon className={cn("mr-3 text-white", iconSizeClass)} />
        <div
          className={cn(
            "font-mono font-bold tracking-widest text-white",
            textSizeClass
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
        {isBoss && (
            <div className="absolute -bottom-4 w-48 h-2.5 bg-gray-700/50 border border-gray-500 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${healthPercentage}%` }} />
            </div>
        )}
    </div>
  );
};

export default React.memo(EnemyComponent);

    