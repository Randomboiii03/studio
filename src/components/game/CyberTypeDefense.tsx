"use client";

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENEMY_TYPES, POWER_UPS, WORDS_LIST } from '@/lib/game-data';
import { useToast } from "@/hooks/use-toast";
import Scoreboard from './Scoreboard';
import PowerUpDisplay from './PowerUpDisplay';
import Turret from './Turret';
import EnemyComponent from './Enemy';
import GameOverModal from './GameOverModal';
import { cn } from '@/lib/utils';

type Enemy = {
  id: number;
  word: string;
  x: number;
  y: number;
  speed: number;
  type: keyof typeof ENEMY_TYPES;
};

type Explosion = Omit<Enemy, 'speed'>;

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
};

type Action =
  | { type: 'START_GAME' }
  | { type: 'GAME_TICK'; delta: number }
  | { type: 'INPUT_CHANGE'; value: string }
  | { type: 'RESET_GAME' }
  | { type: 'ADD_ENEMY'; payload: Enemy }
  | { type: 'DESTROY_ENEMY'; payload: { enemy: Enemy } }
  | { type: 'ADD_EXPLOSION'; payload: Explosion }
  | { type: 'REMOVE_EXPLOSION'; payload: { id: number } }
  | { type: 'ACTIVATE_POWERUP'; payload: typeof POWER_UPS[number] }
  | { type: 'DEACTIVATE_POWERUP'; payload: { name: string } }
  | { type: 'SET_EFFECTS'; payload: Partial<GameState['effects']> }
  | { type: 'SET_LIVES'; payload: number };

const INITIAL_LIVES = 10;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

const initialState: GameState = {
  status: 'idle',
  score: 0,
  lives: INITIAL_LIVES,
  combo: 1,
  level: 1,
  enemies: [],
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
    
    case 'DESTROY_ENEMY': {
      const { enemy } = action.payload;
      const scoreGained = enemy.word.length * 10 * state.combo * state.effects.scoreMultiplier;
      return {
        ...state,
        score: state.score + scoreGained,
        combo: state.combo + 1,
        enemies: state.enemies.filter(e => e.id !== enemy.id),
      };
    }

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      let newEnemies = [...state.enemies];
      let newLives = state.lives;
      let newCombo = state.combo;
      let gameOver = false;

      const speedModifier = state.effects.isSlowed ? 0.5 : 1;
      
      newEnemies = state.effects.isFrozen ? newEnemies : newEnemies.map(enemy => ({
        ...enemy,
        y: enemy.y + enemy.speed * action.delta * 60 * speedModifier,
      })).filter(enemy => {
        if (enemy.y >= GAME_HEIGHT) {
          if (!state.effects.isShielded) {
            newLives -= 1;
          }
          newCombo = 1;
          if (newLives <= 0) gameOver = true;
          return false;
        }
        return true;
      });

      if (gameOver) {
        return { ...state, status: 'gameOver', finalScore: state.score, lives: 0, enemies: [] };
      }
      
      const newLevel = Math.floor(state.score / 1000) + 1;

      return { ...state, enemies: newEnemies, lives: newLives, combo: newCombo, level: newLevel };
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

    default:
      return state;
  }
};

export function CyberTypeDefense() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const enemySpawnTimerRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    dispatch({ type: 'INPUT_CHANGE', value });

    const powerUp = POWER_UPS.find(p => p.keywords.includes(value));
    if (powerUp) {
      activatePowerUp(powerUp);
      dispatch({ type: 'INPUT_CHANGE', value: '' });
      return;
    }

    const matchedEnemy = state.enemies.find(enemy => enemy.word === value);
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
    
    switch(powerUp.name) {
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
      case 'Frenzy':
        state.enemies.forEach(enemy => destroyEnemy(enemy, true));
        break;
      case 'Heal':
        dispatch({ type: 'SET_LIVES', payload: Math.min(INITIAL_LIVES, state.lives + 3) });
        break;
    }
    
    if(powerUp.duration > 0 && powerUp.duration !== Infinity) {
        const timeoutId = setTimeout(() => {
            dispatch({ type: 'DEACTIVATE_POWERUP', payload: { name: powerUp.name } });
            switch(powerUp.name) {
                case 'Freeze': dispatch({ type: 'SET_EFFECTS', payload: { isFrozen: false } }); break;
                case 'Shield': dispatch({ type: 'SET_EFFECTS', payload: { isShielded: false } }); break;
                case 'Slowdown': dispatch({ type: 'SET_EFFECTS', payload: { isSlowed: false } }); break;
                case 'Overclock': dispatch({ type: 'SET_EFFECTS', payload: { scoreMultiplier: 1 } }); break;
            }
        }, powerUp.duration);
        
        dispatch({ type: 'ACTIVATE_POWERUP', payload: { ...powerUp, timeoutId } });
    } else {
        dispatch({ type: 'ACTIVATE_POWERUP', payload: { ...powerUp, timeoutId: setTimeout(() => {}, 0) } });
    }
  }, [state.enemies, state.lives]);
  

  const destroyEnemy = (enemy: Enemy, isFrenzy = false) => {
    dispatch({ type: 'DESTROY_ENEMY', payload: { enemy } });
    
    if (!isFrenzy) {
        dispatch({ type: 'ADD_EXPLOSION', payload: { id: enemy.id, word: enemy.word, x: enemy.x, y: enemy.y, type: enemy.type } });
        setTimeout(() => dispatch({ type: 'REMOVE_EXPLOSION', payload: { id: enemy.id } }), 300);
    }
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

      const newEnemy: Enemy = {
        id: enemyIdCounter++,
        word,
        x: Math.random() * (GAME_WIDTH - 100),
        y: -30,
        speed: baseSpeed * ENEMY_TYPES[type].speed,
        type,
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
    };
  }, [state.status, gameLoop]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div 
        ref={gameAreaRef}
        className="relative w-full max-w-5xl aspect-[10/6] bg-black/40 rounded-lg border-2 border-primary/50 shadow-[0_0_20px] shadow-primary/20 overflow-hidden"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      >
        {state.status === 'playing' || state.status === 'gameOver' ? (
          <>
            <Scoreboard score={state.score} lives={state.lives} combo={state.combo} level={state.level} />
            <PowerUpDisplay activePowerUps={state.activePowerUps} />
            
            {state.enemies.map(enemy => (
              <EnemyComponent key={enemy.id} {...enemy} />
            ))}
            {state.explosions.map(explosion => (
              <div
                key={explosion.id}
                className={cn("absolute font-mono font-bold tracking-widest animate-glitch", ENEMY_TYPES[explosion.type].className)}
                style={{ left: explosion.x, top: explosion.y }}
              >
                {explosion.word}
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
            <h2 className="text-4xl font-bold text-primary">Prepare for Battle</h2>
            <p className="text-muted-foreground max-w-md">The system is under attack. Use your keyboard as your weapon to eliminate threats before they breach the firewall.</p>
            <Button size="lg" onClick={() => dispatch({ type: 'START_GAME' })} className="shadow-[0_0_20px] shadow-primary/50">
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
