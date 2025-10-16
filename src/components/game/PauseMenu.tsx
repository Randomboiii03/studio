
"use client";

import { Button } from "@/components/ui/button";

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export default function PauseMenu({ onResume, onRestart, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-4">
      <h2 className="text-4xl font-bold text-primary tracking-wider mb-8">PAUSED</h2>
      <div className="flex flex-col gap-4 w-64">
        <Button onClick={onResume} variant="default" size="lg" className="shadow-[0_0_15px] shadow-primary/50">Resume</Button>
        <Button onClick={onRestart} variant="secondary" size="lg">Restart</Button>
        <Button onClick={onExit} variant="outline" size="lg">Exit Game</Button>
      </div>
    </div>
  );
}

    