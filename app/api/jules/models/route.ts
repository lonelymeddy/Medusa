import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  const active = aiProvider.getActiveProvider();
  const available = aiProvider.getAvailableProviders();

  return NextResponse.json({
    success: true,
    activeProvider: active,
    availableProviders: available,
    models: [
      { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', provider: 'gemini', contextWindow: '2M tokens', status: 'available' },
      { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', provider: 'anthropic', contextWindow: '200k tokens', status: 'available' },
      { id: 'gpt-4o', name: 'OpenAI GPT-4o', provider: 'openai', contextWindow: '128k tokens', status: 'available' },
      { id: 'local-runner', name: 'Medusa Embedded Sandbox Engine', provider: 'local', contextWindow: '64k tokens', status: 'ready' },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const { provider, apiKey, model } = await request.json();
    if (apiKey) {
      if (provider === 'gemini') process.env.GEMINI_API_KEY = apiKey;
      if (provider === 'openai') process.env.OPENAI_API_KEY = apiKey;
      if (provider === 'anthropic') process.env.ANTHROPIC_API_KEY = apiKey;
    }
    return NextResponse.json({ success: true, message: `Configured provider ${provider} with model ${model || 'default'}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
