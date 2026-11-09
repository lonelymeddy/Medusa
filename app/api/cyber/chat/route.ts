import { NextRequest, NextResponse } from 'next/server';
import { cybersecurityOrchestrator } from '@/lib/cybersecurity/orchestrator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, investigationId, attachment } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'A valid cybersecurity prompt is required.' }, { status: 400 });
    }

    const id = investigationId || `inv-${Date.now()}`;
    const result = await cybersecurityOrchestrator.executeInvestigation(
      id,
      message,
      attachment
    );

    return NextResponse.json({
      success: true,
      investigationId: id,
      investigation: result.investigation,
      report: result.report,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
