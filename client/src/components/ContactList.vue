<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import ContactCard from './ContactCard.vue';
import type { Contact } from '../types';

defineProps<{
  contacts: Contact[];
  loading: boolean;
}>();

const emit = defineEmits<{
  delete: [id: number];
}>();

const handleDelete = (id: number) => {
  emit('delete', id);
};
</script>

<template>
  <div class="h-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="contacts.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
      <Users :size="64" class="text-gray-300 mb-4" />
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No contacts found</h3>
      <p class="text-sm text-gray-500">Try adding a contact using the AI assistant</p>
    </div>

    <!-- Contact Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ContactCard
        v-for="contact in contacts"
        :key="contact.id"
        :contact="contact"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>
