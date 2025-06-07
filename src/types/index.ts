// Updated types to match database schema exactly
export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  created_at: string
  updated_at: string
  gumroad_creator_id?: string | null
}

export interface AIModel {
  id: string
  provider: 'openai' | 'anthropic' | 'google'
  model_name: string
  display_name: string
  description: string | null
  cost_per_1k_tokens: number
  is_free: boolean
  is_available: boolean
  requires_pro: boolean
  max_tokens: number
  created_at?: string
}

export interface Agent {
  id: string
  creator_id: string
  creator?: User
  name: string
  description: string
  system_prompt: string
  input_schema: InputField[]
  ai_provider: 'openai' | 'anthropic' | 'google'
  ai_model_id: string
  ai_model?: AIModel
  price_per_use: number
  category: string
  tags: string[]
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  total_uses: number
  total_revenue: number
  average_rating: number
  rating_count: number
  created_at: string
  updated_at: string
}

export interface InputField {
  name: string
  type: 'text' | 'textarea' | 'number' | 'select'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

export interface Usage {
  id: string
  user_id: string
  agent_id: string
  agent?: Agent
  input_data: Record<string, any>
  output_data: string | null
  tokens_used: number | null
  cost: number
  status: 'pending' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
  credits_used?: number
  payment_method?: string
}

export interface AgentRating {
  id: string
  user_id: string
  agent_id: string
  rating: number
  review: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  description: string | null
  agent_id: string | null
  usage_id: string | null
  status: string
  created_at: string
  gumroad_sale_id?: string | null
  gumroad_order_id?: string | null
}

export interface UserBalance {
  user_id: string
  available_balance: number
  pending_balance: number
  total_earned: number
  updated_at: string
}

export interface AgentCredits {
  id: string
  user_id: string
  agent_id: string
  credits_remaining: number
  total_credits_purchased: number
  gumroad_purchase_id: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type PageType = 'landing' | 'marketplace' | 'agent-detail' | 'create-agent' | 'dashboard' | 'profile'

export interface AppState {
  currentPage: PageType
  selectedAgentId?: string
  user?: User
  isAuthenticated: boolean
  loading: boolean
  agents: Agent[]
  myAgents: Agent[]
  myUsages: Usage[]
  aiModels: AIModel[]
}