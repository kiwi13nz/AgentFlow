import React from 'react';
import { Bot, Zap, DollarSign, TrendingUp, ArrowRight, Star, Users } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AgentCard } from '../components/AgentCard';

export function Landing() {
  const { navigate, featuredAgents, isAuthenticated } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Build, Share & Monetize
              <span className="block bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Create powerful AI agents with custom prompts, share them with the world, 
              and earn money every time someone uses your creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('marketplace')}
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('create-agent')}
                  className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-105"
                >
                  Create Your Agent
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-slide-up">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">2,500+</div>
              <div className="text-gray-600">AI Agents</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-secondary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="bg-accent-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-accent-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$250K+</div>
              <div className="text-gray-600">Earned by Creators</div>
            </div>
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose AgentFlow?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most powerful platform for creating, sharing, and monetizing AI agents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary-500 rounded-xl p-3 w-fit mb-6">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Easy to Create
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build powerful AI agents with our intuitive interface. No coding required - 
                just describe what you want your agent to do.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-secondary-500 rounded-xl p-3 w-fit mb-6">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Monetize Your Creativity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Set your own prices and earn money every time someone uses your agent. 
                Turn your AI expertise into a steady income stream.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="bg-accent-500 rounded-xl p-3 w-fit mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Scale Your Impact
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reach thousands of users instantly. Our marketplace helps you discover 
                the perfect agents for any task or need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured Agents
              </h2>
              <p className="text-xl text-gray-600">
                Discover the most popular and highest-rated AI agents
              </p>
            </div>
            <button
              onClick={() => navigate('marketplace')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 leading-relaxed">
            Join thousands of creators who are already building and monetizing AI agents. 
            Your next breakthrough is just one click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('create-agent')}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Create Your First Agent
            </button>
            <button
              onClick={() => navigate('marketplace')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 hover:scale-105"
            >
              Browse Marketplace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}