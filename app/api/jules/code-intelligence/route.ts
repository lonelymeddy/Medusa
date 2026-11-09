import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { action, code, language = 'typescript' } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'explain':
        systemPrompt = 'You are a senior software architect. Explain the architectural role, algorithmic complexity, and structure of this code.';
        userPrompt = `Language: ${language}\n\nCode:\n${code}`;
        break;
      case 'bugs':
        systemPrompt = 'You are a staff security and reliability engineer. Identify race conditions, boundary bugs, resource leaks, and unhandled errors.';
        userPrompt = `Language: ${language}\n\nCode:\n${code}`;
        break;
      case 'refactor':
        systemPrompt = 'You are a principal engineer. Propose clean architecture, DRY refactoring, and optimal typing for this code.';
        userPrompt = `Language: ${language}\n\nCode:\n${code}`;
        break;
      case 'generate-tests':
        systemPrompt = 'You are a testing specialist. Write comprehensive unit tests including edge cases, corrupted inputs, and mock suites.';
        userPrompt = `Language: ${language}\n\nCode:\n${code}`;
        break;
      default:
        systemPrompt = 'You are an autonomous code reviewer. Provide structured code analysis with suggestions.';
        userPrompt = `Language: ${language}\n\nCode:\n${code}`;
    }

    const response = await aiProvider.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    return NextResponse.json({
      success: true,
      action,
      analysis: response.text,
      modelUsed: response.model,
      usage: response.usage,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
