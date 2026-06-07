# Dataverse Table Specifications — Project Management Tool

Created from `src/App.tsx` MODELS definition. Use these to create tables when deploying to Power Apps Dataverse.

> **Design Principle:** All field types are TEXT or LOOKUP. No CHOICE/OptionSet types used. Every configurable value lives in `pm_config`, editable via the ⚙️ Config tab without code changes.

---

## 1. pm_resource (Resource)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Resource ID | pm_resourceid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (150) | Yes | |
| Role | pm_role | Single Line of Text (100) | Yes | |
| Department | pm_department | Single Line of Text (100) | No | `pm_config` type=`department` |
| Team | pm_team | Single Line of Text (100) | No | `pm_config` type=`team` — used for Sprint Board team grouping |
| Email | pm_email | Email (100) | No | |
| Joined Date | pm_joineddate | Date Only | Yes | |
| Leave Date | pm_leavedate | Date Only | No | |
| Cost | pm_cost | Currency / Decimal | No | |
| Status | pm_status | Single Line of Text (50) | No | `pm_config` type=`resource_status` |

---

## 2. pm_capability (Capability)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Capability ID | pm_capabilityid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Description | pm_description | Multiple Lines of Text (2000) | No | |
| Type | pm_capabilitytype | Lookup → pm_config | No | `pm_config` type=`capability_type` |
| Cost | pm_cost | Currency / Decimal | No | |

---

## 3. pm_product (Product)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Product ID | pm_productid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Journey Name | pm_journeyname | Single Line of Text (200) | No | |
| Short Name | pm_shortname | Single Line of Text (50) | No | |
| Value Stream | pm_valuestream | Lookup → pm_config | No | `pm_config` type=`value_stream` |
| Governance Status | pm_governancestatus | Single Line of Text (100) | No | `pm_config` type=`governance_status` |
| Contact | pm_contact | Single Line of Text (150) | No | |

---

## 4. pm_capabilityproduct (Capability-Product Link — N:N)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Link ID | pm_capabilityproductid | Primary Key (GUID) | Auto | |
| Capability | pm_capabilityid | Lookup → pm_capability | Yes | |
| Product | pm_productname | Lookup → pm_product | Yes | |

---

## 5. pm_requirement (Requirement / Backlog)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Requirement ID | pm_requirementid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Capability | pm_capabilityid | Lookup → pm_capability | No | |
| Project | pm_projectname | Lookup → pm_project | No | NULL = Backlog item; SET = Linked to project |
| Priority | pm_priority | Single Line of Text (50) | No | `pm_config` type=`priority` — for backlog ranking |
| Status | pm_status | Single Line of Text (50) | No | `pm_config` type=`requirement_status` |
| PSC Approval Required | pm_pscapprovalrequired | Single Line of Text (10) | No | `pm_config` type=`yes_no` |
| PSC Approval Status | pm_pscapprovalstatus | Single Line of Text (50) | No | `pm_config` type=`psc_approval_status` |
| Effort | pm_effort | Whole Number | No | Build effort in days |

> **Backlog vs Requirement:** Same table. Backlog = pm_projectname IS NULL. Linked = pm_projectname IS SET. Requirements tab has All/Linked/Backlog mode toggle. Priority column drives backlog ranking.

---

## 6. pm_project (Project)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Project ID | pm_projectid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Product | pm_productname | Lookup → pm_product | No | |
| Start Date | pm_startdate | Date Only | No | |
| Target Delivery Date | pm_targetdeliverydate | Date Only | No | |
| Status | pm_status | Single Line of Text (50) | No | `pm_config` type=`project_status` |
| Est. Effort (days) | pm_estimateeffort | Whole Number | No | |
| Overall Completion (%) | pm_overallcompletion | Whole Number (0-100) | No | |
| Enhancement Type | pm_enhancementtype | Single Line of Text (100) | No | `pm_config` type=`enhancement_type` |
| Priority | pm_priority | Single Line of Text (100) | No | `pm_config` type=`priority` |
| Scope | pm_scope | Multiple Lines of Text (4000) | No | |
| Year / Quarter | pm_yearquarter | Single Line of Text (20) | No | |
| Gov Template | pm_governance_template | Single Line of Text (100) | No | Explicit governance template (VS name). Falls back to product's VS if empty. |

---

## 7. pm_control (Control)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Control ID | pm_controlid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Project | pm_projectname | Lookup → pm_project | No | |

---

## 8. pm_epic (Epic)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Epic ID | pm_epicid | Primary Key (GUID) | Auto | |
| Title | pm_title | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Project | pm_projectname | Lookup → pm_project | No | |
| Jira Link | pm_jiralink | Single Line of Text (500) | No | 🔗 Jira pending — text field for URL |
| Effort (days) | pm_estimatedeffort | Whole Number | No | PM's estimate |
| Start Date | pm_startdate | Date Only | No | |
| Release Date | pm_releasedate | Date Only | No | |
| Completed Date | pm_completeddate | Date Only | No | |
| RAG Status | pm_ragstatus | Single Line of Text (10) | No | `pm_config` type=`rag_status` — G=done (SP counted), A=at risk, R=blocked |

---

## 9. pm_userstory (User Story)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| User Story ID | pm_userstoryid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Epic | pm_epicid | Lookup → pm_epic | No | |
| Acceptance Criteria | pm_acceptancecriteria | Multiple Lines of Text (4000) | No | |
| Story Points | pm_storypoint | Whole Number | No | 1pt = 1 manday. Used in Sprint Board SP breakdown |

> 🔗 Jira pending — `pm_jiralink` will be added once Jira integration is implemented.

---

## 10. pm_risk (Risk)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Risk ID | pm_riskid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Product | pm_productname | Lookup → pm_product | No | |
| Requirement | pm_requirementid | Lookup → pm_requirement | No | Filtered by selected product |

---

## 11. pm_dependency (Dependency)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Dependency ID | pm_dependencyid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Product | pm_productname | Lookup → pm_product | No | |
| Requirement | pm_requirementid | Lookup → pm_requirement | No | Filtered by selected product |

---

## 12. pm_demand (Demand)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Demand ID | pm_demandid | Primary Key (GUID) | Auto | |
| Title | pm_title | Single Line of Text (200) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Type | pm_type | Single Line of Text (50) | No | `pm_config` type=`demand_type` |
| Priority | pm_priority | Single Line of Text (50) | No | `pm_config` type=`priority` |
| Status | pm_status | Single Line of Text (50) | No | Flow-driven from `demand_flow` config |
| Value Stream | pm_valuestream | Single Line of Text (100) | No | `pm_config` type=`value_stream` |
| Capability | pm_capability | Lookup → pm_capability | No | |
| Product | pm_product | Lookup → pm_product | **Yes** | |
| Submitted By | pm_submitted_by | Single Line of Text (100) | No | |
| Submitted Date | pm_submitted_date | Date Only | No | |
| Assessment Notes | pm_assessment_notes | Multiple Lines of Text (2000) | No | |
| Converted To | pm_converted_to | Lookup → pm_requirement | No | Links to created requirement/backlog |
| Converted Date | pm_converted_date | Date Only | No | |

> **Workflow:** Per-VS flow steps (config-driven). Terminal actions (✅ Approve, 📥 Save to Backlog, ❌ Reject) only shown at the final flow step. Backlogged demands get 🔄 Reopen. Converted/Backlogged/Rejected hidden from active list. `DemandView.tsx`.

---

## 13. pm_config (Configuration)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Config ID | pm_configid | Primary Key (GUID) | Auto | |
| Type | pm_type | Single Line of Text (100) | Yes | Category discriminator |
| Name | pm_name | Single Line of Text (200) | Yes | Format varies by type |
| Description | pm_description | Single Line of Text (500) | No | |
| Code Change? | pm_hardcoded | Single Line of Text (10) | No | Yes = value checked in code; No = freely editable |

---

## 14. pm_release (Release/Sprint)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Release ID | pm_releaseid | Primary Key (GUID) | Auto | |
| Release Name | pm_releasename | Single Line of Text (200) | Yes | |
| Status | pm_status | Single Line of Text (50) | No | `pm_config` type=`release_status` |
| Release Date | pm_releasedate | Date Only | No | |
| Cutoff Date | pm_cutoffdate | Date Only | No | |
| Description | pm_description | Multiple Lines of Text (2000) | No | |

---

## 15. pm_releaseitem (Release Item)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Release Item ID | pm_releaseitemid | Primary Key (GUID) | Auto | |
| Release | pm_release | Lookup → pm_release | Yes | |
| User Story | pm_userstory | Lookup → pm_userstory | Yes | |
| Signoff Status | pm_signoff_status | Single Line of Text (50) | No | `pm_config` type=`signoff_status` |
| Signoff Note | pm_signoff_note | Single Line of Text (500) | No | |
| Signoff By | pm_signoff_by | Single Line of Text (100) | No | |
| Signoff Date | pm_signoff_date | Date Only | No | |
| Registered By | pm_registered_by | Single Line of Text (100) | No | |
| Registered Date | pm_registered_date | Date Only | No | |
| Tool | pm_tool | Single Line of Text (100) | No | `pm_config` type=`tool` |

---

## 16. pm_assignment (Assignment)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Assignment ID | pm_assignmentid | Primary Key (GUID) | Auto | |
| Resource | pm_resource | Lookup → pm_resource | Yes | |
| Epic | pm_epic | Lookup → pm_epic | Yes | |
| Allocation % | pm_allocationpct | Whole Number (0-100) | No | |
| Start Date | pm_startdate | Date Only | No | |
| End Date | pm_enddate | Date Only | No | |

---

## 17. pm_checkpoint (Governance Checkpoint)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Checkpoint ID | pm_checkpointid | Primary Key (GUID) | Auto | |
| Project | pm_projectname | Lookup → pm_project | Yes | |
| Phase | pm_phase | Single Line of Text (100) | Yes | From configurable `project_phase` |
| Task | pm_task | Single Line of Text (200) | Yes | From configurable `project_checklist` |
| Owner | pm_owner | Single Line of Text (100) | No | |
| Status | pm_status | Single Line of Text (50) | No | To Do, In Progress, Done, N/A |
| Plan Start | pm_plan_start | Date Only | No | |
| Plan End | pm_plan_end | Date Only | No | |
| Actual Start | pm_actual_start | Date Only | No | |
| Actual End | pm_actual_end | Date Only | No | |

> Tasks defined in `project_checklist` config. Phases defined in `project_phase` config. Auto-create on first edit. "Generate N Items" button per project.

---

## 18. pm_user (User)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| User ID | pm_userid | Primary Key (GUID) | Auto | |
| Username | pm_username | Single Line of Text (100) | Yes | |
| Display Name | pm_displayname | Single Line of Text (200) | Yes | |
| Role | pm_role | Single Line of Text (100) | No | `pm_config` type=`user_role` |
| Value Stream | pm_valuestream | Single Line of Text (200) | No | Comma-separated VS IDs for VSO role |
| Email | pm_email | Email (100) | No | |
| Status | pm_status | Single Line of Text (50) | No | |

---

## Config Type Reference

All configurable values live in `pm_config`. Add/edit/remove values in the ⚙️ Config tab.

| Config Type | Used By (Table.Field) | Seed Values | Code Change? |
|---|---|---|---|
| `value_stream` | pm_product.pm_valuestream, pm_demand.pm_valuestream, pm_user.pm_valuestream | Customer Experience, Operational Efficiency, Risk & Compliance | No |
| `team` | pm_resource.pm_team | Alpha, Beta, Gamma, Delta, Platform, Business | No |
| `department` | pm_resource.pm_department | IT, Business | No |
| `enhancement_type` | pm_project.pm_enhancementtype | New Integration, BAU Enhancement | No |
| `capability_type` | pm_capability.pm_capabilitytype | Functional, Technical, Integration, Infrastructure, Security, Data & Analytics | No |
| `governance_status` | pm_product.pm_governancestatus | Approved, Pending, Rejected, N/A | **Yes** |
| `priority` | pm_project.pm_priority, pm_requirement.pm_priority | Low, Medium, High, Critical | **Yes** |
| `rag_status` | pm_epic.pm_ragstatus | G, A, R | **Yes** |
| `requirement_status` | pm_requirement.pm_status | Prioritized (backlog/unlinked), Linked (to project) | **Yes** |
| `psc_approval_status` | pm_requirement.pm_pscapprovalstatus | Pending, Approved, Rejected, N/A | **Yes** |
| `signoff_status` | pm_releaseitem.pm_signoff_status | Pending, Approved, Rejected | **Yes** |
| `resource_status` | pm_resource.pm_status | Active, Inactive, On Leave | **Yes** |
| `project_status` | pm_project.pm_status | Onboarding, Development Phase 1, Development Phase 2, Review, Live | **Yes** |
| `release_status` | pm_release.pm_status | Draft, Open, In Review, Released | **Yes** |
| `yes_no` | pm_requirement.pm_pscapprovalrequired | Yes, No | **Yes** |
| `tool` | pm_releaseitem.pm_tool | Jira, Azure DevOps, GitHub, ServiceNow, Jenkins | No |
| `demand_type` | pm_demand.pm_type | Feature, Bug, Enhancement, Tech Debt | No |
| `demand_flow` | pm_demand (workflow) | Per-VS flow steps. Format: pm_name=VS:order, pm_description=status. Terminal actions only at final step. | **Yes** |
| `user_role` | pm_user.pm_role | Value Stream Owner, Product Owner, Delivery Lead, Business Analyst, Admin, Release Manager, ITSO, Value Stream PMO | **Yes** |
| `project_checklist` | pm_checkpoint.pm_task | Per-VS per-phase task definitions. Format: pm_name={VS}:{phase}:{order}, pm_description={task}. Falls back to default without VS prefix. 54 entries. | **Yes** |
| `project_phase` | pm_checkpoint.pm_phase | Per-VS pipeline phase definitions. Format: pm_name={VS}:{order}, pm_description={phase}. Default uses `_:` prefix. 22 entries across 4 templates. | **Yes** |

---

## Portfolio View

The **📈 Portfolio** tab shows a holistic view of the entire portfolio grouped by Value Stream → Product.

| Metric | Source |
|---|---|
| Demand count + status breakdown | `pm_demand` grouped by product |
| Project count | `pm_project.pm_productname` |
| Risk & dependency counts | `pm_risk.pm_productname`, `pm_dependency.pm_productname` |
| Story Points (total/completed) | `pm_userstory.pm_storypoint` via epics → projects; completed = epics with RAG=G |
| Active sprints | `pm_release` → release items → stories → epics → projects chain |
| Teams involved | `pm_assignment` → `pm_resource.pm_team` via epics |
| Flow steps | `demand_flow` config count per VS |

---

## Sprint Board

The **📋 Sprints** tab shows a Team × Product grid (teams as rows, products as columns). Teams derived from resource assignments → epics. Sprint cards show name, status, story count, signoff progress, and completed/total SP. Filter toggle: show/hide completed sprints.

---

## Governance View

The **✅ Governance** tab shows per-project per-phase checklist. Reads phases from `project_phase` config and tasks from `project_checklist` config. All items editable — auto-creates checkpoint records on first edit. "Generate N Items" button per project. UAC: VSO sees only assigned VS projects, BA sees demand-linked projects. Edit gated (DL/Admin/VSO/PO/RM can edit; BA/ITSO read-only).

---

## Embedded Code Logic (Code Change Required to Modify)

### Demand Workflow (demand_flow)

Per-VS config. Flow values: `Submitted`, `Triaging`, `Assessed`, `PSC Review`. Terminal actions at final step: `Approved`, `Backlogged`, `Rejected`.

| # | Location | What |
|---|---|---|
| 1 | DemandView Change Status popup | Flow steps at intermediate, terminal actions at final step |
| 2 | `badgeClass()` | Badge colors (submitted=green, triaging=amber, assessed=blue, psc review=amber, backlogged=blue, rejected=blue) |
| 3 | `openConvert()` in DemandView | ✅ Approve opens convert modal (Requirement or Backlog target) |
| 4 | `saveToBacklog()` in DemandView | 📥 One-click creates `pm_requirement` (Prioritized, unlinked) |
| 5 | `reopenDemand()` in DemandView | 🔄 Backlogged → first flow step (back in active list) |
| 6 | Convert modal | Target: Requirement (linked to project) or Backlog (unlinked) |

### Release Workflow (release_status)

Values: `Draft`, `Open`, `In Review`, `Released`

| # | Location | What |
|---|---|---|
| 1 | ReleasesView buttons | Conditional rendering per status |
| 2 | `badgeClass()` | Badge colors |

### RAG Status (rag_status)

Values: `G`, `A`, `R`

| # | Location | What |
|---|---|---|
| 1 | `badgeClass()` | Badge colors for G/A/R |
| 2 | Portfolio SP calculation | G = completed SP |

---

## Relationships Summary

| Parent | Child | Via |
|---|---|---|
| pm_resource | pm_assignment | pm_resource |
| pm_epic | pm_assignment | pm_epic |
| pm_capability | pm_capabilityproduct | pm_capabilityid |
| pm_product | pm_capabilityproduct | pm_productname |
| pm_config | pm_product | pm_valuestream |
| pm_config | pm_capability | pm_capabilitytype |
| pm_capability | pm_requirement | pm_capabilityid |
| pm_project | pm_requirement | pm_projectname |
| pm_project | pm_control | pm_projectname |
| pm_project | pm_epic | pm_projectname |
| pm_project | pm_checkpoint | pm_projectname |
| pm_product | pm_risk | pm_productname |
| pm_product | pm_dependency | pm_productname |
| pm_requirement | pm_risk | pm_requirementid |
| pm_requirement | pm_dependency | pm_requirementid |
| pm_epic | pm_userstory | pm_epicid |
| pm_release | pm_releaseitem | pm_release |
| pm_userstory | pm_releaseitem | pm_userstory |
| pm_demand | pm_requirement | pm_converted_to |

---

## Current DEV Seed Data

| Table | Records |
|---|---|
| pm_resource | 10 |
| pm_capability | 6 |
| pm_product | 6 |
| pm_capabilityproduct | 9 |
| pm_requirement | 11 |
| pm_project | 6 |
| pm_control | 4 |
| pm_epic | 7 |
| pm_userstory | 16 |
| pm_risk | 6 |
| pm_dependency | 6 |
| pm_config | ~120 entries (22 types) |
| pm_demand | 5 |
| pm_release | 5 |
| pm_releaseitem | 14 |
| pm_assignment | 15 |
| pm_user | 9 |
| pm_checkpoint | 24 |
| **Total** | **~330 records** |
