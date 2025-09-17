import React, { useState, useEffect, useCallback } from 'react';
import { getFeatureRecommendations } from '../../services/genesisService';
import type { Recommendation } from '../../types';
import Loader from './Loader';

interface InnovationHubProps {
  planContext: string;
}

const ICONS: { [key: string]: React.JSX.Element } = {
  Tech: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Experience: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
    </svg>
  ),
  Engagement: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
};

const InnovationHub: React.FC<InnovationHubProps> = ({ planContext }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getFeatureRecommendations(planContext);
      setRecommendations(result);
    } catch (err: any) {
      setError(err.message || 'Could not fetch recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, [planContext]);

  useEffect(() => {
    if (planContext) {
      fetchRecommendations();
    }
  }, [planContext, fetchRecommendations]);

  return (
    <div className="mt-12 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Innovation Hub</h2>
        <p className="text-gray-400 mt-2">Level-up your event with these AI-powered ideas.</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        {isLoading && <div className="flex justify-center p-8"><Loader /></div>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {!isLoading && !error && (
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center gap-x-3 mb-3">
                  <div className="text-indigo-400">{ICONS[rec.icon]}</div>
                  <h3 className="font-semibold text-lg">{rec.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{rec.description}</p>
              </div>
            ))}
          </div>
        )}
         <div className="mt-6 text-center">
            <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-semibold text-indigo-300 bg-indigo-500/10 rounded-md hover:bg-indigo-500/20 disabled:opacity-50 transition"
            >
                {isLoading ? 'Generating...' : 'Suggest New Ideas'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default InnovationHub;