
"use client";

export default function Turret() {
  return (
    <div className="w-40 h-20 pointer-events-none">
      <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="turret-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cannon */}
        <path 
          d="M72 10 L88 10 L92 50 L68 50 Z" 
          className="fill-primary/20 stroke-primary stroke-1"
          style={{ filter: "url(#turret-glow)" }}
        />
        <path 
          d="M74 12 L86 12 L89 48 L71 48 Z" 
          className="fill-background"
        />
        <rect x="78" y="0" width="4" height="10" className="fill-primary" />
        
        {/* Base */}
        <path 
          d="M40 75 C40 65, 120 65, 120 75 L110 80 L50 80 Z"
          className="fill-primary/30 stroke-primary stroke-1"
          style={{ filter: "url(#turret-glow)" }}
        />
        <path 
          d="M45 75 C45 68, 115 68, 115 75 L108 79 L52 79 Z"
          className="fill-background"
        />

        {/* Central glowing orb */}
        <circle cx="80" cy="65" r="8" className="fill-primary" />
        <circle cx="80" cy="65" r="5" className="fill-background" />
        <circle cx="80" cy="65" r="12" className="fill-primary/30" style={{ filter: "url(#turret-glow)" }} />
      </svg>
    </div>
  );
}
