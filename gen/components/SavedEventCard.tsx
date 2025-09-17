import React from 'react';
import type { SavedEvent } from '../types';
import { ICONS } from '../constants';

interface SavedEventCardProps {
  savedEvent: SavedEvent;
  onViewPlan: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const SavedEventCard: React.FC<SavedEventCardProps> = ({ savedEvent, onViewPlan, onEdit, onDelete }) => {
  const { plan_data: plan, card_image_url: cardImageUrl } = savedEvent;

  const fallbackImage = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group relative bg-card rounded-lg shadow-lg overflow-hidden border border-border hover:border-primary transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={cardImageUrl || fallbackImage}
          alt={plan.eventName}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = fallbackImage; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-5">
            <p className="text-sm text-secondary font-semibold mb-1">{plan.eventDate}</p>
            <h3 className="text-xl font-bold text-white mb-2 truncate">{plan.eventName}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {React.cloneElement(ICONS.LOCATION_MARKER, { className: 'w-4 h-4 flex-shrink-0' })}
                <span className="truncate">{plan.venue?.name || 'Venue TBD'}</span>
            </div>
        </div>
      </div>
       <div className="absolute top-4 right-4 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button
            onClick={onViewPlan}
            className="flex items-center justify-center w-10 h-10 bg-accent/80 backdrop-blur-sm rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            title="View Plan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
          </button>
           <button
            onClick={onEdit}
            className="flex items-center justify-center w-10 h-10 bg-accent/80 backdrop-blur-sm rounded-full text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
            title="Edit Plan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
          </button>
           <button
            onClick={onDelete}
            className="flex items-center justify-center w-10 h-10 bg-accent/80 backdrop-blur-sm rounded-full text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
            title="Delete Plan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
          </button>
      </div>
    </div>
  );
};

export default SavedEventCard;