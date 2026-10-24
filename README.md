# Eventora — GenAI-Powered Event Planning Assistant

Eventora is an intelligent event planning assistant designed to help individuals, couples, and organizers plan weddings, birthdays, and community gatherings with structured AI guidance, deterministic budget allocations, chronological preparation timelines, and vendor checklists.

---

## 1. Project Overview

Organizing celebrations often involves juggling disjointed spreadsheets, missing critical vendor booking deadlines, and exceeding budgets without realizing it. Eventora unifies event planning into a structured workflow:
- **Assisted Event Creation:** Multistep wizard capturing celebration type, dates, guest counts, budget priorities, theme preferences, and dietary restrictions.
- **AI-Powered Planning Engine:** Generates strategic event roadmaps, actionable preparation milestones, category-by-category budget allocations, and vendor procurement checklists.
- **Deterministic Financial Manager:** Real-time budget tracking with IEEE-754 safe arithmetic, over-budget detection, deficit calculations, and confirmed expenditure tracking.
- **Timeline & Milestones:** Chronological preparation schedule with overdue task detection, priority classifications, and completion progress bars.
- **Vendor Roster:** Comprehensive procurement checklist tracking vendor status (needed, contacted, booked, confirmed), contact details, and quotation estimates.
- **Resilient Demo Mode:** Seamless, zero-network fallback that simulates realistic planning for weddings, birthdays, and community gatherings when no API credentials are provided.

---

## 2. Technology Stack & Architecture

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS v4 & custom design tokens
- **UI Components:** Reusable component library styled with Radix UI patterns and Lucide React icons
- **Validation:** Zod schemas for form submissions, API requests, and AI response verification
- **Persistence (MVP):** Local storage repository pattern (`IEventRepository`) using React 19's `useSyncExternalStore` for flicker-free SSR hydration and immediate cross-component reactivity
- **AI Integration:** Google GenAI SDK (`@google/genai`) accessing Gemini 2.5 Flash via server-side Route Handlers (`/api/plan/generate`)
- **Unit Testing:** Standalone test suite executed via `tsx` validating financial calculations, overdue logic, and schema conformance

---

## 3. Prerequisites

- **Node.js:** `v20.x` or higher (`v24.19.0` tested)
- **npm:** `10.x` or higher (`11.17.0` tested)
- **Google Gemini API Key (Optional):** Required only for live AI generation. If omitted, the application operates in **Demo Mode**.

---

## 4. Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/Eventora.git
cd Eventora
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (Optional)
Copy the example environment configuration:
```bash
cp .env.example .env.local
```
*(On Windows PowerShell: `Copy-Item .env.example .env.local`)*

Open `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-2.5-flash"
```
> **Note:** If `GEMINI_API_KEY` is left blank or omitted, Eventora will automatically activate **Demo Mode**.

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Code Quality & Testing Commands

### Run Unit Tests
Exercises 30 unit tests validating budget calculations, overdue tasks, Zod validation, and AI schema compliance:
```bash
npm test
```

### Run ESLint
Verifies syntax, imports, and code hygiene:
```bash
npm run lint
```

### Build for Production
Creates an optimized production build with Turbopack and TypeScript checking:
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

---

## 6. Demo Mode vs. Live AI

| Feature | Demo Mode (No API Key) | Live AI (With API Key) |
| :--- | :--- | :--- |
| **Setup Required** | None (instant zero-config) | `GEMINI_API_KEY` in `.env.local` |
| **Network Calls** | Completely offline / local | Server-side call to Google Gemini |
| **Output Label** | Labeled with amber `DEMO MODE` badge | Labeled with indigo `LIVE AI` badge |
| **Event Plans** | Deterministic, rule-based plans matching event type & budget | Fully dynamic generative plan |
| **Budget Management**| Fully editable & persistent | Fully editable & persistent |
| **Timeline & Tasks** | Interactive milestone tracking | Interactive milestone tracking |
| **Vendor Roster** | Interactive status toggles & quotes | Interactive status toggles & quotes |

---

## 7. Security & Secret Management

- **Zero Client Credential Exposure:** `GEMINI_API_KEY` is accessed exclusively in server-side API routes (`/api/plan/generate`). No keys are exposed in client-side bundles or HTTP responses.
- **Strict Data Validation:** All user inputs and AI outputs are validated using Zod (`CompleteEventSchema`, `GeneratedPlanSchema`).
- **Safe Rendering:** All user-provided fields are rendered through JSX escaping to prevent XSS vulnerabilities.
- **Git Hygiene:** `.env*.local` files and build outputs (`.next/`) are strictly ignored in `.gitignore`.

---

## 8. Deployment Preparation

Eventora is designed for immediate deployment on platforms supporting Next.js App Router (e.g., **Vercel**, **Netlify**, or **AWS Amplify**):

1. **Build Command:** `npm run build`
2. **Output Directory:** `.next`
3. **Environment Variables:** Add `GEMINI_API_KEY` and `GEMINI_MODEL` in your platform's environment settings.
4. **Data Persistence Notice:** In this MVP, event data is persisted in browser `localStorage`. Data is private to the user's browser and device. A future migration to PostgreSQL or Cloud Firestore can be implemented by swapping the `IEventRepository` implementation without altering UI components.

---

## 9. Troubleshooting

- **PowerShell Script Execution Restriction:**
  If running `npm` produces a security error on Windows PowerShell, run using `cmd.exe /c npm ...` or adjust policy:
  `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
- **Port Conflict (3000 in use):**
  Start on an alternate port: `npm run dev -- -p 3001`.
- **Live AI Fails / Timeout:**
  If the Gemini API key is expired or network is unreachable, Eventora automatically falls back to Demo Mode and displays an informative banner rather than crashing.
