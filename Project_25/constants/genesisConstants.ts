import React from 'react';
import type { Stage } from '../types';

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const BrainstormingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.42 0-2.798.347-4.098.97l-1.003-4.881a11.25 11.25 0 0 1 11.25 0l-1.003 4.881zm-7.5-4.881a7.5 7.5 0 0 0 7.5 0m-7.5 0a7.5 7.5 0 0 1 7.5 0m0 0a6.75 6.75 0 0 0-7.5 0m7.5 0a6.75 6.75 0 0 1-7.5 0m7.5 0a6.75 6.75 0 0 0-7.5 0m7.5 0a6.75 6.75 0 0 1-7.5 0" })
  )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const LogisticsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" }),
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" })
    )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const VendorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 21v-7.5A2.25 2.25 0 0 0 11.25 11.25H4.5A2.25 2.25 0 0 0 2.25 13.5V21M3 3h12M3 7.5h12M3 12h12M4.5 3.75h15a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6a2.25 2.25 0 0 1 2.25-2.25Z" })
    )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const MarketingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" }),
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" })
    )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const ExecutionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const FeedbackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" })
    )
);

// FIX: Converted JSX to React.createElement to be valid in a .ts file.
const SummaryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { ...props, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" })
    )
);


export const STAGES: Stage[] = [
  {
    title: "Brainstorming & Ideation",
    description: "Generating initial concepts and themes.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(BrainstormingIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `You are an expert event planner AI.
The user wants to plan an event with the following idea: "${eventIdea}".
Your first task is to brainstorm initial concepts. Provide 3 distinct and creative themes for this event. For each theme, describe the atmosphere, potential activities, and target audience. Format your response clearly using markdown.
Do not mention any of the other planning stages yet.`
  },
  {
    title: "Logistics Planning",
    description: "Detailing venue, date, and guest list management.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(LogisticsIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
Previous Planning Details:
${context}

Now, create a detailed logistics plan. Based on the brainstormed ideas, suggest criteria for selecting a venue. Propose a method for choosing the best date and time. Outline a clear strategy for creating and managing a guest list, including sending invitations and tracking RSVPs. Provide actionable steps.`
  },
  {
    title: "Vendor Coordination",
    description: "Identifying and managing necessary vendors.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(VendorIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
Previous Planning Details:
${context}

Your next task is vendor coordination. List the key types of vendors that would be required for this event (e.g., catering, entertainment, decoration, photography). For each vendor type, provide a checklist of important questions to ask before hiring them. Suggest some strategies for negotiating contracts and managing vendor relationships.`
  },
  {
    title: "Marketing & Promotion",
    description: "Creating a promotion strategy.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(MarketingIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
Previous Planning Details:
${context}

Develop a marketing and promotion plan. Outline a multi-channel strategy to create buzz for the event. This should include suggestions for social media campaigns (including platforms and content ideas), email marketing, and potentially traditional media outreach. Create a sample timeline for promotional activities leading up to the event day.`
  },
  {
    title: "Execution & On-site Management",
    description: "Planning the event day schedule.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(ExecutionIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
Previous Planning Details:
${context}

Focus on event day execution. Create a detailed day-of-event timeline, from setup to breakdown. List key roles and responsibilities for the event team (e.g., Event Coordinator, Volunteer Manager, Tech Support). Provide a contingency plan for 3 common potential problems (e.g., bad weather, technical difficulties, guest issues).`
  },
  {
    title: "Post-Event Follow-up",
    description: "Gathering feedback and sending thanks.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(FeedbackIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
Previous Planning Details:
${context}

Finally, create a post-event follow-up plan. Suggest effective ways to gather feedback from attendees (e.g., surveys, social media polls). Draft a template for a thank-you message to be sent to guests, vendors, and staff. Explain why post-event engagement is important for future events.`
  },
  {
    title: "Final Plan Summary",
    description: "Compiling the complete event blueprint.",
    // FIX: Converted JSX to React.createElement to be valid in a .ts file.
    icon: React.createElement(SummaryIcon, { className: "h-6 w-6" }),
    prompt: (eventIdea, context) => `Event Idea: "${eventIdea}"
All Previous Planning Details:
${context}

You are a world-class event director. Your final task is to synthesize all the previous planning details into a single, cohesive, and comprehensive final event plan document. 
Structure the document with clear headings for each section (e.g., Event Concept, Logistics, Vendor Management, Marketing, Day-of Execution, and Post-Event Actions).
Start with a brief, inspiring executive summary of the event.
Conclude with an encouraging closing statement about the event's potential success.
The tone should be professional, confident, and ready for execution. Format the entire output using markdown for clarity and readability.`
  },
];
