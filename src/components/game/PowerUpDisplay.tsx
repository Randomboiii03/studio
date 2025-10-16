"use client";

import { POWER_UPS, type PowerUp } from '@/lib/game-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PowerUpDisplayProps {
  activePowerUps: { name: string; color: string }[];
}

export default function PowerUpDisplay({ activePowerUps }: PowerUpDisplayProps) {
  const isPowerUpActive = (powerUpName: string) => {
    return activePowerUps.some(p => p.name === powerUpName);
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <TooltipProvider>
        {POWER_UPS.map((powerUp: PowerUp) => {
          const isActive = isPowerUpActive(powerUp.name);
          return (
            <Tooltip key={powerUp.name}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'w-12 h-12 flex items-center justify-center rounded-md border border-primary/20 bg-black/30 transition-all duration-300',
                    isActive ? 'border-accent shadow-[0_0_15px] shadow-accent/70' : 'opacity-40'
                  )}
                >
                  <powerUp.icon className={cn('w-6 h-6', isActive ? 'text-accent' : 'text-primary')} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-background border-accent">
                <p className="font-bold text-accent">{powerUp.name}</p>
                <p className="text-sm text-muted-foreground">{powerUp.effect}</p>
                <p className="text-xs mt-1">
                  Keywords: <span className="font-mono text-primary">{powerUp.keywords.join(', ')}</span>
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
