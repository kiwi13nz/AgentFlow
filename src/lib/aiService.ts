// src/lib/aiService.ts - FIXED VERSION
import React from 'react'
import { supabase } from './supabase'

interface AIResponse {
  content: string
  tokensUsed: number
  cost: number
}

interface AgentExecution {
  agentId: string
  userId: string
  inputData: Record<string, any>
  paymentMethod?: 'free' | 'credits' | 'direct'
}

class AIService {
  private openaiApiKey: string
  private anthropicApiKey: string
  private googleApiKey: string

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
    this.googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY || ''
  }

  async executeAgent({ agentId, userId, inputData, paymentMethod = 'free' }: AgentExecution): Promise<AIResponse> {
    try {
      console.log('Executing agent:', { agentId, userId, inputData })

      // Try different approaches to get the agent and AI model data
      console.log('Step 1: Getting agent data...')
      
      // First, get the agent
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .eq('status', 'active')
        .single()

      console.log('Agent data:', { agent, error: agentError })

      if (agentError || !agent) {
        console.error('Agent not found or inactive:', agentError)
        throw new Error('Agent not found or inactive')
      }

      // Then get the AI model separately with better error handling
      console.log('Step 2: Getting AI model data for model_id:', agent.ai_model_id)
      
      const { data: aiModel, error: modelError } = await supabase
        .from('ai_models')
        .select('*')
        .eq('id', agent.ai_model_id)
        .maybeSingle() // Use maybeSingle() instead of single() to handle missing records gracefully

      console.log('AI Model data:', { aiModel, error: modelError })

      if (modelError) {
        console.error('Error fetching AI model:', modelError)
        throw new Error(`Failed to fetch AI model: ${modelError.message}`)
      }

      if (!aiModel) {
        console.error('AI model not found for ID:', agent.ai_model_id)
        throw new Error(`AI model not found. This agent may be misconfigured. Please contact the agent creator.`)
      }

      // Create usage record
      const { data: usage, error: usageError } = await supabase
        .from('agent_usages')
        .insert({
          user_id: userId,
          agent_id: agentId,
          input_data: inputData,
          cost: agent.price_per_use,
          status: 'pending'
        })
        .select()
        .single()

      if (usageError) {
        console.error('Failed to create usage record:', usageError)
        throw new Error('Failed to create usage record')
      }

      console.log('Usage record created:', usage)

      // Prepare the prompt
      const prompt = this.buildPrompt(agent.system_prompt, agent.input_schema, inputData)
      console.log('Generated prompt:', prompt)
      
      // Execute based on provider
      let response: AIResponse
      
      switch (aiModel.provider) {
        case 'openai':
          response = await this.callOpenAI(aiModel.model_name, prompt, aiModel.max_tokens)
          break
        case 'anthropic':
          response = await this.callAnthropic(aiModel.model_name, prompt, aiModel.max_tokens)
          break
        case 'google':
          response = await this.callGoogle(aiModel.model_name, prompt, aiModel.max_tokens)
          break
        default:
          throw new Error('Unsupported AI provider')
      }

      console.log('AI response:', response)

      // Calculate actual cost based on tokens used
      const actualCost = agent.price_per_use || (response.tokensUsed / 1000) * aiModel.cost_per_1k_tokens

      // Update usage record with result
      const { error: updateError } = await supabase
        .from('agent_usages')
        .update({
          output_data: response.content,
          tokens_used: response.tokensUsed,
          cost: actualCost,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', usage.id)

      if (updateError) {
        console.error('Failed to update usage record:', updateError)
      }

      // Update agent stats
      const { error: statsError } = await supabase
        .from('agents')
        .update({
          total_uses: agent.total_uses + 1,
          total_revenue: agent.total_revenue + actualCost
        })
        .eq('id', agentId)

      if (statsError) {
        console.error('Failed to update agent stats:', statsError)
      }

      return {
        ...response,
        cost: actualCost
      }

    } catch (error) {
      console.error('AI execution error:', error)
      
      // If we have a usage record, mark it as failed
      // (This would require storing the usage ID, but for now we'll skip)
      
      throw error
    }
  }

  private buildPrompt(systemPrompt: string, inputSchema: any[], inputData: Record<string, any>): string {
    let prompt = systemPrompt + '\n\n'
    
    // Add user inputs
    prompt += 'User inputs:\n'
    inputSchema.forEach(field => {
      const value = inputData[field.name]
      if (value) {
        prompt += `${field.label}: ${value}\n`
      }
    })
    
    prompt += '\nPlease provide a helpful response based on the above information.'
    
    return prompt
  }

  private async callOpenAI(model: string, prompt: string, maxTokens: number): Promise<AIResponse> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
    }

    console.log('Calling OpenAI with model:', model)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: Math.min(maxTokens, 4000),
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      tokensUsed: data.usage.total_tokens,
      cost: 0 // Will be calculated based on agent pricing
    }
  }

  private async callAnthropic(model: string, prompt: string, maxTokens: number): Promise<AIResponse> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured. Please add VITE_ANTHROPIC_API_KEY to your environment variables.')
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(maxTokens, 4000),
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Anthropic API error:', errorText)
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.content[0].text,
      tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
      cost: 0
    }
  }

  private async callGoogle(model: string, prompt: string, maxTokens: number): Promise<AIResponse> {
    if (!this.googleApiKey) {
      throw new Error('Google API key not configured. Please add VITE_GOOGLE_API_KEY to your environment variables.')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: Math.min(maxTokens, 4000),
          temperature: 0.7,
        }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Google API error:', errorText)
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      content: data.candidates[0].content.parts[0].text,
      tokensUsed: data.usageMetadata?.totalTokenCount || 1000, // Estimate if not provided
      cost: 0
    }
  }

  // Get available AI models
  async getAvailableModels(userIsPro: boolean = false) {
    const { data, error } = await supabase
      .from('ai_models')
      .select('*')
      .eq('is_available', true)
      .order('provider')

    if (error) {
      throw new Error('Failed to fetch AI models')
    }

    // Filter based on user's subscription
    return data.filter(model => model.is_free || userIsPro || !model.requires_pro)
  }
}

export const aiService = new AIService()

// Hook for React components
export function useAIModels(userIsPro: boolean = false) {
  const [models, setModels] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    aiService.getAvailableModels(userIsPro)
      .then(setModels)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userIsPro])

  return { models, loading }
}