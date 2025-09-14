import React, { useState, useCallback, useMemo, CSSProperties } from 'react';
import type { User, Plan, SavedEvent, EventPlan } from '../types';
import { Page } from '../types';
import Header from '../components/Header';
import PromptInput from '../components/genesis/PromptInput';
import StageDisplay from '../components/genesis/StageDisplay';
import PlanCard from '../components/genesis/PlanCard';
import FinalPlanDisplay from '../components/genesis/FinalPlanDisplay';
import InnovationHub from '../components/genesis/InnovationHub';
import { STAGES } from '../constants/genesisConstants';
import { generatePlanForStage, structureGenesisPlan, generateGenesisImage } from '../services/genesisService';

interface EventGenesisPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const EventGenesisPage: React.FC<EventGenesisPageProps> = ({ user, onLogout, onNavigate }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // State for image generation error handling
  const [imageGenFailed, setImageGenFailed] = useState<boolean>(false);
  const [manualImageUrl, setManualImageUrl] = useState<string>('');
  const [stagedPlan, setStagedPlan] = useState<EventPlan | null>(null);

  const resetState = () => {
    setUserInput('');
    setIsGenerating(false);
    setCurrentStageIndex(-1);
    setPlans([]);
    setError(null);
    setImageGenFailed(false);
    setStagedPlan(null);
    setManualImageUrl('');
  };

  const handlePlanEvent = useCallback(async (idea: string) => {
    if (!idea.trim() || isGenerating) return;

    resetState();
    setIsGenerating(true);
    setCurrentStageIndex(0);
    setUserInput(idea);

    let accumulatedContext = '';

    try {
      for (let i = 0; i < STAGES.length; i++) {
        setCurrentStageIndex(i);
        const stage = STAGES[i];
        const generatedContent = await generatePlanForStage(idea, stage, accumulatedContext);
        
        const newPlan: Plan = {
          title: stage.title,
          content: generatedContent,
          icon: stage.icon,
        };

        setPlans(prevPlans => [...prevPlans, newPlan]);
        accumulatedContext += `\n\n**${stage.title}**:\n${generatedContent}`;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the plan. Please try again.');
    } finally {
      setIsGenerating(false);
      setCurrentStageIndex(STAGES.length); // Mark all as complete
    }
  }, [isGenerating]);

  const isComplete = !isGenerating && plans.length > 0 && plans.length === STAGES.length;

  const fullPlanContext = useMemo(() => {
    if (!isComplete) return '';
    return plans.map(p => `## ${p.title}\n\n${p.content}`).join('\n\n---\n\n');
  }, [plans, isComplete]);
  
  const handleSaveEvent = useCallback(async () => {
    if (!isComplete || !fullPlanContext) return;

    setIsSaving(true);
    setError(null);
    setImageGenFailed(false);
    setStagedPlan(null);

    try {
      // 1. Convert markdown plan to structured JSON
      const structuredPlan = await structureGenesisPlan(fullPlanContext, userInput);
      
      // 2. Try to generate an image for the dashboard card
      try {
        const images = await generateGenesisImage(userInput, structuredPlan.theme);
        const newCardImageUrl = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : null;

        if (!newCardImageUrl) {
            throw new Error("Image generation returned no images.");
        }
        
        // 3. Create the SavedEvent object
        const newSavedEvent: SavedEvent = {
          id: new Date().toISOString(),
          plan: structuredPlan,
          cardImageUrl: newCardImageUrl,
        };

        // 4. Save to localStorage
        const existingEvents: SavedEvent[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
        localStorage.setItem('savedEvents', JSON.stringify([...existingEvents, newSavedEvent]));

        // 5. Navigate to Dashboard
        onNavigate(Page.Dashboard);

      } catch (imageError: any) {
        console.error("Image generation failed:", imageError);
        setStagedPlan(structuredPlan);
        setImageGenFailed(true);
        setError("AI failed to generate an image. You can provide one manually to save.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while structuring the plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [isComplete, fullPlanContext, userInput, onNavigate]);

  const handleSaveWithManualImage = useCallback(() => {
    if (!stagedPlan || !manualImageUrl.trim()) {
      setError("Please provide a valid image URL.");
      return;
    }
    try {
      new URL(manualImageUrl);
    } catch (_) {
      setError("The provided URL is not valid. Please check and try again.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const newSavedEvent: SavedEvent = {
      id: new Date().toISOString(),
      plan: stagedPlan,
      cardImageUrl: manualImageUrl,
    };
    const existingEvents: SavedEvent[] = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    localStorage.setItem('savedEvents', JSON.stringify([...existingEvents, newSavedEvent]));
    onNavigate(Page.Dashboard);
    setIsSaving(false);
  }, [stagedPlan, manualImageUrl, onNavigate]);

  const backgroundStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -20,
    background: 'radial-gradient(at top left, #1e1b4b 20%, transparent 50%), radial-gradient(at bottom right, #4c1d95 20%, transparent 60%), radial-gradient(at top right, #1e3a8a 30%, transparent 70%)',
    animation: 'gradient-flow 20s ease-in-out infinite',
    backgroundSize: '200% 200%',
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white">
      <div style={backgroundStyle}></div>
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-5xl py-12 sm:py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Event Genesis AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Your agentic partner in crafting unforgettable events. Just share your idea, and let the AI build the blueprint.
            </p>
          </div>
          
          {!isComplete && (
            <PromptInput onPlan={handlePlanEvent} isGenerating={isGenerating} />
          )}
          
          {(isGenerating || plans.length > 0) && (
            <div className="mt-12">
              {isGenerating && <h2 className="text-xl font-bold text-center text-indigo-300 mb-6 animate-pulse">AI Agent is on the job!</h2>}
              <StageDisplay currentStageIndex={currentStageIndex} />
            </div>
          )}

          {error && <div className="mt-8 text-center text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}

          <div className="mt-10">
            {isComplete ? (
              <>
                <FinalPlanDisplay
                    plan={plans[plans.length - 1]}
                    onReset={resetState}
                    onSave={handleSaveEvent}
                    isSaving={isSaving && !imageGenFailed}
                />
                
                {imageGenFailed && (
                    <div className="glass-card rounded-xl p-6 shadow-2xl mt-8 animate-fade-in border border-dashed border-yellow-500">
                        <h3 className="text-lg font-semibold text-yellow-400">Image Generation Failed</h3>
                        <p className="text-gray-300 mt-2">Please provide a URL for the event image to complete saving.</p>
                        <div className="mt-4 flex flex-col sm:flex-row gap-4 items-center">
                            <input 
                                type="url" 
                                value={manualImageUrl} 
                                onChange={(e) => setManualImageUrl(e.target.value)} 
                                placeholder="https://example.com/image.jpg"
                                className="w-full flex-grow p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                                aria-label="Manual Image URL"
                            />
                            <button 
                                onClick={handleSaveWithManualImage}
                                disabled={isSaving}
                                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-x-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isSaving ? 'Saving...' : 'Save with this Image'}
                            </button>
                        </div>
                    </div>
                )}
                
                <InnovationHub planContext={fullPlanContext} />
              </>
            ) : (
              <div className="space-y-8">
                {plans.map((plan, index) => (
                  <PlanCard key={index} plan={plan} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventGenesisPage;