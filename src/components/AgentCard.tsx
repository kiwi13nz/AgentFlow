// src/components/AgentCard.tsx
import React from 'react';
import { Star, TrendingUp, DollarSign, Tag, Zap, Lock } from 'lucide-react';
import { Agent } from '../contexts/AppContext';
import { useApp } from '../contexts/AppContext';

interface AgentCardProps {
  agent: Agent;
  showRevenue?: boolean;
}

export function AgentCard({ agent, showRevenue = false }: AgentCardProps) {
  const { navigate } = useApp();

  const handleClick = () => {
    if (agent.price_per_use > 0) {
      // For paid agents, still allow viewing but they'll see the coming soon message
      navigate('agent-detail', agent.id);
    } else {
      navigate('agent-detail', agent.id);
    }
  };

  const isFree = agent.price_per_use === 0;
  const isPro = agent.ai_model?.requires_pro || false;

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        !isFree ? 'hover:border-amber-200' : 'hover:border-primary-200'
      }`}
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {agent.name}
              </h3>
              {isFree && (
                <span className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Zap className="h-3 w-3" />
                  <span>Free</span>
                </span>
              )}
              {isPro && !isFree && (
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Lock className="h-3 w-3" />
                  <span>Premium</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {agent.description}
            </p>
          </div>
          <div className="ml-4 flex items-center space-x-1 bg-accent-50 px-2 py-1 rounded-full">
            <DollarSign className="h-3 w-3 text-accent-600" />
            <span className="text-sm font-medium text-accent-700">
              {isFree ? 'Free' : `$${agent.price_per_use.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {agent.average_rating > 0 ? agent.average_rating.toFixed(1) : '--'}
              </span>
              {agent.rating_count > 0 && (
                <span className="text-xs text-gray-500">
                  ({agent.rating_count})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">
                {agent.total_uses.toLocaleString()} uses
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            by {agent.creator?.name || 'Anonymous'}
          </div>
        </div>

        {showRevenue && (
          <div className="mb-4 p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">Total Revenue</span>
              <span className="text-lg font-semibold text-secondary-800">
                ${agent.total_revenue.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-secondary-600">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                agent.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : agent.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {agent.status}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{agent.category}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(agent.tags || []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {(agent.tags || []).length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{(agent.tags || []).length - 2}
              </span>
            )}
          </div>
        </div>

        {/* AI Model Info */}
        {agent.ai_model && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Powered by {agent.ai_model.display_name}
              </span>
              <span className="text-xs text-gray-400">
                {agent.ai_model.provider.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}