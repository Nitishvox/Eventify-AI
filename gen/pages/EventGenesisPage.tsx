// FIX: This file was a placeholder. It has been implemented to create the "Event Genesis" feature, a step-by-step AI-powered event planning tool that streams content to the UI.
import React, { useState, useCallback } from 'react';
import type { User, Plan } from '../types';
import { Page } from '../types';
import { STAGES } from '../constants/genesisConstants';
import { generateFullPlanStream } from '../services/genesisService';

import Header from '../components/Header';
import PromptInput from '../components/genesis/PromptInput';
import StageDisplay from '../components/genesis/StageDisplay';
import PlanCard from '../components/genesis/PlanCard';
import FinalPlanDisplay from '../components/genesis/FinalPlanDisplay';

interface EventGenesisPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const EventGenesisPage: React.FC<EventGenesisPageProps> = ({ user, onLogout, onNavigate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [idea, setIdea] = useState<string>('');

  const handleGeneratePlan = useCallback(async (submittedIdea: string) => {
    setIdea(submittedIdea);
    setIsGenerating(true);
    setCurrentStageIndex(0);
    setPlans([]);
    setError(null);

    try {
      const stream = generateFullPlanStream(submittedIdea);
      for await (const { stageIndex, content } of stream) {
        setCurrentStageIndex(stageIndex + 1);
        setPlans(prev => [
          ...prev,
          {
            id: STAGES[stageIndex].id,
            title: STAGES[stageIndex].title,
            icon: React.cloneElement(STAGES[stageIndex].icon, { className: 'w-8 h-8' }),
            content: content,
          },
        ]);
      }
    } catch (e: any) {
      setError(e.message || "An unknown error occurred during plan generation.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleReset = () => {
    setIsGenerating(false);
    setCurrentStageIndex(-1);
    setPlans([]);
    setError(null);
    setIdea('');
  }

  const isComplete = currentStageIndex === STAGES.length && !isGenerating;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="absolute inset-0 -z-10 h-full w-full bg-gray-900 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
            Event Genesis
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400">
            From a single idea, a legendary event is born. Describe your vision, and watch the AI build your plan step-by-step.
          </p>
        </div>

        {!isComplete && plans.length === 0 && <PromptInput onPlan={handleGeneratePlan} isGenerating={isGenerating} />}
        
        {(isGenerating || plans.length > 0) && (
          <div className="mt-8">
            <StageDisplay currentStageIndex={isGenerating ? currentStageIndex : STAGES.length} />
          </div>
        )}

        {error && <div className="mt-8 text-center bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

        <div className="mt-8 space-y-8 max-h-[60vh] overflow-y-auto p-1">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        
        {isComplete && <FinalPlanDisplay 
            plans={plans} 
            idea={idea} 
            user={user}
            onRestart={handleReset} 
            onNavigate={onNavigate}
        />}

      </main>
    </div>
  );
};

export default EventGenesisPage;