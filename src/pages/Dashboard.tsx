// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Users, Eye, Plus, Star, Calendar, BarChart3 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { AgentCard } from '../components/AgentCard';

interface UserBalance {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
}

export function Dashboard() {
  const { navigate, isAuthenticated, myAgents, user, refreshMyData } = useApp();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsages, setRecentUsages] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load user balance
      const { data: balanceData } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setBalance(balanceData);

      // Load recent usages of user's agents
      const { data: usages } = await supabase
        .from('agent_usages')
        .select(`
          *,
          agents!inner (
            name,
            creator_id
          ),
          profiles!inner (
            name
          )
        `)
        .eq('agents.creator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentUsages(usages || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const totalRevenue = balance?.total_earned || 0;
  const totalUses = myAgents.reduce((sum, agent) => sum + agent.total_uses, 0);
  const avgRating = myAgents.length > 0 
    ? myAgents.reduce((sum, agent) => sum + agent.average_rating, 0) / myAgents.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name || 'Creator'}! Manage your AI agents and track your earnings.
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
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Earned</div>
            {balance && (
              <div className="text-xs text-secondary-600 mt-1">
                ${balance.available_balance.toFixed(2)} available
              </div>
            )}
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
              Across all agents
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
              {myAgents.filter(a => a.status === 'active').length} published
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {avgRating > 0 ? avgRating.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-xs text-yellow-600 mt-1">
              {myAgents.reduce((sum, agent) => sum + agent.rating_count, 0)} total reviews
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('create-agent')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-gray-900">Create New Agent</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
              
              <button
                onClick={() => navigate('marketplace')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-secondary-600" />
                  <span className="font-medium text-gray-900">Browse Marketplace</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>

              <button
                onClick={refreshMyData}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-accent-600" />
                  <span className="font-medium text-gray-900">Refresh Data</span>
                </div>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentUsages.length > 0 ? (
                recentUsages.slice(0, 5).map((usage) => (
                  <div key={usage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{usage.agents.name}</p>
                      <p className="text-sm text-gray-600">Used by {usage.profiles.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(usage.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-secondary-600">
                        +${usage.cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {usage.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400">Your agent usage will appear here</p>
                </div>
              )}
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
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onChange={refreshMyData}
              >
                <option>All Agents</option>
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading your agents...</p>
            </div>
          ) : myAgents.length > 0 ? (
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