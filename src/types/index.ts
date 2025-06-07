export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  creatorId: string;
  creator: User;
  name: string;
  description: string;
  systemPrompt: string;
  inputSchema: InputField[];
  pricePerUse: number;
  category: string;
  tags: string[];
  rating: number;
  totalUses: number;
  revenue: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InputField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface Usage {
  id: string;
  userId: string;
  agentId: string;
  agent: Agent;
  inputData: Record<string, any>;
  outputData: string;
  cost: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export type PageType = 'landing' | 'marketplace' | 'agent-detail' | 'create-agent' | 'dashboard' | 'profile';

export interface AppState {
  currentPage: PageType;
  selectedAgentId?: string;
  user?: User;
  isAuthenticated: boolean;
}