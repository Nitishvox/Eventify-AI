import React, { useState } from 'react';
import type { OpsMindBudgetCategory, OpsMindEventDetails, OpsMindTimeline, OpsMindVendor } from '../../types';
import { findVendors, generateEventTimeline } from '../../services/geminiService';
import Loader from './Loader';
import { UsersIcon, BrainIcon } from './Icons';
import VendorSyncEngine from './VendorSyncEngine';
import TimelineArchitect from './TimelineArchitect';
import Card from './Card';

interface OpsMindWorkspaceProps {
  eventDetails: OpsMindEventDetails;
  budgetPlan: OpsMindBudgetCategory[];
  onWorkspaceComplete: (vendors: OpsMindVendor[], timeline: OpsMindTimeline) => void;
}

const OpsMindWorkspace: React.FC<OpsMindWorkspaceProps> = ({ eventDetails, budgetPlan, onWorkspaceComplete }) => {
  const [vendors, setVendors] = useState<OpsMindVendor[] | null>(null);
  const [timeline, setTimeline] = useState<OpsMindTimeline | null>(null);
  
  const [vendorState, setVendorState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [timelineState, setTimelineState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  
  const [vendorError, setVendorError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const handleGenerateVendors = async () => {
    setVendorState('loading');
    setVendorError(null);
    try {
      const result = await findVendors(eventDetails, budgetPlan);
      setVendors(result);
      setVendorState('done');
    } catch (err) {
      setVendorError('Failed to find vendors. The AI might be busy, please try again.');
      setVendorState('error');
      console.error(err);
    }
  };

  const handleGenerateTimeline = async () => {
    setTimelineState('loading');
    setTimelineError(null);
    try {
      const result = await generateEventTimeline(eventDetails);
      setTimeline(result);
      setTimelineState('done');
    } catch (err) {
      setTimelineError('Failed to generate timeline. Please try again.');
      setTimelineState('error');
      console.error(err);
    }
  };

  const bothDone = vendorState === 'done' && timelineState === 'done';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Operations Workspace</h2>
        <p className="text-brand-gray-400 mt-1">Generate your operational assets. The AI will build a vendor plan and event timeline based on your budget and details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* VendorSync Engine */}
        <Card className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><UsersIcon className="w-5 h-5"/> Vendor Insights</h3>
          {vendorState === 'idle' && (
            <div className="text-center p-4">
              <p className="text-brand-gray-300 mb-4">Generate budget-aware tips for finding the right vendors.</p>
              <button onClick={handleGenerateVendors} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all">
                Generate Vendor Plan
              </button>
            </div>
          )}
          {vendorState === 'loading' && <div className="flex justify-center p-8"><Loader /></div>}
          {vendorState === 'error' && (
            <div className="text-center p-4">
              <p className="text-red-400">{vendorError}</p>
              <button onClick={handleGenerateVendors} className="mt-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
          )}
          {vendorState === 'done' && vendors && <VendorSyncEngine eventDetails={eventDetails} vendors={vendors} />}
        </Card>

        {/* Timeline Architect */}
        <Card className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><BrainIcon className="w-5 h-5"/> Event Timeline</h3>
          {timelineState === 'idle' && (
            <div className="text-center p-4">
              <p className="text-brand-gray-300 mb-4">Let the AI design a seamless event schedule that avoids common bottlenecks.</p>
              <button onClick={handleGenerateTimeline} className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-all">
                Generate Timeline
              </button>
            </div>
          )}
          {timelineState === 'loading' && <div className="flex justify-center p-8"><Loader /></div>}
          {timelineState === 'error' && (
            <div className="text-center p-4">
              <p className="text-red-400">{timelineError}</p>
              <button onClick={handleGenerateTimeline} className="mt-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
          )}
          {timelineState === 'done' && timeline && <TimelineArchitect timeline={timeline} />}
        </Card>
      </div>

      {bothDone && (
        <div className="flex justify-end pt-4 animate-fade-in">
          <button
            onClick={() => onWorkspaceComplete(vendors!, timeline!)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg"
          >
            Finish & View Summary
          </button>
        </div>
      )}
    </div>
  );
};

export default OpsMindWorkspace;
