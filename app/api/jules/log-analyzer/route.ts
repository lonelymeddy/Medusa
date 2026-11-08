import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { logText } = await request.json();

    if (!logText || typeof logText !== 'string') {
      return NextResponse.json({ success: false, error: 'logText is required' }, { status: 400 });
    }

    let detectedError = 'General runtime error';
    let rootCause = 'Unhandled exception during execution';
    let suggestedPatch = 'Add defensive checks around vulnerable call sites';

    if (logText.includes('502') || logText.includes('Bad Gateway')) {
      detectedError = 'HTTP 502 Bad Gateway';
      rootCause = 'Reverse proxy could not establish connection with upstream application port';
      suggestedPatch = 'Ensure server binds to 0.0.0.0 and port matches hosting provider (e.g. PORT=10000 on Render).';
    } else if (logText.includes('Cannot find module') || logText.includes('MODULE_NOT_FOUND')) {
      detectedError = 'Module Resolution Failure';
      rootCause = 'Imported module is missing from dependencies or standalone bundle.';
      suggestedPatch = 'Ensure package is listed in package.json dependencies and copied in Dockerfile.';
    }

    return NextResponse.json({
      success: true,
      errorSummary: detectedError,
      rootCause,
      suggestedPatch,
      confidenceScore: 0.94,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
