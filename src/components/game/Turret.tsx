"use client";

import { cn } from "@/lib/utils";

export default function Turret() {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none">
      <svg viewBox="0 0 192 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Turret Cannon */}
        <path 
          d="M86 20 H106 V60 H86 Z" 
          className="fill-primary/30 stroke-primary stroke-2"
          style={{ filter: "url(#glow)" }}
        />
        <path 
          d="M88 20 H104 V58 H88 Z" 
          className="fill-background"
        />
        <rect x="94" y="10" width="4" height="10" className="fill-primary" />
        
        {/* Turret Base */}
        <path 
          d="M60 90 C70 70, 122 70, 132 90 H60 Z"
          className="fill-primary/30 stroke-primary stroke-2"
          style={{ filter: "url(#glow)" }}
        />
         <path 
          d="M65 90 C75 75, 117 75, 127 90 H65 Z"
          className="fill-background"
        />
        <circle cx="96" cy="80" r="10" className="fill-primary" />
        <circle cx="96" cy="80" r="6" className="fill-background" />

      </svg>
    </div>
  );
}
