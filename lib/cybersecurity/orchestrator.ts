import { securityToolRegistry, SecurityFinding, ToolExecutionResult } from './tools';
import { cybersecurityPlanner, SecurityPlan, SecurityTask } from './planner';
import { cybersecurityStorage, SecurityInvestigation, ChatSessionMessage } from './storage';
import { aiProvider } from '../ai-provider';

export interface ExecutionEvent {
  type: 'plan_created' | 'task_started' | 'task_completed' | 'finding_discovered' | 'report_generated' | 'completed' | 'error';
  plan?: SecurityPlan;
  currentTask?: SecurityTask;
  finding?: SecurityFinding;
  textChunk?: string;
  report?: string;
}

export class CybersecurityOrchestrator {
  async executeInvestigation(
    investigationId: string,
    prompt: string,
    attachment?: { filename: string; content: string; isBinary?: boolean },
    onEvent?: (event: ExecutionEvent) => void
  ): Promise<{ investigation: SecurityInvestigation; report: string }> {
    let inv = cybersecurityStorage.get(investigationId);
    if (!inv) {
      inv = {
        id: investigationId,
        title: prompt.slice(0, 45) || 'Security Assessment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: 'general',
        status: 'active',
        messages: [],
        findings: [],
      };
    }

    inv.messages.push({
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString(),
    });

    const plan = cybersecurityPlanner.createPlan(prompt, {
      filename: attachment?.filename,
      isCode: attachment?.filename?.endsWith('.ts') || attachment?.filename?.endsWith('.js') || attachment?.filename?.endsWith('.py') || Boolean(attachment?.content && (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('audit') || prompt.toLowerCase().includes('script'))),
      isFile: Boolean(attachment),
    });

    inv.category = plan.category;
    inv.target = plan.target;
    inv.scope = plan.scope;

    if (onEvent) {
      onEvent({ type: 'plan_created', plan });
    }

    const allFindings: SecurityFinding[] = [];

    for (const task of plan.tasks) {
      task.status = 'RUNNING';
      task.startTime = new Date().toISOString();
      if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });

      try {
        let res: ToolExecutionResult | null = null;
        if (task.tool === 'nmap') {
          task.status = 'SCANNING';
          if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });
          res = await securityToolRegistry.scanNetwork(plan.target);
        } else if (task.tool === 'medusa-web-scanner') {
          task.status = 'SCANNING';
          if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });
          res = await securityToolRegistry.analyzeWebSecurity(plan.target);
        } else if (task.tool === 'medusa-code-auditor') {
          task.status = 'ANALYZING';
          if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });
          res = await securityToolRegistry.auditSourceCode(attachment?.content || prompt, attachment?.filename || 'input.ts');
        } else if (task.tool === 'medusa-malware-analyzer') {
          task.status = 'ANALYZING';
          if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });
          const buf = Buffer.from(attachment?.content || prompt, attachment?.isBinary ? 'base64' : 'utf-8');
          res = await securityToolRegistry.analyzeMalwareFile(buf, attachment?.filename || 'sample.bin');
        } else if (task.tool === 'threat-intelligence-engine') {
          task.status = 'ANALYZING';
          if (onEvent) onEvent({ type: 'task_started', plan, currentTask: task });
          res = await securityToolRegistry.queryThreatIntel(plan.target);
        }

        if (res) {
          task.result = res;
          if (res.findings && res.findings.length > 0) {
            for (const f of res.findings) {
              allFindings.push(f);
              if (onEvent) onEvent({ type: 'finding_discovered', finding: f });
            }
          }
        }

        task.status = 'COMPLETED';
        task.endTime = new Date().toISOString();
        if (onEvent) onEvent({ type: 'task_completed', plan, currentTask: task });
      } catch (err: any) {
        task.status = 'FAILED';
        task.error = err.message;
        if (onEvent) onEvent({ type: 'error', currentTask: task });
      }
    }

    const findingsSummary = allFindings.map(f => `[${f.severity}] ${f.title} (${f.category}): ${f.description} - Impact: ${f.potentialImpact} - Remediation: ${f.remediation}`).join('\n\n');

    const promptContext = `
You are MEDUSA, an elite autonomous AI cybersecurity platform.
Generate a structured, professional cybersecurity assessment report based on the following authenticated investigation:

Objective: ${plan.objective}
Target: ${plan.target}
Authorized Scope: ${plan.scope}

Real Security Findings Discovered:
${findingsSummary || 'No high-risk vulnerabilities detected under current scope heuristics.'}

Provide a comprehensive, high-signal report formatted in clean Markdown with:
1. Executive Summary
2. Threat & Risk Posture
3. Detailed Technical Findings (Vulnerability, Severity, Affected Component, Evidence, Potential Impact)
4. Strategic Remediation Roadmap
5. Conclusion
`;

    const aiResult = await aiProvider.complete([
      { role: 'system', content: 'You are MEDUSA, an autonomous AI cybersecurity intelligence system. Be precise, highly technical, and strictly defensive.' },
      { role: 'user', content: promptContext }
    ]);

    const reportMarkdown = aiResult.text;

    inv.findings = allFindings;
    inv.reportMarkdown = reportMarkdown;
    inv.status = 'completed';
    inv.messages.push({
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: reportMarkdown,
      timestamp: new Date().toISOString(),
      plan,
      findings: allFindings,
      status: 'COMPLETED'
    });

    cybersecurityStorage.saveInvestigation(inv);

    if (onEvent) {
      onEvent({ type: 'report_generated', report: reportMarkdown, plan });
      onEvent({ type: 'completed', report: reportMarkdown });
    }

    return { investigation: inv, report: reportMarkdown };
  }
}

export const cybersecurityOrchestrator = new CybersecurityOrchestrator();
