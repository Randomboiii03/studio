import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot } from 'lucide-react';
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
