# VoteEasy: Election Assistant

## Live Demo
- **Frontend**: https://promptwar-project.web.app
- **Backend API**: https://voter-guide-api-360693077440.us-central1.run.app

## Vertical
Civic Tech / Voter Education

## Problem Statement
India's electorate is incredibly diverse, speaking dozens of languages. Millions of voters struggle to access factual, state-specific election information—such as required documents and polling locations—due to complex official websites and severe language barriers, leading to lower voter turnout and civic disenfranchisement.

## Approach & Logic
Our solution integrates multiple cutting-edge tools to build a seamless civic assistant. We utilized **Google Stitch** to generate a clean, accessible UI design system. **Antigravity** (agentic coding) rapidly built the full-stack architecture. The **Gemini API** powers the core logic, providing multilingual, state-specific AI responses. Finally, **Google Cloud Run** allows for robust, scalable container deployment.

## How It Works
The user journey is simple and intuitive:
1. **Select State**: The user selects their Indian state to load localized civic data.
2. **Multilingual Chat**: The user asks election questions in their native language using text or voice dictation. 
3. **AI Response**: Gemini auto-detects the language, processes the localized state context, and replies factually in the same language.
4. **Document Checklist**: The app displays official ECI required documents for that state, which can be easily shared.
5. **Booth Finder**: Entering a Voter ID directs the user to their exact polling station via the ECI portal.

## Google Services Used
- **Gemini API (gemini-1.5-flash)**: Fast, multilingual Q&A with strict factual bounding.
- **Google Cloud Run**: Containerized, scalable backend deployment.
- **Google Stitch**: Rapid, premium UI design and token generation.
- **Google Antigravity**: Autonomous agentic development for full-stack scaffolding.

## Assumptions
- Users have basic internet access and a modern browser (required for the Web Speech API).
- The official ECI portal links remain stable and accessible.
- The 11 hardcoded states represent the initial rollout phase.

## Setup Instructions
1. **Clone**: `git clone <repo-url>`
2. **Environment Variables**: 
   - Root: Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
   - Frontend: Create `/frontend/.env` and add `VITE_API_URL=http://localhost:3001`.
3. **Install Backend**: `cd backend && npm install`
4. **Install Frontend**: `cd ../frontend && npm install`
5. **Run Backend**: `npm start` (from `/backend`)
6. **Run Frontend**: `npm run dev` (from `/frontend`)

## API Endpoints
- **`GET /health`**: Returns server status `{ status: "ok" }`.
- **`POST /ask`**: Accepts `{ message, state }`. Returns Gemini's context-aware, multilingual reply `{ reply }`.
- **`GET /checklist/:stateCode`**: Returns specific voting documents, ECI booth URLs, and helpline numbers for a given state code.
