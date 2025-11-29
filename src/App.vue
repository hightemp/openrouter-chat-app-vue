<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import TopBar from './components/TopBar.vue';
import ChatList from './components/ChatList.vue';
import ChatView from './components/ChatView.vue';
import AppSettingsModal from './components/modals/AppSettingsModal.vue';
import ModelSettingsModal from './components/modals/ModelSettingsModal.vue';
import { useSettings } from './composables/useSettings';
import { useChats } from './composables/useChats';

const { settings, loadSettings } = useSettings();
const { loadChats } = useChats();

const showAppSettings = ref(false);
const showModelSettings = ref(false);

onMounted(async () => {
  await loadSettings();
  await loadChats();
  applyTheme();
});

watch(() => settings.value.theme, applyTheme);

function applyTheme() {
  const theme = settings.value.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}
</script>

<template>
  <div class="app-container">
    <TopBar 
      @open-settings="showAppSettings = true"
      @open-model-settings="showModelSettings = true"
    />
    
    <div class="main-content">
      <ChatList class="sidebar" />
      <ChatView class="chat-view" />
    </div>

    <AppSettingsModal 
      v-if="showAppSettings" 
      @close="showAppSettings = false" 
    />
    
    <ModelSettingsModal 
      v-if="showModelSettings" 
      @close="showModelSettings = false" 
    />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 260px;
  border-right: 1px solid var(--border-color);
  flex-shrink: 0;
}

.chat-view {
  flex: 1;
}
</style>
