// src/pages/AgentDetail.tsx - Fix the import
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, DollarSign, Play, User, Calendar, TrendingUp, MessageSquare, Share2, Zap, Lock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { aiService } from '../lib/aiService';
import { InputField } from '../types/index'; // Changed from '../types'

export function AgentDetail() {
  const { agents, selectedAgentId, navigate, isAuthenticated, user } = useApp();
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [cost, setCost] = useState<number>(0);

  const agent = agents.find(a => a.id === selectedAgentId);

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agent not found</h2>
          <button
            onClick={() => navigate('marketplace')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: InputField, value: any) => {
    setInputValues(prev => ({
      ...prev,
      [field.name]: value
    }));
  };

  const handleRunAgent = async () => {
    if (!isAuthenticated || !user || !agent) {
      alert('Please sign in to use agents');
      return;
    }

    const isFree = agent.price_per_use === 0;

    // For paid agents, show coming soon message
    if (!isFree) {
      alert('Paid agents are coming soon! For now, enjoy our free agents.');
      return;
    }

    setIsRunning(true);
    setError('');
    setResult('');
    
    try {
      const response = await aiService.executeAgent({
        agentId: agent.id,
        userId: user.id,
        inputData: inputValues,
        paymentMethod: 'free'
      });
      
      setResult(response.content);
      setCost(response.cost);
      
      // Clear form after successful execution
      setInputValues({});
      
    } catch (err: any) {
      console.error('Agent execution error:', err);
      setError(err.message || 'Failed to execute agent. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const isFormValid = agent.input_schema.every(field => 
    !field.required || (inputValues[field.name] && inputValues[field.name].toString().trim())
  );

  const isFree = agent.price_per_use === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('marketplace')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Marketplace</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {agent.name}
                    </h1>
                    {isFree && (
                      <span className="bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Free</span>
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(agent.average_rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">
                      {agent.average_rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({agent.rating_count} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-secondary-500" />
                    <span className="text-gray-600">{agent.total_uses.toLocaleString()} uses</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-accent-50 px-3 py-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-accent-600" />
                  <span className="text-lg font-semibold text-accent-700">
                    {isFree ? 'Free' : `$${agent.price_per_use.toFixed(2)}`}
                  </span>
                  {!isFree && <span className="text-sm text-accent-600">per use</span>}
                </div>
              </div>
            </div>

            {/* AI Model Info */}
            {agent.ai_model && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  AI Model Information
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{agent.ai_model.display_name}</p>
                    <p className="text-gray-600 text-sm">{agent.ai_model.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Provider: {agent.ai_model.provider.toUpperCase()}
                    </p>
                  </div>
                  {agent.ai_model.is_free && (
                    <span className="bg-secondary-50 text-secondary-700 px-2 py-1 rounded text-sm">
                      Free Model
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Creator Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Creator
              </h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  {agent.creator?.avatar_url ? (
                    <img src={agent.creator.avatar_url} alt={agent.creator.name || ''} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{agent.creator?.name || 'Anonymous'}</h4>
                  <p className="text-gray-600">{agent.creator?.email}</p>
                  {agent.creator?.bio && (
                    <p className="text-sm text-gray-500 mt-1">{agent.creator.bio}</p>
                  )}
                </div>
                <div className="ml-auto text-right">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags and Category */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tags & Category
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg font-medium">
                  {agent.category}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar - Try Agent */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="flex items-center space-x-2 mb-6">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Try This Agent
                </h3>
              </div>

              {/* Coming Soon Notice for Paid Agents */}
              {!isFree && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Premium Agent</span>
                  </div>
                  <p className="text-sm text-amber-700 mb-3">
                    This is a premium agent that requires payment. We're working on implementing secure payments!
                  </p>
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                    <p className="text-xs text-amber-800 font-medium">
                      🚀 Coming Soon: Secure payment processing
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      For now, enjoy our free agents while we build the payment system.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {agent.input_schema.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                          !isFree ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        value={inputValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        disabled={!isFree}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          !isFree ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        value={inputValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        disabled={!isFree}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          !isFree ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        value={inputValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field, field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
                        disabled={!isFree}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleRunAgent}
                  disabled={!isFormValid || isRunning || !isAuthenticated}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isFree 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {isFree ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <span>
                        {isFree 
                          ? 'Run Agent (Free)' 
                          : 'Premium Agent - Coming Soon'
                        }
                      </span>
                    </>
                  )}
                </button>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 text-center">
                    Please sign in to use this agent
                  </p>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {result && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Result:</h4>
                      {cost > 0 && (
                        <span className="text-sm text-gray-500">Cost: ${cost.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                      {result}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(result)}
                      className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}