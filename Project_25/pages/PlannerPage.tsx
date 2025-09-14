
import React, { useState, useEffect } from 'react';
import type { User, EventPlan, SavedEvent } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import Spinner from '../components/Spinner';
import FeatureCard from '../components/FeatureCard';
import ChatModal from '../components/ChatModal';
import { generateEventPlan, generateMoodBoard } from '../services/geminiService';
import { ICONS } from '../constants';

interface PlannerPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const PlannerPage: React.FC<PlannerPageProps> = ({ user, onLogout, onNavigate }) => {
  // Form State
  const [eventType, setEventType] = useState('Tech Conference');
  const [guestCount, setGuestCount] = useState('150');
  const [budget, setBudget] = useState('$20,000');
  const [location, setLocation] = useState('San Francisco, CA');
  const [vibe, setVibe] = useState('Innovative, professional, and engaging');
  const [specialRequests, setSpecialRequests] = useState('Need a good networking area and high-speed Wi-Fi.');
  
  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventPlan, setEventPlan] = useState<EventPlan | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [editModeEventId, setEditModeEventId] = useState<string | null>(null);
  const [imageGenFailed, setImageGenFailed] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  useEffect(() => {
    const eventId = localStorage.getItem('eventToEditId');
    if (eventId) {
      setEditModeEventId(eventId);
      const events: SavedEvent[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
      const eventToEdit = events.find(e => e.id === eventId);
      if (eventToEdit) {
        const { plan, cardImageUrl: existingImageUrl } = eventToEdit;
        setEventType(plan.eventName);
        setLocation(plan.venue.address);
        setVibe(plan.theme);
        // Pre-fill generated plan to allow immediate refinement
        setEventPlan(plan);
        setCardImageUrl(existingImageUrl);
        // Note: Not all form fields are stored in the plan, so they'll be default/empty.
        setGuestCount('');
        setBudget('');
        setSpecialRequests('');
      }
    }
    // Clean up the edit ID when the component unmounts
    return () => {
      localStorage.removeItem('eventToEditId');
    };
  }, []);

  const handleGenerateOrUpdatePlan = async () => {
    setIsLoading(true);
    setError(null);
    setEventPlan(null);
    setCardImageUrl(null);
    setImageGenFailed(false);
    setManualImageUrl('');

    try {
      const plan = await generateEventPlan(eventType, guestCount, budget, location, vibe, specialRequests);
      
      try {
        const images = await generateMoodBoard(plan.theme, plan.description);
        const newCardImageUrl = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : null;
        setCardImageUrl(newCardImageUrl);
      } catch (imageError: any) {
        console.error("Image generation failed:", imageError);
        setImageGenFailed(true);
        setError("AI failed to generate an image. You can provide one manually below.");
        setCardImageUrl(null);
      }

      setEventPlan(plan);

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImageSubmit = () => {
    if (manualImageUrl.trim()) {
      try {
        // Basic URL validation
        new URL(manualImageUrl);
        setCardImageUrl(manualImageUrl);
        setImageGenFailed(false);
        setError(null);
      } catch (_) {
        setError("Please enter a valid image URL.");
      }
    }
  };

  const handleSaveAndNavigate = () => {
    if (eventPlan) {
      if (editModeEventId) {
        const events: SavedEvent[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
        const updatedEvents = events.map(e => 
          e.id === editModeEventId 
            ? { ...e, plan: eventPlan, cardImageUrl: cardImageUrl } 
            : e
        );
        localStorage.setItem('savedEvents', JSON.stringify(updatedEvents));
      } else {
        const newSavedEvent: SavedEvent = {
          id: new Date().toISOString(),
          plan: eventPlan,
          cardImageUrl: cardImageUrl,
        };
        const existingEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
        localStorage.setItem('savedEvents', JSON.stringify([...existingEvents, newSavedEvent]));
      }
      onNavigate(Page.Dashboard);
    }
  };

  const handlePlanUpdate = (updatedPlan: EventPlan) => {
    setEventPlan(updatedPlan);
    setIsChatModalOpen(false); // Close modal after update
  };

  const formInputClass = "w-full px-4 py-2 bg-brand-gray-700 border border-brand-gray-600 rounded-md text-white placeholder-brand-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 transition";

  const renderInitialState = () => (
    <div className="text-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FeatureCard icon={ICONS.CALENDAR} title="Detailed Agendas" description="Generate minute-by-minute schedules." />
        <FeatureCard icon={ICONS.LOCATION_MARKER} title="Venue Discovery" description="Find real, perfect-fit venues." />
        <FeatureCard icon={ICONS.IMAGE} title="Mood Boards" description="Create stunning visuals for your theme." />
        <FeatureCard icon={ICONS.SPARKLES} title="AI-Powered Ideas" description="Get creative themes and descriptions." />
      </div>
      <p className="text-lg text-brand-gray-300">Fill out the form below to begin planning your next amazing event.</p>
    </div>
  );

  const renderPlan = () => {
    if (!eventPlan) return null;
    return (
      <div className="bg-brand-gray-800 border border-brand-gray-700 rounded-2xl p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
                {cardImageUrl ? (
                    <img src={cardImageUrl} alt={eventPlan.eventName} className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[16/9]" />
                ) : imageGenFailed ? (
                    <div className="bg-brand-gray-700 p-4 rounded-lg border border-dashed border-brand-gray-600 space-y-3 h-full flex flex-col justify-center">
                        <p className="text-sm text-brand-gray-300">Image generation failed. Please provide a URL for the event image.</p>
                        <input 
                            type="url" 
                            value={manualImageUrl} 
                            onChange={(e) => setManualImageUrl(e.target.value)} 
                            placeholder="https://example.com/image.jpg"
                            className={formInputClass}
                            aria-label="Manual Image URL"
                        />
                        <button onClick={handleManualImageSubmit} className="w-full bg-brand-purple-500 hover:bg-brand-purple-400 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all">
                            Set Image
                        </button>
                    </div>
                ) : (
                    <div className="bg-brand-gray-700 aspect-[16/9] rounded-lg flex items-center justify-center">
                        <p className="text-brand-gray-400">No Image Generated</p>
                    </div>
                )}
            </div>
            <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-2">{eventPlan.eventName}</h2>
                <p className="text-brand-gray-300 mb-4">{eventPlan.description}</p>
                <div className="flex items-center text-sm text-brand-purple-300 bg-brand-purple-500/20 px-3 py-1 rounded-full w-fit mb-6">
                    {React.cloneElement(ICONS.EMOJI_HAPPY, { className: 'w-5 h-5'})}
                    <span className="ml-2 font-semibold">Theme: {eventPlan.theme}</span>
                </div>
            </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 border-b border-brand-gray-600 pb-2">Venue Details</h3>
                <div className="space-y-3 text-sm">
                    {eventPlan.venue ? (<>
                        <p><strong className="font-semibold text-brand-gray-200">Name:</strong> {eventPlan.venue.name}</p>
                        <p><strong className="font-semibold text-brand-gray-200">Address:</strong> {eventPlan.venue.address}</p>
                        <p><strong className="font-semibold text-brand-gray-200">Description:</strong> {eventPlan.venue.description}</p>
                        {eventPlan.venue.website && (
                            <a href={eventPlan.venue.website} target="_blank" rel="noopener noreferrer" className="text-brand-blue-400 hover:underline flex items-center space-x-1">
                              <span>Visit Website</span>
                              {React.cloneElement(ICONS.ATTRIBUTION, { className: 'w-4 h-4' })}
                            </a>
                        )}
                    </>) : <p>No venue details provided.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 border-b border-brand-gray-600 pb-2">Agenda</h3>
                {eventPlan.agenda ? (
                  <ul className="space-y-4">
                      {eventPlan.agenda.map((item, index) => (
                          <li key={index} className="flex items-start">
                              <span className="bg-brand-gray-700 text-brand-gray-200 font-bold text-sm px-2 py-1 rounded-md mr-4 w-20 text-center flex-shrink-0">{item.time}</span>
                              <div>
                                  <p className="font-semibold">{item.title}</p>
                                  <p className="text-sm text-brand-gray-300">{item.description}</p>
                              </div>
                          </li>
                      ))}
                  </ul>
                ) : <p>No agenda provided.</p>}
            </div>
        </div>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={() => setIsChatModalOpen(true)}
              className="flex items-center justify-center space-x-2 bg-brand-purple-500 hover:bg-brand-purple-400 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              {React.cloneElement(ICONS.SPARKLES, { className: 'w-5 h-5' })}
              <span>Refine with AI</span>
            </button>
            <button
                onClick={handleSaveAndNavigate}
                className="bg-brand-blue-500 hover:bg-brand-blue-400 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
                {editModeEventId ? 'Save Changes' : 'Save to Dashboard'}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-dark text-brand-gray-100 min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">AI Event Planner</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-brand-gray-300">
            {editModeEventId ? "Update your event details below." : "Describe your event, and let our AI handle the details."}
          </p>
        </div>

        <div className="bg-brand-gray-800/50 border border-brand-gray-700 rounded-2xl p-8 shadow-2xl mb-12">
          <form onSubmit={(e) => { e.preventDefault(); handleGenerateOrUpdatePlan(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Event Type</label>
                <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} className={formInputClass} placeholder="e.g., Birthday Party, Corporate Retreat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Number of Guests</label>
                <input type="text" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={formInputClass} placeholder="e.g., 50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Budget</label>
                <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className={formInputClass} placeholder="e.g., $5,000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={formInputClass} placeholder="e.g., New York, NY" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Desired Vibe / Theme</label>
                <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} className={formInputClass} placeholder="e.g., Casual and fun, Elegant and formal" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-gray-200 mb-2">Special Requests</label>
                <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className={formInputClass} rows={3} placeholder="e.g., Vegetarian options, Live band" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-brand-blue-500 hover:bg-brand-blue-400 disabled:bg-brand-gray-600 text-white font-bold py-3 px-8 rounded-lg text-base transition-all"
              >
                {isLoading ? <Spinner size="sm" /> : React.cloneElement(ICONS.LIGHTNING_BOLT, { className: "w-5 h-5" })}
                <span>{isLoading ? (editModeEventId ? 'Updating...' : 'Generating...') : (editModeEventId ? 'Update Plan' : 'Generate Plan')}</span>
              </button>
            </div>
          </form>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center mb-8">{error}</div>}
        
        {isLoading && <div className="flex justify-center items-center py-10"><Spinner size="lg"/></div>}

        {!isLoading && !eventPlan && renderInitialState()}
        
        {!isLoading && eventPlan && renderPlan()}

      </main>
      {eventPlan && isChatModalOpen && (
          <ChatModal
            isOpen={isChatModalOpen}
            onClose={() => setIsChatModalOpen(false)}
            eventPlan={eventPlan}
            onPlanUpdate={handlePlanUpdate}
          />
      )}
    </div>
  );
};

export default PlannerPage;
