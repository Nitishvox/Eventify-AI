
import React, { useState, useEffect, useCallback } from 'react';
import type { User, SavedEvent } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import { getCoralPoints, getTotalCoralPoints } from '../services/coralService';
import { ICONS } from '../constants';

// Inlined Counter Component for smooth number animations
const Counter: React.FC<{ end: number; prefix?: string; }> = ({ end, prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0; // Always start from 0 on new end value for a more impactful animation
    const duration = 1500;
    const startTime = performance.now();

    const animateCount = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      // Ease-out quint function for a smoother slowdown
      const easedProgress = 1 - Math.pow(1 - progress, 5);
      const newCount = Math.floor(start + (end - start) * easedProgress);
      
      if (count !== newCount) {
        setCount(newCount);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animateCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  return <>{prefix}{count.toLocaleString()}</>;
};

const parseNumericValue = (value: string | undefined): number => {
    if (!value) return 0;
    const num = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
}


// Main Page Component
interface VisualisationsPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}
const VisualisationsPage: React.FC<VisualisationsPageProps> = ({ user, onLogout, onNavigate }) => {
  const [userApiUsage, setUserApiUsage] = useState(0);
  const [totalApiUsage, setTotalApiUsage] = useState(0);
  const [allEvents, setAllEvents] = useState<SavedEvent[]>([]);
  
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalGuests, setTotalGuests] = useState(0);
  
  const [eventTypeCounts, setEventTypeCounts] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    // Fetch API usage stats
    const [currentUserApi, platformTotalApi] = await Promise.all([
      getCoralPoints(user.id),
      getTotalCoralPoints(),
    ]);
    setUserApiUsage(currentUserApi);
    setTotalApiUsage(platformTotalApi);
    
    // Fetch and process event data from localStorage
    const localData = localStorage.getItem('ai-event-planner-events');
    const events: SavedEvent[] = localData ? JSON.parse(localData) : [];
    setAllEvents(events.slice(0, 5)); // For "Recent Events" list

    setTotalEvents(events.length);

    const budgetSum = events.reduce((sum, event) => {
        const budgetString = (event.plan_data as any).budget || '$0'; // Handle legacy data
        return sum + parseNumericValue(budgetString);
    }, 0);
    setTotalBudget(budgetSum);
    
    const guestSum = events.reduce((sum, event) => {
        const guestString = (event.plan_data as any).guestCount || '0'; // Handle legacy data
        return sum + parseNumericValue(guestString);
    }, 0);
    setTotalGuests(guestSum);
    
    // Simple event type analysis
    const counts: Record<string, number> = {};
    const keywords = ['conference', 'workshop', 'party', 'meetup', 'launch', 'gala', 'retreat'];
    events.forEach(event => {
        const name = event.plan_data.eventName.toLowerCase();
        let found = false;
        for (const keyword of keywords) {
            if (name.includes(keyword)) {
                const capitalized = keyword.charAt(0).toUpperCase() + keyword.slice(1);
                counts[capitalized] = (counts[capitalized] || 0) + 1;
                found = true;
                break;
            }
        }
        if (!found) {
            counts['Other'] = (counts['Other'] || 0) + 1;
        }
    });
    setEventTypeCounts(counts);

  }, [user.id]);

  useEffect(() => {
    fetchData();

    const updatePointsHandler = () => {
        fetchData();
    };

    window.addEventListener('coralPointsUpdated', updatePointsHandler);
    window.addEventListener('storage', fetchData); // Listen for changes in other tabs

    return () => {
      window.removeEventListener('coralPointsUpdated', updatePointsHandler);
      window.removeEventListener('storage', fetchData);
    };
  }, [fetchData]);

  const maxEventTypeCount = Math.max(...Object.values(eventTypeCounts), 0);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Analytics Dashboard</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            Monitor key metrics for your event planning activities and platform usage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card p-8 rounded-2xl border border-border text-center flex flex-col justify-center animate-fade-in">
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Total Events Planned</h2>
                <div className="text-7xl font-bold text-primary my-4">
                    <Counter end={totalEvents} />
                </div>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border text-center flex flex-col justify-center animate-fade-in" style={{animationDelay: '100ms'}}>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Total Budget Managed</h2>
                <div className="text-7xl font-bold text-green-400 my-4">
                    <Counter end={totalBudget} prefix="$" />
                </div>
            </div>
             <div className="bg-card p-8 rounded-2xl border border-border text-center flex flex-col justify-center animate-fade-in" style={{animationDelay: '200ms'}}>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Total Guests</h2>
                 <div className="text-7xl font-bold text-secondary my-4">
                    <Counter end={totalGuests} />
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-card p-8 rounded-2xl border border-border animate-fade-in" style={{animationDelay: '300ms'}}>
                <h2 className="text-2xl font-bold mb-6">Event Type Breakdown</h2>
                <div className="space-y-4">
                    {Object.keys(eventTypeCounts).length > 0 ? Object.entries(eventTypeCounts).map(([type, count]) => (
                        <div key={type} className="flex items-center">
                            <span className="w-24 text-muted-foreground">{type}</span>
                            <div className="flex-1 bg-accent rounded-full h-6 mr-4">
                                <div className="bg-primary h-6 rounded-full text-right pr-2 text-primary-foreground text-sm flex items-center justify-end"
                                     style={{ width: `${(count / maxEventTypeCount) * 100}%` }}>
                                    {count}
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-muted-foreground">No event data to analyze.</p>}
                </div>
            </div>
             <div className="bg-card p-8 rounded-2xl border border-border animate-fade-in" style={{animationDelay: '400ms'}}>
                <h2 className="text-2xl font-bold mb-6">Recent Events</h2>
                 <ul className="space-y-3">
                    {allEvents.length > 0 ? allEvents.map(event => (
                        <li key={event.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                            <div>
                                <p className="font-semibold text-foreground">{event.plan_data.eventName}</p>
                                <p className="text-sm text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="text-sm font-mono bg-background px-2 py-1 rounded">{event.plan_data.venue.address.split(',').pop()?.trim()}</span>
                        </li>
                    )) : <p className="text-muted-foreground">No recent events found.</p>}
                 </ul>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border text-center flex flex-col justify-center animate-fade-in" style={{animationDelay: '500ms'}}>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Your API Usage</h2>
                <div className="text-6xl font-bold text-primary my-4">
                    <Counter end={userApiUsage} />
                </div>
                <p className="text-muted-foreground">Total API Calls</p>
            </div>
            <div className="bg-card p-8 rounded-2xl border border-border text-center flex flex-col justify-center animate-fade-in" style={{animationDelay: '600ms'}}>
                <h2 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider">Total Platform Usage</h2>
                <div className="text-6xl font-bold text-green-400 my-4">
                    <Counter end={totalApiUsage} />
                </div>
                <p className="text-muted-foreground">Total API Calls by All Users</p>
            </div>
        </div>

      </main>
    </div>
  );
};

export default VisualisationsPage;