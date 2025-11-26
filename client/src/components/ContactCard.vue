<script setup lang="ts">
import { computed } from 'vue';
import { Trash2, Mail, Phone, Calendar } from 'lucide-vue-next';
import type { Contact } from '../types';

const props = defineProps<{
  contact: Contact;
}>();

const emit = defineEmits<{
  delete: [id: number];
}>();

// Generate initials from name or email
const initials = computed(() => {
  if (props.contact.name) {
    const parts = props.contact.name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
  if (props.contact.email) {
    return props.contact.email.substring(0, 2).toUpperCase();
  }
  return '??';
});

// Format the last contacted date
const formattedLastContacted = computed(() => {
  if (!props.contact.lastContactedAt) return null;
  const date = new Date(props.contact.lastContactedAt);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
});

// Display name (fallback to email if no name)
const displayName = computed(() => {
  return props.contact.name || props.contact.email || 'Unknown';
});

const handleDelete = () => {
  emit('delete', props.contact.id);
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between">
      <!-- Avatar and Info -->
      <div class="flex items-start gap-3 flex-1">
        <!-- Avatar Circle -->
        <div class="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          {{ initials }}
        </div>

        <!-- Contact Details -->
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ displayName }}
          </h3>

          <!-- Email -->
          <div v-if="contact.email" class="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
            <Mail :size="14" />
            <span class="truncate">{{ contact.email }}</span>
          </div>

          <!-- Phone -->
          <div v-if="contact.phone" class="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
            <Phone :size="14" />
            <span>{{ contact.phone }}</span>
          </div>

          <!-- Last Contacted -->
          <div v-if="formattedLastContacted" class="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
            <Calendar :size="12" />
            <span>Last contacted: {{ formattedLastContacted }}</span>
          </div>

          <!-- Notes Preview -->
          <div v-if="contact.notes" class="mt-2 text-xs text-gray-500 line-clamp-2">
            {{ contact.notes }}
          </div>
        </div>
      </div>

      <!-- Delete Button -->
      <button
        @click="handleDelete"
        class="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
        title="Delete contact"
      >
        <Trash2 :size="18" />
      </button>
    </div>
  </div>
</template>
