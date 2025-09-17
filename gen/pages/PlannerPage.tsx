

import React, { useState, useEffect } from 'react';
import type { User, EventPlan, SavedEvent } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import Spinner from '../components/Spinner';
import FeatureCard from '../components/FeatureCard';
import { generateEventPlan, generateMoodBoard } from '../services/geminiService';
import { ICONS } from '../constants';
import ChatModal from '../components/ChatModal';

const LOCAL_STORAGE_KEY = 'ai-event-planner-events';

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
  const [teamNotes, setTeamNotes] = useState('');
  
  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventPlan, setEventPlan] = useState<EventPlan | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [editModeEventId, setEditModeEventId] = useState<number | null>(null);
  const [imageGenFailed, setImageGenFailed] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  useEffect(() => {
    const eventIdStr = localStorage.getItem('eventToEditId');
    if (eventIdStr) {
      const eventId = parseInt(eventIdStr, 10);
      setEditModeEventId(eventId);
      setIsLoading(true);
      
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        const allEvents: SavedEvent[] = localData ? JSON.parse(localData) : [];
        const eventToEdit = allEvents.find(event => event.id === eventId);

        if (!eventToEdit) {
            setError("Could not find the event to edit in local storage.");
        } else {
            const plan = eventToEdit.plan_data;
            setEventType(plan.eventName);
            setLocation(plan.venue.address);
            setVibe(plan.theme);
            setEventPlan(plan);
            setTeamNotes(plan.teamNotes || '');
            setCardImageUrl(eventToEdit.card_image_url);
            // Clear these fields as they aren't part of the core EventPlan and are for generation only
            setGuestCount('');
            setBudget('');
            setSpecialRequests('');
        }
      } catch (e) {
        setError("Error reading event from local storage.");
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
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

      setEventPlan({...plan, teamNotes});

    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImageSubmit = () => {
    if (manualImageUrl.trim()) {
      try {
        new URL(manualImageUrl);
        setCardImageUrl(manualImageUrl);
        setImageGenFailed(false);
        setError(null);
      } catch (_) {
        setError("Please enter a valid image URL.");
      }
    }
  };

  const handleSaveAndNavigate = async () => {
    if (!eventPlan || !user) return;
    setIsLoading(true);
    setError(null);
    
    const planToSave = { ...eventPlan, teamNotes };

    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let allEvents: SavedEvent[] = localData ? JSON.parse(localData) : [];

        if (editModeEventId) {
            // Update existing event
            allEvents = allEvents.map(event =>
                event.id === editModeEventId
                    ? { ...event, plan_data: planToSave, card_image_url: cardImageUrl }
                    : event
            );
        } else {
            // Add new event
            const newEvent: SavedEvent = {
                id: Date.now(),
                user_id: user.id,
                created_at: new Date().toISOString(),
                plan_data: planToSave,
                card_image_url: cardImageUrl,
            };
            allEvents.unshift(newEvent); // Add to the beginning of the array
        }
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allEvents));
        onNavigate(Page.Dashboard);

    } catch (e) {
        setError("Failed to save event to local storage.");
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePlanUpdateFromChat = (updatedPlan: EventPlan) => {
    setEventPlan(updatedPlan);
    setTeamNotes(updatedPlan.teamNotes || ''); // Sync team notes as well
    setIsChatModalOpen(false); // Close the modal
  };

  const formInputClass = "w-full px-4 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-ring transition";

  const renderInitialState = () => (
    <div className="text-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <FeatureCard icon={ICONS.CALENDAR} title="Detailed Agendas" description="Generate minute-by-minute schedules." />
        <FeatureCard icon={ICONS.LOCATION_MARKER} title="Venue Discovery" description="Find real, perfect-fit venues." />
        <FeatureCard icon={ICONS.IMAGE} title="Mood Boards" description="Create stunning visuals for your theme." />
        <FeatureCard icon={ICONS.SPARKLES} title="AI-Powered Ideas" description="Get creative themes and descriptions." />
      </div>
      <p className="text-lg text-muted-foreground">Fill out the form below to begin planning your next amazing event.</p>
    </div>
  );

  const renderPlan = () => {
    if (!eventPlan) return null;
    return (
      <div className="bg-card/50 border border-border rounded-2xl p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
                {cardImageUrl ? (
                    <img src={cardImageUrl} alt={eventPlan.eventName} className="rounded-lg shadow-lg w-full h-auto object-cover aspect-[16/9]" />
                ) : imageGenFailed ? (
                    <div className="bg-accent p-4 rounded-lg border border-dashed border-border space-y-3 h-full flex flex-col justify-center">
                        <p className="text-sm text-muted-foreground">Image generation failed. Please provide a URL for the event image.</p>
                        <input 
                            type="url" 
                            value={manualImageUrl} 
                            onChange={(e) => setManualImageUrl(e.target.value)} 
                            placeholder="https://example.com/image.jpg"
                            className={formInputClass}
                            aria-label="Manual Image URL"
                        />
                        <button onClick={handleManualImageSubmit} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-2 px-4 rounded-lg text-sm transition-all">
                            Set Image
                        </button>
                    </div>
                ) : (
                    <div className="bg-accent aspect-[16/9] rounded-lg flex items-center justify-center">
                        <p className="text-muted">No Image Generated</p>
                    </div>
                )}
            </div>
            <div className="md:w-2/3">
                <h2 className="text-3xl font-bold mb-2">{eventPlan.eventName}</h2>
                <p className="text-muted-foreground mb-4">{eventPlan.description}</p>
                <div className="flex items-center text-sm text-secondary bg-secondary/20 px-3 py-1 rounded-full w-fit mb-4">
                    {React.cloneElement(ICONS.EMOJI_HAPPY, { className: 'w-5 h-5'})}
                    <span className="ml-2 font-semibold">Theme: {eventPlan.theme}</span>
                </div>
                <button
                    onClick={() => setIsChatModalOpen(true)}
                    className="flex items-center space-x-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground font-bold py-2 px-4 rounded-lg text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {React.cloneElement(ICONS.SPARKLES, { className: "w-5 h-5" })}
                    <span>Refine with AI</span>
                </button>
            </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Venue Details</h3>
                <div className="space-y-3 text-sm">
                    {eventPlan.venue ? (<>
                        <p><strong className="font-semibold text-card-foreground">Name:</strong> {eventPlan.venue.name}</p>
                        <p><strong className="font-semibold text-card-foreground">Address:</strong> {eventPlan.venue.address}</p>
                        <p><strong className="font-semibold text-card-foreground">Description:</strong> {eventPlan.venue.description}</p>
                        {eventPlan.venue.website && (
                            <a href={eventPlan.venue.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center space-x-1">
                              <span>Visit Website</span>
                              {React.cloneElement(ICONS.ATTRIBUTION, { className: 'w-4 h-4' })}
                            </a>
                        )}
                    </>) : <p>No venue details provided.</p>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">Agenda</h3>
                {eventPlan.agenda ? (
                  <ul className="space-y-4">
                      {eventPlan.agenda.map((item, index) => (
                          <li key={index} className="flex items-start">
                              <span className="bg-accent text-muted-foreground font-bold text-sm px-2 py-1 rounded-md mr-4 w-20 text-center flex-shrink-0">{item.time}</span>
                              <div>
                                  <p className="font-semibold">{item.title}</p>
                                  <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                          </li>
                      ))}
                  </ul>
                ) : <p>No agenda provided.</p>}
            </div>
        </div>
        <div className="mt-10 flex justify-end">
            <button
                onClick={handleSaveAndNavigate}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg transition-all disabled:bg-muted"
            >
                {isLoading ? 'Saving...' : (editModeEventId ? 'Save Changes' : 'Save to Dashboard')}
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">AI Event Planner</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            {editModeEventId ? "Update your event details below." : "Describe your event, and let our AI handle the details."}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-2xl mb-12">
          <form onSubmit={(e) => { e.preventDefault(); handleGenerateOrUpdatePlan(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Event Type</label>
                <input type="text" value={eventType} onChange={(e) => setEventType(e.target.value)} className={formInputClass} placeholder="e.g., Birthday Party, Corporate Retreat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Number of Guests</label>
                <input type="text" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={formInputClass} placeholder="e.g., 50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Budget</label>
                <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} className={formInputClass} placeholder="e.g., $5,000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={formInputClass} placeholder="e.g., New York, NY" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Desired Vibe / Theme</label>
                <input type="text" value={vibe} onChange={(e) => setVibe(e.target.value)} className={formInputClass} placeholder="e.g., Casual and fun, Elegant and formal" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Special Requests</label>
                <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className={formInputClass} rows={2} placeholder="e.g., Vegetarian options, Live band" />
              </div>
               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Team Notes</label>
                <textarea value={teamNotes} onChange={(e) => setTeamNotes(e.target.value)} className={formInputClass} rows={3} placeholder="Internal notes for your team (e.g., Remember to contact DJ, confirm vegetarian count)" />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground font-bold py-3 px-8 rounded-lg text-base transition-all"
              >
                {isLoading ? <Spinner size="sm" /> : React.cloneElement(ICONS.LIGHTNING_BOLT, { className: "w-5 h-5" })}
                <span>{isLoading ? (editModeEventId ? 'Updating...' : 'Generating...') : (editModeEventId ? 'Update Plan' : 'Generate Plan')}</span>
              </button>
            </div>
          </form>
        </div>

        {error && <div className="bg-destructive/20 border border-destructive text-destructive px-4 py-3 rounded-lg text-center mb-8">{error}</div>}
        
        {isLoading && !eventPlan && <div className="flex justify-center items-center py-10"><Spinner size="lg"/></div>}

        {!isLoading && !eventPlan && renderInitialState()}
        
        {!isLoading && eventPlan && renderPlan()}

      </main>

      {eventPlan && (
        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          eventPlan={eventPlan}
          onPlanUpdate={handlePlanUpdateFromChat}
        />
      )}
    </div>
  );
};

export default PlannerPage;