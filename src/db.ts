import Dexie, { type Table } from 'dexie';
import type { Chat, Message, Attachment, Settings, ModelInfo } from './types';

export class AppDatabase extends Dexie {
  chats!: Table<Chat>;
  messages!: Table<Message>;
  attachments!: Table<Attachment>;
  settings!: Table<Settings>;
  modelsCache!: Table<ModelInfo>;

  constructor() {
    super('OpenRouterChatDB');
    this.version(1).stores({
      chats: 'id, updatedAt',
      messages: 'id, chatId, timestamp',
      attachments: 'id',
      settings: '++id', // Singleton, id=1
      modelsCache: 'id'
    });
  }
}

export const db = new AppDatabase();