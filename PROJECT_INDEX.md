# 🗺️ CivicPulse — Master Project Route & Architecture Index

> **Quick Lookup Rule for Antigravity AI**:  
> Whenever a feature, bug fix, UI change, or backend enhancement is requested, refer to this index to target the exact file immediately without running slow repo-wide directory searches.

---

## ⚡ Quick Task-to-File Cheat Sheet

| If user says... | Direct File to Open & Edit |
| :--- | :--- |
| **"Landing page navbar mathu / logo / links"** | [`apps/web/src/components/landing/LandingNavbar.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/LandingNavbar.tsx) |
| **"Hero 3D city / Mapbox / camera / hover tooltip"** | [`apps/web/src/components/landing/MapboxCityHero.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/MapboxCityHero.tsx) |
| **"Hero text / headline / Report button"** | [`apps/web/src/components/landing/MapboxCityHero.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/MapboxCityHero.tsx) |
| **"One report can start a chain of action / 5 stages"** | [`apps/web/src/components/landing/CivicPulseIntroSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/CivicPulseIntroSection.tsx) |
| **"AI agents section / Orchestrator diagram / Stepper"** | [`apps/web/src/components/landing/AIAgentOrchestrationSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/AIAgentOrchestrationSection.tsx) |
| **"How CivicPulse works section / Workflow stages"** | [`apps/web/src/components/landing/HowCivicPulseWorksSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/HowCivicPulseWorksSection.tsx) |
| **"Before/After verification / Pothole / Waste case"** | [`apps/web/src/components/landing/ResolutionVerificationSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/ResolutionVerificationSection.tsx) |
| **"City impact metrics / 2487 issues / Ward health"** | [`apps/web/src/components/landing/CityImpactSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/CityImpactSection.tsx) |
| **"Final CTA section / Bottom city skyline"** | [`apps/web/src/components/landing/FinalCTASection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/FinalCTASection.tsx) |
| **"Footer links / copyright / back to top"** | [`apps/web/src/components/landing/LandingFooter.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/LandingFooter.tsx) |
| **"Citizen report issue form / photo upload / GPS"** | [`apps/web/src/pages/citizen/ReportIssuePage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/citizen/ReportIssuePage.tsx) |
| **"Citizen view my reported incidents"** | [`apps/web/src/pages/citizen/MyIncidentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/citizen/MyIncidentsPage.tsx) |
| **"Officer field dashboard / tasks / upload proof"** | [`apps/web/src/pages/officer/OfficerDashboardPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/officer/OfficerDashboardPage.tsx) |
| **"Manager command center / triage feed / live queue"** | [`apps/web/src/pages/manager/CommandCenterPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/CommandCenterPage.tsx) |
| **"Manager 3D live map view"** | [`apps/web/src/pages/manager/LiveMapPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/LiveMapPage.tsx) |
| **"Manager incidents table / filters / severity"** | [`apps/web/src/pages/manager/IncidentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/IncidentsPage.tsx) |
| **"Departments / Field teams management"** | [`apps/web/src/pages/manager/DepartmentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/DepartmentsPage.tsx) & [`FieldTeamsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/FieldTeamsPage.tsx) |
| **"Admin AI agent control / Gemini vs Deterministic"** | [`apps/web/src/pages/admin/AgentControlCenterPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/AgentControlCenterPage.tsx) |
| **"Admin decision audit logs"** | [`apps/web/src/pages/admin/DecisionAuditPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/DecisionAuditPage.tsx) |
| **"Backend Vision / Image analysis agent logic"** | [`apps/api/src/agents/definitions/visionAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/visionAgent.ts) |
| **"Backend Duplicate detection agent logic"** | [`apps/api/src/agents/definitions/duplicateAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/duplicateAgent.ts) |
| **"Backend Severity / Priority scoring agent logic"** | [`apps/api/src/agents/definitions/severityAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/severityAgent.ts) |
| **"Backend Routing / Crew dispatch agent logic"** | [`apps/api/src/agents/definitions/routingAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/routingAgent.ts) |
| **"Backend Location / GIS geocoding agent logic"** | [`apps/api/src/agents/definitions/locationAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/locationAgent.ts) |
| **"Backend Incident service / Database logic"** | [`apps/api/src/services/incidentService.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/services/incidentService.ts) |
| **"Shared domain types / Severity / State machine"** | [`packages/shared/src/index.ts`](file:///d:/LearningTask/CivicPulse/packages/shared/src/index.ts) |
| **"Theme colors / Tailwind tokens"** | [`apps/web/tailwind.config.js`](file:///d:/LearningTask/CivicPulse/apps/web/tailwind.config.js) & [`apps/web/src/index.css`](file:///d:/LearningTask/CivicPulse/apps/web/src/index.css) |

---

## 🌐 1. Frontend Route Map (`apps/web`)

### Public Hub
- `/` or `/landing` ➔ [`apps/web/src/pages/public/LandingPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/public/LandingPage.tsx)
- `/auth/login` ➔ [`apps/web/src/pages/public/LoginPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/public/LoginPage.tsx)

### Citizen Experience Portal (`/citizen`)
- `/citizen` ➔ [`apps/web/src/pages/citizen/CitizenHomePage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/citizen/CitizenHomePage.tsx)
- `/citizen/report` ➔ [`apps/web/src/pages/citizen/ReportIssuePage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/citizen/ReportIssuePage.tsx)
- `/citizen/incidents` ➔ [`apps/web/src/pages/citizen/MyIncidentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/citizen/MyIncidentsPage.tsx)

### Officer Field Operations Portal (`/officer`)
- `/officer` or `/officer/tasks` ➔ [`apps/web/src/pages/officer/OfficerDashboardPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/officer/OfficerDashboardPage.tsx)

### Municipal Operations / Manager Portal (`/manager`)
- `/manager/command-center` ➔ [`apps/web/src/pages/manager/CommandCenterPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/CommandCenterPage.tsx)
- `/manager/3d-map` or `live-map` ➔ [`apps/web/src/pages/manager/LiveMapPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/LiveMapPage.tsx)
- `/manager/incidents` ➔ [`apps/web/src/pages/manager/IncidentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/IncidentsPage.tsx)
- `/manager/dispatch` ➔ [`apps/web/src/pages/manager/DispatchPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/DispatchPage.tsx)
- `/manager/departments` ➔ [`apps/web/src/pages/manager/DepartmentsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/DepartmentsPage.tsx)
- `/manager/field-teams` ➔ [`apps/web/src/pages/manager/FieldTeamsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/FieldTeamsPage.tsx)
- `/manager/analytics` ➔ [`apps/web/src/pages/manager/AnalyticsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/AnalyticsPage.tsx)
- `/manager/reports` ➔ [`apps/web/src/pages/manager/ReportsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/ReportsPage.tsx)
- `/manager/settings` ➔ [`apps/web/src/pages/manager/SettingsPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/manager/SettingsPage.tsx)

### Admin / AI Command Center (`/admin`)
- `/admin/overview` ➔ [`apps/web/src/pages/admin/AdminOverviewPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/AdminOverviewPage.tsx)
- `/admin/agents` ➔ [`apps/web/src/pages/admin/AgentControlCenterPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/AgentControlCenterPage.tsx)
- `/admin/audit` ➔ [`apps/web/src/pages/admin/DecisionAuditPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/DecisionAuditPage.tsx)
- `/admin/policies` ➔ [`apps/web/src/pages/admin/PoliciesPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/PoliciesPage.tsx)
- `/admin/telemetry` ➔ [`apps/web/src/pages/admin/SystemTelemetryPage.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/pages/admin/SystemTelemetryPage.tsx)

---

## 🎨 2. Landing Page Component Breakdown (`apps/web/src/components/landing`)

| Component | Purpose & Description |
| :--- | :--- |
| [`LandingNavbar.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/LandingNavbar.tsx) | Clean 80px floating header with logo, tagline, navigation links, and primary green CTA |
| [`HeroSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/HeroSection.tsx) | Hero shell rendering the full-screen 3D Mapbox city component |
| [`MapboxCityHero.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/MapboxCityHero.tsx) | Mapbox GL JS v3 Standard 3D Digital Twin, building hovers, pulsing incident markers, side inspection panel |
| [`CivicPulseIntroSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/CivicPulseIntroSection.tsx) | *“One report can start a chain of action”* — continuous visual flow `REPORT → UNDERSTAND → COORDINATE → RESOLVE → VERIFY` |
| [`AIAgentOrchestrationSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/AIAgentOrchestrationSection.tsx) | Central AI Orchestrator + 9 floating agent nodes, live report simulation stepper, and agent inspector drawer |
| [`HowCivicPulseWorksSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/HowCivicPulseWorksSection.tsx) | 5-stage horizontal visual storytelling (`01 REPORT` to `05 VERIFY`) with telemetry gates and benchmarks |
| [`ResolutionVerificationSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/ResolutionVerificationSection.tsx) | *“Resolved doesn’t always mean solved”* — Before → Field Action → After case studies with computer vision proof |
| [`CityImpactSection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/CityImpactSection.tsx) | Key municipal impact metrics, 2,487 reports, SLA compliance, and Ward Health index |
| [`FinalCTASection.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/FinalCTASection.tsx) | *“See a problem? Help your city solve it.”* with 3D skyline and transitioning red/amber to green resolved pins |
| [`LandingFooter.tsx`](file:///d:/LearningTask/CivicPulse/apps/web/src/components/landing/LandingFooter.tsx) | Minimal Warm Ivory & Navy footer with quick links, status indicator, and back-to-top |

---

## 🤖 3. Backend & AI Agent Directory (`apps/api`)

### Agent Definitions (`apps/api/src/agents/definitions/`)
- [`visionAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/visionAgent.ts) ➔ Multimodal vision model (analyzes pothole depth, waste volume, structural defects)
- [`locationAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/locationAgent.ts) ➔ GIS coordinates resolution, ward boundary matching, street snapping
- [`duplicateAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/duplicateAgent.ts) ➔ Spatial radius clustering (within 25m) and cosine text deduplication
- [`severityAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/severityAgent.ts) ➔ Transit corridor impact, hazard matrix, automated SLA assignment
- [`routingAgent.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/agents/definitions/routingAgent.ts) ➔ Department & field crew selection based on defect category

### API Modules (`apps/api/src/modules/`)
- `incidents/` ➔ REST endpoints for incident creation, state transition, and queries
- `departments/` ➔ Municipal department rosters (Roads, Water, Waste, Electrical)
- `teams/` ➔ Field officer crews, equipment availability, and active assignments
- `analytics/` ➔ SLA metrics, resolution velocity, and zone statistics
- `orchestrations/` ➔ Agent pipeline execution triggers and audit trail
- `health/` ➔ Health check endpoint (`GET /api/health`)

### Database Models (`apps/api/src/models/`)
- [`Incident.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/Incident.ts) ➔ Incident MongoDB schema with 2dsphere spatial index
- [`WorkOrder.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/WorkOrder.ts) ➔ Municipal dispatch work orders and repair specifications
- [`AgentExecution.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/AgentExecution.ts) ➔ AI execution telemetry and input/output payloads
- [`AuditLog.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/AuditLog.ts) ➔ Immutable audit trail for all operational decisions
- [`Department.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/Department.ts) & [`Team.ts`](file:///d:/LearningTask/CivicPulse/apps/api/src/models/Team.ts) ➔ Organization structures

---

## 📦 4. Shared Package (`packages/shared/src/index.ts`)

Contains authoritative domain rules shared between frontend and backend:
- **Incident Categories**: `POTHOLE`, `GARBAGE`, `STREETLIGHT`, `WATER_LEAK`, `DRAINAGE`, `FALLEN_TREE`, `ROAD_DAMAGE`
- **Severity Levels**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **State Machine Transitions**:
  `SUBMITTED` ➔ `ANALYZING` ➔ `VALIDATED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `VERIFYING` ➔ `CLOSED` (or `REOPENED`)
- **Execution Engines**: `GEMINI_AI` vs `DETERMINISTIC_ENGINE`

---

## 🎨 5. Design System Tokens (`apps/web/tailwind.config.js`)

- `ivory`: `#F7F8F4` (Primary background)
- `mist`: `#EEF4F7` (Secondary background)
- `navy`: `#102A43` (Primary text & headings)
- `slate-civic`: `#526777` (Muted/body text)
- `botanical`: `#159A68` (Primary brand green accent)
- `civic-blue`: `#2878E5` (Secondary action blue)
- `amber-civic`: `#F2B84B` (Warning / In Progress)
- `coral-civic`: `#EF6A63` (Urgent / Critical)
- `green-civic`: `#36B37E` (Resolved / Success)
