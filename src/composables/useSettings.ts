import { ref, onMounted } from 'vue';
import { db } from '../db';
import type { Settings } from '../types';

const settings = ref<Settings>({
  apiKey: '',
  theme: 'dark',
});

export function useSettings() {
  const loadSettings = async () => {
    const saved = await db.settings.get(1);
    if (saved) {
      settings.value = { ...settings.value, ...saved };
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    settings.value = { ...settings.value, ...newSettings };
    await db.settings.put({ ...settings.value, id: 1 });
  };

  onMounted(() => {
    loadSettings();
  });

  return {
    settings,
    loadSettings,
    saveSettings,
  };
}