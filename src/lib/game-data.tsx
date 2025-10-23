
import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot, Skull, Snowflake, Bomb, EyeOff, Fingerprint, GitFork } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const GLITCH_WORDS_LIST = ["glitch", "static", "corrupt", "fragment", "error", "binary", "system", "kernel"];

export type EnemyTypeInfo = {
  icon: LucideIcon;
  className: string;
  speed: number;
  description: string;
};

export const ENEMY_TYPES: { [key: string]: EnemyTypeInfo } = {
    Malware: { icon: Bug, className: 'text-threat-malware', speed: 1, description: "Standard hostile program." },
    Phishing: { icon: Shield, className: 'text-threat-phishing', speed: 1.2, description: "Deceptive entity, moves faster." },
    DDoS: { icon: Siren, className: 'text-threat-ddos', speed: 0.8, description: "Slow but resilient." },
    Ransomware: { icon: Biohazard, className: 'text-threat-ransomware', speed: 1.1, description: "Locks down system resources." },
    Spyware: { icon: ServerCrash, className: 'text-threat-spyware', speed: 1.3, description: "Fast-moving data thief." },
    Adware: { icon: Bot, className: 'text-threat-adware', speed: 0.9, description: "Distracts and clutters the system." },
    Stealth: { icon: EyeOff, className: 'text-threat-stealth', speed: 1.1, description: "Cloaked until it nears the firewall." },
    Glitch: { icon: Fingerprint, className: 'text-threat-glitch', speed: 1.0, description: "Scrambles its signature periodically." },
    Splitter: { icon: GitFork, className: 'text-threat-splitter', speed: 0.9, description: "Splits into two smaller fragments." },
    SplitterChild: { icon: GitFork, className: 'text-threat-splitter', speed: 1.5, description: "Fast but weak fragment." },
    Boss: { icon: Skull, className: 'text-destructive', speed: 0.5, description: "A powerful foe with a long defense phrase." },
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
