<script setup lang="ts">
import MessagesList from './MessagesList.vue';
import Composer from './Composer.vue';
import { useChats } from '../composables/useChats';

const { currentChat } = useChats();
</script>

<template>
  <div class="chat-view-container">
    <div v-if="!currentChat" class="empty-state">
      Select or create a chat to start messaging
    </div>
    <template v-else>
      <MessagesList />
      <Composer />
    </template>
  </div>
</template>

<style scoped>
.chat-view-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: 1rem;
}
</style>