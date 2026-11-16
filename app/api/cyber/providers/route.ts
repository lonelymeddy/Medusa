import { NextRequest, NextResponse } from 'next/server';
import { aiProvider, SupportedModelProvider } from '@/lib/ai-provider';

export async function GET() {
  const statuses = aiProvider.getProviderStatuses();
  return NextResponse.json({
    success: true,
    activeProvider: aiProvider.getActiveProvider(),
    providers: statuses,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, provider, apiKey } = body;

    if (action === 'test') {
      const res = await aiProvider.testConnection(provider as SupportedModelProvider);
      return NextResponse.json({ success: res.success, latencyMs: res.latencyMs, error: res.error });
    }

    if (action === 'configure' && provider && apiKey) {
      const update: any = {};
      if (provider === 'openai_primary') update.openaiApiKey = apiKey;
      if (provider === 'openai_secondary') update.openaiApiKeySecondary = apiKey;
      if (provider === 'anthropic') update.anthropicApiKey = apiKey;
      if (provider === 'gemini') update.geminiApiKey = apiKey;
      if (provider === 'deepseek') update.deepseekApiKey = apiKey;
      aiProvider.updateConfig(update);
      return NextResponse.json({ success: true, message: `Configured ${provider}` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
