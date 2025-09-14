import React, { useState } from 'react';
import { OpsMindEventDetails, OpsMindGuestFlowAnalysis } from '../../types';
import { simulateGuestFlow } from '../../services/geminiService';
import Loader from './Loader';
import { BrainIcon, LightbulbIcon } from './Icons';
import Card from './Card';

interface GuestFlowSimulatorProps {
  eventDetails: OpsMindEventDetails;
  onSimulationComplete: (simulation: OpsMindGuestFlowAnalysis) => void;
}

const defaultTimeline = `6:00 PM - Doors Open & Guest Arrival
6:30 PM - Cocktail Hour Begins (1 Bar, 2 Bartenders)
7:30 PM - Guests move to Main Hall
7:45 PM - Welcome Speech
8:00 PM - Dinner Service Starts
9:30 PM - Keynote Speaker
10:00 PM - Live Band & Dancing
11:30 PM - Late Night Snacks
12:00 AM - Event Concludes`;

const GuestFlowSimulator: React.FC<GuestFlowSimulatorProps> = ({ eventDetails, onSimulationComplete }) => {
  const [timeline, setTimeline] = useState(defaultTimeline);
  const [simulation, setSimulation] = useState<OpsMindGuestFlowAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSimulation(null);

    try {
      const result = await simulateGuestFlow(eventDetails, timeline);
      setSimulation(result);
    } catch (err) {
      setError('Failed to run simulation. Please check your timeline and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSimulation(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BrainIcon className="w-6 h-6"/> GuestFlow Simulator</h2>
        <p className="text-brand-gray-400 mt-1">Predict engagement bottlenecks and optimize your event's timeline for a seamless guest experience.</p>
      </div>
      
      {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
      
      {!isLoading && simulation ? (
        <div className="space-y-6 animate-fade-in-up">
          <div>
            <h3 className="text-xl font-bold text-white">Simulation Analysis</h3>
            <p className="text-brand-gray-300 mt-2 bg-brand-gray-900/50 p-4 rounded-lg border border-brand-gray-700">{simulation.summary}</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Identified Bottlenecks</h3>
            {simulation.bottlenecks.length > 0 ? (
                <div className="space-y-4">
                  {simulation.bottlenecks.map((item, index) => (
                    <Card key={index}>
                      <p className="font-mono text-sm text-brand-secondary">{item.time}</p>
                      <p className="font-semibold text-white mt-2">{item.issue}</p>
                      <div className="flex items-start gap-3 mt-3 pt-3 border-t border-brand-gray-700">
                        <LightbulbIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                        <p className="text-brand-gray-300">{item.suggestion}</p>
                      </div>
                    </Card>
                  ))}
                </div>
            ) : (
                <p className="text-brand-gray-400">No significant bottlenecks were identified. Looks like a smooth experience!</p>
            )}
          </div>
           <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto bg-brand-gray-600 hover:bg-brand-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Run New Simulation
            </button>
            <button
              onClick={() => onSimulationComplete(simulation)}
              className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Finish & View Summary
            </button>
          </div>
        </div>
      ) : !isLoading && (
         <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-brand-gray-300">Event Timeline</label>
            <textarea
              id="timeline"
              name="timeline"
              rows={10}
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="mt-1 block w-full bg-brand-gray-700 border-brand-gray-600 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-white p-2 font-mono"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:bg-brand-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
              {isLoading ? <Loader /> : 'Simulate Experience'}
            </button>
          </div>
          {error && <p className="text-red-400 text-right mt-4">{error}</p>}
        </form>
      )}
    </div>
  );
};

export default GuestFlowSimulator;
