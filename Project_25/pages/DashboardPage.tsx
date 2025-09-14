import React, { useState, useEffect } from 'react';
import type { User, SavedEvent } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import SavedEventCard from '../components/SavedEventCard';
import ViewPlanModal from '../components/ViewPlanModal';
import { ICONS } from '../constants';

const getSavedEvents = (): SavedEvent[] => {
  try {
      const events = localStorage.getItem('savedEvents');
      return events ? JSON.parse(events) : [];
  } catch (error) {
      console.error("Could not retrieve saved events from local storage:", error);
      return [];
  }
};

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout, onNavigate }) => {
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [viewingEvent, setViewingEvent] = useState<SavedEvent | null>(null);

  useEffect(() => {
    setSavedEvents(getSavedEvents());
  }, []);

  const updateEventsInStorage = (events: SavedEvent[]) => {
    localStorage.setItem('savedEvents', JSON.stringify(events));
  };

  const handleViewPlan = (event: SavedEvent) => {
    setViewingEvent(event);
  };
  
  const handleEdit = (event: SavedEvent) => {
    localStorage.setItem('eventToEditId', event.id);
    onNavigate(Page.Planner);
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event plan?")) {
      const updatedEvents = savedEvents.filter(event => event.id !== eventId);
      setSavedEvents(updatedEvents);
      updateEventsInStorage(updatedEvents);
    }
  };

  const handleCloseModal = () => {
    setViewingEvent(null);
  };
  
  const renderEmptyState = () => (
    <div className="text-center py-20 bg-brand-gray-800/50 border-2 border-dashed border-brand-gray-700 rounded-2xl">
      <div className="inline-block bg-brand-gray-700 p-4 rounded-full mb-4">
        {React.cloneElement(ICONS.IMAGE_GALLERY, { className: 'w-12 h-12 text-brand-gray-400' })}
      </div>
      <h2 className="text-2xl font-bold mb-2">No Saved Events Yet</h2>
      <p className="text-brand-gray-300 mb-6">Your planned events will appear here once you save them.</p>
      <button
        onClick={() => onNavigate(Page.Planner)}
        className="bg-brand-blue-500 hover:bg-brand-blue-400 text-white font-bold py-2 px-6 rounded-lg transition-all"
      >
        Plan Your First Event
      </button>
    </div>
  );

  return (
    <div className="bg-brand-dark text-brand-gray-100 min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Event Dashboard</h1>
           <button
            onClick={() => onNavigate(Page.Planner)}
            className="hidden sm:flex items-center justify-center space-x-2 bg-brand-blue-500 hover:bg-brand-blue-400 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
                {React.cloneElement(ICONS.LIGHTNING_BOLT, { className: 'w-5 h-5' })}
                <span>New Event</span>
            </button>
        </div>
        
        {savedEvents.length === 0 ? (
          renderEmptyState()
        ) : (
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
        )}
      </main>
      <ViewPlanModal
        isOpen={!!viewingEvent}
        onClose={handleCloseModal}
        savedEvent={viewingEvent}
      />
    </div>
  );
};

export default DashboardPage;