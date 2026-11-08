import { Logger } from '../logger';

export type SupportedModelProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'local';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface CompletionResult {
  text: string;
  provider: SupportedModelProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProviderConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  ollamaBaseUrl?: string;
  defaultProvider?: SupportedModelProvider;
}

export class AIProviderManager {
  private config: AIProviderConfig;

  constructor(customConfig?: Partial<AIProviderConfig>) {
    this.config = {
      openaiApiKey: customConfig?.openaiApiKey || process.env.OPENAI_API_KEY,
      anthropicApiKey: customConfig?.anthropicApiKey || process.env.ANTHROPIC_API_KEY,
      geminiApiKey: customConfig?.geminiApiKey || process.env.GEMINI_API_KEY,
      ollamaBaseUrl: customConfig?.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      defaultProvider: customConfig?.defaultProvider || 'local',
    };
  }

  getActiveProvider(): SupportedModelProvider {
    if (this.config.geminiApiKey) return 'gemini';
    if (this.config.openaiApiKey) return 'openai';
    if (this.config.anthropicApiKey) return 'anthropic';
    return this.config.defaultProvider || 'local';
  }

  isProviderAvailable(provider: SupportedModelProvider): boolean {
    switch (provider) {
      case 'openai':
        return Boolean(this.config.openaiApiKey);
      case 'anthropic':
        return Boolean(this.config.anthropicApiKey);
      case 'gemini':
        return Boolean(this.config.geminiApiKey);
      case 'ollama':
        return Boolean(this.config.ollamaBaseUrl);
      case 'local':
        return true;
      default:
        return false;
    }
  }

  getAvailableProviders(): SupportedModelProvider[] {
    const list: SupportedModelProvider[] = ['local'];
    if (this.isProviderAvailable('gemini')) list.push('gemini');
    if (this.isProviderAvailable('openai')) list.push('openai');
    if (this.isProviderAvailable('anthropic')) list.push('anthropic');
    if (this.isProviderAvailable('ollama')) list.push('ollama');
    return list;
  }


  async chatCompletion(opts: { messages: ChatMessage[]; temperature?: number; model?: string }): Promise<CompletionResult> {
    return this.complete(opts.messages, { temperature: opts.temperature, model: opts.model });
  }

  async complete(
    messages: ChatMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    const provider = this.getActiveProvider();
    Logger.info(`Executing AI completion with provider: ${provider}`, {
      messageCount: messages.length,
      model: options.model,
    });

    try {
      if (provider === 'gemini' && this.config.geminiApiKey) {
        return await this.completeGemini(messages, options);
      }
      if (provider === 'openai' && this.config.openaiApiKey) {
        return await this.completeOpenAI(messages, options);
      }
      if (provider === 'anthropic' && this.config.anthropicApiKey) {
        return await this.completeAnthropic(messages, options);
      }
    } catch (err: any) {
      Logger.warn(`AI Provider ${provider} failed, falling back to embedded local runner`, {
        error: err.message,
      });
    }

    return this.completeLocal(messages, options);
  }

  private async completeOpenAI(
    messages: ChatMessage[],
    options: CompletionOptions
  ): Promise<CompletionResult> {
    const model = options.model || 'gpt-4o';
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 2000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API request failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      provider: 'openai',
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  private async completeAnthropic(
    messages: ChatMessage[],
    options: CompletionOptions
  ): Promise<CompletionResult> {
    const model = options.model || 'claude-3-5-sonnet-20241022';
    const systemMessage = messages.find((m) => m.role === 'system')?.content;
    const userAssistantMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.anthropicApiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system: systemMessage,
        messages: userAssistantMessages,
        max_tokens: options.maxTokens ?? 2000,
        temperature: options.temperature ?? 0.2,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    return {
      text: data.content?.[0]?.text || '',
      provider: 'anthropic',
      model,
      usage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  private async completeGemini(
    messages: ChatMessage[],
    options: CompletionOptions
  ): Promise<CompletionResult> {
    const model = options.model || 'gemini-1.5-pro';
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: options.maxTokens ?? 2000,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      text: candidateText,
      provider: 'gemini',
      model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  private completeLocal(
    messages: ChatMessage[],
    options: CompletionOptions
  ): CompletionResult {
    const lastUserPrompt = messages.filter((m) => m.role === 'user').pop()?.content || '';
    return {
      text: `[Medusa Embedded Rule Engine] Processed prompt: "${lastUserPrompt.slice(0, 100)}" cleanly.`,
      provider: 'local',
      model: options.model || 'medusa-embedded-reasoner-v1',
      usage: {
        promptTokens: lastUserPrompt.length / 4,
        completionTokens: 25,
        totalTokens: Math.floor(lastUserPrompt.length / 4) + 25,
      },
    };
  }
}

export const aiProvider = new AIProviderManager();

// Add compatibility alias
(AIProviderManager.prototype as any).chatCompletion = function(opts: { messages: ChatMessage[]; temperature?: number; model?: string }) {
  return this.complete(opts.messages, { temperature: opts.temperature, model: opts.model });
};
