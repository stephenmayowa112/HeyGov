<script setup lang="ts">
import { ref } from 'vue';
import { Search } from 'lucide-vue-next';

const emit = defineEmits<{
  search: [query: string];
}>();

const searchQuery = ref('');
let debounceTimer: number | null = null;

const handleInput = () => {
  // Clear existing timer
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = window.setTimeout(() => {
    emit('search', searchQuery.value);
  }, 500);
};

const handleClear = () => {
  searchQuery.value = '';
  emit('search', '');
};
</script>

<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search :size="18" class="text-gray-400" />
    </div>
    <input
      v-model="searchQuery"
      @input="handleInput"
      type="text"
      placeholder="Search contacts by name or email..."
      class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
    />
    <button
      v-if="searchQuery"
      @click="handleClear"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
    >
      <span class="text-lg">×</span>
    </button>
  </div>
</template>
