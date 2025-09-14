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
  const { plan, cardImageUrl } = savedEvent;

  const fallbackImage = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="bg-brand-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-brand-gray-700 hover:border-brand-blue-500 transition-all duration-300 transform hover:-translate-y-1">
      <img
        src={cardImageUrl || fallbackImage}
        alt={plan.eventName}
        className="w-full h-48 object-cover"
        onError={(e) => { e.currentTarget.src = fallbackImage; }}
      />
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-sm text-brand-purple-300 font-semibold mb-1">{plan.eventDate}</p>
        <h3 className="text-xl font-bold text-white mb-2 truncate">{plan.eventName}</h3>
        <p className="text-brand-gray-300 text-sm mb-4 flex-grow">{plan.theme}</p>
        
        <div className="mt-auto pt-4 border-t border-brand-gray-700">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 text-sm text-brand-gray-300">
                    {React.cloneElement(ICONS.LOCATION_MARKER, { className: 'w-4 h-4' })}
                    <span className="truncate">{plan.venue?.name || 'Venue TBD'}</span>
                </div>
                <button
                    onClick={onViewPlan}
                    className="text-sm font-semibold text-brand-blue-400 hover:text-brand-blue-300 transition"
                >
                    View Plan &rarr;
                </button>
            </div>
            <div className="flex items-center justify-end space-x-4">
                 <button
                    onClick={onEdit}
                    className="text-sm font-semibold text-brand-gray-300 hover:text-white transition"
                >
                    Edit
                </button>
                <button
                    onClick={onDelete}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 transition"
                >
                    Delete
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SavedEventCard;