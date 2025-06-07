// src/lib/aiService.ts
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

  async executeAgent({ agentId, userId, inputData }: AgentExecution): Promise<AIResponse> {
    try {
      // Get agent details with AI model info
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select(`
          *,
          ai_models!inner (
            provider,
            model_name,
            cost_per_1k_tokens,
            max_tokens
          ),
          profiles!inner (
            name
          )
        `)
        .eq('id', agentId)
        .eq('status', 'active')
        .single()

      if (agentError || !agent) {
        throw new Error('Agent not found or inactive')
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
        throw new Error('Failed to create usage record')
      }

      // Prepare the prompt
      const prompt = this.buildPrompt(agent.system_prompt, agent.input_schema, inputData)
      
      // Execute based on provider
      let response: AIResponse
      
      switch (agent.ai_models.provider) {
        case 'openai':
          response = await this.callOpenAI(agent.ai_models.model_name, prompt, agent.ai_models.max_tokens)
          break
        case 'anthropic':
          response = await this.callAnthropic(agent.ai_models.model_name, prompt, agent.ai_models.max_tokens)
          break
        case 'google':
          response = await this.callGoogle(agent.ai_models.model_name, prompt, agent.ai_models.max_tokens)
          break
        default:
          throw new Error('Unsupported AI provider')
      }

      // Calculate actual cost based on tokens used
      const actualCost = agent.price_per_use || (response.tokensUsed / 1000) * agent.ai_models.cost_per_1k_tokens

      // Update usage record with result
      await supabase
        .from('agent_usages')
        .update({
          output_data: response.content,
          tokens_used: response.tokensUsed,
          cost: actualCost,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', usage.id)

      return {
        ...response,
        cost: actualCost
      }

    } catch (error) {
      console.error('AI execution error:', error)
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
      throw new Error('OpenAI API key not configured')
    }

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
      throw new Error('Anthropic API key not configured')
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
      throw new Error('Google API key not configured')
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