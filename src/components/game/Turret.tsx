
"use client";

export default function Turret() {
  return (
    <div className="w-40 h-20 pointer-events-none">
      <svg viewBox="0 0 160 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <filter id="turret-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cannon */}
        <path 
          d="M76 10 L84 10 L88 40 L72 40 Z" 
          className="fill-primary/20 stroke-primary stroke-1"
          style={{ filter: "url(#turret-glow)" }}
        />
        <path 
          d="M78 12 L82 12 L85 38 L75 38 Z" 
          className="fill-background"
        />
        <rect x="79" y="0" width="2" height="10" className="fill-primary" />
        
        {/* Base */}
        <path 
          d="M20 78 C 40 50, 120 50, 140 78 L120 80 L40 80 Z"
          className="fill-primary/30 stroke-primary stroke-1"
          style={{ filter: "url(#turret-glow)" }}
        />
        <path 
          d="M30 78 C 50 58, 110 58, 130 78 L115 79 L45 79 Z"
          className="fill-background"
        />

        {/* Central glowing orb */}
        <circle cx="80" cy="68" r="10" className="fill-primary" />
        <circle cx="80" cy="68" r="6" className="fill-background" />
        <circle cx="80" cy="68" r="14" className="fill-primary/30" style={{ filter: "url(#turret-glow)" }} />
      </svg>
    </div>
  );
}
