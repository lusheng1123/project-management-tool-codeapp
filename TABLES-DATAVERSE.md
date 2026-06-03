# Dataverse Table Specifications — Project Management Tool

Created from `src/App.tsx` MODELS definition. Use these to create tables when deploying to Power Apps Dataverse.

> **Note:** Fields previously using hardcoded CHOICE have been converted to TEXT. Values are now maintained in `pm_config` (Configuration table). This makes all dropdown values configurable without code changes.

---

## 1. pm_resource (Resource)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Resource ID | pm_resourceid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (150) | Yes | |
| Role | pm_role | Single Line of Text (100) | Yes | |
| Department | pm_department | Single Line of Text (100) | No | `pm_config` type=`department` |
| Team | pm_team | Single Line of Text (100) | No | `pm_config` type=`team` |
| Email | pm_email | Email (100) | No | |
| Joined Date | pm_joineddate | Date Only | Yes | |
| Leave Date | pm_leavedate | Date Only | No | |
| Cost | pm_cost | Currency / Decimal | No | Monthly cost |
| Status | pm_status | Choice | Yes | Active, Inactive, On Leave *(hardcoded — lifecycle)* |

---

## 2. pm_capability (Capability)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Capability ID | pm_capabilityid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Description | pm_description | Multiple Lines of Text (2000) | No | |
| Type | pm_capabilitytype | Lookup → pm_config | No | `pm_config` type=`capability_type` |
| Cost | pm_cost | Currency / Decimal | No | Monthly operating cost |

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

## 4. pm_capabilityproduct (Capability-Product Link — N:N Manual)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Link ID | pm_capabilityproductid | Primary Key (GUID) | Auto | |
| Capability | pm_capabilityid | Lookup → pm_capability | Yes | |
| Product | pm_productname | Lookup → pm_product | Yes | |

---

## 5. pm_requirement (Requirement)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Requirement ID | pm_requirementid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Capability | pm_capabilityid | Lookup → pm_capability | No | |
| Project | pm_projectname | Lookup → pm_project | No | Product derived from project |
| Status | pm_status | Single Line of Text (100) | No | `pm_config` type=`requirement_status` |
| PSC Approval Required | pm_pscapprovalrequired | Choice | Yes | Yes, No *(hardcoded — boolean)* |
| PSC Approval Status | pm_pscapprovalstatus | Single Line of Text (100) | No | `pm_config` type=`psc_approval_status` |

> **Note:** `pm_productname` removed — product is derived from the linked project via `pm_projectname` → `pm_project.pm_productname`.

---

## 6. pm_project (Project)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Project ID | pm_projectid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Product | pm_productname | Lookup → pm_product | No | |
| Start Date | pm_startdate | Date Only | No | |
| Target Delivery Date | pm_targetdeliverydate | Date Only | No | |
| Status | pm_status | Choice | Yes | Onboarding, Development Phase 1, Development Phase 2, Review, Live *(hardcoded — pipeline)* |
| Est. Effort (days) | pm_estimateeffort | Whole Number | No | |
| Overall Completion (%) | pm_overallcompletion | Whole Number (0-100) | No | |
| Enhancement Type | pm_enhancementtype | Single Line of Text (100) | No | `pm_config` type=`enhancement_type` |
| Priority | pm_priority | Single Line of Text (100) | No | `pm_config` type=`priority` |
| Scope | pm_scope | Multiple Lines of Text (4000) | No | |
| Year / Quarter | pm_yearquarter | Single Line of Text (20) | No | |

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
| Jira Link | pm_jiralink | Single Line of Text (500) | No | |
| Effort (days) | pm_effort | Whole Number | No | |
| Release Date | pm_releasedate | Date Only | No | |
| Start Date | pm_startdate | Date Only | No | |
| Completed Date | pm_completeddate | Date Only | No | |
| RAG Status | pm_ragstatus | Single Line of Text (10) | No | `pm_config` type=`rag_status` (G, A, R) |

> **Note:** Developer assignments are now in `pm_assignment` table.

---

## 9. pm_userstory (User Story)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| User Story ID | pm_userstoryid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Epic | pm_epicid | Lookup → pm_epic | No | |
| Acceptance Criteria | pm_acceptancecriteria | Multiple Lines of Text (4000) | No | |

---

## 10. pm_risk (Risk)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Risk ID | pm_riskid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Project | pm_projectname | Lookup → pm_project | No | |

---

## 11. pm_dependency (Dependency)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Dependency ID | pm_dependencyid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Risk | pm_riskid | Lookup → pm_risk | No | |

---

## 12. pm_config (Configuration)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Config ID | pm_configid | Primary Key (GUID) | Auto | |
| Type | pm_type | Choice | Yes | value_stream, team, department, enhancement_type, capability_type, governance_status, priority, rag_status, requirement_status, psc_approval_status, signoff_status |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Description | pm_description | Single Line of Text (500) | No | |

> **Purpose:** Central lookup table for all configurable dropdown values across the app. Each type stores its valid values as rows.

| Config Type | Used By | Example Values |
|---|---|---|
| `value_stream` | pm_product.pm_valuestream | Customer Experience, Operational Efficiency, Risk & Compliance |
| `team` | pm_resource.pm_team | Alpha, Beta, Gamma, Delta, Platform, Business |
| `department` | pm_resource.pm_department | IT, Business |
| `enhancement_type` | pm_project.pm_enhancementtype | New Integration, BAU Enhancement |
| `capability_type` | pm_capability.pm_capabilitytype | Functional, Technical, Integration, Infrastructure, Security, Data & Analytics |
| `governance_status` | pm_product.pm_governancestatus | Approved, Pending, Rejected, N/A |
| `priority` | pm_project.pm_priority | Low, Medium, High, Critical |
| `rag_status` | pm_epic.pm_ragstatus | G, A, R |
| `requirement_status` | pm_requirement.pm_status | New, Prioritized, Linked |
| `psc_approval_status` | pm_requirement.pm_pscapprovalstatus | Pending, Approved, Rejected, N/A |
| `signoff_status` | pm_releaseitem.pm_signoff_status | Pending, Approved, Rejected |

---

## 13. pm_release (Release)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Release ID | pm_releaseid | Primary Key (GUID) | Auto | |
| Release Name | pm_releasename | Single Line of Text (200) | Yes | |
| Status | pm_status | Choice | Yes | Draft → Open → In Review → Released *(hardcoded — workflow)* |
| Release Date | pm_releasedate | Date Only | No | |
| Cutoff Date | pm_cutoffdate | Date Only | No | |
| Description | pm_description | Multiple Lines of Text (2000) | No | |

---

## 14. pm_releaseitem (Release Item)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Release Item ID | pm_releaseitemid | Primary Key (GUID) | Auto | |
| Release | pm_release | Lookup → pm_release | Yes | |
| User Story | pm_userstory | Lookup → pm_userstory | Yes | Can be in multiple releases |
| Signoff Status | pm_signoff_status | Single Line of Text (100) | No | `pm_config` type=`signoff_status` |
| Signoff Note | pm_signoff_note | Single Line of Text (500) | No | |
| Signoff By | pm_signoff_by | Single Line of Text (100) | No | |
| Signoff Date | pm_signoff_date | Date Only | No | |
| Registered By | pm_registered_by | Single Line of Text (100) | No | |
| Registered Date | pm_registered_date | Date Only | No | |

---

## 15. pm_assignment (Assignment)

| Display Name | Schema Name | Type | Required | Config Source |
|---|---|---|---|---|
| Assignment ID | pm_assignmentid | Primary Key (GUID) | Auto | |
| Resource | pm_resource | Lookup → pm_resource | Yes | |
| Epic | pm_epic | Lookup → pm_epic | Yes | |
| Allocation % | pm_allocationpct | Whole Number (0-100) | No | |
| Start Date | pm_startdate | Date Only | No | |
| End Date | pm_enddate | Date Only | No | Empty = ongoing |

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
| pm_project | pm_risk | pm_projectname |
| pm_epic | pm_userstory | pm_epicid |
| pm_risk | pm_dependency | pm_riskid |
| pm_release | pm_releaseitem | pm_release |
| pm_userstory | pm_releaseitem | pm_userstory |

---

## Fields Changed: CHOICE → TEXT

| Table | Field | New Config Type |
|---|---|---|
| pm_resource | pm_department | department |
| pm_resource | pm_team | team |
| pm_product | pm_governancestatus | governance_status |
| pm_project | pm_enhancementtype | enhancement_type |
| pm_project | pm_priority | priority |
| pm_epic | pm_ragstatus | rag_status |
| pm_requirement | pm_status | requirement_status |
| pm_requirement | pm_pscapprovalstatus | psc_approval_status |
| pm_releaseitem | pm_signoff_status | signoff_status |

> Add/remove values in the Config tab — no code changes needed.

---

## Fields Kept as CHOICE (Hardcoded — Workflow Logic)

| Table | Field | Values |
|---|---|---|
| pm_resource | pm_status | Active, Inactive, On Leave |
| pm_project | pm_status | Onboarding, Development Phase 1, Development Phase 2, Review, Live |
| pm_requirement | pm_pscapprovalrequired | Yes, No |
| pm_release | pm_status | Draft, Open, In Review, Released |
| pm_config | pm_type | (all config categories) |

---

## Current DEV Seed Data

| Table | Records |
|---|---|
| pm_resource | 10 resources |
| pm_capability | 6 capabilities |
| pm_product | 6 products |
| pm_capabilityproduct | 9 links |
| pm_requirement | 8 requirements |
| pm_project | 6 projects |
| pm_control | 4 controls |
| pm_epic | 6 epics |
| pm_userstory | 8 stories |
| pm_risk | 6 risks |
| pm_dependency | 6 dependencies |
| pm_config | 41 entries (11 types) |
| pm_release | 3 releases |
| pm_releaseitem | 6 items |
| pm_assignment | 11 assignments |
| **Total** | **~215 records** |
