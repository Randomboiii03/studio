import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot, Crosshair, Zap, Snowflake, ShieldCheck, Hourglass, HeartPulse, Bomb, Crown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WORDS_LIST = [
  'crypto', 'exploit', 'firewall', 'glitch', 'kernel', 'malware', 'network',
  'overflow', 'password', 'phishing', 'protocol', 'rootkit', 'server', 'trojan',
  'virus', 'backdoor', 'botnet', 'cipher', 'debugger', 'decrypt', 'denial',
  'encoder', 'exploit', 'hacker', 'keylogger', 'logicbomb', 'payload', 'proxy',
  'ransom', 'security', 'spyware', 'threat', 'wormhole', 'zeroday', 'auth',
  'binary', 'bypass', 'cookie', 'domain', 'exploit', 'gateway', 'hash',
  'hijack', 'malicious', 'obfuscate', 'packet', 'patch', 'phreak', 'root',
  'script', 'shell', 'sniff', 'spoof', 'token', 'unlock', 'virtual', 'zombie',
  'access', 'alert', 'breach', 'code', 'crash', 'data', 'ddos', 'error', 'hack',
  'host', 'leak', 'lock', 'node', 'port', 'raid', 'risk', 'scan', 'spam', 'trace'
];

export type EnemyType = {
  icon: LucideIcon;
  className: string;
  speed: number;
};

export const ENEMY_TYPES: { [key: string]: EnemyType } = {
  Malware: { icon: Bug, className: "text-threat-malware", speed: 1 },
  Phishing: { icon: Shield, className: "text-threat-phishing", speed: 1.2 },
  DDoS: { icon: Siren, className: "text-threat-ddos", speed: 0.8 },
  Ransomware: { icon: Biohazard, className: "text-threat-ransomware", speed: 1.1 },
  Spyware: { icon: ServerCrash, className: "text-threat-spyware", speed: 1.3 },
  Adware: { icon: Bot, className: "text-threat-adware", speed: 0.9 },
};

export type PowerUp = {
    name: string;
    icon: LucideIcon;
    keywords: string[];
    effect: string;
    duration: number; // in ms, Infinity for permanent
    color: string;
};
  
export const POWER_UPS: PowerUp[] = [
    { name: 'Frenzy', icon: Crosshair, keywords: ['frenzy', 'berserk'], effect: 'Destroys all visible enemies.', duration: 0, color: 'text-red-500' },
    { name: 'Freeze', icon: Snowflake, keywords: ['freeze', 'ice'], effect: 'Freezes all enemies for 5 seconds.', duration: 5000, color: 'text-blue-400' },
    { name: 'Shield', icon: ShieldCheck, keywords: ['shield', 'protect'], effect: 'Protects from 3 hits or 10 seconds.', duration: 10000, color: 'text-green-500' },
    { name: 'Slowdown', icon: Hourglass, keywords: ['slow', 'time'], effect: 'Slows all enemies for 10 seconds.', duration: 10000, color: 'text-yellow-500' },
    { name: 'Heal', icon: HeartPulse, keywords: ['heal', 'repair'], effect: 'Restores 3 lives.', duration: 0, color: 'text-pink-500' },
    { name: 'Nuke', icon: Bomb, keywords: ['nuke', 'bomb'], effect: 'Destroys all enemies. Clears screen.', duration: 0, color: 'text-orange-500' },
    { name: 'Overclock', icon: Zap, keywords: ['overclock', 'boost'], effect: 'Doubles score for 10 seconds.', duration: 10000, color: 'text-purple-500' },
    { name: 'King', icon: Crown, keywords: ['king', 'god'], effect: 'Makes you invincible for 10 seconds.', duration: 10000, color: 'text-yellow-300' },
];
