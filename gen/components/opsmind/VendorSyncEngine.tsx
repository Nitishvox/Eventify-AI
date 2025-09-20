import React from 'react';
import { OpsMindEventDetails, OpsMindVendor } from '../../types';
import { LightbulbIcon, StarIcon } from './Icons';
import Card from './Card';

interface VendorSyncEngineProps {
  eventDetails: OpsMindEventDetails;
  vendors: OpsMindVendor[];
}

const VendorSyncEngine: React.FC<VendorSyncEngineProps> = ({ eventDetails, vendors }) => {
  
  const handleSearch = (category: string) => {
    const query = `${category} in ${eventDetails.location}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.map((vendor, index) => (
          <Card 
            key={index} 
            className="flex flex-col animate-fade-in-up" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="text-xl font-semibold text-brand-primary">{vendor.category}</h3>
            
            <div className="flex items-start gap-3 mt-3 pt-3 border-t border-brand-gray-700 flex-grow">
              <LightbulbIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
              <p className="text-brand-gray-300 text-sm">{vendor.description}</p>
            </div>

             <div className="flex items-start gap-3 mt-3 pt-3 border-t border-brand-gray-700 flex-grow bg-brand-primary/10 p-3 rounded-lg">
              <StarIcon className="w-5 h-5 text-brand-primary shrink-0 mt-1" />
              <p className="text-brand-gray-200 text-sm font-semibold">{vendor.budgetNote}</p>
            </div>

            <div className="mt-4">
              <button 
                onClick={() => handleSearch(vendor.category)}
                className="w-full bg-brand-gray-700 hover:bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Search for {vendor.category} Vendors
              </button>
            </div>
          </Card>
        ))}
    </div>
  );
};

export default VendorSyncEngine;
