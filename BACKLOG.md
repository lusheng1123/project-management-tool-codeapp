# Backlog — Project Management Tool

---

## 🚀 Feature: UAC (User Access Control)

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

### Config: `pm_config` type=`user_role`

Roles stored in config table. Seed values:

| Role | Description |
|---|---|
| Admin | Full access — all tabs + CRUD |
| PM | Project Manager — manage projects, resources, assignments |
| PO | Product Owner — signoff, approve demands |
| Developer | View + work on epics, stories, assignments |
| Release Manager | Manage releases, signoff |
| Viewer | Read-only across all tabs |

### Role → Tab Mapping

| Role | Visible Tabs |
|---|---|
| Admin | All (12 tabs) |
| PM | Resources, Products, Projects, Capabilities, Requirements, Epics, Stories, Risks, Deps, Demand |
| PO | Products, Requirements, Epics, Stories, Demand |
| Developer | Epics, Stories, Requirements, Projects, Releases |
| Release Manager | Releases, Epics, Stories, Requirements |
| Viewer | All (read-only — no Edit/Delete/Create buttons) |

### UI Changes

| Layer | What |
|---|---|
| `App.tsx` header | Role selector dropdown (DEV mode). Persisted in localStorage as `pm_current_role` |
| `App.tsx` nav | `TABS` array filtered by current role before rendering tab buttons |
| All `views/*.tsx` | Conditional action buttons — Edit/Delete/Create hidden for Viewer; Create hidden for Developer on some tabs |

### Files Affected

| File | Change |
|---|---|
| `models.ts` | Add `pm_user` table |
| `seed.ts` | Add 6 user_role config entries + seed 6 users |
| `App.tsx` | Role selector + tab filtering logic |
| All 11 view files | Conditional action visibility based on role |
| `TABLES-DATAVERSE.md` | Update table specs |

### Effort: ~10 files | Priority: High

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
| Capability | pm_capability | Lookup → pm_capability | Target capability |
| Product | pm_product | Lookup → pm_product | Target product |
| Submitted By | pm_submitted_by | Single Line of Text (100) | |
| Submitted Date | pm_submitted_date | Date Only | |
| Effort Estimate | pm_effort_estimate | Whole Number | Assessed (days) |
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
| E2 | Demand Intake — New tab + workflow + convert | **High** | ~5 | New table, workflow, convert action |
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
| Features (major) | 2 |
| Enhancements | 10 |
| Bugs / Cleanup | 3 |
| **Total Backlog Items** | **15** |
