import type React from 'react';

export enum Page {
  Landing,
  Login,
  Planner,
  Dashboard,
  EventGenesis,
  OpsMindAI,
}

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

// For the new Landing Page & Planner Page UI
export interface Event {
  imageUrl: string;
  category: string;
  date: {
    day: string;
    month: string;
  };
  title: string;
  description: string;
  fullDate: string;
  location: string;
  attendees: string;
  price: string;
}

// Based on geminiService.ts grounding metadata
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

// For chat messages
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    // If present, this message is a confirmation request from the model.
    // The value is the original user prompt that needs confirmation.
    pendingRequest?: string;
}

// For the new conversational agent's response
export interface AgentResponse {
    responseText: string;
    actionableRequestIdentified: boolean;
    originalUserPrompt?: string;
}

// --- Restored Types for Event Planner ---

export type Priority = 'High' | 'Medium' | 'Low';

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
  priority?: Priority;
}

export interface Venue {
  name: string;
  address: string;
  description: string;
  website?: string;
}

export interface EventPlan {
  eventName: string;
  eventDate: string;
  venue: Venue;
  agenda: AgendaItem[];
  theme: string;
  description: string;
}

// --- New Type for Saved Events ---
export interface SavedEvent {
  id: string;
  plan: EventPlan;
  cardImageUrl: string | null;
}

// --- Types for Event Genesis ---

export interface Plan {
  title: string;
  content: string;
  icon: React.JSX.Element;
}

export interface Stage {
  title: string;
  description: string;
  icon: React.JSX.Element;
  prompt: (eventIdea: string, context: string) => string;
}

export interface Recommendation {
  title: string;
  description: string;
  icon: 'Tech' | 'Experience' | 'Engagement';
}

// --- Types for OpsMind AI ---

export enum OpsMindAppStep {
  BUDGET = 'BUDGET',
  VENDORS = 'VENDORS',
  GUESTS = 'GUESTS',
  SUMMARY = 'SUMMARY',
}

export interface OpsMindEventDetails {
  totalBudget: number;
  guestCount: number;
  eventType: string;
  priorities: string[];
  currency: string;
  description: string;
  duration: number;
}

export interface OpsMindBudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  tradeOffs: string;
}

export interface OpsMindVendor {
  name: string;
  rating: number;
  description: string;
  negotiationPoint: string;
}

export interface OpsMindBottleneck {
  time: string;
  issue: string;
  suggestion: string;
}

export interface OpsMindGuestFlowAnalysis {
  summary: string;
  bottlenecks: OpsMindBottleneck[];
}
