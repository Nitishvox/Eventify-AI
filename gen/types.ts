// FIX: This file was empty, causing numerous import errors. It has been populated with all the necessary type definitions for the application.
export enum Page {
  Landing = 'LANDING',
  Login = 'LOGIN',
  Dashboard = 'DASHBOARD',
  Planner = 'PLANNER',
  EventGenesis = 'EVENT_GENESIS',
  OpsMindAI = 'OPSMIND_AI',
  Visualisations = 'VISUALISATIONS',
  Community = 'COMMUNITY',
  Account = 'ACCOUNT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
}

export interface Session {
  user: {
    id: string;
    email: string;
    user_metadata: {
      name: string;
      avatar_url: string;
    }
  }
}

export interface Event {
  imageUrl: string;
  category: string;
  date: { day: string; month: string };
  title: string;
  description: string;
  fullDate: string;
  location: string;
  attendees: string;
  price: string;
}

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
  priority?: 'High' | 'Medium' | 'Low';
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
  theme: string;
  description: string;
  venue: Venue;
  agenda: AgendaItem[];
  teamNotes?: string;
}

export interface SavedEvent {
  id: number;
  user_id: string;
  created_at: string;
  plan_data: EventPlan;
  card_image_url: string | null;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    pendingRequest?: string; // For actionable requests
}

// OpsMind AI Types
export enum OpsMindAppStep {
  DETAILS = 'DETAILS',
  WORKSPACE = 'WORKSPACE',
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
  location: string;
}

export interface OpsMindBudgetCategory {
  category: string;
  amount: number;
  percentage: number;
  tradeOffs: string;
}

export interface OpsMindVendor {
  category: string;
  description: string;
  budgetNote: string;
}

export interface OpsMindTimeline {
  summary: string;
  agenda: {
    time: string;
    title: string;
    description: string;
  }[];
}

// Event Genesis Types
export interface Plan {
  id: string;
  title: string;
  icon: JSX.Element;
  content: string;
}

export interface Recommendation {
  icon: 'Tech' | 'Experience' | 'Engagement';
  title: string;
  description: string;
}

// Visualisations / Milestones
export interface Milestone {
  id: string;
  title: string;
  description: string;
  threshold: number;
  prize: number;
  achieved: boolean;
}

// Community Page Types
export interface CommunityPost {
    id: string;
    author: {
        name: string;
        avatarUrl: string;
        title: string;
    };
    timestamp: string;
    plan: EventPlan;
    imageUrl: string;
    likes: number;
    comments: number;
}