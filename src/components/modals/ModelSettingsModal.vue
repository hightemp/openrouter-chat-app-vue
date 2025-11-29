<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { useChats } from '../../composables/useChats';
import { db } from '../../db';

const emit = defineEmits(['close']);
const { currentChat, currentChatId } = useChats();

const temperature = ref(0.7);
const topP = ref(1.0);
const maxTokens = ref(0);

onMounted(() => {
  if (currentChat.value?.modelConfig) {
    temperature.value = currentChat.value.modelConfig.temperature ?? 0.7;
    topP.value = currentChat.value.modelConfig.top_p ?? 1.0;
    maxTokens.value = currentChat.value.modelConfig.max_tokens ?? 0;
  }
});

const handleSave = async () => {
  if (currentChatId.value && currentChat.value) {
    const updatedConfig = {
      ...currentChat.value.modelConfig,
      temperature: temperature.value,
      top_p: topP.value,
      max_tokens: maxTokens.value || undefined
    };
    
    await db.chats.update(currentChatId.value, {
      modelConfig: updatedConfig,
      updatedAt: Date.now()
    });
    
    // Update local state
    currentChat.value.modelConfig = updatedConfig;
  }
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Model Settings</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            Temperature: {{ temperature }}
          </label>
          <input 
            v-model.number="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="form-range"
          />
          <p class="form-hint">Higher values make output more random.</p>
        </div>

        <div class="form-group">
          <label class="form-label">
            Top P: {{ topP }}
          </label>
          <input 
            v-model.number="topP"
            type="range"
            min="0"
            max="1"
            step="0.05"
            class="form-range"
          />
          <p class="form-hint">Nucleus sampling.</p>
        </div>

        <div class="form-group">
          <label class="form-label">Max Tokens</label>
          <input 
            v-model.number="maxTokens"
            type="number"
            min="0"
            placeholder="0 for unlimited"
            class="form-input"
          />
          <p class="form-hint">0 or empty for model default.</p>
        </div>
      </div>

      <div class="modal-footer">
        <button 
          @click="$emit('close')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          class="btn btn-primary"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px var(--accent-color);
}

.form-range {
  width: 100%;
  cursor: pointer;
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
  margin-bottom: 0;
}

.modal-footer {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-secondary:hover {
  background-color: var(--bg-tertiary);
}

.btn-primary {
  background-color: var(--accent-color);
  color: white;
}

.btn-primary:hover {
  background-color: var(--accent-hover);
}

.icon {
  width: 20px;
  height: 20px;
}
</style>