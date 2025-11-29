<script setup lang="ts">
import { ref, onUpdated, nextTick, watch } from 'vue';
import MessageItem from './MessageItem.vue';
import { useChats } from '../composables/useChats';

const { messages, isGenerating, regenerateLastMessage } = useChats();
const containerRef = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
};

watch(() => messages.value.length, scrollToBottom);
onUpdated(scrollToBottom);
</script>

<template>
  <div ref="containerRef" class="messages-list-container">
    <div v-if="messages.length === 0" class="empty-messages">
      <p class="empty-title">No messages yet</p>
      <p class="empty-subtitle">Start a conversation by typing below.</p>
    </div>
    
    <MessageItem 
      v-for="(msg, index) in messages" 
      :key="msg.id" 
      :message="msg" 
      :is-last="index === messages.length - 1"
      @regenerate="regenerateLastMessage"
    />

    <div v-if="isGenerating" class="thinking-indicator">
      <div class="dot" style="animation-delay: 0ms"></div>
      <div class="dot" style="animation-delay: 150ms"></div>
      <div class="dot" style="animation-delay: 300ms"></div>
      <span class="thinking-text">Thinking...</span>
    </div>
  </div>
</template>

<style scoped>
.messages-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-messages {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  margin: 0;
}

.thinking-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: var(--text-tertiary);
}

.dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-color);
  border-radius: 50%;
  animation: bounce 1s infinite;
}

.thinking-text {
  font-size: 0.875rem;
  margin-left: 8px;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>