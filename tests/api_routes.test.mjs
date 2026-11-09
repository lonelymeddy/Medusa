import test from 'node:test';
import assert from 'node:assert/strict';

import { GET as getRepos } from '../app/api/jules/repos/route.ts';
import { GET as getSessions, POST as createSession } from '../app/api/jules/sessions/route.ts';
import { POST as analyzeRepo } from '../app/api/jules/analyze/route.ts';
import { POST as runSession } from '../app/api/jules/run/route.ts';
import { POST as submitSession } from '../app/api/jules/submit/route.ts';
import { POST as runTerminal } from '../app/api/jules/terminal/route.ts';
import { GET as getRules, POST as createRule } from '../app/api/jules/knowledge-base/route.ts';
import { GET as getDeployments } from '../app/api/jules/deployments/route.ts';
import { GET as getModels } from '../app/api/jules/models/route.ts';

test('GET /api/jules/repos returns default presets and separated examples', async () => {
  const req = new Request('http://localhost:3000/api/jules/repos');
  const res = await getRepos(req);
  const data = await res.json();
  assert.ok(Array.isArray(data.presets));
  assert.equal(data.presets.length, 4);
  assert.ok(Array.isArray(data.examples));
});

test('POST /api/jules/analyze generates plan', async () => {
  const req = new Request('http://localhost:3000/api/jules/analyze', {
    method: 'POST',
    body: JSON.stringify({
      repoUrl: 'https://github.com/facebook/react',
      taskPrompt: 'Fix fiber node reconciler leak'
    })
  });
  const res = await analyzeRepo(req);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.plan.length, 5);
  assert.ok(data.proposedBranch.includes('fix-fiber-node'));
});

test('Full lifecycle: create session -> run steps -> submit PR', async () => {
  // 1. Create Session
  const createReq = new Request('http://localhost:3000/api/jules/sessions', {
    method: 'POST',
    body: JSON.stringify({
      repoUrl: 'https://github.com/tiangolo/fastapi',
      taskPrompt: 'Fix async request body parsing'
    })
  });
  const createRes = await createSession(createReq);
  const createData = await createRes.json();
  assert.equal(createData.success, true);
  const sessionId = createData.session.id;

  // 2. Run All Steps
  const runReq = new Request('http://localhost:3000/api/jules/run', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      autoRunAll: true
    })
  });
  const runRes = await runSession(runReq);
  const runData = await runRes.json();
  assert.equal(runData.success, true);
  assert.equal(runData.session.status, 'completed');
  assert.equal(runData.session.diffs.length > 0, true);

  // 3. Submit PR
  const submitReq = new Request('http://localhost:3000/api/jules/submit', {
    method: 'POST',
    body: JSON.stringify({
      sessionId,
      title: 'Fix async request body parsing',
      description: 'Applied boundary checks to handle corrupted payload stream gracefully.'
    })
  });
  const submitRes = await submitSession(submitReq);
  const submitData = await submitRes.json();
  assert.equal(submitData.success, true);
  assert.ok(submitData.prUrl.includes('fastapi/pull/'));
});

test('POST /api/jules/terminal runs sandboxed command', async () => {
  const req = new Request('http://localhost:3000/api/jules/terminal', {
    method: 'POST',
    body: JSON.stringify({ command: 'node -v' })
  });
  const res = await runTerminal(req);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.stdout.includes('v'));
  assert.equal(data.exitCode, 0);
});

test('Knowledge Base: create and retrieve persistent rules', async () => {
  const postReq = new Request('http://localhost:3000/api/jules/knowledge-base', {
    method: 'POST',
    body: JSON.stringify({
      title: 'No Mockups Rule',
      category: 'coding_standards',
      content: 'Never use mock emojis or fake buttons.'
    })
  });
  const postRes = await createRule(postReq);
  const postData = await postRes.json();
  assert.equal(postData.success, true);

  const getRes = await getRules();
  const getData = await getRes.json();
  assert.equal(getData.success, true);
  assert.ok(getData.rules.length >= 1);
});

test('Deployments & Models endpoints return structured system health', async () => {
  const depRes = await getDeployments();
  const depData = await depRes.json();
  assert.equal(depData.success, true);
  assert.ok(depData.deployments.length > 0);

  const modRes = await getModels();
  const modData = await modRes.json();
  assert.equal(modData.success, true);
  assert.ok(modData.models.length >= 4);
});
