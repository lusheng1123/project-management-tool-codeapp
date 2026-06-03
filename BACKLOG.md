# Backlog — Project Management Tool

---

## 🚀 Feature: UAC (User Access Control)

### Design Principles
- **Tab-level** filtering — roles see only their assigned tabs
- **Button-level** gating — workflow buttons (Approve, Triage, Signoff etc.) restricted by role
- **Centralized** permission matrix in `src/permissions.ts` (single source of truth)
- **`useRole()` hook** — `canViewTab(tabId)` + `canDo(action, tab?)` consumed by all views
- DEV mode: role selector dropdown in header, persisted as `pm_current_role` in localStorage

### Tables

**pm_user** — Users with roles

| Field | Schema Name | Type | Purpose |
|---|---|---|---|
| User ID | pm_userid | Primary Key (GUID) | Auto |
| Username | pm_username | Single Line of Text (100) | Login identifier (email/alias) |
| Display Name | pm_displayname | Single Line of Text (200) | Display name |
| Role | pm_role | Lookup → pm_config | `pm_config` type=`user_role` |
| Status | pm_status | Single Line of Text (50) | Active / Inactive |
| Email | pm_email | Email (100) | |

### Roles (pm_config type=`user_role`)

| Role | Description |
|---|---|
| Admin | Full access — all tabs, all actions |
| PM | Project Manager — manage projects, resources, assignments, demand workflow |
| PO | Product Owner — approve/reject demands, signoff releases |
| Developer | View + work on epics, stories, register to releases |
| Release Manager | Manage releases, signoff |
| Viewer | Read-only across all tabs |

### Permission Matrix

#### Tab Visibility

| Role | Visible Tabs (12 total) |
|---|---|
| Admin | All 12 |
| PM | Demand, Capabilities, Products, Projects, Requirements, Epics, Stories, Risks, Deps, Releases, Resources |
| PO | Demand, Products, Requirements, Epics, Stories |
| Developer | Epics, Stories, Requirements, Projects, Releases |
| Release Manager | Releases, Epics, Stories, Requirements |
| Viewer | All 12 (read-only — no action buttons) |

#### Action Permissions (per tab)

| Tab → | Demand | Release | General (all other tabs) |
|---|---|---|---|
| **Admin** | All (Create, Edit, Delete, Triage, Assess, Approve, Reject, Convert) | All (Create, Edit, Delete, Open, Review, Complete, Register, Signoff) | Full CRUD |
| **PM** | Create, Edit, Delete, Triage, Assess, Convert, Reject | Create, Edit, Delete, Register | Full CRUD on managed tabs |
| **PO** | Approve, Reject | Signoff | View-only on others |
| **Developer** | View-only | Register stories | Create/Edit Story, view rest |
| **Release Mgr** | View-only | All (Create, Edit, Delete, Open, Review, Complete, Register, Signoff) | Edit Release, view rest |
| **Viewer** | None | None | None (view-only) |

#### Demand Workflow Buttons — Who Sees What

| Button | Admin | PM | PO | Developer | Release Mgr | Viewer |
|---|---|---|---|---|---|---|
| `+ Raise Demand` | ✅ | ✅ | — | — | — | — |
| `✏️ Edit` | ✅ | ✅ | — | — | — | — |
| `🗑️ Delete` | ✅ | ✅ | — | — | — | — |
| `🔍 Start Triage` | ✅ | ✅ | — | — | — | — |
| `📋 Assess` | ✅ | ✅ | — | — | — | — |
| `❌ Reject` | ✅ | ✅ | ✅ | — | — | — |
| `✅ Approve` | ✅ | — | ✅ | — | — | — |
| `🔄 Convert` | ✅ | ✅ | — | — | — | — |

### Implementation

| File | Change |
|---|---|
| `src/permissions.ts` | **New** — centralized permission matrix: `{ role → { tabs: string[], actions: { [tab]: string[] } } }` |
| `src/context/RoleContext.tsx` | **New** — `RoleProvider` + `useRole()` hook exposing `role`, `canViewTab()`, `canDo()` |
| `src/models.ts` | Add `pm_user` table |
| `src/seed.ts` | 6 user_role config + 6 seed users (one per role) |
| `src/App.tsx` | Wrap in `<RoleProvider>`, role selector dropdown in header, filter `TABS` by `canViewTab()` |
| `src/views/*.tsx` (12 views) | Each view calls `const { canDo } = useRole()` and wraps action buttons: `{canDo('approve') && <button>✅ Approve</button>}` |
| `TABLES-DATAVERSE.md` | Add pm_user spec + user_role config type |
| `BACKLOG.md` | Mark E1 done |

### Example Usage in Views

```tsx
// In DemandView.tsx
const { canDo } = useRole()
...
{dem.pm_status === 'Approved' && canDo('convert') && (
  <button onClick={() => openConvert(dem.id)}>🔄 Convert</button>
)}
{dem.pm_status === 'Assessed' && canDo('approve') && (
  <button onClick={() => approve(dem.id)}>✅ Approve</button>
)}
{dem.pm_status === 'Submitted' && canDo('triage') && (
  <button onClick={() => startTriage(dem.id)}>🔍 Start Triage</button>
)}
{canDo('create') && (
  <button onClick={openCreate}>+ Raise Demand</button>
)}
```

### Effort: ~16 files | Priority: High

---

## 📥 Feature: Demand Intake

### Table: `pm_demand`

| Field | Schema Name | Type | Purpose |
|---|---|---|---|
| Demand ID | pm_demandid | Primary Key (GUID) | Auto |
| Title | pm_title | Single Line of Text (200) | Brief summary |
| Detail | pm_detail | Multiple Lines of Text (4000) | Full description |
| Type | pm_type | Single Line of Text (50) | `pm_config` type=`demand_type` |
| Priority | pm_priority | Single Line of Text (50) | `pm_config` type=`priority` |
| Status | pm_status | Single Line of Text (50) | `pm_config` type=`demand_status` |
| Value Stream | pm_valuestream | Single Line of Text (50) | `pm_config` type=`value_stream` |
| Capability | pm_capability | Lookup → pm_capability | Target capability |
| Product | pm_product | Lookup → pm_product (Required) | Target application |
| Submitted By | pm_submitted_by | Single Line of Text (100) | |
| Submitted Date | pm_submitted_date | Date Only | |
| Assessment Notes | pm_assessment_notes | Single Line of Text (500) | |
| Converted To | pm_converted_to | Lookup → pm_requirement | Once approved |
| Converted Date | pm_converted_date | Date Only | |

### Config: New Types

| Config Type | Values |
|---|---|
| `demand_type` | Feature, Bug, Enhancement, Tech Debt |
| `demand_status` | Submitted, Triaging, Assessed, Approved, Rejected, Converted |

### Workflow

```
Submitted → Triaging → Assessed → Approved → Converted
                         ↓
                      Rejected
```

### New Tab: "📥 Demand" (12th tab)

| Column | Detail |
|---|---|
| Table | Title, Type, Priority, Status, Capability, Product |
| Expand | Click row → shows detail + assessment notes |
| Actions | Edit, Delete, workflow buttons |
| Convert | "🔄 Convert" on Approved → creates pm_requirement, sets pm_converted_to |

### Files Affected

| File | Change |
|---|---|
| `models.ts` | Add `pm_demand` table |
| `seed.ts` | Add config entries + 4 seed demands |
| `views/DemandView.tsx` | New view with workflow |
| `views.tsx` | Add DemandView export |
| `App.tsx` | Add Demand tab |

### Effort: ~5 files | Priority: High

---

## 🔧 Enhancement Backlog

| # | Feature | Priority | Files | Notes |
|---|---|---|---|---|
| E1 | UAC — User roles + tab filtering + permissions | **High** | ~10 | Roles, tab visibility, action buttons |
| E2 | Demand Intake — New tab + workflow + convert | **High** | ~5 | ✅ **Done** — `views/DemandView.tsx`, 5-stage workflow, config-driven, convert to requirement |
| E3 | `pm_pscapprovalrequired` dropdown from `yes_no` config | Low | 1 | Replace text input with Yes/No select |
| E4 | Effort Summary tab — Product/Project/Epic/Story rollup | Medium | ~3 | Calculated totals across hierarchy |
| E5 | Resource capacity warnings — Allocation % > 100% | Low | 1 | Red highlight in Resources tab |
| E6 | `pm_userstory.pm_storypoint` → auto-calculate epic actual | Medium | 2 | Already partially done; extend to Effort tab |
| E7 | Bulk status change in Projects (select multiple → update) | Low | 1 | Checkboxes + batch action |
| E8 | Export to CSV per tab | Low | 1 | Download button in each view header |
| E9 | Dark mode toggle in header | Low | 1 | CSS variables swap |
| E10 | Notification badge for pending signoffs | Low | 2 | Count badge on Releases tab |

---

## 🐛 Bugs / Cleanup

| # | Issue | Status |
|---|---|---|
| B1 | `App.tsx.bak-split` backup file in `src/` — remove after confirming split works | Open |
| B2 | Seed data total count in TABLES-DATAVERSE.md — verify 62 (56 config + 6 user_roles = 62?) | Open |
| B3 | `.bak-*` backup files in `src/` — already removed | Done |

---

## Summary

| Category | Count |
|---|---|
| Features (major) | 1 |
| Enhancements | 10 |
| Bugs / Cleanup | 3 |
| **Total Backlog Items** | **14** |
