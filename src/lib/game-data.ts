import { Shield, Zap, Snowflake, Bomb, ShieldCheck, Heart, Scan, Rewind, type LucideIcon } from 'lucide-react';

export const POWER_UPS = [
  { name: 'Freeze', effect: 'Halts all enemies for a short duration.', keywords: ['quarantine', 'lockdown'], icon: Snowflake, duration: 3000, color: 'text-cyan-400' },
  { name: 'Second Chance', effect: 'Prevents turret damage from the next enemy hit.', keywords: ['rollback', 'restore'], icon: ShieldCheck, duration: Infinity, oneTime: true, color: 'text-green-400' },
  { name: 'Frenzy', effect: 'Destroys all on-screen enemies instantly.', keywords: ['purge', 'cleanse'], icon: Bomb, duration: 0, color: 'text-red-500' },
  { name: 'Shield', effect: 'Grants temporary invulnerability to the turret.', keywords: ['firewall', 'defend'], icon: Shield, duration: 5000, color: 'text-blue-500' },
  { name: 'Overclock', effect: 'Doubles score gain for a short time.', keywords: ['boost', 'amplify'], icon: Zap, duration: 7000, color: 'text-yellow-400' },
  { name: 'Scan', effect: 'Reveals hidden or cloaked enemies.', keywords: ['detect', 'audit'], icon: Scan, duration: 0, color: 'text-gray-400' },
  { name: 'Slowdown', effect: 'Reduces the speed of all enemies temporarily.', keywords: ['throttle', 'ratelimit'], icon: Rewind, duration: 5000, color: 'text-purple-400' },
  { name: 'Heal', effect: 'Restores turret health.', keywords: ['patch', 'update'], icon: Heart, duration: 0, color: 'text-pink-500' }
] as const;

export type PowerUp = typeof POWER_UPS[number];

export type EnemyTypeData = {
  className: string;
  speed: number;
};

export const ENEMY_TYPES: Record<string, EnemyTypeData> = {
  Malware: { className: 'text-threat-malware', speed: 1.2 },
  Phishing: { className: 'text-threat-phishing', speed: 1 },
  DDoS: { className: 'text-threat-ddos', speed: 0.8 },
  Ransomware: { className: 'text-threat-ransomware', speed: 1.5 },
  Spyware: { className: 'text-threat-spyware', speed: 1.1 },
  Adware: { className: 'text-threat-adware', speed: 0.9 },
};

export const WORDS_LIST = [
  'virus', 'trojan', 'worm', 'phishing', 'exploit', 'rootkit', 'keylogger', 'backdoor',
  'firewall', 'encryption', 'protocol', 'network', 'server', 'database', 'payload',
  'malware', 'spyware', 'adware', 'botnet', 'ransomware', 'cyberattack', 'vulnerability',
  'zeroday', 'patch', 'update', 'authentication', 'authorization', 'security', 'privacy',
  'hacker', 'cracker', 'scriptkiddie', 'threat', 'vector', 'mitigation', 'remediation',
  'incident', 'response', 'forensics', 'analysis', 'detection', 'prevention', 'honeypot',
  'ddos', 'injection', 'crosssite', 'scripting', 'session', 'hijacking', 'spoofing'
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'NEO', score: 105230 },
  { rank: 2, name: 'TRINITY', score: 98750 },
  { rank: 3, name: 'MORPHEUS', score: 95100 },
  { rank: 4, name: 'CYPHER', score: 82400 },
  { rank: 5, name: 'AGENT_SMITH', score: 76500 },
  { rank: 6, name: 'PLAYER_ONE', score: 65210 },
  { rank: 7, name: 'GHOST', score: 59880 },
  { rank: 8, name: 'HACKERMAN', score: 52300 },
  { rank: 9, name: 'BYTE', score: 48900 },
  { rank: 10, name: 'GLITCH', score: 45050 },
];
