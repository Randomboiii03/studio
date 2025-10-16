
"use client";

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENEMY_TYPES, WORDS_LIST } from '@/lib/game-data';
import Turret from './Turret';
import EnemyComponent from './Enemy';
import GameOverModal from './GameOverModal';
import PauseMenu from './PauseMenu';
import { cn } from '@/lib/utils';
import { Award, Heart, Pause, Zap } from 'lucide-react';

type Enemy = {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  type: keyof typeof ENEMY_TYPES;
  vx: number;
  vy: number;
  status: 'alive' | 'dying';
};

type Projectile = {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
};

type Explosion = { id: string; x: number; y: number; color: string; };

type GameState = {
  status: 'idle' | 'playing' | 'gameOver' | 'paused';
  score: number;
  lives: number;
  combo: number;
  level: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  inputValue: string;
  isShaking: boolean;
};

type Action =
  | { type: 'START_GAME' }
  | { type: 'GAME_TICK' }
  | { type: 'INPUT_CHANGE'; payload: string }
  | { type: 'RESET_GAME' }
  | { type: 'EXIT_GAME' }
  | { type: 'SPAWN_ENEMY' }
  | { type: 'ENEMY_DESTROYED'; payload: { enemy: Enemy } }
  | { type: 'ENEMY_REACHED_END'; payload: { enemyId: number } }
  | { type: 'CREATE_PROJECTILE'; payload: { enemy: Enemy } }
  | { type: 'UPDATE_PROJECTILES' }
  | { type: 'CREATE_EXPLOSION'; payload: { enemy: Enemy } }
  | { type: 'CLEANUP_EFFECTS' }
  | { type: 'TRIGGER_SHAKE' }
  | { type: 'STOP_SHAKE' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' };

const INITIAL_LIVES = 10;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const TURRET_POSITION = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 };
let enemyIdCounter = 0;

const initialState: GameState = {
  status: 'idle',
  score: 0,
  lives: INITIAL_LIVES,
  combo: 1,
  level: 1,
  enemies: [],
  projectiles: [],
  explosions: [],
  inputValue: '',
  isShaking: false,
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      enemyIdCounter = 0;
      return {
        ...initialState,
        status: 'playing',
      };
    case 'RESET_GAME':
      enemyIdCounter = 0;
      return { ...initialState, status: 'playing' };

    case 'EXIT_GAME':
        return { ...initialState };

    case 'PAUSE_GAME':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME_GAME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'INPUT_CHANGE':
      return { ...state, inputValue: action.payload };

    case 'SPAWN_ENEMY': {
      if (state.enemies.length > 15 + state.level) return state;

      const word = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
      const enemyTypes = Object.keys(ENEMY_TYPES) as (keyof typeof ENEMY_TYPES)[];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      const baseSpeed = 0.5 + state.level * 0.1;
      
      const startX = Math.random() * (GAME_WIDTH - 100) + 50;
      const startY = -50;
      
      const angle = Math.atan2(TURRET_POSITION.y - startY, TURRET_POSITION.x - startX);
      const speed = baseSpeed * ENEMY_TYPES[type].speed;

      const newEnemy: Enemy = {
        id: enemyIdCounter++,
        word,
        x: startX,
        y: startY,
        speed: speed,
        type,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        status: 'alive'
      };

      return { ...state, enemies: [...state.enemies, newEnemy] };
    }
    
    case 'ENEMY_DESTROYED': {
      const { enemy } = action.payload;
      const scoreGained = enemy.word.length * 10 * state.combo;

      return {
        ...state,
        score: state.score + scoreGained,
        combo: state.combo + 1,
        enemies: state.enemies.map(e =>
          e.id === enemy.id ? { ...e, status: 'dying' } : e
        ),
        inputValue: '',
      };
    }
    
    case 'ENEMY_REACHED_END': {
        const newLives = state.lives - 1;
        if (newLives <= 0) {
            return { ...state, status: 'gameOver', lives: 0, enemies: [], projectiles: [] };
        }
        return {
            ...state,
            lives: newLives,
            combo: 1,
            enemies: state.enemies.filter(e => e.id !== action.payload.enemyId),
            isShaking: true,
        };
    }

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      const newEnemies = state.enemies.map(enemy => ({
        ...enemy,
        x: enemy.x + enemy.vx,
        y: enemy.y + enemy.vy,
      }));

      const newLevel = Math.floor(state.score / 1000) + 1;
      return { ...state, enemies: newEnemies, level: newLevel };
    }
    
    case 'CREATE_PROJECTILE': {
        const { enemy } = action.payload;
        const projectileId = `proj-${enemy.id}-${Date.now()}`;
        const newProjectile: Projectile = {
            id: projectileId,
            x: TURRET_POSITION.x,
            y: TURRET_POSITION.y,
            targetX: enemy.x,
            targetY: enemy.y
        };
        return { ...state, projectiles: [...state.projectiles, newProjectile] };
    }

    case 'UPDATE_PROJECTILES': {
        const newProjectiles = state.projectiles.map(p => {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 25) return null; // Remove if close to target
            const moveX = (dx / dist) * 25; // Projectile speed
            const moveY = (dy / dist) * 25;
            return {...p, x: p.x + moveX, y: p.y + moveY};
        }).filter(Boolean) as Projectile[];
        return { ...state, projectiles: newProjectiles };
    }

    case 'CREATE_EXPLOSION': {
        const { enemy } = action.payload;
        const explosionId = `expl-${enemy.id}-${Date.now()}`;
        const typeData = ENEMY_TYPES[enemy.type];
        const newExplosion: Explosion = {
            id: explosionId,
            x: enemy.x,
            y: enemy.y,
            color: typeData.className
        };
        return { ...state, explosions: [...state.explosions, newExplosion] };
    }
    
    case 'CLEANUP_EFFECTS': {
        return {
            ...state,
            enemies: state.enemies.filter(e => e.status !== 'dying'),
            explosions: [], // Explosions are short-lived
        };
    }

    case 'TRIGGER_SHAKE':
      return {...state, isShaking: true};
      
    case 'STOP_SHAKE':
      return {...state, isShaking: false};

    default:
      return state;
  }
};

const StatItem = ({ icon: Icon, value, label, className }: { icon: React.ElementType, value: string | number, label: string, className?: string }) => (
  <div className={cn("flex items-center gap-2 font-mono text-lg", className)}>
      <Icon className="w-5 h-5" />
      <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-2xl tracking-tighter">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
      </div>
  </div>
);

export function CyberTypeDefense() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (state.isShaking) {
      if(shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      
      if(gameAreaRef.current) {
        gameAreaRef.current.classList.remove('animate-screen-shake');
        void gameAreaRef.current.offsetWidth; // trigger reflow
        gameAreaRef.current.classList.add('animate-screen-shake');
      }

      shakeTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'STOP_SHAKE' });
      }, 400);
    }
     return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [state.isShaking]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state.status !== 'playing') return;
    dispatch({ type: 'INPUT_CHANGE', payload: e.target.value.toLowerCase() });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && state.status === 'playing') {
      const value = state.inputValue.trim();
      if (!value) return;

      const matchedEnemy = state.enemies.find(enemy => enemy.word === value && enemy.status === 'alive');
      if (matchedEnemy) {
        dispatch({ type: 'ENEMY_DESTROYED', payload: { enemy: matchedEnemy } });
        dispatch({ type: 'CREATE_PROJECTILE', payload: { enemy: matchedEnemy } });
        
        setTimeout(() => {
            dispatch({ type: 'CREATE_EXPLOSION', payload: { enemy: matchedEnemy } });
        }, 200); // Projectile travel time
      } else {
        dispatch({ type: 'INPUT_CHANGE', payload: '' });
      }
    }
  };

  // Main Game Loop
  useEffect(() => {
    if (state.status !== 'playing') return;

    const gameLoop = setInterval(() => {
      dispatch({ type: 'GAME_TICK' });
      dispatch({ type: 'UPDATE_PROJECTILES' });

      state.enemies.forEach(enemy => {
        if (enemy.y >= GAME_HEIGHT && enemy.status === 'alive') {
          dispatch({ type: 'ENEMY_REACHED_END', payload: { enemyId: enemy.id } });
        }
      });
      
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [state.status, state.enemies]);

  // Enemy Spawner
  useEffect(() => {
      if (state.status !== 'playing') return;
      const spawnInterval = Math.max(500, 3000 - state.level * 100);
      const spawner = setInterval(() => {
          dispatch({ type: 'SPAWN_ENEMY' });
      }, spawnInterval);

      return () => clearInterval(spawner);
  }, [state.status, state.level]);

  // Effect and entity cleanup loop
  useEffect(() => {
    if (state.status !== 'playing') return;
    const cleanupLoop = setInterval(() => {
        dispatch({type: 'CLEANUP_EFFECTS'});
    }, 500);
    return () => clearInterval(cleanupLoop);
  }, [state.status]);

  useEffect(() => {
    if (state.status === 'playing') {
        inputRef.current?.focus();
    }
  }, [state.status]);


  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <div 
        ref={gameAreaRef}
        className={cn(
          "relative bg-black/40 rounded-lg border-2 border-primary/50 shadow-[0_0_20px] shadow-primary/20 overflow-hidden",
          state.isShaking && "border-destructive shadow-[0_0_30px] shadow-destructive"
        )}
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {state.status === 'idle' ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
              CyberType Defense
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Type the words to destroy falling cyber threats. How long can you survive?
            </p>
            <Button size="lg" onClick={() => dispatch({ type: 'START_GAME' })} className="shadow-[0_0_20px] shadow-primary/50 mt-4">
              Start Defense Protocol
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-4 flex flex-col gap-2 text-primary p-2 rounded-lg bg-black/30 border border-primary/20 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <StatItem icon={Award} value={state.score.toLocaleString()} label="Score" className="text-primary" />
                    <StatItem icon={Zap} value={`x${state.combo}`} label="Combo" className="text-yellow-400" />
                    <StatItem icon={Heart} value={state.lives} label="Lives" className="text-red-500" />
                </div>
                <div className="text-center text-xs text-muted-foreground font-mono">LEVEL: {state.level}</div>
            </div>

            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => dispatch({type: 'PAUSE_GAME'})}>
                <Pause />
            </Button>
            
            {state.enemies.map(enemy => (
              <EnemyComponent key={enemy.id} {...enemy} />
            ))}
            
            {state.projectiles.map(p => (
              <div key={p.id} className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_10px] shadow-primary" style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%)` }} />
            ))}

            {state.explosions.map(explosion => (
              <div key={explosion.id} className="absolute" style={{ left: explosion.x, top: explosion.y }}>
                {[...Array(5)].map((_, i) => (
                  <div key={`${explosion.id}-${i}`} className={cn("absolute rounded-full animate-fade-dots", explosion.color.replace('text-','bg-'))} style={{ 
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      transform: `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px)`,
                      animationDelay: `${Math.random() * 0.1}s`,
                    }} />
                ))}
              </div>
            ))}

            <Turret />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80">
              <Input
                ref={inputRef}
                type="text"
                className="w-full text-center bg-background/80 border-primary h-12 text-xl font-mono tracking-widest focus:bg-background focus:shadow-[0_0_20px] focus:shadow-primary/50 transition-all duration-300"
                placeholder={state.status === 'playing' ? "TYPE HERE" : ''}
                value={state.inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={state.status !== 'playing'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </>
        )}

        {state.status === 'gameOver' && (
          <GameOverModal 
            score={state.score}
            onRestart={() => dispatch({ type: 'RESET_GAME' })}
          />
        )}
        
        {state.status === 'paused' && (
            <PauseMenu 
                onResume={() => dispatch({type: 'RESUME_GAME'})}
                onRestart={() => dispatch({type: 'RESET_GAME'})}
                onExit={() => dispatch({type: 'EXIT_GAME'})}
            />
        )}
      </div>
    </div>
  );
}

    