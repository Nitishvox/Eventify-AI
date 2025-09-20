import React from 'react';
import type { OpsMindBudgetCategory, OpsMindEventDetails, OpsMindTimeline, OpsMindVendor } from '../../types';
import { PartyPopperIcon, CheckCircleIcon } from './Icons';
import Card from './Card';

interface OpsMindSummaryProps {
  eventDetails: OpsMindEventDetails;
  budgetPlan: OpsMindBudgetCategory[];
  vendors: OpsMindVendor[];
  timeline: OpsMindTimeline;
  onEdit: () => void;
  onRestart: () => void;
}

const currencySymbols: { [key: string]: string } = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const OpsMindSummary: React.FC<OpsMindSummaryProps> = ({
  eventDetails,
  budgetPlan,
  vendors,
  timeline,
  onEdit,
  onRestart,
}) => {
    
  const currencySymbol = currencySymbols[eventDetails.currency] || '$';

  const handleDownload = () => {
    let content = `OpsMind AI - Event Operations Plan\n`;
    content += `===================================\n\n`;

    // Event Details
    content += `1. EVENT OVERVIEW\n`;
    content += `-----------------\n`;
    content += `Event Type: ${eventDetails.eventType}\n`;
    content += `Description: ${eventDetails.description}\n`;
    content += `Location: ${eventDetails.location}\n`;
    content += `Guest Count: ${eventDetails.guestCount}\n`;
    content += `Duration: ${eventDetails.duration} hours\n`;
    content += `Total Budget: ${currencySymbol}${eventDetails.totalBudget}\n`;
    content += `Priorities: ${eventDetails.priorities.join(', ')}\n\n`;

    // Budget Plan
    content += `2. BUDGET ALLOCATION\n`;
    content += `--------------------
`;
    budgetPlan.forEach(cat => {
        content += `- ${cat.category}: ${currencySymbol}${cat.amount} (${cat.percentage}%)\n`;
        content += `  Trade-offs: ${cat.tradeOffs}\n\n`;
    });

    // Vendors
    content += `3. VENDOR & PROCUREMENT INSIGHTS\n`;
    content += `--------------------------------\n`;
    vendors.forEach(vendor => {
        content += `* ${vendor.category.toUpperCase()} *\n`;
        content += `  - Professional Tip: ${vendor.description}\n`;
        content += `  - Budget Note: ${vendor.budgetNote}\n`;
        content += `  - Recommended Search: "Find ${vendor.category} vendors in ${eventDetails.location}"\n\n`;
    });
    
    // Timeline
    content += `4. EVENT TIMELINE & GUEST FLOW\n`;
    content += `------------------------------\n`;
    content += `Strategic Summary: ${timeline.summary}\n\n`;
    content += `Agenda:\n`;
    timeline.agenda.forEach(item => {
        content += `  - ${item.time}: ${item.title}\n`;
        content += `    ${item.description}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpsMind-${eventDetails.eventType.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-center animate-fade-in-up space-y-6">
      <div className="flex flex-col items-center gap-4">
        <PartyPopperIcon className="w-16 h-16 text-brand-primary" />
        <h2 className="text-3xl font-bold text-white">Operations Blueprint Generated!</h2>
      </div>
      <p className="text-brand-gray-300 max-w-2xl mx-auto">
        Your comprehensive operations plan is ready. OpsMind AI has created a budget, vendor insights, and a guest-centric timeline to ensure your event's success.
      </p>
      
      <Card className="text-left">
          <h3 className="text-xl font-bold text-white">Event Summary</h3>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <p><strong className="block text-brand-gray-400">Event Type</strong>{eventDetails.eventType}</p>
              <p><strong className="block text-brand-gray-400">Location</strong>{eventDetails.location}</p>
              <p><strong className="block text-brand-gray-400">Guests</strong>{eventDetails.guestCount}</p>
              <p><strong className="block text-brand-gray-400">Budget</strong>{currencySymbol}{eventDetails.totalBudget.toLocaleString()}</p>
          </div>
      </Card>

      <div className="flex flex-col items-center gap-2 text-lg text-green-400">
        <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Budget Plan Architected</div>
        <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Vendor Insights Generated</div>
        <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Event Timeline Designed</div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          Download Blueprint
        </button>
        <button
          onClick={onEdit}
          className="w-full sm:w-auto bg-brand-gray-600 hover:bg-brand-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
        >
          Back to Workspace
        </button>
      </div>
      <button
        onClick={onRestart}
        className="text-brand-gray-400 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
      >
        or Plan Another Event
      </button>
    </div>
  );
};

export default OpsMindSummary;
