import React, { useState, useEffect } from 'react';
import { OpsMindBudgetCategory, OpsMindEventDetails, OpsMindVendor } from '../../types';
import { findVendors } from '../../services/geminiService';
import Loader from './Loader';
import { UsersIcon, StarIcon } from './Icons';
import Card from './Card';

interface VendorSyncEngineProps {
  eventDetails: OpsMindEventDetails;
  budgetPlan: OpsMindBudgetCategory[];
  onVendorsFound: (vendors: Record<string, OpsMindVendor[]>) => void;
}

const VendorSyncEngine: React.FC<VendorSyncEngineProps> = ({ eventDetails, budgetPlan, onVendorsFound }) => {
  const [vendors, setVendors] = useState<Record<string, OpsMindVendor[]> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await findVendors(eventDetails, budgetPlan);
      setVendors(result);
      onVendorsFound(result);
    } catch (err) {
      setError('Failed to find vendors. The AI might be busy, please try again in a moment.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-brand-gray-500'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><UsersIcon className="w-6 h-6"/> VendorSync Engine</h2>
        <p className="text-brand-gray-400 mt-1">Discover and vet vendors perfectly matched to your event's vibe and budget.</p>
      </div>

      {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
      {error && <p className="text-red-400 text-center">{error}</p>}

      {vendors && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(vendors).map(([category, vendorList]) => (
            <div key={category}>
              <h3 className="text-xl font-semibold mb-4 text-brand-primary">{category}</h3>
              <div className="space-y-4">
                {vendorList.map((vendor, index) => (
                  <Card key={index}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white">{vendor.name}</h4>
                      {renderStars(vendor.rating)}
                    </div>
                    <p className="text-sm text-brand-gray-300 mt-2">{vendor.description}</p>
                    <p className="text-sm mt-3 pt-3 border-t border-brand-gray-700">
                      <span className="font-semibold text-brand-gray-400">Negotiation Tip: </span>
                      <span className="text-brand-gray-300">{vendor.negotiationPoint}</span>
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorSyncEngine;
