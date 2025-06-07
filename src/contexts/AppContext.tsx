import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, PageType, User, Agent, Usage } from '../types';

interface AppContextValue extends AppState {
  navigate: (page: PageType, agentId?: string) => void;
  login: (user: User) => void;
  logout: () => void;
  agents: Agent[];
  myAgents: Agent[];
  myUsages: Usage[];
  featuredAgents: Agent[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

type AppAction = 
  | { type: 'NAVIGATE'; payload: { page: PageType; agentId?: string } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  currentPage: 'landing',
  isAuthenticated: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.payload.page,
        selectedAgentId: action.payload.agentId,
      };
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: undefined,
        isAuthenticated: false,
        currentPage: 'landing',
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const navigate = (page: PageType, agentId?: string) => {
    dispatch({ type: 'NAVIGATE', payload: { page, agentId } });
  };

  const login = (user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Mock data - in a real app, this would come from API calls
  const agents: Agent[] = [
    {
      id: '1',
      creatorId: 'creator1',
      creator: { id: 'creator1', email: 'sarah@example.com', name: 'Sarah Chen', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      name: 'Blog Post Writer',
      description: 'Generate engaging blog posts on any topic with SEO optimization',
      systemPrompt: 'You are an expert content writer specializing in blog posts...',
      inputSchema: [
        { name: 'topic', type: 'text', label: 'Topic', placeholder: 'Enter your blog topic', required: true },
        { name: 'tone', type: 'select', label: 'Tone', required: true, options: ['Professional', 'Casual', 'Humorous'] },
        { name: 'length', type: 'select', label: 'Length', required: true, options: ['Short (500 words)', 'Medium (1000 words)', 'Long (1500+ words)'] }
      ],
      pricePerUse: 2.99,
      category: 'Content Creation',
      tags: ['writing', 'blog', 'seo', 'content'],
      rating: 4.8,
      totalUses: 1247,
      revenue: 3729.53,
      active: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: '2',
      creatorId: 'creator2',
      creator: { id: 'creator2', email: 'mike@example.com', name: 'Mike Rodriguez', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      name: 'Code Reviewer',
      description: 'Professional code review with best practices and optimization suggestions',
      systemPrompt: 'You are a senior software engineer providing code reviews...',
      inputSchema: [
        { name: 'code', type: 'textarea', label: 'Code to Review', placeholder: 'Paste your code here', required: true },
        { name: 'language', type: 'select', label: 'Programming Language', required: true, options: ['JavaScript', 'Python', 'Java', 'TypeScript', 'Go'] }
      ],
      pricePerUse: 4.99,
      category: 'Development',
      tags: ['code', 'review', 'programming', 'best-practices'],
      rating: 4.9,
      totalUses: 892,
      revenue: 4451.08,
      active: true,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: '3',
      creatorId: 'creator3',
      creator: { id: 'creator3', email: 'alex@example.com', name: 'Alex Kim', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      name: 'Marketing Copy Generator',
      description: 'Create compelling marketing copy for ads, emails, and landing pages',
      systemPrompt: 'You are a master copywriter with expertise in direct response marketing...',
      inputSchema: [
        { name: 'product', type: 'text', label: 'Product/Service', placeholder: 'What are you selling?', required: true },
        { name: 'audience', type: 'text', label: 'Target Audience', placeholder: 'Describe your ideal customer', required: true },
        { name: 'format', type: 'select', label: 'Copy Format', required: true, options: ['Email Subject', 'Ad Headline', 'Landing Page', 'Social Media Post'] }
      ],
      pricePerUse: 1.99,
      category: 'Marketing',
      tags: ['marketing', 'copywriting', 'ads', 'conversion'],
      rating: 4.7,
      totalUses: 2156,
      revenue: 4290.44,
      active: true,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-22'
    }
  ];

  const myAgents = state.isAuthenticated ? agents.slice(0, 2) : [];
  const myUsages: Usage[] = [];
  const featuredAgents = agents.slice(0, 3);

  const value: AppContextValue = {
    ...state,
    navigate,
    login,
    logout,
    agents,
    myAgents,
    myUsages,
    featuredAgents,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}