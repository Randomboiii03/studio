import { Shield, Bug, Siren, Biohazard, ServerCrash, Bot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const WORDS_LIST = [
    // Verbs (Actions)
    'analyze', 'authenticate', 'authorize', 'backtrace', 'block', 'bypass',
    'capture', 'certify', 'compile', 'compress', 'configure', 'connect',
    'contain', 'correlate', 'crack', 'decompile', 'decrypt', 'defend',
    'delete', 'detect', 'disable', 'disinfect', 'disrupt', 'document',
    'dump', 'echo', 'elevate', 'emulate', 'encapsulate', 'encode', 'encrypt',
    'escalate', 'evade', 'execute', 'exploit', 'filter', 'firewall', 'flush',
    'harden', 'hash', 'honeypot', 'hook', 'impersonate', 'infect', 'infiltrate',
    'initialize', 'inject', 'install', 'intercept', 'isolate', 'jam',
    'keylog', 'launch', 'link', 'load', 'lock', 'log', 'map', 'mask',
    'migrate', 'mirror', 'mitigate', 'modify', 'monitor', 'obfuscate',
    'override', 'overwrite', 'packet-sniff', 'patch', 'penetrate',
    'permission', 'ping', 'pivot', 'poison', 'port-scan', 'probe',
    'protect', 'quarantine', 'query', 'reboot', 'replicate', 'report',
    'resolve', 'restore', 'reverse-engineer', 'revert', 'root', 'route',
    'sandbox', 'sanitize', 'scan', 'script', 'secure', 'segment', 'send',
    'sequence', 'shadow', 'shell', 'shield', 'shred', 'simulate', 'sniff',
    'social-engineer', 'spoof', 'spread', 'sterilize', 'syn-flood',
    'sys-admin', 'terminate', 'trace', 'track', 'trap', 'trigger', 'tunnel',
    'unbind', 'unlock', 'unpack', 'update', 'upgrade', 'validate', 'virtualize',
    'whitelist', 'wipe', 'worm', 'zero-day',
  
    // Nouns (Concepts/Tools)
    'access-control', 'adware', 'algorithm', 'alias', 'anomaly', 'antivirus',
    'api', 'archive', 'attack-vector', 'audit', 'authentication',
    'backdoor', 'backup', 'banner', 'binary', 'biometrics', 'blacklist',
    'blockchain', 'bot', 'botnet', 'breach', 'broadcast', 'brute-force',
    'buffer-overflow', 'bug', 'chain-of-custody', 'checksum', 'cipher',
    'ciphertext', 'client', 'cloud', 'cluster', 'code', 'command',
    'compliance', 'compression', 'connection', 'cookie', 'core', 'covert-channel',
    'credential', 'cross-site-scripting', 'crypto-locker', 'cryptography',
    'cyber-espionage', 'cyberspace', 'daemon', 'data-breach', 'data-leak',
    'database', 'datagram', 'debugger', 'deception', 'denial-of-service',
    'dev-ops', 'dictionary-attack', 'digital-signature', 'directory', 'dns',
    'docker', 'domain', 'dos', 'drive-by-download', 'drone', 'dumpster-diving',
    'dynamic-analysis', 'e-commerce', 'encryption-key', 'endpoint',
    'entropy', 'ethernet', 'ethics', 'exfiltration', 'exploit-kit', 'firmware',
    'forensics', 'fragment', 'framework', 'fuzzer', 'gateway', 'geofencing',
    'git', 'glitch', 'gray-hat', 'hacker', 'hashcat', 'header', 'hex',
    'honey-pot', 'host', 'http', 'hub', 'hypervisor', 'incident-response',
    'information-security', 'infrastructure', 'injection', 'input-validation',
    'insider-threat', 'internet', 'intrusion', 'ip-address', 'ipv6', 'jailbreak',
    'javascript', 'json', 'jwt', 'kernel', 'key', 'keylogger', 'keystroke',
    'kubernetes', 'lan', 'lateral-movement', 'library', 'linux', 'load-balancer',
    'localhost', 'log-file', 'logic-bomb', 'machine-learning', 'macro',
    'malvertising', 'man-in-the-middle', 'malware', 'memory', 'metadata',
    'metasploit', 'microservice', 'mitigation', 'mobile-security', 'module',
    'multi-factor', 'mutex', 'netcat', 'network', 'neural-net', 'nmap',
    'node', 'nonce', 'nosql', 'oauth', 'open-source', 'operating-system',
    'osint', 'overflow', 'packet', 'pass-the-hash', 'password', 'patch-management',
    'payload', 'pentest', 'pharming', 'phishing', 'physical-security', 'plaintext',
    'policy', 'polymorphic', 'port', 'powershell', 'privacy', 'privilege',
    'procedure', 'process', 'protocol', 'proxy', 'python', 'rainbow-table',
    'ram', 'ransomware', 'reconnaissance', 'recovery', 'registry',
    'remote-access', 'repository', 'resilience', 'reverse-proxy', 'risk',
    'rootkit', 'router', 'ruleset', 'runtime', 'salt', 'saml', 'sandbox',
    'sanitization', 'scada', 'scanner', 'schema', 'script-kiddie', 'sdk',
    'security-posture', 'semaphore', 'server', 'session', 'shellcode',
    'side-channel', 'sidejacking', 'sinkhole', 'smishing', 'sniffer',
    'social-engineering', 'socket', 'software', 'spear-phishing', 'spider',
    'spyware', 'sql-injection', 'ssh', 'ssl', 'stack', 'steganography',
    'stream', 'subnet', 'sudo', 'swap', 'symmetric', 'system', 'tailgating',
    'tamper', 'tcp', 'terminal', 'thread', 'threat-actor', 'threat-hunting',
    'ticket', 'token', 'topology', 'tor', 'traffic', 'trojan', 'tunneling',
    'two-factor', 'udp', 'unix', 'usb', 'user', 'validation', 'victim',
    'virtual-machine', 'virus', 'vishing', 'vlan', 'vpn', 'vulnerability',
    'wan', 'war-driving', 'water-holing', 'web-server', 'whaling', 'white-hat',
    'wi-fi', 'windows', 'wireshark', 'worm', 'xml', 'zero-day', 'zombie'
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
