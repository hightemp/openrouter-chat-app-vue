import type { ModelInfo } from '../types';

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatCompletionRequest {
  model: string;
  messages: {
    role: string;
    content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  }[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export async function fetchModels(apiKey: string, baseUrl: string = DEFAULT_BASE_URL): Promise<ModelInfo[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

export async function createChatCompletion(
  apiKey: string,
  request: ChatCompletionRequest,
  baseUrl: string = DEFAULT_BASE_URL
): Promise<Response> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin, // Required by OpenRouter
      'X-Title': 'OpenRouter Chat App Vue', // Optional
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorBody}`);
  }

  return response;
}