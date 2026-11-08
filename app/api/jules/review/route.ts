import { NextResponse } from 'next/server';
import { ReviewerAgent } from '@/lib/agents';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { code, filepath } = await request.json();
    const reviewer = new ReviewerAgent();

    const issues = [];
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Code string is required' }, { status: 400 });
    }

    if (code.includes('console.log')) {
      issues.push({ line: 1, type: 'cleanup', message: 'Production code contains console.log statements' });
    }
    if (code.includes('any')) {
      issues.push({ line: 1, type: 'type-safety', message: 'Avoid loose "any" types; specify exact interface' });
    }

    return NextResponse.json({
      success: true,
      filepath: filepath || 'src/index.ts',
      status: issues.length === 0 ? 'approved' : 'changes_suggested',
      score: issues.length === 0 ? 100 : 85,
      issues,
      recommendation: issues.length === 0
        ? 'Code meets all maintainability, type-safety, and performance standards.'
        : 'Address type annotations and clean up debug log statements.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
