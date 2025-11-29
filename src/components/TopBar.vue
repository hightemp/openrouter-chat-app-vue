<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Settings, Sliders, ChevronDown } from 'lucide-vue-next';
import { useChats } from '../composables/useChats';
import { useModels } from '../composables/useModels';

const emit = defineEmits(['open-settings', 'open-model-settings']);

const { currentChat, updateChatModel } = useChats();
const { loadModels, filterModels } = useModels();

const searchQuery = ref('');
const showModelDropdown = ref(false);

const filteredModels = computed(() => filterModels(searchQuery.value));

const selectModel = (modelId: string) => {
  if (currentChat.value) {
    updateChatModel(currentChat.value.id, modelId);
  }
  showModelDropdown.value = false;
};

// Load models when dropdown opens
watch(showModelDropdown, (newVal) => {
  if (newVal) {
    loadModels();
  }
});
</script>

<template>
  <div class="top-bar">
    <div class="logo-section">
      <h1 class="app-title">OpenRouter Chat</h1>
    </div>

    <div class="center-section" v-if="currentChat">
      <div class="model-selector-container">
        <button 
          @click="showModelDropdown = !showModelDropdown"
          class="model-selector-btn"
        >
          <span class="model-name">{{ currentChat.modelConfig.model || 'Select Model' }}</span>
          <ChevronDown class="icon-sm" />
        </button>

        <div v-if="showModelDropdown" class="dropdown-menu">
          <div class="search-container">
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search models..."
              class="search-input"
              @click.stop
            />
          </div>
          <div class="models-list">
            <button 
              v-for="model in filteredModels" 
              :key="model.id"
              @click="selectModel(model.id)"
              class="model-item"
              :class="{ 'active': model.id === currentChat.modelConfig.model }"
            >
              <div class="model-item-name">{{ model.name }}</div>
              <div class="model-item-id">{{ model.id }}</div>
            </button>
            <div v-if="filteredModels.length === 0" class="no-models">
              No models found
            </div>
          </div>
        </div>
      </div>

      <button 
        @click="$emit('open-model-settings')"
        class="icon-btn"
        title="Model Settings"
      >
        <Sliders class="icon" />
      </button>
    </div>

    <div class="right-section">
      <button 
        @click="$emit('open-settings')"
        class="icon-btn"
        title="App Settings"
      >
        <Settings class="icon" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.top-bar {
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--bg-secondary);
}

.app-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.center-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
  max-width: 600px;
}

.model-selector-container {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.model-selector-btn {
  width: 100%;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 0.875rem;
}

.model-selector-btn:hover {
  background-color: var(--bg-primary); /* Slightly lighter/darker depending on theme logic, using primary for contrast */
  filter: brightness(1.1);
}

.model-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 4px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-height: 384px;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 8px;
  border-bottom: 1px solid var(--border-color);
}

.search-input {
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  font-size: 0.875rem;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.models-list {
  overflow-y: auto;
  flex: 1;
}

.model-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  border-bottom: 1px solid transparent;
}

.model-item:hover {
  background-color: var(--bg-tertiary);
}

.model-item.active {
  background-color: var(--bg-tertiary);
  border-left: 3px solid var(--accent-color);
}

.model-item-name {
  font-size: 0.875rem;
}

.model-item-id {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.no-models {
  padding: 12px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 0.875rem;
}

.icon-btn {
  padding: 8px;
  border-radius: 4px;
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.icon {
  width: 20px;
  height: 20px;
}

.icon-sm {
  width: 16px;
  height: 16px;
  color: var(--text-tertiary);
  margin-left: 8px;
}
</style>