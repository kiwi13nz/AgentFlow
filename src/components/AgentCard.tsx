import React from 'react';
import { Star, TrendingUp, DollarSign, Tag } from 'lucide-react';
import { Agent } from '../types';
import { useApp } from '../contexts/AppContext';

interface AgentCardProps {
  agent: Agent;
  showRevenue?: boolean;
}

export function AgentCard({ agent, showRevenue = false }: AgentCardProps) {
  const { navigate } = useApp();

  const handleClick = () => {
    navigate('agent-detail', agent.id);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {agent.description}
            </p>
          </div>
          <div className="ml-4 flex items-center space-x-1 bg-accent-50 px-2 py-1 rounded-full">
            <DollarSign className="h-3 w-3 text-accent-600" />
            <span className="text-sm font-medium text-accent-700">
              ${agent.pricePerUse}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {agent.rating}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">
                {agent.totalUses.toLocaleString()} uses
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            by {agent.creator.name}
          </div>
        </div>

        {showRevenue && (
          <div className="mb-4 p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary-700">Total Revenue</span>
              <span className="text-lg font-semibold text-secondary-800">
                ${agent.revenue.toLocaleString()}
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
            {agent.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {agent.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{agent.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}