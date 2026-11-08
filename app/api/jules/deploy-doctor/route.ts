import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { platform = 'render', dockerfile, nextConfig, port } = await req.json();
    const checks: { item: string; status: 'PASS' | 'WARN' | 'FAIL'; note: string }[] = [];

    // Check HOSTNAME binding
    if (dockerfile && dockerfile.includes('0.0.0.0')) {
      checks.push({ item: 'Host Binding (0.0.0.0)', status: 'PASS', note: 'Explicitly binds to all network interfaces' });
    } else if (dockerfile) {
      checks.push({ item: 'Host Binding (0.0.0.0)', status: 'FAIL', note: 'Missing HOSTNAME=0.0.0.0, will cause HTTP 502 Bad Gateway on cloud runtimes' });
    }

    // Check dynamic port binding
    if (dockerfile && (dockerfile.includes('$PORT') || dockerfile.includes('PORT'))) {
      checks.push({ item: 'Dynamic Port ($PORT)', status: 'PASS', note: 'Dynamic environment port binding configured' });
    } else if (dockerfile) {
      checks.push({ item: 'Dynamic Port ($PORT)', status: 'WARN', note: 'Hardcoded port detected; may fail on Render or Heroku dynamic port assignment' });
    }

    // Check standalone output
    if (nextConfig && nextConfig.includes('standalone')) {
      checks.push({ item: 'Next.js Standalone Output', status: 'PASS', note: 'Configured for standalone minimal container deployment' });
    }

    const hasFail = checks.some(c => c.status === 'FAIL');

    return NextResponse.json({
      platform,
      overallStatus: hasFail ? 'ERROR' : checks.some(c => c.status === 'WARN') ? 'WARNING' : 'HEALTHY',
      checks,
      fixGuide: hasFail
        ? 'Ensure your Dockerfile exports ENV HOSTNAME="0.0.0.0" and starts the server with node server.js on the dynamic PORT provided by the platform.'
        : 'Deployment parameters look compatible with containerized production environments.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
