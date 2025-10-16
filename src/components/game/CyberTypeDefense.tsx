
"use client";

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENEMY_TYPES, POWER_UPS, WORDS_LIST } from '@/lib/game-data.tsx';
import { useToast } from "@/hooks/use-toast";
import PowerUpDisplay from './PowerUpDisplay';
import Turret from './Turret';
import EnemyComponent from './Enemy';
import GameOverModal from './GameOverModal';
import { cn } from '@/lib/utils';
import { Award, Heart, Zap } from 'lucide-react';

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

type ActivePowerUp = {
  name: typeof POWER_UPS[number]['name'];
  timeoutId: NodeJS.Timeout;
  color: string;
};

type GameState = {
  status: 'idle' | 'playing' | 'gameOver';
  score: number;
  lives: number;
  combo: number;
  level: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  activePowerUps: ActivePowerUp[];
  inputValue: string;
  finalScore: number | null;
  effects: {
    isFrozen: boolean;
    isShielded: boolean;
    isSlowed: boolean;
    scoreMultiplier: number;
  };
  isShaking: boolean;
};

type Action =
  | { type: 'START_GAME' }
  | { type: 'GAME_TICK'; delta: number }
  | { type: 'INPUT_CHANGE'; value: string }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_ENEMY'; payload: Enemy }
  | { type: 'ENEMY_HIT'; payload: { enemyId: number } }
  | { type: 'DESTROY_ENEMY'; payload: { enemyId: number } }
  | { type: 'ADD_PROJECTILE'; payload: Projectile }
  | { type: 'REMOVE_PROJECTILE'; payload: { id: string } }
  | { type: 'ADD_EXPLOSION'; payload: Explosion }
  | { type: 'REMOVE_EXPLOSION'; payload: { id: string } }
  | { type: 'ACTIVATE_POWERUP'; payload: typeof POWER_UPS[number] }
  | { type: 'DEACTIVATE_POWERUP'; payload: { name: string } }
  | { type: 'SET_EFFECTS'; payload: Partial<GameState['effects']> }
  | { type: 'SET_LIVES'; payload: number }
  | { type: 'TRIGGER_SHAKE' }
  | { type: 'STOP_SHAKE' };

const INITIAL_LIVES = 10;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const TURRET_POSITION = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 };


const initialState: GameState = {
  status: 'idle',
  score: 0,
  lives: INITIAL_LIVES,
  combo: 1,
  level: 1,
  enemies: [],
  projectiles: [],
  explosions: [],
  activePowerUps: [],
  inputValue: '',
  finalScore: null,
  effects: {
    isFrozen: false,
    isShielded: false,
    isSlowed: false,
    scoreMultiplier: 1,
  },
  isShaking: false,
};

let enemyIdCounter = 0;

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        status: 'playing',
      };
    case 'RESET_GAME':
      state.activePowerUps.forEach(p => clearTimeout(p.timeoutId));
      return { ...initialState, status: 'playing' };

    case 'INPUT_CHANGE':
      return { ...state, inputValue: action.value };

    case 'ADD_ENEMY':
      return { ...state, enemies: [...state.enemies, action.payload] };
    
    case 'ENEMY_HIT': {
      const enemy = state.enemies.find(e => e.id === action.payload.enemyId);
      if (!enemy) return state;

      const scoreGained = enemy.word.length * 10 * state.combo * state.effects.scoreMultiplier;
      return {
        ...state,
        score: state.score + scoreGained,
        combo: state.combo + 1,
        enemies: state.enemies.map(e => e.id === action.payload.enemyId ? { ...e, status: 'dying' } : e),
      };
    }
    
    case 'DESTROY_ENEMY': {
      return {
        ...state,
        enemies: state.enemies.filter(e => e.id !== action.payload.enemyId),
      };
    }
    
    case 'ADD_PROJECTILE':
      return { ...state, projectiles: [...state.projectiles, action.payload] };
      
    case 'REMOVE_PROJECTILE':
      return { ...state, projectiles: state.projectiles.filter(p => p.id !== action.payload.id) };

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      let newEnemies = [...state.enemies];
      let newLives = state.lives;
      let newCombo = state.combo;
      let gameOver = false;
      let triggerShake = false;

      const speedModifier = state.effects.isSlowed ? 0.5 : 1;
      
      newEnemies = state.effects.isFrozen ? newEnemies : newEnemies.map(enemy => ({
        ...enemy,
        x: enemy.x + enemy.vx * action.delta * 60 * speedModifier,
        y: enemy.y + enemy.vy * action.delta * 60 * speedModifier,
      })).filter(enemy => {
        if (enemy.y >= GAME_HEIGHT) {
          if (enemy.status === 'alive') {
            if (!state.effects.isShielded) {
              newLives -= 1;
              triggerShake = true;
            }
            newCombo = 1;
          }
          if (newLives <= 0) gameOver = true;
          return false;
        }
        return true;
      });
      
      if (triggerShake) {
        return { ...state, enemies: newEnemies, lives: newLives, combo: newCombo, isShaking: true };
      }


      if (gameOver) {
        return { ...state, status: 'gameOver', finalScore: state.score, lives: 0, enemies: [], isShaking: false };
      }
      
      const newProjectiles = state.projectiles.map(p => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const moveX = (dx / dist) * 25; // Projectile speed
        const moveY = (dy / dist) * 25;
        return {...p, x: p.x + moveX, y: p.y + moveY};
      }).filter(p => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        return (dx * dx + dy * dy) > 20*20;
      });


      const newLevel = Math.floor(state.score / 1000) + 1;

      return { ...state, projectiles: newProjectiles, enemies: newEnemies, lives: newLives, combo: newCombo, level: newLevel };
    }
    
    case 'ADD_EXPLOSION':
      return { ...state, explosions: [...state.explosions, action.payload] };
      
    case 'REMOVE_EXPLOSION':
      return { ...state, explosions: state.explosions.filter(e => e.id !== action.payload.id) };

    case 'ACTIVATE_POWERUP': {
      const { payload: powerUp } = action;
      
      const existingPowerup = state.activePowerUps.find(p => p.name === powerUp.name);
      if (existingPowerup) {
        clearTimeout(existingPowerup.timeoutId);
      }
      
      const otherPowerups = state.activePowerUps.filter(p => p.name !== powerUp.name);

      return { ...state, activePowerUps: [...otherPowerups, action.payload as unknown as ActivePowerUp] };
    }
    case 'DEACTIVATE_POWERUP': {
      return { ...state, activePowerUps: state.activePowerUps.filter(p => p.name !== action.payload.name) };
    }
    
    case 'SET_EFFECTS':
        return { ...state, effects: { ...state.effects, ...action.payload } };

    case 'SET_LIVES':
        return { ...state, lives: action.payload };
    
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
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const enemySpawnTimerRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
  }, [state.isShaking]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    dispatch({ type: 'INPUT_CHANGE', value });

    const powerUp = POWER_UPS.find(p => p.keywords.includes(value));
    if (powerUp) {
      activatePowerUp(powerUp);
      dispatch({ type: 'INPUT_CHANGE', value: '' });
      return;
    }

    const matchedEnemy = state.enemies.find(enemy => enemy.word === value && enemy.status === 'alive');
    if (matchedEnemy) {
      destroyEnemy(matchedEnemy);
      dispatch({ type: 'INPUT_CHANGE', value: '' });
    }
  };
  
  const activatePowerUp = useCallback((powerUp: typeof POWER_UPS[number]) => {
    toast({
        title: `Power-Up Activated: ${powerUp.name}`,
        description: powerUp.effect,
    });
    
    let isInstant = powerUp.duration === 0;

    switch(powerUp.name) {
      case 'Frenzy':
        state.enemies.forEach(enemy => destroyEnemy(enemy, true));
        break;
      case 'Freeze':
        dispatch({ type: 'SET_EFFECTS', payload: { isFrozen: true } });
        break;
      case 'Shield':
        dispatch({ type: 'SET_EFFECTS', payload: { isShielded: true } });
        break;
      case 'Slowdown':
        dispatch({ type: 'SET_EFFECTS', payload: { isSlowed: true } });
        break;
      case 'Overclock':
        dispatch({ type: 'SET_EFFECTS', payload: { scoreMultiplier: 2 } });
        break;
      case 'Heal':
        dispatch({ type: 'SET_LIVES', payload: Math.min(INITIAL_LIVES, state.lives + 3) });
        break;
      case 'Nuke':
        state.enemies.forEach(enemy => destroyEnemy(enemy, true));
        break;
      case 'King':
        dispatch({ type: 'SET_EFFECTS', payload: { isShielded: true } }); // For King, we can re-use shield
        break;
    }
    
    if(!isInstant) {
        const timeoutId = setTimeout(() => {
            dispatch({ type: 'DEACTIVATE_POWERUP', payload: { name: powerUp.name } });
            switch(powerUp.name) {
                case 'Freeze': dispatch({ type: 'SET_EFFECTS', payload: { isFrozen: false } }); break;
                case 'Shield': dispatch({ type: 'SET_EFFECTS', payload: { isShielded: false } }); break;
                case 'Slowdown': dispatch({ type: 'SET_EFFECTS', payload: { isSlowed: false } }); break;
                case 'Overclock': dispatch({ type: 'SET_EFFECTS', payload: { scoreMultiplier: 1 } }); break;
                case 'King': dispatch({ type: 'SET_EFFECTS', payload: { isShielded: false } }); break;
            }
        }, powerUp.duration);
        
        dispatch({ type: 'ACTIVATE_POWERUP', payload: { ...powerUp, timeoutId } });
    } else {
        dispatch({ type: 'ACTIVATE_POWERUP', payload: { ...powerUp, timeoutId: setTimeout(() => {
            dispatch({ type: 'DEACTIVATE_POWERUP', payload: { name: powerUp.name } });
        }, 500) } });
    }
  }, [state.enemies, state.lives]);
  

  const destroyEnemy = (enemy: Enemy, isFrenzy = false) => {
    dispatch({ type: 'ENEMY_HIT', payload: { enemyId: enemy.id } });

    const projectileId = `proj-${enemy.id}-${Date.now()}`;
    dispatch({ type: 'ADD_PROJECTILE', payload: { id: projectileId, x: TURRET_POSITION.x, y: TURRET_POSITION.y, targetX: enemy.x, targetY: enemy.y } });
    
    setTimeout(() => {
      dispatch({ type: 'REMOVE_PROJECTILE', payload: { id: projectileId } });
      const explosionId = `expl-${enemy.id}-${Date.now()}`;
      const typeData = ENEMY_TYPES[enemy.type];
      dispatch({ type: 'ADD_EXPLOSION', payload: { id: explosionId, x: enemy.x, y: enemy.y, color: typeData.className } });
      setTimeout(() => dispatch({ type: 'REMOVE_EXPLOSION', payload: { id: explosionId } }), 500);

      if (!isFrenzy) {
        setTimeout(() => dispatch({ type: 'DESTROY_ENEMY', payload: { enemyId: enemy.id } }), 300); // fade out time
      } else {
        dispatch({ type: 'DESTROY_ENEMY', payload: { enemyId: enemy.id } });
      }
    }, 200); // projectile travel time
  };
  
  const spawnEnemy = useCallback(() => {
    if (state.status !== 'playing' || state.enemies.length > 15 + state.level) return;

    const spawnInterval = Math.max(200, 3000 - state.level * 100);
    if (enemySpawnTimerRef.current > spawnInterval) {
      enemySpawnTimerRef.current = 0;
      
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

      dispatch({ type: 'ADD_ENEMY', payload: newEnemy });
    }
  }, [state.level, state.enemies.length, state.status]);

  const gameLoop = useCallback((time: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = time;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const delta = (time - lastTimeRef.current) / 1000;
    lastTimeRef.current = time;
    enemySpawnTimerRef.current += delta * 1000;

    spawnEnemy();
    dispatch({ type: 'GAME_TICK', delta });
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [spawnEnemy]);

  useEffect(() => {
    if (state.status === 'playing') {
      inputRef.current?.focus();
      lastTimeRef.current = undefined;
      enemyIdCounter = 0;
      enemySpawnTimerRef.current = 0;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      state.activePowerUps.forEach(p => clearTimeout(p.timeoutId));
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, [state.status, gameLoop]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4">
      <div 
        ref={gameAreaRef}
        className={cn(
          "relative w-full max-w-5xl aspect-[10/6] bg-black/40 rounded-lg border-2 border-primary/50 shadow-[0_0_20px] shadow-primary/20 overflow-hidden",
          state.isShaking && "border-destructive shadow-[0_0_30px] shadow-destructive animate-screen-shake"
        )}
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {state.status === 'playing' || state.status === 'gameOver' ? (
          <>
            <div className="absolute top-4 left-4 flex flex-col gap-2 text-primary p-2 rounded-lg bg-black/30 border border-primary/20 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <StatItem icon={Award} value={state.score.toLocaleString()} label="Score" className="text-primary" />
                    <StatItem icon={Zap} value={`x${state.combo}`} label="Combo" className="text-yellow-400" />
                    <StatItem icon={Heart} value={state.lives} label="Lives" className="text-red-500" />
                </div>
                <div className="text-center text-xs text-muted-foreground font-mono">LEVEL: {state.level}</div>
            </div>
            <PowerUpDisplay activePowerUps={state.activePowerUps} />
            
            {state.enemies.map(enemy => (
              <EnemyComponent key={enemy.id} {...enemy} />
            ))}
            
            {state.projectiles.map(p => (
              <div key={p.id} className="absolute w-1 h-4 bg-primary/80 rounded-full shadow-[0_0_10px] shadow-primary" style={{ left: p.x, top: p.y, transform: `rotate(${Math.atan2(p.targetY - p.y, p.targetX - p.x)}rad) translate(0, -50%)` }} />
            ))}

            {state.explosions.map(explosion => (
              <div key={explosion.id} className="absolute" style={{ left: explosion.x, top: explosion.y }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn("absolute rounded-full animate-fade-dots", explosion.color.replace('text-','bg-'))} style={{ 
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
                placeholder="TYPE HERE"
                value={state.inputValue}
                onChange={handleInputChange}
                disabled={state.status !== 'playing'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
            <h1 className="font-headline text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-2">
              CyberType Defense
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
              Type the words to destroy falling cyber threats. Activate powerful abilities by typing special keywords. How long can you survive?
            </p>
            <Button size="lg" onClick={() => dispatch({ type: 'START_GAME' })} className="shadow-[0_0_20px] shadow-primary/50 mt-4">
              Start Defense Protocol
            </Button>
          </div>
        )}

        {state.status === 'gameOver' && (
          <GameOverModal 
            score={state.finalScore || 0}
            onRestart={() => dispatch({ type: 'RESET_GAME' })}
          />
        )}
      </div>
    </div>
  );
}

    