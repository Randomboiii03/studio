
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
  status: 'alive' | 'dying' | 'targeted';
};

type Projectile = {
  id: string;
  x: number;
  y: number;
  targetId: number;
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
  | { type: 'RESET_GAME' }
  | { type: 'EXIT_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'GAME_TICK' }
  | { type: 'INPUT_CHANGE'; payload: string }
  | { type: 'SUBMIT_WORD' }
  | { type: 'ENEMY_HIT'; payload: { enemy: Enemy } }
  | { type: 'PROJECTILE_HIT'; payload: { targetId: number } }
  | { type: 'ENEMY_REACHED_END'; payload: { enemyId: number } }
  | { type: 'CLEANUP_EFFECTS' }
  | { type: 'TRIGGER_SHAKE' }
  | { type: 'STOP_SHAKE' }
  | { type: 'ADD_ENEMY', payload: Enemy };


const INITIAL_LIVES = 10;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const TURRET_POSITION = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 };
const TURRET_HITBOX_Y = GAME_HEIGHT - 80; // Adjusted for better collision feel
let enemyIdCounter = 0;
let effectIdCounter = 0;

const initialState: GameState = {
  status: 'idle',
  score: 0,
  lives: INITIAL_LIVES,
  combo: 0,
  level: 1,
  enemies: [],
  projectiles: [],
  explosions: [],
  inputValue: '',
  isShaking: false,
};

const spawnEnemy = (level: number): Enemy => {
  const word = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
  const enemyTypes = Object.keys(ENEMY_TYPES) as (keyof typeof ENEMY_TYPES)[];
  const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  
  // Base speed decreases for longer words
  const lengthModifier = 1 - (Math.min(word.length, 15) - 4) * 0.05; // -5% speed per char over 4
  const baseSpeed = (0.5 + level * 0.1) * Math.max(0.5, lengthModifier);
  
  const startX = Math.random() * (GAME_WIDTH - 100) + 50;
  const startY = -50;
  
  const angle = Math.atan2(TURRET_POSITION.y - startY, TURRET_POSITION.x - startX);
  const speed = baseSpeed * ENEMY_TYPES[type].speed;

  return {
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
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      enemyIdCounter = 0;
      effectIdCounter = 0;
      return {
        ...initialState,
        status: 'playing',
      };
    case 'RESET_GAME':
      enemyIdCounter = 0;
      effectIdCounter = 0;
      return { ...initialState, status: 'playing' };

    case 'EXIT_GAME':
        return { ...initialState };

    case 'PAUSE_GAME':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME_GAME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'INPUT_CHANGE':
      return { ...state, inputValue: action.payload };

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      // Update enemy positions
      const updatedEnemies = state.enemies.map(enemy => ({
        ...enemy,
        x: enemy.x + enemy.vx,
        y: enemy.y + enemy.vy,
      }));

      // Update projectile positions
      const updatedProjectiles = state.projectiles.map(p => {
            const enemyTarget = updatedEnemies.find(e => e.id === p.targetId);
            const targetX = enemyTarget ? enemyTarget.x : p.targetX;
            const targetY = enemyTarget ? enemyTarget.y : p.targetY;
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 25) {
                return null;
            }
            
            const moveX = (dx / dist) * 25; // Projectile speed
            const moveY = (dy / dist) * 25;
            return {...p, x: p.x + moveX, y: p.y + moveY, targetX, targetY};
        }).filter(Boolean) as Projectile[];

      // Check for projectile hits
      let hitProjectiles: number[] = [];
      state.projectiles.forEach(p => {
          const enemy = updatedEnemies.find(e => e.id === p.targetId && e.status !== 'dying');
          if (enemy) {
              const dx = p.x - enemy.x;
              const dy = p.y - enemy.y;
              if (Math.sqrt(dx * dx + dy * dy) < 25) {
                  hitProjectiles.push(p.targetId);
              }
          }
      });
      
      let nextState: GameState = { ...state, enemies: updatedEnemies, projectiles: updatedProjectiles };
      
      hitProjectiles.forEach(targetId => {
        nextState = gameReducer(nextState, { type: 'PROJECTILE_HIT', payload: { targetId } });
      });

      // Check for enemies reaching the end
      const enemiesReachedEnd = nextState.enemies.filter(e => e.y >= TURRET_HITBOX_Y && e.status === 'alive');
      
      enemiesReachedEnd.forEach(enemy => {
        nextState = gameReducer(nextState, { type: 'ENEMY_REACHED_END', payload: { enemyId: enemy.id } });
      });

      return nextState;
    }
    
    case 'ENEMY_HIT': {
        const { enemy } = action.payload;
        const projectileId = `proj-${enemy.id}-${effectIdCounter++}`;
        const newProjectile: Projectile = {
            id: projectileId,
            x: TURRET_POSITION.x,
            y: TURRET_POSITION.y,
            targetId: enemy.id,
            targetX: enemy.x,
            targetY: enemy.y
        };

        return {
            ...state,
            inputValue: '',
            enemies: state.enemies.map(e =>
                e.id === enemy.id ? { ...e, status: 'targeted' } : e
            ),
            projectiles: [...state.projectiles, newProjectile],
        };
    }
    
    case 'PROJECTILE_HIT': {
      const { targetId } = action.payload;
      const enemy = state.enemies.find(e => e.id === targetId);

      if (!enemy || enemy.status === 'dying') {
          return state;
      }
      
      const scoreGained = enemy.word.length * 10 * (state.combo + 1);
      const explosionId = `expl-${targetId}-${effectIdCounter++}`;
      const typeData = ENEMY_TYPES[enemy.type];
      const newExplosion: Explosion = {
          id: explosionId,
          x: enemy.x,
          y: enemy.y,
          color: typeData.className
      };
      
      const updatedEnemies = state.enemies.map(e => e.id === targetId ? { ...e, status: 'dying' } : e);

      return {
        ...state,
        score: state.score + scoreGained,
        combo: state.combo + 1,
        enemies: updatedEnemies,
        projectiles: state.projectiles.filter(p => p.targetId !== targetId),
        explosions: [...state.explosions, newExplosion],
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
            combo: 0,
            enemies: state.enemies.filter(e => e.id !== action.payload.enemyId),
            isShaking: true,
        };
    }

    case 'SUBMIT_WORD': {
      const value = state.inputValue.trim();
      if (!value) return state;

      const matchedEnemy = state.enemies.find(
        (enemy) => enemy.word === value && enemy.status === 'alive'
      );

      if (matchedEnemy) {
        return gameReducer(state, { type: 'ENEMY_HIT', payload: { enemy: matchedEnemy } });
      } else {
        return { ...state, inputValue: '', combo: 0 };
      }
    }
    
    case 'CLEANUP_EFFECTS': {
        const remainingEnemies = state.enemies.filter(e => e.status !== 'dying');
        const levelUp = state.enemies.length > 0 && remainingEnemies.length === 0;
        
        return {
            ...state,
            enemies: remainingEnemies,
            explosions: [], // Explosions are short-lived
            level: levelUp ? state.level + 1 : state.level,
        };
    }

    case 'ADD_ENEMY':
        return { ...state, enemies: [...state.enemies, action.payload] };

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

  const { status, score, lives, combo, level, enemies, projectiles, explosions, inputValue, isShaking } = state;

  useEffect(() => {
    if (isShaking) {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      
      const element = gameAreaRef.current;
      if(element) {
        element.classList.remove('animate-screen-shake');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('animate-screen-shake');
      }

      shakeTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'STOP_SHAKE' });
      }, 400);
    }
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [isShaking]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'playing') return;
    dispatch({ type: 'INPUT_CHANGE', payload: e.target.value.toLowerCase() });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && status === 'playing') {
      dispatch({ type: 'SUBMIT_WORD' });
    } else if (e.key === 'Escape' && status === 'playing') {
      dispatch({ type: 'PAUSE_GAME' });
    }
  };

  // Main Game Loop
  useEffect(() => {
    if (status !== 'playing') return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      if (deltaTime > 16) { // Corresponds to ~60 FPS
        dispatch({ type: 'GAME_TICK' });
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [status]);


  // Enemy Spawner
  useEffect(() => {
    if (status !== 'playing') return;
    
    // Check if all enemies are gone to trigger next level
    if (enemies.length === 0) {
        // Spawn initial wave for the level
        const waveSize = Math.min(5 + level, 20); // e.g. level 1 has 6, grows to max of 20
        for(let i = 0; i < waveSize; i++) {
            setTimeout(() => {
                if(status === 'playing') {
                    dispatch({ type: 'ADD_ENEMY', payload: spawnEnemy(level) });
                }
            }, i * (2000 / (level * 0.5 + 1))); // Stagger spawns, faster with levels
        }
    }
}, [status, level, enemies.length]);


  // Effect and entity cleanup loop
  useEffect(() => {
    if (status !== 'playing') return;
    const cleanupLoop = setInterval(() => {
        dispatch({type: 'CLEANUP_EFFECTS'});
    }, 500);
    return () => clearInterval(cleanupLoop);
  }, [status]);

  useEffect(() => {
    if (status === 'playing') {
        inputRef.current?.focus();
    }
  }, [status]);


  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <div 
        ref={gameAreaRef}
        className={cn(
          "relative bg-black/40 rounded-lg border-2 border-primary/50 shadow-[0_0_20px] shadow-primary/20 overflow-hidden",
          isShaking && "border-destructive shadow-[0_0_30px] shadow-destructive"
        )}
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {status === 'idle' ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
              CyberType Defense
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Type the cybersecurity commands to neutralize falling threats. Defend the system!
            </p>
            <Button size="lg" onClick={() => dispatch({ type: 'START_GAME' })} className="shadow-[0_0_20px] shadow-primary/50 mt-4">
              Start Defense Protocol
            </Button>
          </div>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => dispatch({type: 'PAUSE_GAME'})}>
                <Pause />
            </Button>
            
            {enemies.map(enemy => (
              <EnemyComponent key={enemy.id} {...enemy} />
            ))}
            
            {projectiles.map(p => (
              <div key={p.id} className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_10px] shadow-primary" style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%)` }} />
            ))}

            {explosions.map(explosion => (
              <div key={`${explosion.id}-${Math.random()}`} className="absolute" style={{ left: explosion.x, top: explosion.y }}>
                {[...Array(5)].map((_, i) => (
                  <div key={`${explosion.id}-${i}-${Math.random()}`} className={cn("absolute rounded-full animate-fade-dots", explosion.color.replace('text-','bg-'))} style={{ 
                      width: `${Math.random() * 6 + 2}px`,
                      height: `${Math.random() * 6 + 2}px`,
                      transform: `translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px)`,
                      animationDelay: `${Math.random() * 0.1}s`,
                    }} />
                ))}
              </div>
            ))}

            <Turret />
            
            <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between items-end z-10 pointer-events-none">
                <div className="flex-1 flex justify-start gap-4">
                     <StatItem icon={Award} value={score.toLocaleString()} label="Score" className="text-primary" />
                     <StatItem icon={Heart} value={lives} label="Lives" className="text-red-500" />
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 pointer-events-auto">
                    <Input
                        ref={inputRef}
                        type="text"
                        className="w-full text-center bg-background/80 border-primary h-12 text-xl font-mono tracking-widest focus:bg-background focus:shadow-[0_0_20px] focus:shadow-primary/50 transition-all duration-300"
                        placeholder={status === 'playing' ? "TYPE HERE" : ''}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={status !== 'playing'}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />
                </div>

                <div className="flex-1 flex justify-end gap-4">
                    <StatItem icon={Zap} value={`x${combo}`} label="Combo" className="text-yellow-400" />
                    <div className="text-center text-xs text-muted-foreground font-mono w-24">LEVEL: {level}</div>
                </div>
            </div>

          </>
        )}

        {status === 'gameOver' && (
          <GameOverModal 
            score={score}
            onRestart={() => dispatch({ type: 'RESET_GAME' })}
          />
        )}
        
        {status === 'paused' && (
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
