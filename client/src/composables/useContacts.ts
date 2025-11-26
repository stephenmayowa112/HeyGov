import { ref, type Ref } from 'vue';
import { contactsApi } from '../services/api';
import type { Contact } from '../types';

export function useContacts() {
  const contacts: Ref<Contact[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  /**
   * Fetch all contacts with optional search query
   */
  const fetchContacts = async (query?: string) => {
    loading.value = true;
    error.value = null;

    try {
      contacts.value = await contactsApi.getContacts(query);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch contacts';
      console.error('Error fetching contacts:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a contact by ID
   */
  const deleteContact = async (id: number) => {
    loading.value = true;
    error.value = null;

    try {
      await contactsApi.deleteContact(id);
      // Remove from local state
      contacts.value = contacts.value.filter((c) => c.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete contact';
      console.error('Error deleting contact:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    deleteContact,
  };
}
