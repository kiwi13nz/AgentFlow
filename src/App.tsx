import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Header } from './components/Header';
import { Landing } from './pages/Landing';
import { Marketplace } from './pages/Marketplace';
import { AgentDetail } from './pages/AgentDetail';
import { CreateAgent } from './pages/CreateAgent';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

function AppContent() {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing />;
      case 'marketplace':
        return <Marketplace />;
      case 'agent-detail':
        return <AgentDetail />;
      case 'create-agent':
        return <CreateAgent />;
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;