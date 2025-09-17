

import React, { useState, useEffect } from 'react';
import type { User, SavedEvent } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import SavedEventCard from '../components/SavedEventCard';
import ViewPlanModal from '../components/ViewPlanModal';
import Spinner from '../components/Spinner';
import { ICONS } from '../constants';

const LOCAL_STORAGE_KEY = 'ai-event-planner-events';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, onNavigate }) => {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [viewingEvent, setViewingEvent] = useState<SavedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      const allEvents: SavedEvent[] = localData ? JSON.parse(localData) : [];
      // Filter events for the currently logged-in user
      const userEvents = allEvents.filter(event => event.user_id === user.id);
      setSavedEvents(userEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (e) {
      setError('Failed to load your events from local storage.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const handleViewPlan = (event: SavedEvent) => {
    setViewingEvent(event);
  };
  
  const handleEdit = (event: SavedEvent) => {
    localStorage.setItem('eventToEditId', String(event.id));
    onNavigate(Page.Planner);
  };

  const handleDelete = async (eventId: number) => {
    if (window.confirm("Are you sure you want to permanently delete this event plan?")) {
        try {
            const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
            const allEvents: SavedEvent[] = localData ? JSON.parse(localData) : [];
            const updatedEvents = allEvents.filter(event => event.id !== eventId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
            setSavedEvents(savedEvents.filter(event => event.id !== eventId));
        } catch (e) {
            setError('Could not delete the event from local storage. Please try again.');
            console.error(e);
        }
    }
  };

  const handleCloseModal = () => {
    setViewingEvent(null);
  };
  
  const renderEmptyState = () => (
    <div className="text-center py-20 glass-card rounded-2xl border-2 border-dashed border-border">
      <div className="inline-block bg-accent p-4 rounded-full mb-4">
        {React.cloneElement(ICONS.IMAGE_GALLERY, { className: 'w-12 h-12 text-muted' })}
      </div>
      <h2 className="text-2xl font-bold mb-2">No Saved Events Yet</h2>
      <p className="text-muted-foreground mb-6">Your planned events will appear here once you save them.</p>
      <button
        onClick={() => onNavigate(Page.Planner)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-all"
      >
        Plan Your First Event
      </button>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-20"><Spinner size="lg"/></div>;
    }
    if (error) {
      return <div className="text-center py-20 text-destructive">{error}</div>;
    }
    if (savedEvents.length === 0) {
      return renderEmptyState();
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {savedEvents.map(event => (
          <SavedEventCard 
            key={event.id} 
            savedEvent={event} 
            onViewPlan={() => handleViewPlan(event)}
            onEdit={() => handleEdit(event)}
            onDelete={() => handleDelete(event.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Event Dashboard</h1>
        </div>
        
        {renderContent()}

      </main>
       <button
        onClick={() => onNavigate(Page.Planner)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
        aria-label="Plan New Event"
        title="Plan New Event"
      >
        {React.cloneElement(ICONS.LIGHTNING_BOLT, { className: 'w-8 h-8' })}
      </button>
      <ViewPlanModal
        isOpen={!!viewingEvent}
        onClose={handleCloseModal}
        savedEvent={viewingEvent}
      />
    </div>
  );
};

export default DashboardPage;