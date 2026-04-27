# VoteEasy: Election Assistant
*A multilingual, state-aware AI assistant designed to democratize civic information access across India.*

## 🌐 Live Demo (Optional for Evaluation)
- **Frontend**: https://promptwar-project.web.app
- **Backend API**: https://voter-guide-api-360693077440.us-central1.run.app

## Vertical
Civic Tech / Voter Education

## Problem Statement
India's electorate is incredibly diverse, speaking dozens of languages. Millions of voters struggle to access factual, state-specific election information—such as required documents and polling locations—due to complex official websites and severe language barriers, leading to lower voter turnout and civic disenfranchisement.

## Approach & Logic
VoteEasy leverages an ecosystem of Google services to transform a complex civic process into an accessible, intelligent conversation.

- **Gemini API**: Acts as the cognitive engine. It understands natural language intents, automatically detects regional languages, and bounds its responses strictly to state-specific contexts to prevent hallucination of election rules.
- **Google Cloud Run**: Provides a scalable, containerized backend capable of dynamically injecting real-time ECI (Election Commission of India) data into the AI prompt securely.
- **Google Stitch**: Provided the foundational design tokens to ensure a premium, WCAG-compliant interface, maximizing accessibility for all demographics.
- **Google Antigravity**: Accelerated the full-stack agentic development, allowing rapid prototyping of a robust Node.js/React architecture.

## 🧠 Decision-Making Logic
VoteEasy isn't just a UI wrapper; it's a dynamic routing system driven by contextual logic:
- **Language Adaptation**: Gemini infers the user's input language dynamically (e.g., Hindi, Marathi) and enforces the response in the exact same language without requiring manual language toggles.
- **Context Injection**: Upon initialization, the assistant loads exact ECI parameters (approved documents, URLs, helplines) corresponding exclusively to the user's selected state, ensuring AI responses are geographically accurate.
- **Intent Boundary Enforcement**: System prompts strictly constrain the assistant to civic guidance. If a query falls outside election workflows, the fallback mechanism gracefully redirects users to official `voters.eci.gov.in` channels.

## 🧪 Sample Interaction

**User (English)**: *"What do I need to bring to vote in Maharashtra?"*  
**Assistant**: *"To vote in Maharashtra, you need a valid Voter ID (EPIC). If you do not have it, you can bring an Aadhaar Card, PAN Card, Driving License, or Indian Passport. Ensure your name is on the electoral roll. Check voters.eci.gov.in for more details."*

**User (Hindi)**: *"मेरा पोलिंग बूथ कहाँ है? (Where is my polling booth?)"*  
**Assistant**: *"आप अपना मतदान केंद्र (पोलिंग बूथ) भारत निर्वाचन आयोग की आधिकारिक वेबसाइट पर देख सकते हैं। कृपया अपने वोटर आईडी (EPIC) नंबर का उपयोग करके voters.eci.gov.in पर अपनी जानकारी खोजें। अधिक सहायता के लिए आप 1950 पर कॉल कर सकते हैं।"*

## How It Works
The assistant guides users through a structured civic workflow:
1. **Context Initialization**: The user selects their state, triggering the backend to mount localized ECI guidelines into the AI's active memory.
2. **Multilingual Query Processing**: The user inputs a query via text or voice dictation. Gemini processes the intent alongside the injected state context.
3. **Dynamic Response Generation**: The AI formulates a factual, concise response in the detected native language, avoiding generic or out-of-state advice.
4. **Actionable Outputs**: Alongside chat, the system renders a concrete document checklist and provides direct paths to the official ECI booth locator.

## Google Services Used
- **Gemini API (gemini-2.5-flash)** — Core AI engine (`@google/generative-ai`) for multilingual civic Q&A with state-specific context injection
- **Google Cloud Run** — Serverless backend deployment with auto-scaling; Docker container hosted at `voter-guide-api-360693077440.us-central1.run.app`
- **Firebase Hosting** — Frontend CDN deployment (`firebase-tools`) at `promptwar-project.web.app` with global edge caching
- **Firebase Analytics** — User interaction tracking (`firebase/analytics`); logs `page_view`, `question_asked`, `checklist_viewed`, and `booth_finder_used` events from all four React components
- **Google Fonts** — Google Sans & Public Sans typography loaded via `fonts.googleapis.com` for accessible, Google-native UI design
- **Google Stitch** — UI design system and component generation for premium, WCAG-compliant interface tokens
- **Google Antigravity** — Agentic full-stack development; accelerated Node.js/React architecture prototyping

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
