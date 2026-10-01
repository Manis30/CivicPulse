# CIVICPULSE
## Autonomous Civic Incident Operations Platform (Enterprise 2026 Edition)

CivicPulse converts citizen-reported real-world civic problems into structured incidents and autonomously manages the entire operational lifecycle:

```
REPORT
  → ANALYZE (Vision Agent)
  → LOCATE (Location Agent)
  → DETECT DUPLICATES (Duplicate Agent)
  → PRIORITIZE (Severity Agent)
  → ROUTE (Routing Agent)
  → ASSIGN & DISPATCH (Operations Agent)
  → INVESTIGATE (Investigation Agent — Workflow-Triggered)
  → RESOLVE (Field Officer Action)
  → VERIFY (Resolution Verification Agent)
  → CLOSE / AUTO-REOPEN (Autonomous State Machine)
  → LEARN & PATTERN DETECTION (Pattern Agent)
```

---

> 🗺️ **Master Route & Architecture Index**: For quick file-to-feature lookup and instant implementation targeting, see [`PROJECT_INDEX.md`](./PROJECT_INDEX.md).

---

## Architecture Principles

1. **Sandboxed Tool Registry**: AI Agents act strictly through a centralized Tool Registry. Agents NEVER directly access MongoDB or execute unauthorized mutations.
2. **Dual-Mode Execution**:
   - `GEMINI_AI`: Multimodal and LLM reasoning via Google Gemini API.
   - `DETERMINISTIC_ENGINE`: Algorithmic fallback using 2dsphere spatial calculations, TF-IDF cosine text similarity, multi-factor risk matrices, and image delta verification.
3. **Corrected State Machine**:
   - `SUBMITTED → ANALYZING → VALIDATED → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFYING → CLOSED`
   - or `VERIFYING → REOPENED → ASSIGNED`.
4. **Resilient Failure Recovery**: Exponential backoff retry with automatic engine fallback.

---

## Project Structure

```
CivicPulse/
├── apps/
│   ├── web/                     # React 19, TypeScript, Tailwind, Three.js, R3F, Drei, Lucide
│   │   ├── src/
│   │   │   ├── components/      # Design system: ui, data-display, feedback, three, common
│   │   │   ├── layouts/         # Role shells: Public, Citizen, Officer, Manager, Admin
│   │   │   ├── pages/           # Landing, Command Center, Citizen, Officer, Admin hubs
│   │   │   ├── services/        # API clients (Axios) with X-Request-Id tracing
│   │   │   ├── routes/          # Clean React Router architecture with 5 role hubs
│   │   │   └── index.css        # Enterprise 2026 dark design tokens
│   │   └── vite.config.ts
│   │
│   └── api/                     # Node.js, Express, TypeScript, Zod, Helmet, Winston
│       └── src/
│           ├── config/          # Zod-validated environment config
│           ├── middleware/      # RequestId, RequestLogger, Centralized ErrorHandler, 404
│           ├── modules/health/  # GET /api/health endpoint
│           ├── models/          # Mongoose model placeholders
│           ├── agents/          # AI Orchestrator & 10 agents placeholders
│           ├── tools/           # Tool Registry placeholders
│           ├── queues/          # Dual-mode Redis/In-memory queue placeholders
│           └── sockets/         # Real-time WebSocket placeholders
│
├── packages/
│   └── shared/                  # Authoritative domain types, constants, state machine rules
│
├── .env.example
├── .gitignore
├── package.json                 # Monorepo npm workspaces
└── README.md
```

---

## Quick Start (Phase 1 Foundation)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend API
```bash
npm run dev:api
# Running on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Start Frontend Operations Web App
```bash
npm run dev:web
# Running on http://localhost:5173
```
