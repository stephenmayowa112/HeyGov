<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { Send, Bot, User, Loader2 } from 'lucide-vue-next';
import { agentApi } from '../services/api';
import type { ChatMessage } from '../types';

const emit = defineEmits<{
  refresh: [];
}>();

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  const prompt = inputMessage.value.trim();
  if (!prompt || isLoading.value) return;

  // Add user message
  messages.value.push({
    role: 'user',
    content: prompt,
    timestamp: new Date(),
  });

  inputMessage.value = '';
  scrollToBottom();

  // Set loading state
  isLoading.value = true;

  try {
    // Call the agent API
    const response = await agentApi.askAgent(prompt);

    // Add assistant response
    messages.value.push({
      role: 'assistant',
      content: response.response,
      timestamp: new Date(),
    });

    scrollToBottom();

    // Emit refresh event to update contact list
    emit('refresh');
  } catch (error) {
    console.error('Error calling agent:', error);
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error processing your request. Please try again.',
      timestamp: new Date(),
    });
    scrollToBottom();
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-lg border border-gray-200">
    <!-- Header -->
    <div class="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
      <Bot :size="24" class="text-blue-600" />
      <div>
        <h2 class="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <p class="text-xs text-gray-600">Ask me to manage your contacts</p>
      </div>
    </div>

    <!-- Chat History -->
    <div
      ref="chatContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4"
    >
      <!-- Welcome Message -->
      <div v-if="messages.length === 0" class="text-center text-gray-500 mt-8">
        <Bot :size="48" class="mx-auto text-gray-300 mb-3" />
        <p class="text-sm">Hi! I'm your CRM assistant.</p>
        <p class="text-xs mt-1">Try saying:</p>
        <div class="mt-3 space-y-1 text-xs text-gray-400">
          <p>"I met Alex today"</p>
          <p>"Who did I contact last week?"</p>
          <p>"Add Sarah with email sarah@example.com"</p>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="[
          'flex gap-3',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- Assistant Icon -->
        <div
          v-if="message.role === 'assistant'"
          class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0"
        >
          <Bot :size="16" class="text-blue-600" />
        </div>

        <!-- Message Bubble -->
        <div
          :class="[
            'max-w-[80%] rounded-lg px-4 py-2.5',
            message.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          ]"
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
          <p
            :class="[
              'text-xs mt-1',
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
            ]"
          >
            {{ message.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>

        <!-- User Icon -->
        <div
          v-if="message.role === 'user'"
          class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0"
        >
          <User :size="16" class="text-purple-600" />
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isLoading" class="flex gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Bot :size="16" class="text-blue-600" />
        </div>
        <div class="bg-gray-100 rounded-lg px-4 py-2.5">
          <div class="flex items-center gap-2">
            <Loader2 :size="16" class="animate-spin text-gray-500" />
            <span class="text-sm text-gray-600">Thinking...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex gap-2">
        <input
          v-model="inputMessage"
          @keypress="handleKeyPress"
          :disabled="isLoading"
          type="text"
          placeholder="Type your message..."
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          @click="sendMessage"
          :disabled="!inputMessage.trim() || isLoading"
          class="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Send :size="18" />
        </button>
      </div>
      <p class="text-xs text-gray-500 mt-2">Press Enter to send</p>
    </div>
  </div>
</template>
