import React from 'react';
import type { User } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import { ICONS } from '../constants';

interface CommunityPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const CommunityPage: React.FC<CommunityPageProps> = ({ user, onLogout, onNavigate }) => {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center bg-accent p-6 rounded-full mb-6">
            {React.cloneElement(ICONS.USERS, { className: 'w-16 h-16 text-primary' })}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Community Hub Coming Soon!</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We're hard at work building an interactive space for event planners to connect, share amazing plans, and collaborate on future projects. Stay tuned for updates!
          </p>
          <button
            onClick={() => onNavigate(Page.Dashboard)}
            className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default CommunityPage;