export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  type: 'image';
  data: string; // base64 data url
  name?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: Role;
  content: string;
  timestamp: number;
  attachmentIds?: string[];
  model?: string; // Модель, которая сгенерировала ответ (для assistant)
}

export interface ModelConfig {
  model: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  modelConfig: ModelConfig;
}

export interface Settings {
  id?: number; // Dexie auto-increment key (usually 1 for singleton)
  apiKey: string;
  baseUrl?: string; // Опционально, если пользователь захочет сменить endpoint
  theme?: 'light' | 'dark';
}

export interface ModelInfo {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}