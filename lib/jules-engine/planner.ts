import { PlanStep, Language } from "./types";

export interface PlanGenerationRequest {
  taskPrompt: string;
  repoOwner: string;
  repoName: string;
  language: Language;
}

export class JulesPlanner {
  generatePlan(req: PlanGenerationRequest): PlanStep[] {
    const { taskPrompt, language } = req;
    const lower = taskPrompt.toLowerCase();

    const plan: PlanStep[] = [];

    // Step 1: Investigation & Repo Structure Discovery
    plan.push({
      id: 'step-1',
      title: 'Analyze codebase structure and isolate target files',
      description: `Run repository inspection tools (list_files, read_file) to locate relevant modules, configuration, and dependencies for language ${language}.`,
      status: 'pending',
    });

    // Step 2: Test replication / reproduction
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error') || lower.includes('debug')) {
      plan.push({
        id: 'step-2',
        title: 'Reproduce bug and identify root cause failure',
        description: 'Examine failing test logs or edge cases. Formulate hypothesis and pinpoint exact faulty functions or boundary conditions.',
        status: 'pending',
      });
    } else {
      plan.push({
        id: 'step-2',
        title: 'Design interface and specification for implementation',
        description: 'Draft the function signatures, data types, and modular structure matching architectural requirements.',
        status: 'pending',
      });
    }

    // Step 3: Core Implementation
    plan.push({
      id: 'step-3',
      title: 'Apply targeted code modifications with git merge diffs',
      description: 'Implement solution cleanly without touching unrelated lines, adhering to strict coding conventions and error handling standards.',
      status: 'pending',
    });

    // Step 4: Verification & Automated Tests
    plan.push({
      id: 'step-4',
      title: 'Execute test suites and verify regression safety',
      description: `Run automated tests (${language === 'python' ? 'pytest' : language === 'rust' ? 'cargo test' : language === 'go' ? 'go test' : 'npm test'}) to confirm changes pass without breaking existing features.`,
      status: 'pending',
    });

    // Step 5: Pre-commit checks & submission readiness
    plan.push({
      id: 'step-5',
      title: 'Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done',
      description: 'Inspect modified git diffs, ensure zero linting errors, compile artifacts, and format patch.',
      status: 'pending',
    });

    return plan;
  }
}
