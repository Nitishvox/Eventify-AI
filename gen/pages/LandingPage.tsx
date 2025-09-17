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
    description: 'Join industry leaders for the latest in technology trends, networking, and innovation.',
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
    location: 'WeWork Mission Street',
    attendees: '78/100 attendees',
    price: 'Free',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80',
    category: 'Workshop',
    date: { day: '10', month: 'Aug' },
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies and tools from industry experts.',
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
    <div className="bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
             <div className="flex items-center space-x-2">
                {React.cloneElement(ICONS.CALENDAR, { className: "w-8 h-8 text-primary"})}
                <span className="font-bold text-xl tracking-tight">EventPlanner AI</span>
            </div>
            <div>
                 <button
                    onClick={onGetStarted}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-6 rounded-lg text-sm transition-all duration-300"
                >
                    Sign In
                </button>
            </div>
        </nav>
      </header>
      <main>
        <div className="relative isolate px-6 pt-14 lg:px-8">
            <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:py-56 text-center">
                 <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                    The Future of Event Planning is Here
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Leverage the power of generative AI to design, plan, and execute unforgettable events. From initial concept to the final schedule, our intelligent platform streamlines every detail.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <button
                        onClick={onGetStarted}
                        className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300"
                    >
                        Get Started
                    </button>
                    <a href="#" className="text-sm font-semibold leading-6 text-foreground">
                        Learn more <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </div>

        <div className="bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Discover Upcoming Events</h2>
                    <p className="mt-2 text-lg leading-8 text-muted-foreground">
                       Explore a curated selection of events happening near you.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
                    {mockEvents.map(event => (
                        <EventCard key={event.title} event={event} onCardClick={onGetStarted} />
                    ))}
                </div>
            </div>
        </div>
      </main>
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} AI Event Planner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;