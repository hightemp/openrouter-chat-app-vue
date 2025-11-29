<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { X } from 'lucide-vue-next';
import { useSettings } from '../../composables/useSettings';

const emit = defineEmits(['close']);
const { settings, saveSettings } = useSettings();

const apiKey = ref('');
const baseUrl = ref('');
const theme = ref('dark');

onMounted(() => {
  apiKey.value = settings.value.apiKey;
  baseUrl.value = settings.value.baseUrl || 'https://openrouter.ai/api/v1';
  theme.value = settings.value.theme || 'dark';
});

const handleSave = async () => {
  await saveSettings({
    apiKey: apiKey.value,
    baseUrl: baseUrl.value,
    theme: theme.value as 'light' | 'dark'
  });
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">App Settings</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">OpenRouter API Key</label>
          <input 
            v-model="apiKey"
            type="password"
            placeholder="sk-or-..."
            class="form-input"
          />
          <p class="form-hint">
            Get your key at <a href="https://openrouter.ai/keys" target="_blank" class="link">openrouter.ai/keys</a>
          </p>
        </div>

        <div class="form-group">
          <label class="form-label">API Base URL</label>
          <input 
            v-model="baseUrl"
            type="text"
            placeholder="https://openrouter.ai/api/v1"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Theme</label>
          <select v-model="theme" class="form-select">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
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

.form-input, .form-select {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 1rem;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 1px var(--accent-color);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: 4px;
  margin-bottom: 0;
}

.link {
  color: var(--accent-color);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
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