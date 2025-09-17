

import React, { useState, useCallback, useEffect } from 'react';
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import EventGenesisPage from './pages/EventGenesisPage';
import OpsMindAIPage from './pages/OpsMindAIPage';
import VisualisationsPage from './pages/VisualisationsPage';
import CommunityPage from './pages/CommunityPage';
import AccountPage from './pages/AccountPage';
import Spinner from './components/Spinner';
import type { User } from './types';
import { Page } from './types';
import { supabase } from './services/supabaseClient';

// Helper to map Supabase user to our internal User type
const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
  avatarUrl: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(supabaseUser.user_metadata?.name || 'U')}`,
});

const App: React.FC = () => {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Landing);
  
  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);
  
  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
            setUser(mapSupabaseUserToAppUser(session.user));
            setCurrentPage(Page.Dashboard);
        }
        setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
            setUser(mapSupabaseUserToAppUser(session.user));
            if (_event === 'SIGNED_IN') {
                 setCurrentPage(Page.Dashboard);
            }
        } else {
            setUser(null);
            setCurrentPage(Page.Landing);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdateUser = async (updatedUser: User) => {
      const { data, error } = await supabase.auth.updateUser({
          data: { name: updatedUser.name, avatar_url: updatedUser.avatarUrl }
      });
      if (error) {
          console.error("Error updating user:", error.message);
          // Optionally show an error to the user
      } else if (data.user) {
          setUser(mapSupabaseUserToAppUser(data.user));
      }
  }
  
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);


  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="lg" />
        </div>
      );
    }
    
    if (!session || !user) {
        switch (currentPage) {
            case Page.Login:
                return <LoginPage onNavigate={navigateTo} />;
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
      case Page.Visualisations:
        return <VisualisationsPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      case Page.Community:
        return <CommunityPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
      case Page.Account:
        return <AccountPage user={user} onLogout={handleLogout} onNavigate={navigateTo} onUpdateUser={handleUpdateUser} />;
      default:
        // Redirect logged-in users from landing/login to the dashboard
        if (currentPage === Page.Landing || currentPage === Page.Login) {
            return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
        }
        return <DashboardPage user={user} onLogout={handleLogout} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {renderPage()}
    </div>
  );
};

export default App;