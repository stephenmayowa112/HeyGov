export interface Contact {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  lastContactedAt: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  toolsUsed?: string[];
  error?: string;
  message?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
