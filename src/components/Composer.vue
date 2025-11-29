<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Send, Paperclip, X } from 'lucide-vue-next';
import { useChats } from '../composables/useChats';
import { nanoid } from 'nanoid';
import type { Attachment } from '../types';

const { sendMessage, isGenerating } = useChats();

const input = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const attachments = ref<Attachment[]>([]);

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`;
  }
};

const handleSend = async () => {
  if ((!input.value.trim() && attachments.value.length === 0) || isGenerating.value) return;
  
  const content = input.value;
  const currentAttachments = [...attachments.value];
  
  input.value = '';
  attachments.value = [];
  if (textareaRef.value) textareaRef.value.style.height = 'auto';
  
  await sendMessage(content, currentAttachments);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleFileSelect = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        attachments.value.push({
          id: nanoid(),
          type: 'image',
          data: e.target?.result as string,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  }
  // Reset input
  (e.target as HTMLInputElement).value = '';
};

const removeAttachment = (id: string) => {
  attachments.value = attachments.value.filter(a => a.id !== id);
};

// Paste handler for images
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        const reader = new FileReader();
        reader.onload = (event) => {
          attachments.value.push({
            id: nanoid(),
            type: 'image',
            data: event.target?.result as string,
            name: 'Pasted Image'
          });
        };
        reader.readAsDataURL(blob);
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste);
});
</script>

<template>
  <div class="composer-container">
    <div v-if="attachments.length > 0" class="attachments-preview">
      <div v-for="att in attachments" :key="att.id" class="attachment-thumb-wrapper">
        <img :src="att.data" class="attachment-thumb" />
        <button 
          @click="removeAttachment(att.id)"
          class="remove-attachment-btn"
        >
          <X class="icon-xs" />
        </button>
      </div>
    </div>

    <div class="input-area">
      <label class="attach-btn">
        <Paperclip class="icon" />
        <input type="file" multiple accept="image/*" class="hidden-input" @change="handleFileSelect" />
      </label>
      
      <textarea
        ref="textareaRef"
        v-model="input"
        @input="adjustHeight"
        @keydown="handleKeyDown"
        placeholder="Type a message..."
        rows="1"
        class="message-input"
      ></textarea>
      
      <button 
        @click="handleSend"
        :disabled="(!input.trim() && attachments.length === 0) || isGenerating"
        class="send-btn"
      >
        <Send class="icon" />
      </button>
    </div>
    <div class="hint-text">
      Shift + Enter for new line
    </div>
  </div>
</template>

<style scoped>
.composer-container {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.attachment-thumb-wrapper {
  position: relative;
}

.attachment-thumb {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.remove-attachment-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  padding: 2px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.attachment-thumb-wrapper:hover .remove-attachment-btn {
  opacity: 1;
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background-color: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 8px;
}

.input-area:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px var(--accent-color);
}

.attach-btn {
  padding: 8px;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-btn:hover {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.hidden-input {
  display: none;
}

.message-input {
  flex: 1;
  background: transparent;
  color: var(--text-primary);
  border: none;
  resize: none;
  padding: 8px 0;
  max-height: 192px;
  font-family: inherit;
  font-size: 1rem;
}

.message-input:focus {
  outline: none;
}

.message-input::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  padding: 8px;
  border-radius: 4px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: var(--accent-hover);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
  text-align: center;
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-xs {
  width: 12px;
  height: 12px;
}
</style>