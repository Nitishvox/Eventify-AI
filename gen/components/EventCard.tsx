import React from 'react';
import { ICONS } from '../constants';
import type { Event } from '../types';

// FIX: Changed the 'icon' prop type from 'React.ReactElement' to 'JSX.Element' to resolve a TypeScript error with React.cloneElement. 'JSX.Element' provides a more specific type that allows for cloning with new props like 'className'.
const DetailItem: React.FC<{ icon: JSX.Element; text: string }> = ({ icon, text }) => (
    <div className="flex items-center text-sm text-muted-foreground">
      {React.cloneElement(icon, { className: 'w-4 h-4 mr-2 text-muted flex-shrink-0' })}
      <span className="truncate">{text}</span>
    </div>
  );
  

const EventCard: React.FC<{ event: Event; onCardClick: () => void }> = ({ event, onCardClick }) => {
  // A simple error handler for missing images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, globalThis.Event>) => {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'; // A generic fallback image
  };
    
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden flex flex-col border border-border group hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
          onError={handleImageError} 
        />
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {event.category}
        </div>
        <div className="absolute top-3 right-3 bg-card/90 text-card-foreground text-center rounded-md px-2 py-1 backdrop-blur-sm border border-border">
          <p className="font-bold text-sm">{event.date.day}</p>
          <p className="text-xs font-semibold uppercase">{event.date.month}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-card-foreground mb-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow">{event.description}</p>
        <div className="space-y-2 mb-4">
            <DetailItem icon={ICONS.CALENDAR} text={event.fullDate} />
            <DetailItem icon={ICONS.LOCATION_MARKER} text={event.location} />
            <DetailItem icon={ICONS.USERS} text={event.attendees} />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <p className={`text-lg font-bold ${event.price === 'Free' ? 'text-green-400' : 'text-card-foreground'}`}>
            {event.price}
          </p>
          <button
            onClick={onCardClick}
            className="px-4 py-2 text-sm font-semibold bg-accent border border-border rounded-md text-accent-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;