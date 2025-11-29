import { ref } from 'vue';
import { db } from '../db';
import { fetchModels } from '../api/openrouter';
import type { ModelInfo } from '../types';
import { useSettings } from './useSettings';

const models = ref<ModelInfo[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useModels() {
  const { settings } = useSettings();

  const loadModels = async (force = false) => {
    if (!force && models.value.length > 0) return;

    isLoading.value = true;
    error.value = null;

    try {
      // Try cache first
      const cached = await db.modelsCache.toArray();
      if (cached.length > 0 && !force) {
        models.value = cached;
        isLoading.value = false;
        // Background update if needed could go here
        return;
      }

      if (!settings.value.apiKey) {
        // Can't fetch without API key
        return;
      }

      const fetched = await fetchModels(settings.value.apiKey, settings.value.baseUrl);
      models.value = fetched;
      
      // Update cache
      await db.modelsCache.clear();
      await db.modelsCache.bulkAdd(fetched);
    } catch (e: any) {
      console.error('Failed to load models:', e);
      error.value = e.message;
    } finally {
      isLoading.value = false;
    }
  };

  const filterModels = (query: string) => {
    if (!query) return models.value;
    const lower = query.toLowerCase();
    return models.value.filter(m => 
      m.name.toLowerCase().includes(lower) || 
      m.id.toLowerCase().includes(lower)
    );
  };

  return {
    models,
    isLoading,
    error,
    loadModels,
    filterModels
  };
}