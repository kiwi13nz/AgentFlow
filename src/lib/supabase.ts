// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          stripe_customer_id?: string | null
        }
      }
      ai_models: {
        Row: {
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
          created_at: string
        }
      }
      agents: {
        Row: {
          id: string
          creator_id: string
          name: string
          description: string
          system_prompt: string
          input_schema: any[]
          ai_provider: 'openai' | 'anthropic' | 'google'
          ai_model_id: string
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
        Insert: {
          creator_id: string
          name: string
          description: string
          system_prompt: string
          input_schema: any[]
          ai_provider?: 'openai' | 'anthropic' | 'google'
          ai_model_id: string
          price_per_use?: number
          category: string
          tags?: string[]
          status?: 'draft' | 'active' | 'inactive'
          is_featured?: boolean
        }
        Update: {
          name?: string
          description?: string
          system_prompt?: string
          input_schema?: any[]
          ai_provider?: 'openai' | 'anthropic' | 'google'
          ai_model_id?: string
          price_per_use?: number
          category?: string
          tags?: string[]
          status?: 'draft' | 'active' | 'inactive'
          is_featured?: boolean
        }
      }
      agent_usages: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          input_data: any
          output_data: string | null
          tokens_used: number | null
          cost: number
          status: 'pending' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          user_id: string
          agent_id: string
          input_data: any
          cost: number
          status?: 'pending' | 'completed' | 'failed'
        }
        Update: {
          output_data?: string
          tokens_used?: number
          status?: 'pending' | 'completed' | 'failed'
          error_message?: string
          completed_at?: string
        }
      }
      user_balances: {
        Row: {
          user_id: string
          available_balance: number
          pending_balance: number
          total_earned: number
          updated_at: string
        }
      }
    }
  }
}