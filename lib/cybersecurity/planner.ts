import { securityToolRegistry, SecurityFinding, ToolExecutionResult } from './tools';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'SCANNING' | 'ANALYZING' | 'COMPLETED' | 'FAILED' | 'WAITING';

export interface SecurityTask {
  id: string;
  title: string;
  tool: string;
  status: TaskStatus;
  startTime?: string;
  endTime?: string;
  result?: ToolExecutionResult;
  error?: string;
}

export interface SecurityPlan {
  objective: string;
  scope: string;
  target: string;
  category: 'web_security' | 'network_scan' | 'source_audit' | 'malware_analysis' | 'threat_intel' | 'forensics' | 'general';
  tasks: SecurityTask[];
}

export class CybersecurityPlanner {
  createPlan(userRequest: string, attachmentContext?: { filename?: string; isCode?: boolean; isFile?: boolean }): SecurityPlan {
    const text = userRequest.toLowerCase();

    // 1. Source Code Auditing (prioritize code analysis requests or code attachments)
    if (attachmentContext?.isCode || (text.includes('code') && !text.includes('malware')) || text.includes('sast') || text.includes('hardcoded secret') || text.includes('semgrep') || text.includes('repository audit')) {
      const target = attachmentContext?.filename || 'source-code.ts';

      return {
        objective: `Static Application Security Testing (SAST) & Secret Audit for ${target}`,
        scope: `Inspected source repository / file: ${target}`,
        target,
        category: 'source_audit',
        tasks: [
          {
            id: 'task-1',
            title: 'Scan Codebase for Hardcoded Secrets, Tokens, and Private Keys',
            tool: 'medusa-code-auditor',
            status: 'PENDING'
          },
          {
            id: 'task-2',
            title: 'Analyze Code for OWASP Top 10 Injection, Traversal, and Eval Flaws',
            tool: 'medusa-code-auditor',
            status: 'PENDING'
          },
          {
            id: 'task-3',
            title: 'AI Semantic Vulnerability Reasoning & Exploitability Analysis',
            tool: 'ai-security-reasoner',
            status: 'PENDING'
          },
          {
            id: 'task-4',
            title: 'Produce Code Remediation Guidance and Secure Refactor Diffs',
            tool: 'report-generator',
            status: 'PENDING'
          }
        ]
      };
    }

    // 2. Web application assessment (explicit URL or web keywords)
    if (text.includes('http://') || text.includes('https://') || text.includes('webapp') || text.includes('website') || text.includes('xss') || text.includes('csrf') || text.includes('sql injection') || text.includes('csp')) {
      const targetMatch = userRequest.match(/https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const target = targetMatch ? targetMatch[0] : 'https://target.local';

      return {
        objective: `Comprehensive Web Application & API Security Assessment on ${target}`,
        scope: `Authorized target: ${target}`,
        target,
        category: 'web_security',
        tasks: [
          {
            id: 'task-1',
            title: 'Analyze HTTP/HTTPS Transport and SSL/TLS Configuration',
            tool: 'medusa-web-scanner',
            status: 'PENDING'
          },
          {
            id: 'task-2',
            title: 'Inspect Critical HTTP Defense Headers and CSP Policies',
            tool: 'medusa-web-scanner',
            status: 'PENDING'
          },
          {
            id: 'task-3',
            title: 'Evaluate Session Management and Cookie Protection Flags',
            tool: 'medusa-web-scanner',
            status: 'PENDING'
          },
          {
            id: 'task-4',
            title: 'Scan Perimeter Network Ports & Services for Target Host',
            tool: 'nmap',
            status: 'PENDING'
          },
          {
            id: 'task-5',
            title: 'Synthesize Findings into Executive & Technical Remediation Report',
            tool: 'report-generator',
            status: 'PENDING'
          }
        ]
      };
    }

    // 3. Malware Analysis
    if (text.includes('malware') || text.includes('sample') || text.includes('yara') || text.includes('suspicious file') || text.includes('dropper') || text.includes('payload')) {
      const target = attachmentContext?.filename || 'sample.bin';

      return {
        objective: `Static Malware Triage & Threat Indicator Analysis for ${target}`,
        scope: `Sample: ${target}`,
        target,
        category: 'malware_analysis',
        tasks: [
          {
            id: 'task-1',
            title: 'Calculate Cryptographic Hashes (MD5, SHA1, SHA256)',
            tool: 'medusa-malware-analyzer',
            status: 'PENDING'
          },
          {
            id: 'task-2',
            title: 'Calculate Shannon Entropy & Detect Obfuscation/Packing',
            tool: 'medusa-malware-analyzer',
            status: 'PENDING'
          },
          {
            id: 'task-3',
            title: 'Extract Suspicious Execution Strings & API Calls',
            tool: 'medusa-malware-analyzer',
            status: 'PENDING'
          },
          {
            id: 'task-4',
            title: 'Query Threat Intelligence Databases for Known Signatures',
            tool: 'threat-intelligence-engine',
            status: 'PENDING'
          },
          {
            id: 'task-5',
            title: 'Compile Threat Triage Report with Indicators of Compromise (IOCs)',
            tool: 'report-generator',
            status: 'PENDING'
          }
        ]
      };
    }

    // 4. Network & Port Scanning
    if (text.includes('port scan') || text.includes('nmap') || text.includes('network scan') || text.includes('port') || text.includes('subnet') || text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)) {
      const ipMatch = userRequest.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      const target = ipMatch ? ipMatch[0] : '127.0.0.1';

      return {
        objective: `Network Discovery and Service Vulnerability Scan on ${target}`,
        scope: `Authorized scan boundary: ${target}`,
        target,
        category: 'network_scan',
        tasks: [
          {
            id: 'task-1',
            title: `Discover Active Services and Exposed TCP Ports on ${target}`,
            tool: 'nmap',
            status: 'PENDING'
          },
          {
            id: 'task-2',
            title: 'Query Threat Intelligence Feeds and IP Reputation',
            tool: 'threat-intelligence-engine',
            status: 'PENDING'
          },
          {
            id: 'task-3',
            title: 'Analyze Service Banners and Identify Known CVEs',
            tool: 'cve-correlator',
            status: 'PENDING'
          },
          {
            id: 'task-4',
            title: 'Generate Network Hardening & Firewall Boundary Report',
            tool: 'report-generator',
            status: 'PENDING'
          }
        ]
      };
    }

    // Default Cybersecurity Investigation
    return {
      objective: `Cybersecurity Investigation: ${userRequest.slice(0, 50)}...`,
      scope: 'Defensive Security Context',
      target: 'System / Security Query',
      category: 'general',
      tasks: [
        {
          id: 'task-1',
          title: 'Understand Request Scope & Map Threat Model',
          tool: 'ai-security-reasoner',
          status: 'PENDING'
        },
        {
          id: 'task-2',
          title: 'Execute Targeted Security Heuristics & Analysis',
          tool: 'medusa-security-engine',
          status: 'PENDING'
        },
        {
          id: 'task-3',
          title: 'Formulate Comprehensive Cybersecurity Assessment',
          tool: 'report-generator',
          status: 'PENDING'
        }
      ]
    };
  }
}

export const cybersecurityPlanner = new CybersecurityPlanner();
