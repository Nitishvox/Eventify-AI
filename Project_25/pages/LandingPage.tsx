import React from 'react';
import EventCard from '../components/EventCard'; // Use the new reusable component
import { ICONS } from '../constants';
import type { Event } from '../types';

const mockEvents: Event[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
    category: 'Conference',
    date: { day: '15', month: 'Oct' },
    title: 'Tech Conference 2024',
    description: 'Join industry leaders for the latest in technology trends, networking, and...',
    fullDate: 'Oct 15, 2024 at 09:00',
    location: 'San Francisco Convention Center',
    attendees: '245/500 attendees',
    price: '$299',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80',
    category: 'Concert',
    date: { day: '20', month: 'Jul' },
    title: 'Summer Music Festival',
    description: 'Three days of amazing music featuring top artists from around the world.',
    fullDate: 'Jul 20, 2024 at 14:00',
    location: 'Golden Gate Park, San Francisco',
    attendees: '1250/2000 attendees',
    price: '$89',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    category: 'Networking',
    date: { day: '25', month: 'Jun' },
    title: 'Startup Networking Night',
    description: 'Connect with entrepreneurs, investors, and startup enthusiasts in the Bay Area.',
    fullDate: 'Jun 25, 2024 at 18:30',
    location: 'WeWork Mission Street, San Francisco',
    attendees: '78/100 attendees',
    price: 'Free',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80',
    category: 'Workshop',
    date: { day: '10', month: 'Aug' },
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies and tools from industry...',
    fullDate: 'Aug 10, 2024 at 10:00',
    location: 'Downtown Learning Center',
    attendees: '32/50 attendees',
    price: '$149',
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-gray-50 text-brand-dark">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                {React.cloneElement(ICONS.CALENDAR, { className: "w-7 h-7 text-brand-blue-500"})}
                <span className="font-bold text-xl">AI Event Planner</span>
            </div>
            <div>
                 <button
                    onClick={onGetStarted}
                    className="bg-brand-blue-500 hover:bg-brand-blue-400 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all duration-300"
                >
                    Plan an Event
                </button>
            </div>
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
              Discover Your Next Event
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
              Use the power of AI to find curated events, or start planning your own.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockEvents.map(event => (
            <EventCard key={event.title} event={event} onCardClick={onGetStarted} />
          ))}
        </div>
      </main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Event Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;