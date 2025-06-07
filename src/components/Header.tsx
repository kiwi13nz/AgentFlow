import React from 'react';
import { Bot, User, Plus, BarChart3, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Header() {
  const { navigate, isAuthenticated, user, login, logout } = useApp();

  const handleAuth = () => {
    if (isAuthenticated) {
      logout();
    } else {
      // Use real Supabase login
      login();
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('landing')}
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                AgentFlow
              </h1>
              <p className="text-xs text-gray-500 -mt-1">AI Agent Marketplace</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('marketplace')}
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
            >
              Marketplace
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate('create-agent')}
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Create Agent
                </button>
                <button
                  onClick={() => navigate('dashboard')}
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => navigate('create-agent')}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Create Agent</span>
                  </button>
                  <button
                    onClick={() => navigate('dashboard')}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name || ''} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => navigate('profile')}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={handleAuth}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}