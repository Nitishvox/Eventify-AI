import React, { useState } from 'react';
import type { User, OpsMindEventDetails, OpsMindBudgetCategory, OpsMindVendor, OpsMindTimeline } from '../types';
import { Page, OpsMindAppStep } from '../types';
import Header from '../components/Header';
import OpsMindHeader from '../components/opsmind/Header';
import BudgetArchitect from '../components/opsmind/BudgetArchitect';
import OpsMindWorkspace from '../components/opsmind/OpsMindWorkspace';
import OpsMindSummary from '../components/opsmind/OpsMindSummary';
import { CheckCircleIcon } from '../components/opsmind/Icons';

interface OpsMindAIPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const OpsMindAIPage: React.FC<OpsMindAIPageProps> = ({ user, onLogout, onNavigate }) => {
  const [step, setStep] = useState<OpsMindAppStep>(OpsMindAppStep.DETAILS);
  const [eventDetails, setEventDetails] = useState<OpsMindEventDetails | null>(null);
  const [budgetPlan, setBudgetPlan] = useState<OpsMindBudgetCategory[] | null>(null);
  const [vendors, setVendors] = useState<OpsMindVendor[] | null>(null);
  const [timeline, setTimeline] = useState<OpsMindTimeline | null>(null);

  const handleDetailsAndBudgetComplete = (details: OpsMindEventDetails, plan: OpsMindBudgetCategory[]) => {
    setEventDetails(details);
    setBudgetPlan(plan);
    setStep(OpsMindAppStep.WORKSPACE);
  };
  
  const handleWorkspaceComplete = (generatedVendors: OpsMindVendor[], generatedTimeline: OpsMindTimeline) => {
    setVendors(generatedVendors);
    setTimeline(generatedTimeline);
    setStep(OpsMindAppStep.SUMMARY);
  };

  const handleRestart = () => {
    setStep(OpsMindAppStep.DETAILS);
    setEventDetails(null);
    setBudgetPlan(null);
    setVendors(null);
    setTimeline(null);
  };

  const handleEdit = () => {
    setStep(OpsMindAppStep.WORKSPACE);
  };

  const renderStep = () => {
    switch (step) {
      case OpsMindAppStep.DETAILS:
        return <BudgetArchitect onBudgetCalculated={handleDetailsAndBudgetComplete} initialDetails={eventDetails} />;
      
      case OpsMindAppStep.WORKSPACE:
        if (eventDetails && budgetPlan) {
          return <OpsMindWorkspace 
                    eventDetails={eventDetails} 
                    budgetPlan={budgetPlan}
                    onWorkspaceComplete={handleWorkspaceComplete}
                 />;
        }
        // Fallback if state is somehow lost
        handleRestart();
        return null;

      case OpsMindAppStep.SUMMARY:
        if (eventDetails && budgetPlan && vendors && timeline) {
            return <OpsMindSummary
                eventDetails={eventDetails}
                budgetPlan={budgetPlan}
                vendors={vendors}
                timeline={timeline}
                onEdit={handleEdit}
                onRestart={handleRestart}
            />;
        }
        // Fallback if state is somehow lost
        handleRestart();
        return null;

      default:
        return <p>Unknown step</p>;
    }
  };

  const getStepIndicator = (currentStep: OpsMindAppStep, stepKey: OpsMindAppStep, stepNumber: number, title: string) => {
    const stepsOrder = [OpsMindAppStep.DETAILS, OpsMindAppStep.WORKSPACE, OpsMindAppStep.SUMMARY];
    const currentIndex = stepsOrder.indexOf(currentStep);
    const stepIndex = stepsOrder.indexOf(stepKey);

    let status = 'upcoming';
    if (currentIndex > stepIndex) {
        status = 'complete';
    } else if (currentIndex === stepIndex) {
        status = 'current';
    }

    const baseClasses = "flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-300";
    const statusClasses: { [key: string]: string } = {
        complete: "text-green-400",
        current: "bg-brand-primary/20 text-brand-primary font-bold",
        upcoming: "text-gray-500",
    }

    return (
        <div className={`${baseClasses} ${statusClasses[status]}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${status === 'complete' ? 'bg-green-500 border-green-500' : status === 'current' ? 'border-brand-primary' : 'border-gray-600'}`}>
                {status === 'complete' ? <CheckCircleIcon className="w-4 h-4 text-white"/> : stepNumber}
            </div>
            <span>{title}</span>
        </div>
    )
  }

  return (
    <div className="bg-brand-dark text-brand-gray-100 min-h-screen">
        <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
                <OpsMindHeader />
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 rounded-xl bg-brand-gray-900/50 border border-brand-gray-700">
                    {getStepIndicator(step, OpsMindAppStep.DETAILS, 1, 'Details & Budget')}
                    <div className="flex-1 h-px bg-brand-gray-700 hidden sm:block"></div>
                    {getStepIndicator(step, OpsMindAppStep.WORKSPACE, 2, 'Operations Workspace')}
                    <div className="flex-1 h-px bg-brand-gray-700 hidden sm:block"></div>
                    {getStepIndicator(step, OpsMindAppStep.SUMMARY, 3, 'Final Summary')}
                </div>

                <div className="bg-brand-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-brand-gray-700">
                    {renderStep()}
                </div>
            </div>
        </main>
    </div>
  );
};

export default OpsMindAIPage;