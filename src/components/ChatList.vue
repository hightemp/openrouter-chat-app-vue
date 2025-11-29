<script setup lang="ts">
import { ref } from 'vue';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-vue-next';
import { useChats } from '../composables/useChats';

const { chats, currentChatId, createChat, selectChat, deleteChat, updateChatTitle } = useChats();

const editingChatId = ref<string | null>(null);
const editTitle = ref('');

const startEditing = (chat: any) => {
  editingChatId.value = chat.id;
  editTitle.value = chat.title;
};

const saveTitle = async () => {
  if (editingChatId.value && editTitle.value.trim()) {
    await updateChatTitle(editingChatId.value, editTitle.value.trim());
  }
  editingChatId.value = null;
};

const cancelEditing = () => {
  editingChatId.value = null;
};

const handleCreateChat = async () => {
  await createChat();
};

const handleDeleteChat = async (id: string) => {
  if (confirm('Are you sure you want to delete this chat?')) {
    await deleteChat(id);
  }
};
</script>

<template>
  <div class="chat-list-container">
    <div class="new-chat-section">
      <button 
        @click="handleCreateChat"
        class="new-chat-btn"
      >
        <Plus class="icon" />
        <span>New Chat</span>
      </button>
    </div>

    <div class="chats-scroll-area">
      <div 
        v-for="chat in chats" 
        :key="chat.id"
        class="chat-item"
        :class="{ 'active': currentChatId === chat.id }"
        @click="selectChat(chat.id)"
      >
        <div class="chat-item-content">
          <MessageSquare class="chat-icon" />
          
          <div v-if="editingChatId === chat.id" class="edit-container" @click.stop>
            <input 
              v-model="editTitle"
              type="text"
              class="edit-input"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEditing"
              autoFocus
            />
            <button @click="saveTitle" class="action-btn confirm">
              <Check class="icon-xs" />
            </button>
            <button @click="cancelEditing" class="action-btn cancel">
              <X class="icon-xs" />
            </button>
          </div>

          <div v-else class="chat-info">
            <h3 class="chat-title">{{ chat.title }}</h3>
            <p class="chat-date">{{ new Date(chat.updatedAt).toLocaleDateString() }}</p>
          </div>

          <div v-if="editingChatId !== chat.id" class="chat-actions">
            <button 
              @click.stop="startEditing(chat)"
              class="action-btn"
            >
              <Edit2 class="icon-xs" />
            </button>
            <button 
              @click.stop="handleDeleteChat(chat.id)"
              class="action-btn delete"
            >
              <Trash2 class="icon-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
}

.new-chat-section {
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  background-color: var(--accent-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  background-color: var(--accent-hover);
}

.chats-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.chat-item {
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.chat-item:hover {
  background-color: var(--bg-tertiary);
}

.chat-item.active {
  background-color: var(--bg-tertiary);
}

.chat-item-content {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-icon {
  width: 20px;
  height: 20px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.chat-actions {
  display: none;
  align-items: center;
  gap: 4px;
}

.chat-item:hover .chat-actions {
  display: flex;
}

.action-btn {
  padding: 4px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.action-btn.delete:hover {
  color: var(--danger-color);
}

.action-btn.confirm {
  color: var(--success-color);
}

.action-btn.cancel {
  color: var(--danger-color);
}

.edit-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

.edit-input {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
}

.edit-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-xs {
  width: 16px;
  height: 16px;
}
</style>