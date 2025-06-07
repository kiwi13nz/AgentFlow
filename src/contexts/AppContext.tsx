// src/contexts/AppContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

// Updated types to match database
export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  website: string | null
  created_at: string
  updated_at: string
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
}

export type PageType = 'landing' | 'marketplace' | 'agent-detail' | 'create-agent' | 'dashboard' | 'profile'

interface AppState {
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

interface AppContextValue extends AppState {
  navigate: (page: PageType, agentId?: string) => void
  login: () => Promise<void>
  logout: () => Promise<void>
  refreshAgents: () => Promise<void>
  refreshMyData: () => Promise<void>
  featuredAgents: Agent[]
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

type AppAction = 
  | { type: 'NAVIGATE'; payload: { page: PageType; agentId?: string } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_MY_AGENTS'; payload: Agent[] }
  | { type: 'SET_MY_USAGES'; payload: Usage[] }
  | { type: 'SET_AI_MODELS'; payload: AIModel[] }

const initialState: AppState = {
  currentPage: 'landing',
  isAuthenticated: false,
  loading: true,
  agents: [],
  myAgents: [],
  myUsages: [],
  aiModels: []
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.payload.page,
        selectedAgentId: action.payload.agentId,
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload || undefined,
        isAuthenticated: !!action.payload,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_AGENTS':
      return {
        ...state,
        agents: action.payload,
      }
    case 'SET_MY_AGENTS':
      return {
        ...state,
        myAgents: action.payload,
      }
    case 'SET_MY_USAGES':
      return {
        ...state,
        myUsages: action.payload,
      }
    case 'SET_AI_MODELS':
      return {
        ...state,
        aiModels: action.payload,
      }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize auth and load data
  useEffect(() => {
    let mounted = true

    const initializeApp = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          await loadUserProfile(session.user)
        }

        // Load public data
        await loadPublicData()
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return
          
          if (session?.user) {
            await loadUserProfile(session.user)
          } else {
            dispatch({ type: 'SET_USER', payload: null })
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('App initialization error:', error)
      } finally {
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    initializeApp()
    
    return () => {
      mounted = false
    }
  }, [])

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Get or create user profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || null,
            avatar_url: supabaseUser.user_metadata?.avatar_url || null,
          })
          .select()
          .single()

        if (insertError) {
          throw insertError
        }
        profile = newProfile
      } else if (error) {
        throw error
      }

      dispatch({ type: 'SET_USER', payload: profile })
      
      // Load user-specific data
      if (profile) {
        await loadMyAgents(profile.id)
        await loadMyUsages(profile.id)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadPublicData = async () => {
    try {
      // Load active agents with creator info
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          profiles!inner (
            id,
            name,
            email,
            avatar_url
          ),
          ai_models!inner (
            provider,
            display_name,
            cost_per_1k_tokens,
            is_free
          )
        `)
        .eq('status', 'active')
        .order('total_uses', { ascending: false })

      if (agentsError) throw agentsError

      const formattedAgents = agents.map(agent => ({
        ...agent,
        creator: agent.profiles,
        ai_model: agent.ai_models,
        // Convert old format for compatibility
        rating: agent.average_rating,
        totalUses: agent.total_uses,
        revenue: agent.total_revenue,
        pricePerUse: agent.price_per_use,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at
      }))

      dispatch({ type: 'SET_AGENTS', payload: formattedAgents })

      // Load AI models
      const { data: models, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_available', true)
        .order('provider')

      if (modelsError) throw modelsError
      dispatch({ type: 'SET_AI_MODELS', payload: models })

    } catch (error) {
      console.error('Error loading public data:', error)
    }
  }

  const loadMyAgents = async (userId: string) => {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select(`
          *,
          ai_models!inner (
            provider,
            display_name,
            cost_per_1k_tokens,
            is_free
          )
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedAgents = agents.map(agent => ({
        ...agent,
        ai_model: agent.ai_models,
        rating: agent.average_rating,
        totalUses: agent.total_uses,
        revenue: agent.total_revenue,
        pricePerUse: agent.price_per_use,
        createdAt: agent.created_at,
        updatedAt: agent.updated_at
      }))

      dispatch({ type: 'SET_MY_AGENTS', payload: formattedAgents })
    } catch (error) {
      console.error('Error loading my agents:', error)
    }
  }

  const loadMyUsages = async (userId: string) => {
    try {
      const { data: usages, error } = await supabase
        .from('agent_usages')
        .select(`
          *,
          agents!inner (
            name,
            creator_id,
            profiles!inner (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      dispatch({ type: 'SET_MY_USAGES', payload: usages || [] })
    } catch (error) {
      console.error('Error loading my usages:', error)
    }
  }

  const navigate = (page: PageType, agentId?: string) => {
    dispatch({ type: 'NAVIGATE', payload: { page, agentId } })
  }

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please try again.')
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      dispatch({ type: 'SET_USER', payload: null })
      dispatch({ type: 'SET_MY_AGENTS', payload: [] })
      dispatch({ type: 'SET_MY_USAGES', payload: [] })
      navigate('landing')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshAgents = async () => {
    await loadPublicData()
  }

  const refreshMyData = async () => {
    if (state.user) {
      await loadMyAgents(state.user.id)
      await loadMyUsages(state.user.id)
    }
  }

  const value: AppContextValue = {
    ...state,
    navigate,
    login,
    logout,
    refreshAgents,
    refreshMyData,
    featuredAgents: state.agents.filter(agent => agent.is_featured).slice(0, 3)
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}