"use client";

import { Heart, Zap, Award } from 'lucide-react';

interface ScoreboardProps {
  score: number;
  lives: number;
  combo: number;
  level: number;
}

const StatItem = ({ icon: Icon, value, label, className }: { icon: React.ElementType, value: string | number, label: string, className?: string }) => (
    <div className={`flex items-center gap-2 font-mono text-lg ${className}`}>
        <Icon className="w-5 h-5" />
        <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-2xl tracking-tighter">{value}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
        </div>
    </div>
);


export default function Scoreboard({ score, lives, combo, level }: ScoreboardProps) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 text-primary p-2 rounded-lg bg-black/30 border border-primary/20 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
            <StatItem icon={Award} value={score.toLocaleString()} label="Score" className="text-primary" />
            <StatItem icon={Zap} value={`x${combo}`} label="Combo" className="text-yellow-400" />
            <StatItem icon={Heart} value={lives} label="Lives" className="text-red-500" />
        </div>
        <div className="text-center text-xs text-muted-foreground font-mono">LEVEL: {level}</div>
    </div>
  );
}
