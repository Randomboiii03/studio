import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WORDS_LIST = [
    // Easy 4-5 letter words
    'code', 'data', 'link', 'user', 'file', 'read', 'write', 'scan', 'ping',
    'lock', 'keys', 'safe', 'secure', 'alert', 'block', 'track', 'trace',
    'admin', 'login', 'shell', 'proxy', 'cloud', 'virus', 'patch', 'bot',
    'root', 'node', 'port', 'host', 'query', 'token', 'guard', 'hash',

    // Medium 6-7 letter words
    'access', 'analyze', 'backup', 'binary', 'bypass', 'cache', 'compile',
    'connect', 'cookie', 'cyber', 'debug', 'decrypt', 'delete', 'denied',
    'deploy', 'device', 'domain', 'encrypt', 'exploit', 'filter', 'firewall',
    'hacker', 'kernel', 'malware', 'monitor', 'network', 'packet',
    'password', 'policy', 'protect', 'protocol', 'recover', 'reboot',
    'restore', 'router', 'sandbox', 'script', 'server', 'shield', 'source',
    'spyware', 'system', 'trojan', 'update', 'virtual', 'worm',

    // Hard 8+ letter words
    'algorithm', 'antivirus', 'archive', 'authenticate', 'authorize',
    'backdoor', 'bandwidth', 'biometric', 'blacklist', 'bruteforce',
    'certificate', 'checksum', 'ciphertext', 'configure', 'connection',
    'credential', 'database', 'decompile', 'decryption', 'defend',
    'directory', 'disaster', 'document', 'download', 'encryption',
    'endpoint', 'escalate', 'ethernet', 'firewall', 'firmware',
    'framework', 'gateway', 'hardware', 'honeypot', 'infiltrate',
    'initialize', 'injection', 'install', 'internet', 'intrusion',
    'keylogger', 'localhost', 'malicious', 'metadata', 'mitigate',
    'obfuscate', 'override', 'penetrate', 'permission', 'phishing',
    'platform', 'polymorphic', 'privilege', 'procedure', 'processor',
    'protocol', 'quarantine', 'ransomware', 'redirect', 'replicate',
    'repository', 'response', 'rootkit', 'security', 'software',
    'spoofing', 'spyware', 'steganography', 'streaming', 'superuser',
    'terminal', 'threat', 'topology', 'transaction', 'transfer',
    'tunneling', 'username', 'validation', 'virtualize', 'vulnerability',
    'whitelist', 'workstation'
];


export type EnemyType = {
  icon: LucideIcon;
  className: string;
  speed: number;
};

export const ENEMY_TYPES: { [key: string]: EnemyType } = {
    Malware: { icon: Bug, className: 'text-threat-malware', speed: 1 },
    Phishing: { icon: Shield, className: 'text-threat-phishing', speed: 1.2 },
    DDoS: { icon: Siren, className: 'text-threat-ddos', speed: 0.8 },
    Ransomware: { icon: Biohazard, className: 'text-threat-ransomware', speed: 1.1 },
    Spyware: { icon: ServerCrash, className: 'text-threat-spyware', speed: 1.3 },
    Adware: { icon: Bot, className: 'text-threat-adware', speed: 0.9 },
};
