<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ArrowUp, ArrowDown, Edit2, FileText, Copy, RefreshCw, Check, X, Trash2 } from 'lucide-vue-next';
import MarkdownContent from './MarkdownContent.vue';
import type { Message, Attachment } from '../types';
import { db } from '../db';

const props = defineProps<{
  message: Message;
  isLast: boolean;
}>();

const emit = defineEmits(['regenerate', 'move-up', 'move-down', 'edit', 'delete']);

const showRaw = ref(false);
const isEditing = ref(false);
const editContent = ref('');
const attachments = ref<Attachment[]>([]);

const loadAttachments = async () => {
  if (props.message.attachmentIds && props.message.attachmentIds.length > 0) {
    attachments.value = await db.attachments.bulkGet(props.message.attachmentIds) as Attachment[];
  } else {
    attachments.value = [];
  }
};

onMounted(loadAttachments);
watch(() => props.message.attachmentIds, loadAttachments);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const toggleFormat = () => {
  showRaw.value = !showRaw.value;
};

const startEditing = () => {
  editContent.value = props.message.content;
  isEditing.value = true;
};

const saveEdit = () => {
  if (editContent.value.trim() !== props.message.content) {
    emit('edit', props.message.id, editContent.value);
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  isEditing.value = false;
};
</script>

<template>
  <div 
    class="message-item"
    :class="{ 'user': message.role === 'user', 'assistant': message.role === 'assistant' }"
  >
    <div class="message-header">
      <span class="role-badge" :class="message.role">
        {{ message.role }}
      </span>
      <span v-if="message.model" class="model-name">{{ message.model }}</span>
    </div>

    <div v-if="attachments.length > 0" class="attachments-grid">
      <div v-for="att in attachments" :key="att.id" class="attachment-wrapper">
        <img 
          v-if="att.type === 'image'" 
          :src="att.data" 
          class="attachment-img"
          :alt="att.name || 'Attachment'"
        />
      </div>
    </div>

    <div class="message-content-wrapper">
      <div v-if="isEditing" class="edit-mode">
        <textarea 
          v-model="editContent" 
          class="edit-textarea"
          rows="5"
        ></textarea>
        <div class="edit-actions">
          <button @click="saveEdit" class="action-btn confirm" title="Save">
            <Check class="icon-xs" />
          </button>
          <button @click="cancelEdit" class="action-btn cancel" title="Cancel">
            <X class="icon-xs" />
          </button>
        </div>
      </div>
      <div v-else-if="showRaw" class="raw-content">
        {{ message.content }}
      </div>
      <MarkdownContent v-else :content="message.content" />
    </div>

    <div class="message-actions" v-if="!isEditing">
      <button @click="$emit('move-up', message.id)" class="action-btn" title="Move Up">
        <ArrowUp class="icon-xs" />
      </button>
      <button @click="$emit('move-down', message.id)" class="action-btn" title="Move Down">
        <ArrowDown class="icon-xs" />
      </button>
      <button @click="startEditing" class="action-btn" title="Edit">
        <Edit2 class="icon-xs" />
      </button>
      <button 
        @click="toggleFormat" 
        class="action-btn" 
        :class="{ 'active': showRaw }"
        :title="showRaw ? 'Show Markdown' : 'Show Raw Text'"
      >
        <FileText class="icon-xs" />
      </button>
      <button
        @click="copyToClipboard"
        class="action-btn"
        title="Copy to Clipboard"
      >
        <Copy class="icon-xs" />
      </button>
      <button
        @click="$emit('delete', message.id)"
        class="action-btn delete"
        title="Delete"
      >
        <Trash2 class="icon-xs" />
      </button>
      <button
        v-if="isLast && message.role === 'assistant'"
        @click="$emit('regenerate')"
        class="action-btn"
        title="Regenerate"
      >
        <RefreshCw class="icon-xs" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.message-item {
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.message-item:hover {
  background-color: var(--bg-secondary);
}

.message-item.user {
  background-color: rgba(37, 99, 235, 0.1); /* blue-600 with opacity */
}

.message-item.assistant {
  background-color: rgba(31, 41, 55, 0.1); /* gray-800 with opacity */
}

[data-theme="dark"] .message-item.assistant {
  background-color: rgba(255, 255, 255, 0.05);
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.role-badge {
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge.user {
  color: var(--accent-color);
}

.role-badge.assistant {
  color: var(--success-color);
}

.model-name {
  margin-left: 8px;
  color: var(--text-secondary);
}

.attachments-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.attachment-wrapper {
  position: relative;
}

.attachment-img {
  max-width: 320px;
  max-height: 256px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  object-fit: contain;
  background-color: var(--bg-primary);
}

.message-content-wrapper {
  position: relative;
}

.raw-content {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-textarea {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.edit-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
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
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.active {
  color: var(--accent-color);
}

.action-btn.confirm {
  color: var(--success-color);
}

.action-btn.cancel {
  color: var(--danger-color);
}

.action-btn.delete:hover {
  color: var(--danger-color);
}

.icon-xs {
  width: 16px;
  height: 16px;
}
</style>