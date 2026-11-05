import test from 'node:test';
import assert from 'node:assert/strict';

// Import modules with tsx
import { JulesPlanner } from '../lib/jules-engine/planner.ts';
import { JulesToolExecutor } from '../lib/jules-engine/tools.ts';
import { JulesAutonomousExecutor } from '../lib/jules-engine/executor.ts';
import { GitHubService } from '../lib/jules-engine/github.ts';

test('Jules planner creates standard structured plan', () => {
  const planner = new JulesPlanner();
  const plan = planner.generatePlan({
    taskPrompt: 'Fix failing authentication tests',
    repoOwner: 'owner',
    repoName: 'repo',
    language: 'typescript'
  });

  assert.equal(plan.length, 5);
  assert.ok(plan[0].title.includes('Analyze codebase structure'));
  assert.ok(plan[1].title.includes('Reproduce bug'));
  assert.ok(plan[4].title.includes('Complete pre-commit steps to ensure proper testing'));
});

test('GitHubService parses repo URL and generates branch names', () => {
  const github = new GitHubService();
  const parsed = github.parseRepoUrl('https://github.com/google/jules.git');
  assert.equal(parsed.owner, 'google');
  assert.equal(parsed.repo, 'jules');

  const branch = github.createBranchName('Fix authentication bug');
  assert.ok(branch.startsWith('fix-authentication-bug-'));
});

test('Jules tool executor handles files and merge diffs', () => {
  const executor = new JulesToolExecutor({
    'file.ts': 'function hello() {\n  return 1;\n}'
  });

  const list = executor.execute('list_files', { path: '.' });
  assert.deepEqual(list.result, ['file.ts']);

  const read = executor.execute('read_file', { filepath: 'file.ts' });
  assert.equal(read.result, 'function hello() {\n  return 1;\n}');

  const diff = `<<<<<<< SEARCH\nfunction hello() {\n  return 1;\n}\n=======\nfunction hello() {\n  return 2;\n}\n>>>>>>> REPLACE`;

  const applied = executor.execute('replace_with_git_merge_diff', {
    filepath: 'file.ts',
    merge_diff: diff
  });
  assert.equal(applied.error, undefined);
  assert.equal(executor.getFiles()['file.ts'], 'function hello() {\n  return 2;\n}');
  assert.equal(executor.getDiffs().length, 1);
});

test('Jules autonomous executor steps through plan', async () => {
  const executor = new JulesAutonomousExecutor();
  const session = executor.createSession('https://github.com/org/test-project', 'Fix memory leak in buffer');

  assert.equal(session.plan.length, 5);
  assert.equal(session.currentStepIndex, 0);

  const step1 = await executor.executeNextStep(session.id);
  assert.equal(step1.session.currentStepIndex, 1);
  assert.equal(step1.session.plan[0].status, 'completed');
  assert.ok(step1.session.logs.length > 2);
});
