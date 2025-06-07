import React from 'react';
import { TrendingUp, DollarSign, Users, Eye, Plus, Star, Calendar } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AgentCard } from '../components/AgentCard';

export function Dashboard() {
  const { navigate, isAuthenticated, myAgents } = useApp();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
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

  const totalRevenue = myAgents.reduce((sum, agent) => sum + agent.revenue, 0);
  const totalUses = myAgents.reduce((sum, agent) => sum + agent.totalUses, 0);
  const avgRating = myAgents.length > 0 
    ? myAgents.reduce((sum, agent) => sum + agent.rating, 0) / myAgents.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage your AI agents and track your earnings
            </p>
          </div>
          <button
            onClick={() => navigate('create-agent')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Agent</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-secondary-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-secondary-600 mt-1">
              +12.3% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-primary-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {totalUses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Uses</div>
            <div className="text-xs text-primary-600 mt-1">
              +8.7% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-accent-100 rounded-lg p-3">
                <Eye className="h-6 w-6 text-accent-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {myAgents.length}
            </div>
            <div className="text-sm text-gray-600">Active Agents</div>
            <div className="text-xs text-accent-600 mt-1">
              2 published this month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {avgRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-xs text-yellow-600 mt-1">
              Across all agents
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Revenue Overview
            </h2>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-primary-600 bg-primary-50 rounded-lg font-medium">
                Last 30 days
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors">
                Last 3 months
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors">
                All time
              </button>
            </div>
          </div>
          
          {/* Mock Chart */}
          <div className="h-64 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg flex items-end justify-center p-8">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Revenue chart would be displayed here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Integration with charting library needed
              </p>
            </div>
          </div>
        </div>

        {/* My Agents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              My Agents ({myAgents.length})
            </h2>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Agents</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          {myAgents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} showRevenue={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No agents yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Create your first AI agent to start earning money from your expertise and creativity.
              </p>
              <button
                onClick={() => navigate('create-agent')}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Create Your First Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}