// src/pages/CreateAgent.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, ArrowLeft, Zap, Crown, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { InputField, AIModel } from '../types';

export function CreateAgent() {
  const { navigate, isAuthenticated, user, aiModels, refreshMyData } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    category: '',
    tags: '',
    pricePerUse: 0,
    aiModelId: '',
    status: 'draft' as 'draft' | 'active'
  });
  const [inputFields, setInputFields] = useState<InputField[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableModels = aiModels.filter(model => model.is_available);
  const selectedModel = availableModels.find(m => m.id === formData.aiModelId);

  useEffect(() => {
    // Set default to free GPT-3.5 model
    const freeModel = availableModels.find(m => m.is_free);
    if (freeModel && !formData.aiModelId) {
      setFormData(prev => ({ ...prev, aiModelId: freeModel.id }));
    }
  }, [availableModels]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to create agents.</p>
          <button
            onClick={() => navigate('landing')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const addInputField = () => {
    const newField: InputField = {
      name: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
    };
    setInputFields([...inputFields, newField]);
  };

  const updateInputField = (index: number, updates: Partial<InputField>) => {
    const updated = [...inputFields];
    updated[index] = { ...updated[index], ...updates };
    setInputFields(updated);
  };

  const removeInputField = (index: number) => {
    setInputFields(inputFields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.systemPrompt || !formData.category || !formData.aiModelId) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare agent data
      const agentData = {
        creator_id: user.id,
        name: formData.name,
        description: formData.description,
        system_prompt: formData.systemPrompt,
        input_schema: inputFields,
        ai_model_id: formData.aiModelId,
        ai_provider: selectedModel?.provider || 'openai',
        price_per_use: formData.pricePerUse,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: formData.status
      };

      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;

      // Refresh user's agents
      await refreshMyData();

      alert('Agent created successfully!');
      navigate('dashboard');

    } catch (err: any) {
      console.error('Error creating agent:', err);
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.description && formData.systemPrompt && formData.category && formData.aiModelId;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>{isPreview ? 'Edit' : 'Preview'}</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid || isSubmitting}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Agent'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {isPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formData.name || 'Untitled Agent'}
              </h1>
              <p className="text-lg text-gray-600">
                {formData.description || 'No description provided'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Agent Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">AI Model:</span>
                    <p className="text-gray-900">{selectedModel?.display_name || 'Not selected'}</p>
                    {selectedModel && (
                      <p className="text-sm text-gray-500">{selectedModel.description}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-gray-900">{formData.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Price per use:</span>
                    <p className="text-gray-900 text-lg font-semibold">
                      {formData.pricePerUse > 0 ? `$${formData.pricePerUse}` : 'Free'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tags:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Input Fields</h3>
                <div className="space-y-4">
                  {inputFields.map((field, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{field.label}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {field.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {field.placeholder || 'No placeholder'}
                      </p>
                      {field.required && (
                        <span className="text-xs text-red-600 font-medium">Required</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Blog Post Writer"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="Development">Development</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what your agent does and how it helps users..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Use ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 for free"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.pricePerUse}
                    onChange={(e) => setFormData({ ...formData, pricePerUse: parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500 mt-1">Set to 0 for free agents</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'active' })}
                  >
                    <option value="draft">Draft (not visible to users)</option>
                    <option value="active">Active (visible in marketplace)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., writing, content, blog, seo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                AI Model Selection *
              </h2>
              <p className="text-gray-600 mb-6">
                Choose the AI model that will power your agent. Different models have different capabilities and costs.
              </p>

              {availableModels.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Models Available</h3>
                  <p className="text-gray-600 mb-4">
                    No AI models are currently available in the system. Please contact an administrator to configure AI models before creating agents.
                  </p>
                  <p className="text-sm text-gray-500">
                    AI models need to be properly configured in the database for agents to function correctly.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableModels.map((model) => (
                    <div
                      key={model.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.aiModelId === model.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData({ ...formData, aiModelId: model.id })}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{model.display_name}</h4>
                        <div className="flex items-center space-x-1">
                          {model.is_free ? (
                            <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded text-xs flex items-center space-x-1">
                              <Zap className="h-3 w-3" />
                              <span>Free</span>
                            </span>
                          ) : model.requires_pro ? (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center space-x-1">
                              <Crown className="h-3 w-3" />
                              <span>Pro</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                      <div className="text-xs text-gray-500">
                        <p>Provider: {model.provider.toUpperCase()}</p>
                        <p>Max tokens: {model.max_tokens.toLocaleString()}</p>
                        {!model.is_free && (
                          <p>Cost: ${model.cost_per_1k_tokens.toFixed(4)}/1k tokens</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* System Prompt */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                System Prompt *
              </h2>
              <p className="text-gray-600 mb-4">
                This is the core instruction that defines how your AI agent behaves. 
                Be specific about the role, expertise, and response style.
              </p>
              <textarea
                rows={8}
                placeholder="You are an expert content writer specializing in blog posts. Your task is to create engaging, SEO-optimized content that..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              />
            </div>

            {/* Input Fields */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Input Fields
                </h2>
                <button
                  onClick={addInputField}
                  className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field</span>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Define what information users need to provide to use your agent.
              </p>

              <div className="space-y-6">
                {inputFields.map((field, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Field #{index + 1}
                      </h4>
                      <button
                        onClick={() => removeInputField(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Topic"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={field.label}
                          onChange={(e) => updateInputField(index, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field Type
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={field.type}
                          onChange={(e) => updateInputField(index, { type: e.target.value as any })}
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="number">Number</option>
                          <option value="select">Select</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Enter your blog topic"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={field.placeholder || ''}
                        onChange={(e) => updateInputField(index, { placeholder: e.target.value })}
                      />
                    </div>

                    {field.type === 'select' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Options (comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Option 1, Option 2, Option 3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateInputField(index, { 
                            options: e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt)
                          })}
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={field.required}
                          onChange={(e) => updateInputField(index, { required: e.target.checked })}
                        />
                        <span className="text-sm text-gray-700">Required field</span>
                      </label>
                    </div>
                  </div>
                ))}

                {inputFields.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      No input fields defined yet. Add fields to collect user input.
                    </p>
                    <button
                      onClick={addInputField}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add Your First Field
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}