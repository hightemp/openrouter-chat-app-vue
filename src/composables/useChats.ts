import { ref, computed } from 'vue';
import { db } from '../db';
import { nanoid } from 'nanoid';
import type { Chat, Message, Attachment, Role } from '../types';
import { createChatCompletion } from '../api/openrouter';
import { useSettings } from './useSettings';

const chats = ref<Chat[]>([]);
const currentChatId = ref<string | null>(null);
const messages = ref<Message[]>([]);
const isGenerating = ref(false);

export function useChats() {
  const { settings } = useSettings();

  const currentChat = computed(() => 
    chats.value.find(c => c.id === currentChatId.value)
  );

  const loadChats = async () => {
    chats.value = await db.chats.orderBy('updatedAt').reverse().toArray();
  };

  const loadMessages = async (chatId: string) => {
    messages.value = await db.messages
      .where('chatId')
      .equals(chatId)
      .sortBy('timestamp');
  };

  const selectChat = async (chatId: string) => {
    currentChatId.value = chatId;
    await loadMessages(chatId);
  };

  const createChat = async (title: string = 'New Chat', model: string = 'openai/gpt-3.5-turbo') => {
    const newChat: Chat = {
      id: nanoid(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelConfig: { model }
    };
    await db.chats.add(newChat);
    chats.value.unshift(newChat);
    await selectChat(newChat.id);
    return newChat;
  };

  const deleteChat = async (chatId: string) => {
    await db.chats.delete(chatId);
    await db.messages.where('chatId').equals(chatId).delete();
    chats.value = chats.value.filter(c => c.id !== chatId);
    if (currentChatId.value === chatId) {
      currentChatId.value = null;
      messages.value = [];
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    await db.chats.update(chatId, { title, updatedAt: Date.now() });
    const chat = chats.value.find(c => c.id === chatId);
    if (chat) chat.title = title;
  };
  
  const updateChatModel = async (chatId: string, model: string) => {
      await db.chats.update(chatId, { 
          modelConfig: { ...currentChat.value?.modelConfig, model },
          updatedAt: Date.now() 
      });
      const chat = chats.value.find(c => c.id === chatId);
      if (chat && chat.modelConfig) chat.modelConfig.model = model;
  };

  const addMessage = async (role: Role, content: string, attachmentIds: string[] = [], model?: string) => {
    if (!currentChatId.value) return;

    const newMessage: Message = {
      id: nanoid(),
      chatId: currentChatId.value,
      role,
      content,
      timestamp: Date.now(),
      attachmentIds,
      model
    };

    await db.messages.add(newMessage);
    messages.value.push(newMessage);
    
    // Update chat timestamp
    await db.chats.update(currentChatId.value, { updatedAt: Date.now() });
    const chatIndex = chats.value.findIndex(c => c.id === currentChatId.value);
    if (chatIndex !== -1) {
        const chat = chats.value[chatIndex];
        if (chat) {
            chat.updatedAt = Date.now();
            chats.value.splice(chatIndex, 1);
            chats.value.unshift(chat);
        }
    }

    return newMessage;
  };

  const sendMessage = async (content: string, attachments: Attachment[] = []) => {
    if (!currentChatId.value || !settings.value.apiKey) return;

    // Save attachments first
    const attachmentIds: string[] = [];
    if (attachments.length > 0) {
      await db.attachments.bulkAdd(attachments);
      attachmentIds.push(...attachments.map(a => a.id));
    }

    // Add user message
    await addMessage('user', content, attachmentIds);

    isGenerating.value = true;

    try {
      // Prepare context
      // TODO: Add pagination/limit logic for large chats

      // Handle multimodal content for current message
      const currentMsgContent: any[] = [{ type: 'text', text: content }];
      for (const att of attachments) {
          if (att.type === 'image') {
              currentMsgContent.push({
                  type: 'image_url',
                  image_url: { url: att.data }
              });
          }
      }
      
      // Replace last message content with multimodal structure for API
      const apiMessages = messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: 'user', content: currentMsgContent as any });


      const response = await createChatCompletion(settings.value.apiKey, {
        model: currentChat.value?.modelConfig.model || 'openai/gpt-3.5-turbo',
        messages: apiMessages,
        temperature: currentChat.value?.modelConfig.temperature,
        top_p: currentChat.value?.modelConfig.top_p,
        max_tokens: currentChat.value?.modelConfig.max_tokens,
      }, settings.value.baseUrl);

      const data = await response.json();
      const assistantMessage = data.choices[0].message;
      
      await addMessage('assistant', assistantMessage.content, [], data.model);

    } catch (e) {
      console.error('Failed to send message:', e);
      await addMessage('system', `Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      isGenerating.value = false;
    }
  };
  
  const regenerateLastMessage = async () => {
      if (!currentChatId.value || messages.value.length === 0) return;
      
      const lastMsg = messages.value[messages.value.length - 1];
      if (lastMsg && lastMsg.role === 'assistant') {
          // Remove last assistant message
          await db.messages.delete(lastMsg.id);
          messages.value.pop();
          
          // Trigger generation again (need to reconstruct the call, simplified here)
          // Ideally we need the last user message content and attachments
          // For MVP, just re-triggering logic similar to sendMessage but without adding user message
          // This requires refactoring sendMessage to separate "add user msg" from "call api"
          
          // Quick fix: get last user message
          const lastUserMsg = messages.value[messages.value.length - 1];
          if (lastUserMsg && lastUserMsg.role === 'user') {
             // We need to re-construct attachments if any
             // This is complex because we need to fetch from DB.
             // For now, let's just say "Regeneration not fully implemented for attachments"
             // or try to re-send text content.
             
             isGenerating.value = true;
             try {
                 const apiMessages = messages.value.map(m => ({ role: m.role, content: m.content }));
                 const response = await createChatCompletion(settings.value.apiKey, {
                    model: currentChat.value?.modelConfig.model || 'openai/gpt-3.5-turbo',
                    messages: apiMessages,
                 }, settings.value.baseUrl);
                 
                 const data = await response.json();
                 await addMessage('assistant', data.choices[0].message.content, [], data.model);
             } catch (e) {
                 console.error(e);
                 await addMessage('system', `Error regenerating: ${e}`);
             } finally {
                 isGenerating.value = false;
             }
          }
      }
  };

  return {
    chats,
    currentChatId,
    currentChat,
    messages,
    isGenerating,
    loadChats,
    selectChat,
    createChat,
    deleteChat,
    updateChatTitle,
    updateChatModel,
    sendMessage,
    regenerateLastMessage
  };
}