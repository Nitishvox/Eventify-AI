import React, { useState, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import EventGenesisPage from './pages/EventGenesisPage';
import OpsMindAIPage from './pages/OpsMindAIPage';
import type { User } from './types';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = useCallback((email: string) => {
    setUser({
      email: email,
      name: email.split('@')[0] || 'User',
      avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${email}`,
    });
    setCurrentPage(Page.Planner);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage(Page.Landing);
  }, []);
  
  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);


  const renderPage = () => {
    if (!user) {
        switch (currentPage) {
            case Page.Login:
                return <LoginPage onLogin={handleLogin} />;
            default:
                return <LandingPage onGetStarted={() => navigateTo(Page.Login)} />;
        }
    }

    switch (currentPage) {
      case Page.Planner:
        return <PlannerPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      case Page.Dashboard:
        return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      case Page.EventGenesis:
        return <EventGenesisPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      case Page.OpsMindAI:
        return <OpsMindAIPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      default:
        return <PlannerPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {renderPage()}
    </div>
  );
};

export default App;