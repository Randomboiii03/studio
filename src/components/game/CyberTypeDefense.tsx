
"use client";

import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ENEMY_TYPES, LEVEL_PHRASES, POWER_UP_TYPES, GLITCH_WORDS_LIST } from '@/lib/game-data';
import Turret from './Turret';
import EnemyComponent from './Enemy';
import GameOverModal from './GameOverModal';
import PauseMenu from './PauseMenu';
import PowerUpComponent from './PowerUp';
import StageAnnouncement from './StageAnnouncement';
import { cn } from '@/lib/utils';
import { Award, Heart, Pause, Zap, Shield as ShieldIcon } from 'lucide-react';
import type { PowerUpType } from '@/lib/game-data';

type Enemy = {
  id: number;
  words: string[];
  currentWordIndex: number;
  x: number;
  y: number;
  speed: number;
  type: keyof typeof ENEMY_TYPES;
  vx: number;
  vy: number;
  status: 'alive' | 'dying' | 'targeted';
  isBoss: boolean;
  isStealthed?: boolean;
  isSplitterChild?: boolean;
  glitchData?: {
    possibleWords: string[];
    lastGlitchTime: number;
    glitchInterval: number;
  };
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

type PowerUp = {
  id: number;
  type: PowerUpType;
  word: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  createdAt: number;
  status: 'alive' | 'dying';
};

type ActivePowerUp = {
  type: PowerUpType;
  expiresAt: number;
};

type Announcement = {
  id: number;
  message: string;
  icon: React.ElementType;
};

type GameState = {
  status: 'idle' | 'playing' | 'gameOver' | 'paused';
  score: number;
  lives: number;
  shield: number;
  combo: number;
  level: number;
  enemies: Enemy[];
  projectiles: Projectile[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  activePowerUps: ActivePowerUp[];
  announcements: Announcement[];
  inputValue: string;
  isShaking: boolean;
  inputErrorShake: boolean;
  nukeEffect: boolean;
  lastHitTime: number;
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
  | { type: 'ENEMY_HIT'; payload: { enemyId: number } }
  | { type: 'PROJECTILE_HIT'; payload: { targetId: number } }
  | { type: 'ENEMY_REACHED_END'; payload: { enemyId: number } }
  | { type: 'CLEANUP_EFFECTS' }
  | { type: 'TRIGGER_SHAKE' }
  | { type: 'STOP_SHAKE' }
  | { type: 'TRIGGER_INPUT_ERROR_SHAKE' }
  | { type: 'STOP_INPUT_ERROR_SHAKE' }
  | { type: 'ADD_ENEMY', payload: Enemy }
  | { type: 'ADD_POWERUP' }
  | { type: 'POWERUP_HIT'; payload: { powerUpId: number } }
  | { type: 'ACTIVATE_POWERUP', payload: { type: PowerUpType } }
  | { type: 'TRIGGER_NUKE_EFFECT' }
  | { type: 'STOP_NUKE_EFFECT' }
  | { type: 'RESET_COMBO' }
  | { type: 'ADD_ANNOUNCEMENT'; payload: Omit<Announcement, 'id'> }
  | { type: 'REMOVE_ANNOUNCEMENT'; payload: { id: number } };


const INITIAL_LIVES = 10;
const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const TURRET_POSITION = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30 };
const TURRET_HITBOX_Y = GAME_HEIGHT - 50;
let enemyIdCounter = 0;
let effectIdCounter = 0;
let powerUpIdCounter = 0;
let announcementIdCounter = 0;
const COMBO_TIMEOUT = 6000; // 6 seconds

const initialState: GameState = {
  status: 'idle',
  score: 0,
  lives: INITIAL_LIVES,
  shield: 0,
  combo: 0,
  level: 1,
  enemies: [],
  projectiles: [],
  explosions: [],
  powerUps: [],
  activePowerUps: [],
  announcements: [],
  inputValue: '',
  isShaking: false,
  inputErrorShake: false,
  nukeEffect: false,
  lastHitTime: 0,
};

const spawnEnemy = (level: number, word: string): Enemy => {
    let allowedEnemyTypes: (keyof typeof ENEMY_TYPES)[] = ['Malware', 'Phishing', 'DDoS', 'Ransomware', 'Spyware', 'Adware'];

    if (level >= 2) allowedEnemyTypes.push('Stealth');
    if (level >= 3) allowedEnemyTypes.push('Glitch');
    if (level >= 4) allowedEnemyTypes.push('Splitter');

    const type = allowedEnemyTypes[Math.floor(Math.random() * allowedEnemyTypes.length)];
    
    const lengthModifier = 1 - (Math.min(word.length, 15) - 4) * 0.05;
    const baseSpeed = (0.5 + level * 0.1) * Math.max(0.5, lengthModifier);
    
    const startX = Math.random() * (GAME_WIDTH - 100) + 50;
    const startY = -50;
    
    const angle = Math.atan2(TURRET_POSITION.y - startY, TURRET_POSITION.x - startX);
    const speed = baseSpeed * ENEMY_TYPES[type].speed;

    const enemy: Enemy = {
      id: enemyIdCounter++,
      words: [word],
      currentWordIndex: 0,
      x: startX,
      y: startY,
      speed: speed,
      type,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      status: 'alive',
      isBoss: false,
    };
    
    if (type === 'Stealth') {
      enemy.isStealthed = true;
    }

    if (type === 'Glitch') {
        const possibleWords = [word, ...[...GLITCH_WORDS_LIST].sort(() => 0.5 - Math.random()).slice(0, 3)];
        enemy.glitchData = {
            possibleWords: possibleWords,
            lastGlitchTime: Date.now(),
            glitchInterval: 3000 + Math.random() * 2000, // 3-5 seconds
        };
    }

    if (type === 'Splitter') {
        enemy.words = [(LEVEL_PHRASES.find(p => p.length === 1 && p[0].length > 6) || ['destabilize'])[0]];
    }

    return enemy;
};

const spawnSplitterChild = (parent: Enemy): Enemy => {
    const word = (LEVEL_PHRASES.find(p => p.length === 1) || ['error'])[0];
    return {
        id: enemyIdCounter++,
        words: [word],
        currentWordIndex: 0,
        x: parent.x + (Math.random() - 0.5) * 50,
        y: parent.y - 20, // Push back slightly
        speed: parent.speed * 1.5,
        type: 'SplitterChild',
        vx: (Math.random() - 0.5) * 2,
        vy: parent.vy * 1.2,
        status: 'alive',
        isBoss: false,
        isSplitterChild: true,
    };
};

const spawnBoss = (level: number, phrase: string[]): Enemy => {
    const type = 'Boss';
    const baseSpeed = (0.3 + level * 0.05);

    const startX = GAME_WIDTH / 2;
    const startY = -100;

    const angle = Math.atan2(TURRET_POSITION.y - startY, TURRET_POSITION.x - startX);
    const speed = baseSpeed * ENEMY_TYPES[type].speed;

    return {
        id: enemyIdCounter++,
        words: phrase,
        currentWordIndex: 0,
        x: startX,
        y: startY,
        speed: speed,
        type: type,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        status: 'alive',
        isBoss: true
    };
};

const gameReducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'START_GAME':
      enemyIdCounter = 0;
      effectIdCounter = 0;
      powerUpIdCounter = 0;
      announcementIdCounter = 0;
      return {
        ...initialState,
        status: 'playing',
        lastHitTime: Date.now(),
      };
    case 'RESET_GAME':
      enemyIdCounter = 0;
      effectIdCounter = 0;
      powerUpIdCounter = 0;
      announcementIdCounter = 0;
      return { ...initialState, status: 'playing', lastHitTime: Date.now() };

    case 'EXIT_GAME':
        return { ...initialState };

    case 'PAUSE_GAME':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME_GAME':
      return state.status === 'paused' ? { ...state, status: 'playing', lastHitTime: Date.now() } : state;

    case 'INPUT_CHANGE':
      return { ...state, inputValue: action.payload };

    case 'GAME_TICK': {
      if (state.status !== 'playing') return state;

      const now = Date.now();
      const isFrozen = state.activePowerUps.some(p => p.type === 'Freeze');
      
      const updatedEnemies = state.enemies.map(enemy => {
        let newX = isFrozen ? enemy.x : enemy.x + enemy.vx;
        let newY = isFrozen ? enemy.y : enemy.y + enemy.vy;
        let newVx = enemy.vx;

        if(enemy.isSplitterChild) {
            if (newX < 50 || newX > GAME_WIDTH - 50) {
              newVx = -enemy.vx;
              newX = enemy.x + newVx;
            }
        }
        
        let isStealthed = enemy.isStealthed;
        if (enemy.type === 'Stealth' && enemy.isStealthed && newY > GAME_HEIGHT / 2) {
            isStealthed = false;
        }
        
        let glitchData = enemy.glitchData;
        let words = enemy.words;
        if (enemy.type === 'Glitch' && enemy.glitchData && now - enemy.glitchData.lastGlitchTime > enemy.glitchData.glitchInterval) {
            const { possibleWords } = enemy.glitchData;
            const newWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
            words = [newWord];
            glitchData = { ...enemy.glitchData, lastGlitchTime: now };
        }

        return {
            ...enemy,
            x: newX,
            y: newY,
            vx: newVx,
            isStealthed,
            glitchData,
            words
        };
      });

      // Update power-up positions
      let updatedPowerUps = state.powerUps.map(p => {
          let newX = isFrozen ? p.x : p.x + p.vx;
          let newY = isFrozen ? p.y : p.y + p.vy;
          let newVx = p.vx;
          let newVy = p.vy;

          if (newX < 50 || newX > GAME_WIDTH - 50) {
              newVx = -p.vx;
              newX = p.x + newVx;
          }
          if (newY < 50 || newY > GAME_HEIGHT / 2) {
              newVy = -p.vy;
              newY = p.y + newVy;
          }
          
          return {
              ...p,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy
          };
      });

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
      
      let nextState: GameState = { 
          ...state, 
          enemies: updatedEnemies, 
          projectiles: updatedProjectiles,
          powerUps: updatedPowerUps.filter(p => now - p.createdAt < 7000 && p.status === 'alive'),
          activePowerUps: state.activePowerUps.filter(p => now < p.expiresAt),
      };
      
      hitProjectiles.forEach(targetId => {
        nextState = gameReducer(nextState, { type: 'PROJECTILE_HIT', payload: { targetId } });
      });

      // Check for combo timeout
      if (state.combo > 0 && now - state.lastHitTime > COMBO_TIMEOUT) {
        nextState = gameReducer(nextState, { type: 'RESET_COMBO' });
      }

      // Check for enemies reaching the end
      const enemiesReachedEnd = nextState.enemies.filter(e => e.y >= TURRET_HITBOX_Y && e.status === 'alive');
      
      enemiesReachedEnd.forEach(enemy => {
        nextState = gameReducer(nextState, { type: 'ENEMY_REACHED_END', payload: { enemyId: enemy.id } });
      });

      return nextState;
    }
    
    case 'ENEMY_HIT': {
        const { enemyId } = action.payload;
        const enemy = state.enemies.find(e => e.id === enemyId);
        if (!enemy) return state;

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
      
      const newCombo = state.combo + 1;
      const scoreGained = enemy.words[enemy.currentWordIndex].length * 10 * (newCombo > 1 ? newCombo : 1);
      const explosionId = `expl-${targetId}-${effectIdCounter++}`;
      const typeData = ENEMY_TYPES[enemy.type];
      const newExplosion: Explosion = {
          id: explosionId,
          x: enemy.x,
          y: enemy.y,
          color: typeData.className
      };
      
      let updatedEnemies = [...state.enemies];
      let newEnemies: Enemy[] = [];
      const enemyIndex = updatedEnemies.findIndex(e => e.id === targetId);

      if (enemy.type === 'Splitter') {
          newEnemies.push(spawnSplitterChild(enemy));
          newEnemies.push(spawnSplitterChild(enemy));
          updatedEnemies.splice(enemyIndex, 1);
      } else if (enemy.isBoss && enemy.currentWordIndex < enemy.words.length - 1) {
          updatedEnemies[enemyIndex] = {
              ...enemy,
              currentWordIndex: enemy.currentWordIndex + 1,
              status: 'alive'
          };
      } else {
          updatedEnemies[enemyIndex] = { ...enemy, status: 'dying' };
      }

      return {
        ...state,
        score: state.score + scoreGained,
        combo: newCombo,
        enemies: [...updatedEnemies, ...newEnemies],
        projectiles: state.projectiles.filter(p => p.targetId !== targetId),
        explosions: [...state.explosions, newExplosion],
        lastHitTime: Date.now(),
      };
    }
    
    case 'ENEMY_REACHED_END': {
        const enemy = state.enemies.find(e => e.id === action.payload.enemyId);
        if (!enemy) return state;

        const damage = enemy.isBoss ? 5 : 1;
        let shieldDamage = Math.min(state.shield, damage);
        let lifeDamage = damage - shieldDamage;
        
        const newShield = state.shield - shieldDamage;
        const newLives = state.lives - lifeDamage;

        if (newLives <= 0) {
            return { ...state, status: 'gameOver', lives: 0, shield: 0, enemies: [], projectiles: [] };
        }
        
        const updatedEnemies = state.enemies.filter(e => e.id !== action.payload.enemyId);

        let newState: GameState = {
            ...state,
            lives: newLives,
            shield: newShield,
            combo: 0,
            enemies: updatedEnemies,
            isShaking: true,
        };
        
        if (state.enemies.length > 0 && updatedEnemies.length === 0) {
          newState.level = state.level + 1;
        }

        return newState;
    }

    case 'SUBMIT_WORD': {
      const value = state.inputValue.trim();
      if (!value) return state;

      const matchedEnemy = state.enemies.find(
        (enemy) => enemy.status === 'alive' && !enemy.isStealthed && enemy.words[enemy.currentWordIndex] === value
      );

      if (matchedEnemy) {
        return gameReducer(state, { type: 'ENEMY_HIT', payload: { enemyId: matchedEnemy.id } });
      }

      const matchedPowerUp = state.powerUps.find(
        (p) => p.status === 'alive' && p.word === value
      );

      if (matchedPowerUp) {
        return gameReducer(state, { type: 'POWERUP_HIT', payload: { powerUpId: matchedPowerUp.id } });
      }

      return { ...state, inputValue: '', combo: 0, inputErrorShake: true };
    }
    
    case 'CLEANUP_EFFECTS': {
        const remainingEnemies = state.enemies.filter(e => e.status !== 'dying');
        const remainingPowerUps = state.powerUps.filter(p => p.status !== 'dying');
        
        const levelUp = state.enemies.length > 0 && remainingEnemies.length === 0;
        
        return {
            ...state,
            enemies: remainingEnemies,
            powerUps: remainingPowerUps,
            explosions: [],
            level: levelUp ? state.level + 1 : state.level,
        };
    }

    case 'ADD_ENEMY':
        return { ...state, enemies: [...state.enemies, action.payload] };

    case 'TRIGGER_SHAKE':
      return {...state, isShaking: true};
      
    case 'STOP_SHAKE':
      return {...state, isShaking: false};

    case 'TRIGGER_INPUT_ERROR_SHAKE':
        return { ...state, inputErrorShake: true };
    
    case 'STOP_INPUT_ERROR_SHAKE':
        return { ...state, inputErrorShake: false };
      
    case 'ADD_POWERUP': {
        const availablePowerUps = Object.keys(POWER_UP_TYPES) as PowerUpType[];
        const type = availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];
        const powerUpInfo = POWER_UP_TYPES[type];

        const newPowerUp: PowerUp = {
            id: powerUpIdCounter++,
            type,
            word: powerUpInfo.word,
            x: Math.random() * (GAME_WIDTH - 200) + 100,
            y: Math.random() * (GAME_HEIGHT / 2 - 100) + 50,
            vx: (Math.random() - 0.5) * 2, // -1 to 1
            vy: (Math.random() - 0.5) * 1, // -0.5 to 0.5
            createdAt: Date.now(),
            status: 'alive'
        };
        return { ...state, powerUps: [...state.powerUps, newPowerUp] };
    }

    case 'POWERUP_HIT': {
        const powerUp = state.powerUps.find(p => p.id === action.payload.powerUpId);
        if (!powerUp) return state;

        const nextState = gameReducer(state, { type: 'ACTIVATE_POWERUP', payload: { type: powerUp.type } });
        
        return {
            ...nextState,
            inputValue: '',
            score: nextState.score + 50, // Bonus points for getting a power-up
            powerUps: nextState.powerUps.map(p => p.id === action.payload.powerUpId ? { ...p, status: 'dying' } : p),
        };
    }

    case 'ACTIVATE_POWERUP': {
        const { type } = action.payload;
        const powerUpInfo = POWER_UP_TYPES[type];
        const now = Date.now();
        
        let newState = { ...state };
        
        switch (type) {
            case 'Nuke': {
                const nonBossEnemies = newState.enemies.filter(e => !e.isBoss && e.status === 'alive');
                if (nonBossEnemies.length === 0) break;

                nonBossEnemies.forEach(enemy => {
                    const currentCombo = newState.combo + 1;
                    const scoreGained = enemy.words[0].length * 10 * currentCombo;
                    const explosion: Explosion = {
                        id: `expl-${enemy.id}-${effectIdCounter++}`,
                        x: enemy.x,
                        y: enemy.y,
                        color: ENEMY_TYPES[enemy.type].className,
                    };
                    newState.score += scoreGained;
                    newState.combo = currentCombo;
                    newState.explosions.push(explosion);
                });
                
                newState.enemies = newState.enemies.map(e => (!e.isBoss && e.status === 'alive') ? {...e, status: 'dying'} : e);
                newState.lastHitTime = Date.now();
                newState = gameReducer(newState, { type: 'TRIGGER_NUKE_EFFECT' });
                break;
            }
            case 'Shield':
                newState.shield = Math.min(state.shield + powerUpInfo.effect.value, 10);
                break;
            case 'Freeze':
                newState.activePowerUps = [
                    ...newState.activePowerUps.filter(p => p.type !== 'Freeze'),
                    { type: 'Freeze', expiresAt: now + powerUpInfo.duration }
                ];
                break;
        }
        return newState;
    }

    case 'TRIGGER_NUKE_EFFECT':
        return { ...state, nukeEffect: true };
    
    case 'STOP_NUKE_EFFECT':
        return { ...state, nukeEffect: false };
    
    case 'RESET_COMBO':
      return { ...state, combo: 0 };
    
    case 'ADD_ANNOUNCEMENT': {
        const newAnnouncement: Announcement = {
            ...action.payload,
            id: announcementIdCounter++,
        };
        return {
            ...state,
            announcements: [...state.announcements, newAnnouncement],
        };
    }
    
    case 'REMOVE_ANNOUNCEMENT':
        return {
            ...state,
            announcements: state.announcements.filter(a => a.id !== action.payload.id),
        };
    
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

const ActivePowerUpIndicator = ({ powerUp }: { powerUp: ActivePowerUp }) => {
    const powerUpInfo = POWER_UP_TYPES[powerUp.type];
    const Icon = powerUpInfo.icon;
    const remainingTime = Math.max(0, (powerUp.expiresAt - Date.now()) / 1000);

    return (
        <div className="flex items-center gap-2 text-white font-mono">
            <Icon className={cn("w-6 h-6", powerUpInfo.className)} />
            <span>{remainingTime.toFixed(1)}s</span>
        </div>
    );
};


export function CyberTypeDefense() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const inputRef = useRef<HTMLInputElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const shakeTimeoutRef = useRef<NodeJS.Timeout>();
  const inputShakeTimeoutRef = useRef<NodeJS.Timeout>();
  const nukeTimeoutRef = useRef<NodeJS.Timeout>();

  const { status, score, lives, shield, combo, level, enemies, projectiles, explosions, powerUps, activePowerUps, announcements, inputValue, isShaking, inputErrorShake, nukeEffect } = state;

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
  
  useEffect(() => {
    if (inputErrorShake) {
        if (inputShakeTimeoutRef.current) clearTimeout(inputShakeTimeoutRef.current);
        inputShakeTimeoutRef.current = setTimeout(() => {
            dispatch({ type: 'STOP_INPUT_ERROR_SHAKE' });
        }, 400);
    }
    return () => {
        if (inputShakeTimeoutRef.current) clearTimeout(inputShakeTimeoutRef.current);
    };
  }, [inputErrorShake]);

  useEffect(() => {
      if (nukeEffect) {
          if (nukeTimeoutRef.current) clearTimeout(nukeTimeoutRef.current);
          nukeTimeoutRef.current = setTimeout(() => {
              dispatch({ type: 'STOP_NUKE_EFFECT' });
          }, 500);
      }
      return () => {
        if (nukeTimeoutRef.current) clearTimeout(nukeTimeoutRef.current);
      };
  }, [nukeEffect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'playing') return;
    dispatch({ type: 'INPUT_CHANGE', payload: e.target.value.toLowerCase() });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && status === 'playing') {
      dispatch({ type: 'SUBMIT_WORD' });
    } else if (e.key === 'Escape' && (status === 'playing' || status === 'paused')) {
        e.preventDefault();
        dispatch({ type: status === 'playing' ? 'PAUSE_GAME' : 'RESUME_GAME' });
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
    if (status !== 'playing' || enemies.length > 0) return;

    const spawn = () => {
        if (status !== 'playing') return;

        const phrase = LEVEL_PHRASES[Math.floor(Math.random() * LEVEL_PHRASES.length)];

        if (level % 5 === 0) {
            // Boss level
            dispatch({ type: 'ADD_ENEMY', payload: spawnBoss(level, phrase) });
        } else {
            // Regular level
            const waveWords = phrase;
            
            // Stagger the spawning of enemies
            const baseInterval = 1500;
            const levelMultiplier = Math.max(0.2, 1 - (level * 0.05));
            
            waveWords.forEach((word, i) => {
                setTimeout(() => {
                    if (status === 'playing') {
                        dispatch({ type: 'ADD_ENEMY', payload: spawnEnemy(level, word) });
                    }
                }, i * baseInterval * levelMultiplier);
            });
        }
    };
    
    // Add a slight delay before the next wave starts
    const spawnTimeout = setTimeout(spawn, 2000);
    
    return () => clearTimeout(spawnTimeout);
}, [status, level, enemies.length]);

// Power-up spawner
useEffect(() => {
    if (status !== 'playing') return;

    const spawnerInterval = setInterval(() => {
        if (status === 'playing' && (level % 5 !== 0) && powerUps.length < 2 && Math.random() < 0.25) {
            dispatch({ type: 'ADD_POWERUP' });
        }
    }, 10000);

    // Wait 5 seconds before starting to spawn power-ups for the first time each level
    const initialTimeout = setTimeout(() => {
        if (status === 'playing' && (level % 5 !== 0) && powerUps.length < 2 && Math.random() < 0.25) {
            dispatch({ type: 'ADD_POWERUP' });
        }
    }, 5000);

    return () => {
        clearInterval(spawnerInterval);
        clearTimeout(initialTimeout);
    };
}, [status]);

// Level Announcements
useEffect(() => {
    if (status !== 'playing') return;

    const newThreats: {level: number, type: keyof typeof ENEMY_TYPES}[] = [
      {level: 2, type: 'Stealth'},
      {level: 3, type: 'Glitch'},
      {level: 4, type: 'Splitter'},
      {level: 5, type: 'Boss'},
    ];

    const threatForLevel = newThreats.find(t => t.level === level);
    if(threatForLevel) {
      const enemyInfo = ENEMY_TYPES[threatForLevel.type];
      dispatch({ type: 'ADD_ANNOUNCEMENT', payload: {
        message: `New Threat Detected: ${threatForLevel.type}`,
        icon: enemyInfo.icon
      }});
    }

}, [status, level]);

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
  
  const isFrozen = activePowerUps.some(p => p.type === 'Freeze');
  const isShielded = shield > 0;

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
              Type the commands to neutralize falling threats. Defend the system!
            </p>
            <Button size="lg" onClick={() => dispatch({ type: 'START_GAME' })} className="shadow-[0_0_20px] shadow-primary/50 mt-4">
              Start Defense Protocol
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-4 z-40 flex flex-col gap-2">
                {announcements.map(announcement => (
                    <StageAnnouncement
                        key={announcement.id}
                        message={announcement.message}
                        icon={announcement.icon}
                        onComplete={() => dispatch({ type: 'REMOVE_ANNOUNCEMENT', payload: { id: announcement.id } })}
                    />
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none z-10">
                {isFrozen && <div className="absolute inset-0 bg-cyan-400/20 animate-pulse" />}
                {nukeEffect && <div className="absolute inset-0 bg-white animate-fade-dots" />}
                {isShielded && <div className="absolute inset-0 border-[6px] border-blue-500/50 rounded-lg animate-pulse" />}
            </div>

            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-30 text-primary hover:bg-primary/10 hover:text-primary" onClick={() => dispatch({type: 'PAUSE_GAME'})}>
                <Pause />
            </Button>
            
            {enemies.map(enemy => (
              <EnemyComponent key={enemy.id} word={enemy.words[enemy.currentWordIndex]} {...enemy} />
            ))}

            {powerUps.map(p => (
                <PowerUpComponent
                    key={p.id}
                    {...p}
                />
            ))}
            
            {projectiles.map(p => (
              <div key={p.id} className="absolute w-2 h-2 bg-primary rounded-full shadow-[0_0_10px] shadow-primary z-20" style={{ left: p.x, top: p.y, transform: `translate(-50%, -50%)` }} />
            ))}

            {explosions.map(explosion => (
              <div key={explosion.id} className="absolute z-20" style={{ left: explosion.x, top: explosion.y }}>
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
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <Turret />
            </div>

            <div className="absolute bottom-4 right-4 w-80 flex flex-col items-center gap-2">
                 <div className="text-center text-xs text-muted-foreground font-mono">LEVEL: {level}</div>
                <Input
                    ref={inputRef}
                    type="text"
                    className={cn(
                        "w-full text-center bg-background/80 border-primary h-12 text-xl font-mono tracking-widest focus:bg-background focus:shadow-[0_0_20px] focus:shadow-primary/50 transition-all duration-300",
                        inputErrorShake && "animate-screen-shake border-destructive"
                    )}
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
            
            <div className="absolute bottom-4 left-4 z-20">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <StatItem icon={Award} value={score.toLocaleString()} label="Score" className="text-primary" />
                    {shield > 0 && <StatItem icon={ShieldIcon} value={shield} label="Shield" className="text-cyan-400" />}
                    <StatItem icon={Zap} value={`x${combo}`} label="Combo" className="text-yellow-400" />
                    <StatItem icon={Heart} value={lives} label="Lives" className="text-red-500" />
                </div>
                <div className="flex items-center gap-4 mt-2">
                    {activePowerUps.map(p => <ActivePowerUpIndicator key={p.type} powerUp={p} />)}
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
