import { NextResponse } from 'next/server';
import { AIProviderManager } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manager = new AIProviderManager();
  const available = manager.getAvailableProviders();
  const active = manager.getActiveProvider();

  return NextResponse.json({
    success: true,
    activeProvider: active,
    availableProviders: available,
    status: {
      openai: Boolean(process.env.OPENAI_API_KEY),
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      ollama: Boolean(process.env.OLLAMA_BASE_URL),
      local: true,
    },
  });
}
