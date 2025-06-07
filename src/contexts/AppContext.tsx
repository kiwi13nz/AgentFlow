// src/contexts/AppContext.tsx - Updated to use types from index.ts
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { 
  User, 
  AIModel, 
  Agent, 
  InputField, 
  Usage, 
  PageType, 
  AppState 
} from '../types'

interface AppContextValue extends AppState {
  navigate: (page: PageType, agentId?: string) => void
  loginWithGoogle: () => Promise<void>
  loginWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>
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
      console.log('Loading public data...')
      
      // Load active agents with creator info - using correct field names
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          profiles!creator_id (
            id,
            name,
            email,
            avatar_url,
            bio,
            website,
            created_at,
            updated_at
          ),
          ai_models!ai_model_id (
            id,
            provider,
            model_name,
            display_name,
            description,
            cost_per_1k_tokens,
            is_free,
            is_available,
            requires_pro,
            max_tokens
          )
        `)
        .eq('status', 'active')
        .eq('ai_models.is_available', true)
        .order('total_uses', { ascending: false })

      if (agentsError) {
        console.error('Agents query error:', agentsError)
        throw agentsError
      }

      console.log('Raw agents data:', agentsData)

      // Transform the data correctly
      const formattedAgents = (agentsData || []).map(agent => ({
        ...agent,
        creator: agent.profiles,
        ai_model: agent.ai_models,
      }))

      console.log('Formatted agents:', formattedAgents)
      dispatch({ type: 'SET_AGENTS', payload: formattedAgents })

      // Load AI models
      const { data: models, error: modelsError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('is_available', true)
        .order('provider')

      if (modelsError) throw modelsError
      dispatch({ type: 'SET_AI_MODELS', payload: models || [] })

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
          ai_models!ai_model_id (
            id,
            provider,
            model_name,
            display_name,
            description,
            cost_per_1k_tokens,
            is_free,
            is_available,
            requires_pro,
            max_tokens
          )
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedAgents = (agents || []).map(agent => ({
        ...agent,
        ai_model: agent.ai_models,
        creator: undefined, // User's own agents don't need creator info
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
          agents!agent_id (
            id,
            name,
            creator_id,
            description,
            category,
            price_per_use,
            profiles!creator_id (
              id,
              name,
              email,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      
      // Transform the data to match our Usage type
      const formattedUsages = (usages || []).map(usage => ({
        ...usage,
        agent: usage.agents ? {
          ...usage.agents,
          creator: usage.agents.profiles
        } : undefined
      }))
      
      dispatch({ type: 'SET_MY_USAGES', payload: formattedUsages })
    } catch (error) {
      console.error('Error loading my usages:', error)
    }
  }

  const navigate = (page: PageType, agentId?: string) => {
    dispatch({ type: 'NAVIGATE', payload: { page, agentId } })
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Email login error:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
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
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
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