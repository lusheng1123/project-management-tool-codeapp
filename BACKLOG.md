# Backlog — Project Management Tool

---

## ✅ Completed Features

| Feature | Status | Notes |
|---|---|---|
| UAC — 8 roles, tab filtering, role selector | ✅ Done | Value Stream Owner, Product Owner, Delivery Lead, Business Analyst, Admin, Release Manager, ITSO, Value Stream PMO |
| Demand Intake — configurable workflow per VS | ✅ Done | demand_flow config, Approved triggers convert to Requirement/Backlog |
| Dashboard — action items, product health | ✅ Done | Role-filtered, clickable with auto-expand navigation |
| Sprint Board — Team×Product grid | ✅ Done | Matrix layout, SP tracking, active-only toggle, role-filtered |
| Governance — configurable phases + checklist | ✅ Done | Per-VS templates, auto-create checkpoints, UAC gated |
| Portfolio View — VS-grouped product cards | ✅ Done | Holistic metrics, SP tracking, teams, sprints |
| Copilot POC | ❌ Removed | Deleted, replaced by Users tab |
| Backlog = Requirement without project | ✅ Done | Same table, mode toggle (All/Linked/Backlog), Priority column |

---

## 🔗 Feature: Jira Integration

### Current State
- `pm_epic` already has `pm_jiralink` (text field, single URL per epic)
- `pm_userstory` — `pm_jiralink` to be added in P1
- No sync, no automation — manual paste only

### Scope

| # | Feature | Description |
|---|---|---|
| 1 | **Extend Jira links** | Add `pm_jiralink` field to `pm_requirement` and `pm_userstory` (not just epics) |
| 2 | **Jira Link column** | Show clickable Jira link icon (🔗) in Epics, Stories, Requirements tables |
| 3 | **Jira status sync** | Pull Jira status alongside local RAG status |
| 4 | **Create Jira issue** | "Push to Jira" button on Approved demands |

### Phases

| Phase | What | Effort |
|---|---|---|
| P1 | `pm_jiralink` on requirements + stories, clickable link column | ~4 files |
| P2 | Create Jira issue from demand/requirement | ~5 files |
| P3 | Status sync | ~4 files |

### Priority: Medium

---

## 🔧 Enhancement Backlog

| # | Feature | Priority | Notes |
|---|---|---|---|
| E1 | Effort Summary tab — Product/Project/Epic/Story rollup | Medium | Calculated totals across hierarchy |
| E2 | Resource capacity warnings — Allocation % > 100% | Low | Red highlight in Resources tab |
| E3 | Bulk status change in Projects | Low | Checkboxes + batch action |
| E4 | Export to CSV per tab | Low | Download button in each view header |
| E5 | Dark mode toggle | Low | CSS variables swap |
| E6 | Notification badge for pending signoffs | Low | Count badge on Releases tab |
| E7 | Auto-generate checkpoints on project status change | Medium | Create from config when project enters phase |
| E8 | 💡 Backlog prioritization (drag-and-drop) | Low | Reorder by priority |
| E9 | 💡 Resource loading chart per sprint | Medium | Visualization of team allocation |

---

## 🐛 Bugs / Cleanup

| # | Issue | Status |
|---|---|---|
| B1 | Jira fields on pm_epic/pm_userstory — update after Jira integration | Pending 🔗 |
| B2 | pm_requirement.pm_productname — add for demand-converted items to carry product link | Open |

---

## Summary

| Category | Count |
|---|---|
| Features (planned) | 1 (Jira) |
| Enhancements | 9 |
| Bugs / Cleanup | 2 |
| **Total Open** | **12** |

### Current Tech Stack
- React 19 + TypeScript + Vite
- localStorage data layer (Dataverse-ready models)
- 18 tables, ~330 seed records, 21 config types
- 39 vitest unit tests
- Playwright screenshot automation for training docs
- 20-slide training PPT with auto-captured screenshots
