import React, { useState } from 'react';
import { OpsMindBudgetCategory, OpsMindEventDetails } from '../../types';
import { generateBudgetPlan } from '../../services/geminiService';
import Loader from './Loader';
import { WalletIcon } from './Icons';

interface BudgetArchitectProps {
  onBudgetCalculated: (details: OpsMindEventDetails, plan: OpsMindBudgetCategory[]) => void;
  initialDetails?: OpsMindEventDetails | null;
}

const currencySymbols: { [key: string]: string } = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const BudgetArchitect: React.FC<BudgetArchitectProps> = ({ onBudgetCalculated, initialDetails }) => {
  const [details, setDetails] = useState(() => {
    const defaultDetails = {
      totalBudget: '500000',
      guestCount: '50',
      eventType: 'Corporate Mixer',
      priorities: 'Food & Drinks',
      currency: 'INR',
      description: 'An annual mixer for company employees and key partners to celebrate recent successes and network.',
      duration: '4',
    };

    if (initialDetails) {
      return {
        totalBudget: String(initialDetails.totalBudget),
        guestCount: String(initialDetails.guestCount),
        eventType: initialDetails.eventType,
        priorities: initialDetails.priorities.join(', '),
        currency: initialDetails.currency,
        description: initialDetails.description,
        duration: String(initialDetails.duration),
      };
    }
    
    return defaultDetails;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const eventDetails: OpsMindEventDetails = {
        totalBudget: Number(details.totalBudget),
        guestCount: Number(details.guestCount),
        eventType: details.eventType,
        priorities: details.priorities.split(',').map(p => p.trim()),
        currency: details.currency,
        description: details.description,
        duration: Number(details.duration),
    };

    try {
      const plan = await generateBudgetPlan(eventDetails);
      onBudgetCalculated(eventDetails, plan);
    } catch (err) {
      setError('Failed to generate budget plan. Please check your inputs and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><WalletIcon className="w-6 h-6"/> Budget Architect</h2>
        <p className="text-brand-gray-400 mt-1">Define your event parameters to generate an intelligent budget allocation.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="totalBudget" className="block text-sm font-medium text-brand-gray-300">Total Budget</label>
            <div className="mt-1 flex rounded-md shadow-sm">
               <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-brand-gray-600 bg-brand-gray-700 text-brand-gray-300 sm:text-sm">
                {currencySymbols[details.currency]}
              </span>
              <input type="number" name="totalBudget" id="totalBudget" value={details.totalBudget} onChange={handleInputChange} className="block w-full min-w-0 flex-1 rounded-none rounded-r-md bg-brand-gray-800 border-brand-gray-600 focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required />
            </div>
          </div>
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-brand-gray-300">Currency</label>
            <select name="currency" id="currency" value={details.currency} onChange={handleInputChange} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
           <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-brand-gray-300">Guest Count</label>
            <input type="number" name="guestCount" id="guestCount" value={details.guestCount} onChange={handleInputChange} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required />
          </div>
           <div>
            <label htmlFor="duration" className="block text-sm font-medium text-brand-gray-300">Duration (hours)</label>
            <input type="number" name="duration" id="duration" value={details.duration} onChange={handleInputChange} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-brand-gray-300">Event Type</label>
            <select name="eventType" id="eventType" value={details.eventType} onChange={handleInputChange} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required>
              <option>Corporate Mixer</option>
              <option>Tech Conference</option>
              <option>Product Launch</option>
              <option>Workshop/Seminar</option>
              <option>Charity Gala</option>
              <option>Wedding</option>
              <option>Birthday Party</option>
              <option>Music Festival</option>
              <option>Art Exhibition</option>
              <option>Holiday Party</option>
              <option>Family Reunion</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="priorities" className="block text-sm font-medium text-brand-gray-300">Priorities (comma-separated)</label>
            <input type="text" name="priorities" id="priorities" value={details.priorities} onChange={handleInputChange} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required />
          </div>
        </div>
        <div>
           <label htmlFor="description" className="block text-sm font-medium text-brand-gray-300">Event Description</label>
           <textarea name="description" id="description" value={details.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2" required />
        </div>
        <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:bg-brand-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                {isLoading ? <Loader /> : 'Generate Budget'}
            </button>
        </div>
        {error && <p className="text-red-400 text-right mt-4">{error}</p>}
      </form>
    </div>
  );
};

export default BudgetArchitect;
