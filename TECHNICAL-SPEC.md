# Technical Specification — Project Management Tool

## 1. System Overview

The Project Management Tool is a single-page React application designed for deployment as a Microsoft Power Apps CodeApp. It provides end-to-end portfolio, demand, delivery, and governance management across multiple value streams with role-based access control.

| Category | Detail |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 7 |
| **Data Layer** | localStorage (DEV) / Dataverse (PROD) |
| **Styling** | Custom CSS (no framework) |
| **Testing** | Vitest (39 unit tests) |
| **Screenshots** | Playwright headless Chromium |
| **Training** | python-pptx (20-slide deck with auto-captured screenshots) |

---

## 2. Data Architecture

### 2.1 Tables (18 total)

| # | Table | Records | Purpose |
|---|---|---|---|
| 1 | pm_resource | 10 | Team members with skills and cost |
| 2 | pm_capability | 6 | System capabilities |
| 3 | pm_product | 6 | Applications / products |
| 4 | pm_capabilityproduct | 9 | N:N link table |
| 5 | pm_requirement | 11 | Requirements + Backlog |
| 6 | pm_project | 6 | Delivery projects |
| 7 | pm_control | 4 | Governance controls |
| 8 | pm_epic | 7 | Agile epics |
| 9 | pm_userstory | 16 | User stories |
| 10 | pm_risk | 6 | Project risks |
| 11 | pm_dependency | 6 | Project dependencies |
| 12 | pm_demand | 5 | Demand intake requests |
| 13 | pm_config | ~120 | Centralized configuration |
| 14 | pm_release | 5 | Releases / Sprints |
| 15 | pm_releaseitem | 14 | Stories registered to releases |
| 16 | pm_assignment | 15 | Resource → Epic assignments |
| 17 | pm_checkpoint | 24 | Governance checklist items |
| 18 | pm_user | 9 | Users with role assignments |

### 2.2 Design Principle

All field types are TEXT or LOOKUP. No CHOICE/OptionSet types. Every configurable dropdown is sourced from `pm_config`, allowing full customization through the app UI without code changes.

### 2.3 localStorage Pattern

```typescript
// data.ts — singleton data service
export const DS = {
  getAll(table: string): any[],
  getById(table: string, id: string): any | null,
  create(table: string, record: Record_): Record_,
  update(table: string, id: string, updates: Record_): Record_ | null,
  delete(table: string, id: string): boolean,
  query(table: string, filters: Record<string, any>): any[],
  getLookupName(table: string, id: string): string
}
```

Seed data is populated on first load via `seedAllIfNeeded()`. Subsequent loads persist data in localStorage.

---

## 3. Role-Based Access Control (UAC)

### 3.1 Roles (8 total)

| # | Role | Tabs | Description |
|---|---|---|---|
| 1 | Admin | 17 | Full system access |
| 2 | Value Stream PMO | 16 | Oversees all VS (no Config) |
| 3 | Value Stream Owner | 12 | Owns specific value streams |
| 4 | Product Owner | 11 | Product-level approval |
| 5 | Delivery Lead | 14 | Delivery management |
| 6 | Business Analyst | 13 | Raises demands, read-only |
| 7 | Release Manager | 12 | Release lifecycle |
| 8 | ITSO | 11 | Security review |

### 3.2 Implementation

**File:** `src/context/RoleContext.tsx`

```typescript
const TABS_BY_ROLE: Record<string, string[]> = { ... }
export function useRole(): { roles, roleName, setRole, hasRole, isAdmin }
export function getAllowedTabs(roles): string[]
```

Role selected via header dropdown, persisted in `localStorage.pm_current_role`. Tab filtering applied in `App.tsx`. View-level UAC applied to Dashboard (action items), Sprint Board (product columns), Portfolio (VS filter), Governance (project visibility + edit permissions).

### 3.3 Multi-role

Removed in current version. Each user has a single role. `pm_user.pm_valuestream` stores comma-separated VS config IDs for VSO assignment.

---

## 4. Demand Intake Workflow

### 4.1 Full Status Lifecycle

```
                            📥 Save to Backlog
                                    │
                                    ▼
  Submitted → Triaging → Assessed → (PSC Review)   Backlogged ──→ 🔄 Reopen → Submitted
      │                                              │
      └──────── ❌ Reject ──────────────────────────┘
      │
      └──────── ✅ Approve (final step only) ──→ Convert Modal
                                                     │
                                          ┌──────────┴──────────┐
                                          ▼                     ▼
                                    Requirement              Backlog
                                   (linked to project)    (unlinked item)
                                    demand → hidden       demand → hidden
```

### 4.2 Config-Driven Status Progression

**File:** `src/views/DemandView.tsx`  
**Config:** `demand_flow` (pm_config type)

**Format:** `pm_name = '{value_stream}:{order}'`, `pm_description = '{status_name}'`

#### Customer Experience (2 steps)
```
Submitted → Triaging
```

#### Operational Efficiency (3 steps)
```
Submitted → Triaging → Assessed
```

#### Risk & Compliance (4 steps)
```
Submitted → Triaging → Assessed → PSC Review
```

Terminal actions (✅ Approve, 📥 Save to Backlog, ❌ Reject) are **only available at the final flow step**.

### 4.3 Change Status UI

A "Change Status" button per row opens a popup menu:

**At intermediate steps** (has next flow step):
```
Change Status ▾
───────────────
Triaging          ← next flow step
Assessed          ← optional (if more steps)
```

**At final flow step** (no progression remaining):
```
Change Status ▾
───────────────
✅ Approve         ← opens convert modal (Requirement or Backlog)
📥 Save to Backlog ← one-click creates backlog pm_requirement
❌ Reject          ← hides demand
```

Terminal actions (Approve, Backlog, Reject) are **only shown at the final flow step**, never alongside flow progression steps. This makes the workflow cleaner and prevents accidental premature termination.

### 4.4 Backlog Action (one-click)

```
Click "Save to Backlog" → creates pm_requirement with:
  pm_detail = demand.pm_detail
  pm_status = 'Prioritized'
  pm_projectname = NULL
  pm_priority = demand.pm_priority
  pm_capabilityid = demand.pm_capability
→ demand status → 'Backlogged' (hidden from active list)
```

Backlogged demands show a **🔄 Reopen** button that returns them to the first flow step (`flow[0]`), re-entering the active workflow.

```typescript
// DemandView.tsx
const getAvailableStatuses = (demand) => {
  const flow = getFlowStatuses(demand.pm_valuestream)
  const idx = flow.indexOf(demand.pm_status)
  return flow.slice(idx + 1) // All statuses after current
}
```

### 4.5 Convert Modal

When a user selects "Approved" (the last step), the convert modal opens:

```
┌─────────────────────────────────────┐
│ Convert Demand                      │
├─────────────────────────────────────┤
│ Target: ○ Requirement  ○ Backlog   │
│ Priority: [dropdown]               │
│ Capability: [dropdown]             │
│ Project: [dropdown — hidden if Backlog] │
│ Status: [dropdown]                 │
│ PSC Approval: [dropdowns]          │
│ [Save]                              │
└─────────────────────────────────────┘
```

- **Requirement**: Creates `pm_requirement` with `pm_projectname` set, status from dropdown
- **Backlog**: Creates `pm_requirement` with `pm_projectname = ''`, status = "Prioritized"
- Both modes set `pm_converted_to` + `pm_converted_date` on the demand
- Converted demands are hidden from the demand list (filtered by `pm_status === 'Approved' && pm_converted_to`)

### 4.6 Stats & Filtering

Stats shown: Active, Submitted, Triaging, Assessed, Pending Conv (Approved-not-yet-converted). Converted and Rejected demands are excluded from the active data set.

### 4.7 badgeClass Mapping

**File:** `src/context/UIContext.tsx`

```typescript
export function badgeClass(val: string): string {
  const v = val.toLowerCase()
  // badge-green: active, approved, new, live, g, submitted, converted
  // badge-amber: in progress, pending, review, a, triaging, psc review
  // badge-blue: inactive, rejected, critical, r, dev1, dev2, assessed
  // badge-gray: default fallback
}
```

---

## 5. Requirements / Backlog

### 5.1 Single Table Design

`pm_requirement` serves both as Requirements (linked to projects) and Backlog (unlinked).

| Condition | Display Mode |
|---|---|
| `pm_projectname IS SET` | Linked — appears in "Linked" tab mode |
| `pm_projectname IS NULL` | Backlog — appears in "Backlog" tab mode |

### 5.2 Mode Toggle

The Requirements tab has three filter buttons:

```
[All] [Linked] [Backlog]
```

Clicking each filters the displayed rows. Stats update accordingly (Total, Linked, Backlog, PSC Approved).

### 5.3 Priority Column

`pm_priority` (from priority config) drives backlog ranking. Shown as a colored badge in the table.

---

## 6. Sprint Board

### 6.1 Matrix Layout (Teams × Products)

**File:** `src/views/SprintView.tsx`  
**Data source:** `pm_release` → `pm_releaseitem` → `pm_userstory` → `pm_epic` → `pm_assignment` → `pm_resource.pm_team`

- **Teams (rows):** Derived from resource assignments to epics involved in the sprint
- **Products (columns):** Derived from project → product chain
- **Cells:** Sprint cards showing name, status, story count, signoff progress, SP (completed/total)

### 6.2 Story Points Tracking

```
totalSP = sum(pm_userstory.pm_storypoint for all stories in sprint)
completedSP = sum(pm_userstory.pm_storypoint for APPROVED release items)
```

Progress bar uses SP-based completion ratio.

### 6.3 Filters

- "Show completed sprints" checkbox — hides Released sprints by default
- Role-based: VSO sees only assigned VS products; BA sees products with active demands

---

## 7. Governance Checklist

### 7.1 Configurable Phases

**Config:** `project_phase`  
**Format:** `pm_name = '{value_stream}:{order}'`, `pm_description = '{phase_name}'`

| Template | Phases |
|---|---|
| Default | Onboarding → Dev1 → Dev2 → Review → Live (5) |
| Customer Experience | Engage → Analysis → Prioritization → Development → Testing → Release → Live (7) |
| Operational Efficiency | Onboarding → Development → Review → Live (4) |
| Risk & Compliance | Onboarding → Dev1 → PSC Review → Dev2 → Review → Live (6) |

### 7.2 Configurable Tasks

**Config:** `project_checklist`  
**Format:** `pm_name = '{VS}:{phase}:{order}'`, `pm_description = '{task_name}'`

Falls back to default (no VS prefix) if VS-specific not found.

### 7.3 Checkpoint Auto-Creation

- Each project×phase×task is shown from config
- Items without a `pm_checkpoint` record appear dimmed (config-only)
- Editing any field auto-creates the checkpoint record
- "Generate N Items" button batch-creates all missing items for a project

### 7.4 Project Template Assignment

`pm_project.pm_governance_template` field allows explicit template override. Falls back to product's value stream for auto-detection.

---

## 8. Navigation Context

**File:** `src/context/NavigationContext.tsx`

Provides cross-view tab navigation with optional record focus:

```typescript
navigate(tabId: string, focusId?: string)
```

When `focusId` is provided, the target view:
1. Expands the row with matching ID
2. Scrolls `row-{focusId}` into view
3. Adds `row-focus-flash` CSS class with 2s animation
4. Calls `clearFocus()` to prevent re-trigger

Implemented in: DashboardView (action item clicks), SprintView (card clicks), PortfolioView (card clicks).

---

## 9. Component Architecture

```
src/
├── App.tsx              # Shell, tab routing, role selector
├── App.css              # Global styles
├── main.tsx             # React entry point
├── models.ts            # 18 table schemas + getFields/getModelName
├── types.ts             # FieldDef, Model, Record_ types
├── data.ts              # DS singleton (localStorage CRUD)
├── seed.ts              # seedAllIfNeeded() — 300+ records
├── views.tsx            # Barrel exports for all views
├── context/
│   ├── UIContext.tsx     # Modal/Toast system + badgeClass
│   ├── SearchContext.tsx # Global search provider
│   ├── NavigationContext.tsx # Tab navigation + focus
│   └── RoleContext.tsx   # Role provider + UAC logic
├── components/
│   ├── DataTable.tsx     # Generic sortable table (limited use now)
│   ├── StatsCards.tsx    # Stat card row
│   ├── SearchBar.tsx     # Search input
│   └── EmptyState.tsx    # Empty state placeholder
└── views/
    ├── DashboardView.tsx     # Dashboard
    ├── PortfolioView.tsx     # Portfolio
    ├── DemandView.tsx        # Demand intake with workflow
    ├── RequirementsView.tsx  # Requirements + Backlog
    ├── ProductsView.tsx      # Products
    ├── ProjectsView.tsx      # Projects + Pipeline board
    ├── EpicsView.tsx         # Epics
    ├── UserStoriesView.tsx   # User stories
    ├── RisksView.tsx         # Risks
    ├── DependenciesView.tsx  # Dependencies
    ├── ReleasesView.tsx      # Release management
    ├── SprintView.tsx        # Sprint board
    ├── CheckpointView.tsx    # Governance checklist
    ├── UsersView.tsx         # User management
    ├── ResourcesView.tsx     # Resource management
    └── ConfigView.tsx        # Configuration
```

---

## 10. Build & Deploy

### Development
```bash
npm run dev        # Vite dev server at localhost:5173
npx vitest run     # 39 unit tests
```

### Production Build
```bash
npm run build      # tsc + vite build → dist/
```
Output: ~387KB JS (97KB gzip), ~20KB CSS

### Power Apps Deployment
```bash
pac code init       # Initialize CodeApp project
pac code push       # Deploy to Power Apps environment
pac code add-data-source -a shared_xxxx -c <connectionId>  # Add connectors
```

---

## 11. Configuration Reference

All config-driven behaviors are controlled via `pm_config` entries. See `src/seed.ts` for seed values and `TABLES-DATAVERSE.md` for full schema.

| Config Type | Controls |
|---|---|
| `value_stream` | Product VS assignment, Demand VS, User VS (VSO) |
| `demand_flow` | Per-VS status progression for demand workflow |
| `demand_type` | Demand classification (Feature, Bug, etc.) |
| `project_phase` | Per-VS pipeline phase definitions |
| `project_checklist` | Per-VS per-phase governance tasks |
| `user_role` | User role definitions |

---

## 12. Known Limitations

1. **No real authentication** — roles set via localStorage dropdown (DEV mode)
2. **No server persistence** — all data in localStorage (Dataverse in PROD)
3. **No multi-language** — English only
4. **No audit trail** — status changes are not logged
5. **No notifications** — no email/Slack/webhook integration
6. **Date handling** — strings stored as dates, no timezone support
7. **No data export** — single-user localStorage, no backup mechanism

---

*Document version: v4.0 — June 2026*
