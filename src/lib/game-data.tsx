
import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot, Skull, Snowflake, Bomb } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WORDS_LIST = [
    // Easy 4-5 letter words
    "code", "data", "link", "user", "file", "read", "write", "scan", "ping",
    "lock", "keys", "safe", "alert", "block", "track", "trace", "admin",
    "login", "shell", "proxy", "cloud", "virus", "patch", "bot", "root",
    "node", "port", "host", "query", "token", "guard", "hash", "mode",

    // Medium 6-7 letter words
    "access", "backup", "binary", "bypass", "cache", "cookie", "cyber",
    "debug", "delete", "deploy", "device", "domain", "filter", "hacker",
    "kernel", "monitor", "network", "packet", "policy", "reboot", "router",
    "script", "server", "shield", "source", "system", "update", "upload",

    // Hard 8+ letter words
    "analyze", "exploit", "firewall", "malware", "password", "protect",
    "protocol", "recover", "restore", "sandbox", "spyware", "trojan",
    "virtual", "encrypt", "decrypt", "denied", "connect", "algorithm",
    "antivirus", "archive", "backdoor", "bandwidth", "biometric", "blacklist",
    "bruteforce", "configure", "database", "download", "endpoint", "ethernet",
    "firmware", "framework", "gateway", "hardware", "honeypot", "initialize",
    "install", "internet", "keylogger", "localhost", "metadata", "mitigate",
    "override", "permission", "phishing", "platform", "privilege", "processor",
    "quarantine", "redirect", "response", "security", "software", "spoofing",
    "terminal", "threat", "topology", "transfer", "tunnel", "username",
    "validate", "vulnerability", "whitelist"
];

export const BOSS_WORDS_LIST = [
    ['secure', 'encrypt', 'authenticate', 'authorize', 'firewall'],
    ['protect', 'defend', 'mitigate', 'quarantine', 'eradicate'],
    ['analyze', 'detect', 'isolate', 'contain', 'resolve'],
    ['harden', 'patch', 'update', 'configure', 'monitor'],
    ['scan', 'identify', 'cleanse', 'restore', 'fortify']
];


export type EnemyTypeInfo = {
  icon: LucideIcon;
  className: string;
  speed: number;
};

export const ENEMY_TYPES: { [key: string]: EnemyTypeInfo } = {
    Malware: { icon: Bug, className: 'text-threat-malware', speed: 1 },
    Phishing: { icon: Shield, className: 'text-threat-phishing', speed: 1.2 },
    DDoS: { icon: Siren, className: 'text-threat-ddos', speed: 0.8 },
    Ransomware: { icon: Biohazard, className: 'text-threat-ransomware', speed: 1.1 },
    Spyware: { icon: ServerCrash, className: 'text-threat-spyware', speed: 1.3 },
    Adware: { icon: Bot, className: 'text-threat-adware', speed: 0.9 },
    Boss: { icon: Skull, className: 'text-destructive', speed: 0.5 },
};

export type PowerUpType = 'Freeze' | 'Nuke' | 'Shield';

export type PowerUpInfo = {
    icon: LucideIcon;
    className: string;
    word: string;
    duration: number;
    effect: {
        value: number;
    };
};

export const POWER_UP_TYPES: Record<PowerUpType, PowerUpInfo> = {
    Freeze: {
        icon: Snowflake,
        className: 'text-cyan-400',
        word: 'freeze',
        duration: 5000, // 5 seconds
        effect: { value: 0 },
    },
    Nuke: {
        icon: Bomb,
        className: 'text-destructive',
        word: 'nuke',
        duration: 0,
        effect: { value: 0 },
    },
    Shield: {
        icon: Shield,
        className: 'text-blue-500',
        word: 'shield',
        duration: 0, 
        effect: { value: 5 }, // Grants 5 shield points
    },
};
