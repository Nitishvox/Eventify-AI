import React, { useState } from 'react';
import type { User, OpsMindEventDetails, OpsMindBudgetCategory, OpsMindVendor, OpsMindGuestFlowAnalysis } from '../types';
import { Page, OpsMindAppStep } from '../types';
import Header from '../components/Header';
import OpsMindHeader from '../components/opsmind/Header';
import BudgetArchitect from '../components/opsmind/BudgetArchitect';
import VendorSyncEngine from '../components/opsmind/VendorSyncEngine';
import GuestFlowSimulator from '../components/opsmind/GuestFlowSimulator';
import { PartyPopperIcon, CheckCircleIcon } from '../components/opsmind/Icons';

interface OpsMindAIPageProps {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
}

const currencySymbols: { [key: string]: string } = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

const OpsMindAIPage: React.FC<OpsMindAIPageProps> = ({ user, onLogout, onNavigate }) => {
  const [step, setStep] = useState<OpsMindAppStep>(OpsMindAppStep.BUDGET);

  // State to hold data across steps
  const [eventDetails, setEventDetails] = useState<OpsMindEventDetails | null>(null);
  const [budgetPlan, setBudgetPlan] = useState<OpsMindBudgetCategory[] | null>(null);
  const [vendors, setVendors] = useState<Record<string, OpsMindVendor[]> | null>(null);
  const [guestFlowAnalysis, setGuestFlowAnalysis] = useState<OpsMindGuestFlowAnalysis | null>(null);

  const handleBudgetCalculated = (details: OpsMindEventDetails, plan: OpsMindBudgetCategory[]) => {
    setEventDetails(details);
    setBudgetPlan(plan);
    setStep(OpsMindAppStep.VENDORS);
  };

  const handleVendorsFound = (vendorList: Record<string, OpsMindVendor[]>) => {
    setVendors(vendorList);
    setStep(OpsMindAppStep.GUESTS);
  };

  const handleSimulationComplete = (simulation: OpsMindGuestFlowAnalysis) => {
    setGuestFlowAnalysis(simulation);
    setStep(OpsMindAppStep.SUMMARY);
  };
  
  const handleRestart = () => {
    setStep(OpsMindAppStep.BUDGET);
    setEventDetails(null);
    setBudgetPlan(null);
    setVendors(null);
    setGuestFlowAnalysis(null);
  }

  const handleEdit = () => {
    setStep(OpsMindAppStep.BUDGET);
  };

  const handleDownload = () => {
    if (!eventDetails || !budgetPlan || !vendors || !guestFlowAnalysis) return;

    const currencySymbol = currencySymbols[eventDetails.currency] || '$';

    let content = `OpsMind AI - Event Plan\n`;
    content += `========================\n\n`;

    // Event Details
    content += `1. Event Details\n`;
    content += `----------------\n`;
    content += `Event Type: ${eventDetails.eventType}\n`;
    content += `Description: ${eventDetails.description}\n`;
    content += `Guest Count: ${eventDetails.guestCount}\n`;
    content += `Duration: ${eventDetails.duration} hours\n`;
    content += `Total Budget: ${currencySymbol}${eventDetails.totalBudget}\n`;
    content += `Priorities: ${eventDetails.priorities.join(', ')}\n\n`;

    // Budget Plan
    content += `2. Budget Plan\n`;
    content += `----------------\n`;
    budgetPlan.forEach(cat => {
        content += `- ${cat.category}: ${currencySymbol}${cat.amount} (${cat.percentage}%)\n`;
        content += `  Trade-offs: ${cat.tradeOffs}\n\n`;
    });

    // Vendors
    content += `3. Vendor Suggestions\n`;
    content += `---------------------\n`;
    Object.entries(vendors).forEach(([category, vendorList]) => {
        content += `\n* ${category.toUpperCase()} *\n`;
        vendorList.forEach(vendor => {
            content += `- Name: ${vendor.name} (${vendor.rating} Stars)\n`;
            content += `  Description: ${vendor.description}\n`;
            content += `  Negotiation Tip: ${vendor.negotiationPoint}\n\n`;
        });
    });

    // Guest Flow Analysis
    content += `4. Guest Flow Analysis\n`;
    content += `------------------------\n`;
    content += `Summary: ${guestFlowAnalysis.summary}\n\n`;
    content += `Identified Bottlenecks:\n`;
    if (guestFlowAnalysis.bottlenecks.length > 0) {
        guestFlowAnalysis.bottlenecks.forEach(b => {
            content += `- Time: ${b.time}\n`;
            content += `  Issue: ${b.issue}\n`;
            content += `  Suggestion: ${b.suggestion}\n\n`;
        });
    } else {
        content += `No significant bottlenecks were identified.\n\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OpsMind-Event-Plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStep = () => {
    switch (step) {
      case OpsMindAppStep.BUDGET:
        return <BudgetArchitect onBudgetCalculated={handleBudgetCalculated} initialDetails={eventDetails} />;
      case OpsMindAppStep.VENDORS:
        if (eventDetails && budgetPlan) {
          return <VendorSyncEngine eventDetails={eventDetails} budgetPlan={budgetPlan} onVendorsFound={handleVendorsFound} />;
        }
        return <p>Error: Event details not found.</p>;
      case OpsMindAppStep.GUESTS:
        if (eventDetails) {
            return <GuestFlowSimulator eventDetails={eventDetails} onSimulationComplete={handleSimulationComplete} />;
        }
        return <p>Error: Event details not found.</p>;
      case OpsMindAppStep.SUMMARY:
        return (
            <div className="text-center animate-fade-in-up space-y-6 bg-brand-gray-800 p-8 rounded-lg border border-brand-gray-700">
                <div className="flex flex-col items-center gap-4">
                    <PartyPopperIcon className="w-16 h-16 text-brand-primary" />
                    <h2 className="text-3xl font-bold text-white">Event Plan Generated!</h2>
                </div>
                <p className="text-brand-gray-300 max-w-2xl mx-auto">
                    Your comprehensive event plan has been successfully created by OpsMind AI. You've got a budget, vendor list, and guest flow analysis ready to go.
                </p>
                <div className="flex flex-col items-center gap-2 text-lg text-green-400">
                    {eventDetails && <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Event Details Captured</div>}
                    {budgetPlan && <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Budget Plan Architected</div>}
                    {vendors && <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Vendors Synced</div>}
                    {guestFlowAnalysis && <div className="flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Guest Flow Simulated</div>}
                </div>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                    >
                        Download Plan
                    </button>
                    <button
                        onClick={handleEdit}
                        className="w-full sm:w-auto bg-brand-gray-600 hover:bg-brand-gray-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
                    >
                        Edit Plan
                    </button>
                </div>
                <button
                    onClick={handleRestart}
                    className="text-brand-gray-400 hover:text-white font-semibold py-2 px-4 transition-colors duration-300"
                >
                    or Plan Another Event
                </button>
            </div>
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  const getStepIndicator = (currentStep: OpsMindAppStep, stepNumber: number, title: string) => {
    const stepsOrder = [OpsMindAppStep.BUDGET, OpsMindAppStep.VENDORS, OpsMindAppStep.GUESTS, OpsMindAppStep.SUMMARY];
    const currentIndex = stepsOrder.indexOf(currentStep);
    const stepIndex = stepNumber - 1;

    let status = 'upcoming';
    if (currentIndex > stepIndex) {
        status = 'complete';
    } else if (currentIndex === stepIndex) {
        status = 'current';
    }

    const baseClasses = "flex items-center gap-2 p-2 rounded-lg text-sm";
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
                
                {/* Progress Indicator */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 p-2 rounded-xl bg-brand-gray-900/50 border border-brand-gray-700">
                    {getStepIndicator(step, 1, 'Budget')}
                    <div className="flex-1 h-px bg-brand-gray-700 hidden sm:block"></div>
                    {getStepIndicator(step, 2, 'Vendors')}
                    <div className="flex-1 h-px bg-brand-gray-700 hidden sm:block"></div>
                    {getStepIndicator(step, 3, 'Guest Flow')}
                    <div className="flex-1 h-px bg-brand-gray-700 hidden sm:block"></div>
                    {getStepIndicator(step, 4, 'Summary')}
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
