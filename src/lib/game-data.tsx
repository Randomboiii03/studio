
import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot, Skull, Snowflake, Bomb, EyeOff, Fingerprint, GitFork } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WORDS_LIST = [
    // Phishing Awareness
    "alert", "verify", "sender", "official", "link", "hover", "check", "spoofing",
    "urgent", "request", "login", "details", "source", "email", "scam",

    // Strong Password Practices
    "phrase", "unique", "random", "complex", "manager", "vault", "secret",
    "characters", "change", "strong", "long", "passkey",

    // Multi-factor Authentication (MFA)
    "code", "token", "prompt", "factor", "auth", "secure", "app", "text", "call",
    "biometric", "fob", "one-time",

    // Data Privacy
    "consent", "private", "share", "encrypt", "policy", "data", "anonymous",
    "delete", "info", "protect", "privacy", "permission",

    // Safe Browsing Habits
    "https", "secure", "lock", "update", "public", "wifi", "browser", "cookie",
    "adblock", "search", "connection", "domain", "patch",

    // Recognizing Malware/Ransomware
    "virus", "threat", "backup", "scan", "file", "block", "ransom", "malware",
    "clean", "download", "attachment", "popup", "warning",

    // Secure Coding Practices
    "input", "validate", "sanitize", "escape", "review", "test", "guard",
    "exploit", "harden", "logic", "principle", "least"
].filter(w => w !== 'reboot' && w !== 'antivirus');

export const GLITCH_WORDS_LIST = ["glitch", "static", "corrupt", "fragment", "error", "binary", "system", "kernel"];

export const BOSS_WORDS_LIST = [
    ['check', 'sender', 'before', 'clicking', 'link'],
    ['use', 'strong', 'unique', 'passwords', 'always'],
    ['enable', 'multi', 'factor', 'auth', 'now'],
    ['protect', 'your', 'personal', 'data', 'online'],
    ['keep', 'your', 'software', 'always', 'updated'],
    ['backup', 'files', 'to', 'prevent', 'loss']
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
    Stealth: { icon: EyeOff, className: 'text-threat-stealth', speed: 1.1 },
    Glitch: { icon: Fingerprint, className: 'text-threat-glitch', speed: 1.0 },
    Splitter: { icon: GitFork, className: 'text-threat-splitter', speed: 0.9 },
    SplitterChild: { icon: GitFork, className: 'text-threat-splitter', speed: 1.5 },
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
        word: 'reboot',
        duration: 0,
        effect: { value: 0 },
    },
    Shield: {
        icon: Shield,
        className: 'text-blue-500',
        word: 'antivirus',
        duration: 0, 
        effect: { value: 5 }, // Grants 5 shield points
    },
};
