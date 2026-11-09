import { NextResponse } from 'next/server';
import { executionSandbox } from '@/lib/jules-engine/sandbox';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { command } = await request.json();

    if (!command || typeof command !== 'string') {
      return NextResponse.json({ success: false, error: 'Command string is required' }, { status: 400 });
    }

    const check = executionSandbox.sanitizeCommand(command);
    if (!check.safe) {
      return NextResponse.json({
        success: false,
        error: check.error || 'Command blocked by security filter'
      }, { status: 403 });
    }

    const result = await executionSandbox.execute(command, { timeoutMs: 15000 });
    return NextResponse.json({
      success: result.exitCode === 0,
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
