import { deepseek } from '@ai-sdk/deepseek';

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  temperature: 0.2,
  maxTokens: 2000,
  timeout: 30000,
};

export async function chatLLM(
  systemPrompt: string, 
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

    const response = await deepseek.chat({
      model: finalConfig.model,
      temperature: finalConfig.temperature,
      maxTokens: finalConfig.maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const content = response.content;
    if (!content) {
      throw new Error('No response content received from DeepSeek LLM');
    }

    return content;

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('LLM request timed out');
    }
    
    if (error instanceof Error && error.message.includes('API')) {
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
    
    throw new Error(`LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function chatLLMWithRetry(
  systemPrompt: string,
  messages: LLMMessage[],
  config: Partial<LLMConfig> = {},
  maxRetries: number = 3
): Promise<string> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await chatLLM(systemPrompt, messages, config);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`LLM attempt ${attempt} failed, retrying in ${delay}ms...`);
    }
  }
  
  throw lastError!;
}

