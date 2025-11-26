import axios from 'axios';
import type { Contact, ApiResponse, AgentResponse } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Contacts API
export const contactsApi = {
  /**
   * Get all contacts with optional search query
   */
  async getContacts(query?: string): Promise<Contact[]> {
    const params = query ? { q: query } : {};
    const response = await api.get<ApiResponse<Contact[]>>('/contacts', { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch contacts');
    }
    return response.data.data;
  },

  /**
   * Create a new contact
   */
  async createContact(data: Partial<Contact>): Promise<Contact> {
    const response = await api.post<ApiResponse<Contact>>('/contacts', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create contact');
    }
    return response.data.data;
  },

  /**
   * Update an existing contact
   */
  async updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
    const response = await api.put<ApiResponse<Contact>>(`/contacts/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update contact');
    }
    return response.data.data;
  },

  /**
   * Delete a contact
   */
  async deleteContact(id: number): Promise<Contact> {
    const response = await api.delete<ApiResponse<Contact>>(`/contacts/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to delete contact');
    }
    return response.data.data;
  },
};

// Agent API
export const agentApi = {
  /**
   * Send a prompt to the AI agent
   */
  async askAgent(prompt: string): Promise<AgentResponse> {
    const response = await api.post<AgentResponse>('/agent', { prompt });
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to process agent request');
    }
    return response.data;
  },
};

export default api;
