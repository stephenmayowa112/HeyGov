<script setup lang="ts">
import { onMounted } from 'vue';
import { useContacts } from './composables/useContacts';
import ContactList from './components/ContactList.vue';
import AgentChat from './components/AgentChat.vue';
import SearchBar from './components/SearchBar.vue';

const { contacts, loading, fetchContacts, deleteContact } = useContacts();

// Fetch contacts on mount
onMounted(() => {
  fetchContacts();
});

// Handle search
const handleSearch = (query: string) => {
  fetchContacts(query);
};

// Handle delete
const handleDelete = async (id: number) => {
  if (confirm('Are you sure you want to delete this contact?')) {
    try {
      await deleteContact(id);
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  }
};

// Handle refresh from agent chat
const handleRefresh = () => {
  fetchContacts();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HeyGov CRM
          </h1>
          <div class="w-full max-w-md ml-8">
            <SearchBar @search="handleSearch" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6 h-[calc(100vh-12rem)]">
        <!-- Contact List (Left/Center - 70%) -->
        <div class="flex-1 overflow-y-auto pr-2">
          <ContactList
            :contacts="contacts"
            :loading="loading"
            @delete="handleDelete"
          />
        </div>

        <!-- Agent Chat (Right - 30%) -->
        <div class="w-[400px] shrink-0">
          <div class="sticky top-0 h-[calc(100vh-12rem)]">
            <AgentChat @refresh="handleRefresh" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

