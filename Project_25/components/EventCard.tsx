import React from 'react';
import { ICONS } from '../constants';
import type { Event } from '../types';

// FIX: Changed the 'icon' prop type from 'React.ReactElement' to 'JSX.Element' to resolve a TypeScript error with React.cloneElement. 'JSX.Element' provides a more specific type that allows for cloning with new props like 'className'.
const DetailItem: React.FC<{ icon: JSX.Element; text: string }> = ({ icon, text }) => (
    <div className="flex items-center text-sm text-gray-600">
      {React.cloneElement(icon, { className: 'w-4 h-4 mr-2 text-gray-500 flex-shrink-0' })}
      <span className="truncate">{text}</span>
    </div>
  );
  

const EventCard: React.FC<{ event: Event; onCardClick: () => void }> = ({ event, onCardClick }) => {
  // A simple error handler for missing images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, globalThis.Event>) => {
      e.currentTarget.src = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80'; // A generic fallback image
  };
    
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.title} 
          className="w-full h-40 object-cover" 
          onError={handleImageError} 
        />
        <div className="absolute top-3 left-3 bg-gray-900/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {event.category}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 text-gray-800 text-center rounded-md px-2 py-1">
          <p className="font-bold text-sm">{event.date.day}</p>
          <p className="text-xs font-semibold">{event.date.month}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{event.description}</p>
        <div className="space-y-2 mb-4">
            <DetailItem icon={ICONS.CALENDAR} text={event.fullDate} />
            <DetailItem icon={ICONS.LOCATION_MARKER} text={event.location} />
            <DetailItem icon={ICONS.USERS} text={event.attendees} />
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <p className={`text-lg font-bold ${event.price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>
            {event.price}
          </p>
          <button
            onClick={onCardClick}
            className="px-4 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;