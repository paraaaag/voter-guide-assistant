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

### 1. Gemini API (`gemini-2.5-flash`)
**Package:** `@google/generative-ai` · **File:** `backend/server.js`
```js
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
const result = await model.generateContent(prompt);
```

### 2. Google Cloud Run
**Tool:** `gcloud run deploy` · **File:** `backend/Dockerfile`  
Serverless backend at `voter-guide-api-360693077440.us-central1.run.app` with auto-scaling and zero cold-start config.

### 3. Firebase Hosting
**Package:** `firebase-tools` · **File:** `firebase.json`  
Frontend deployed to `promptwar-project.web.app` with global CDN and SPA rewrite rules.

### 4. Firebase Analytics
**Package:** `firebase/analytics` · **File:** `frontend/src/firebase.js`, all 4 components
```js
import { getAnalytics, logEvent } from 'firebase/analytics';
const analytics = getAnalytics(app);
logEvent(analytics, 'question_asked', { state: selectedState }); // ChatInterface.jsx
logEvent(analytics, 'checklist_viewed', { state: selectedState }); // Checklist.jsx
logEvent(analytics, 'booth_finder_used', { state: selectedState }); // BoothFinder.jsx
logEvent(analytics, 'page_view', { page_title: 'StateSelector' }); // StateSelector.jsx
```

### 5. Firebase Performance Monitoring
**Package:** `firebase/performance` · **File:** `frontend/src/firebase.js`, `frontend/src/components/ChatInterface.jsx`
```js
import { getPerformance } from 'firebase/performance';
import { trace } from 'firebase/performance';
const perf = getPerformance(app);

// In ChatInterface.jsx — measures end-to-end AI response latency
const aiTrace = trace(perf, 'ai_response_time');
aiTrace.putAttribute('state', selectedState);
aiTrace.start();
await askAssistant(userMsg, selectedState);
aiTrace.stop();
```

### 6. Google Fonts
**CDN:** `fonts.googleapis.com` · **File:** `frontend/index.html`, `frontend/src/index.css`
```html
<link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700
  &family=Public+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```
```css
body { font-family: 'Google Sans', 'Public Sans', sans-serif; }
```

### 7. Google Stitch
**Tool:** Google Stitch design system · **File:** `frontend/DESIGN.md`, all CSS module files  
Provided foundational design tokens for a WCAG-compliant, premium civic UI.

### 8. Google Antigravity
**Tool:** Antigravity agentic coding assistant  
Accelerated full-stack development — Node.js backend, React frontend, security hardening, Jest test suite, and CI/CD pipeline all built agentically.

---

## API Endpoints
- **`GET /health`** — Returns `{ status: "ok" }`.
- **`GET /api/info`** — Returns full Google Services manifest, version, and project ID.
- **`POST /ask`** — Accepts `{ message, state }`. Returns Gemini's context-aware, multilingual reply `{ reply }`.
- **`GET /checklist/:stateCode`** — Returns voting documents, ECI booth URL, and helpline for a given state code.

