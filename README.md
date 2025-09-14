# Eventify-AI
# AI Event Planner — Architecture & Feature Overview

[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/Framework-React-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/badge/Community-Discord-gray?logo=discord)](https://discord.gg/your-server)
[![Twitter](https://img.shields.io/badge/Follow-Twitter-1DA1F2?logo=twitter)](https://twitter.com/your-handle)
[![Hugging Face](https://img.shields.io/badge/Model-HuggingFace-blue?logo=huggingface)](https://huggingface.co/your-model)

# AI Event Planner — Architecture & Feature Overview

## Application Overview

The **AI Event Planner** is a single-page web application designed to be an intelligent partner for planning events. It transforms basic user inputs into detailed, creative, and operationally sound event plans. The system is modular, agentic, and built entirely on the frontend — no backend required.

---

## Core Features

### Intelligent Event Planning

- Users input event type, guest count, budget, location, and vibe.
- The AI generates a structured `EventPlan` object with:
  - Event name, theme, and description
  - Real-world venue suggestion
  - Full, timed agenda
- A mood board image is generated to visually represent the event theme.

### Ideation Engine

- Starts from a single concept (e.g., “launch party for a video game”).
- Autonomously builds a full plan through seven stages:
  - Brainstorming, logistics, vendor coordination, marketing, execution, follow-up, and summary.
- Suggests three innovative features to elevate the experience.

### OpsMind AI — Operational Intelligence

- Budget Architect: Allocates budget with trade-off suggestions.
- VendorSync Engine: Recommends fictional vendors with ratings and negotiation tips.
- GuestFlow Simulator: Predicts timeline bottlenecks and suggests improvements.

### Event Dashboard

- Displays saved events in a responsive grid.
- Users can view, edit, or delete plans.
- Data is stored in-browser using `localStorage`.

### Export Options

- Plans can be downloaded as:
  - PDF (via `jspdf`)
  - DOCX (via `docx`)
- Enables offline sharing and collaboration.

---

## Tech Stack

- Language: TypeScript
- Framework: React
- Styling: Tailwind CSS
- Architecture: Component-based, service-oriented
- Module System: ES Modules with `importmap`
- AI Integration: Provider-agnostic SDK with structured JSON enforcement
- Storage: Browser `localStorage` (no backend required)

---

## Design & UX

- Fully responsive across mobile, tablet, and desktop.
- Accessible with semantic HTML and ARIA attributes.
- Clean dark theme, smooth animations, and guided user flow.

---

## Built By Developers, For Developers

This project is handcrafted to showcase what’s possible with modern frontend tooling and intelligent agentic workflows. No external studio, no proprietary builder — just clean code, modular design, and a vision for smarter event planning.

