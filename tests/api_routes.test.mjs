import test from 'node:test';
import assert from 'node:assert/strict';

import { GET as getRepos } from '../app/api/jules/repos/route.ts';
import { GET as getSessions, POST as createSession } from '../app/api/jules/sessions/route.ts';
import { POST as analyzeRepo } from '../app/api/jules/analyze/route.ts';
import { POST as runSession } from '../app/api/jules/run/route.ts';
import { POST as submitSession } from '../app/api/jules/submit/route.ts';

test('GET /api/jules/repos returns default presets', async () => {
  const req = new Request('http://localhost:3000/api/jules/repos');
  const res = await getRepos(req);
  const data = await res.json();
  assert.ok(Array.isArray(data.presets));
  assert.equal(data.presets.length, 4);
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
