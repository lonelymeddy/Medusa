import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(uptime),
    service: 'medusa-autonomous-agent',
    environment: process.env.NODE_ENV || 'production',
    system: {
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024)),
      },
      nodeVersion: process.version,
    },
    integrations: {
      githubConfigured: Boolean(process.env.GITHUB_TOKEN || process.env.GITHUB_CLIENT_ID),
      aiConfigured: Boolean(
        process.env.OPENAI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.OLLAMA_BASE_URL
      ),
    },
    durationMs: Date.now() - startTime,
  };

  Logger.debug('Health endpoint check called', { status: 'healthy' });
  return NextResponse.json(healthData, { status: 200 });
}
