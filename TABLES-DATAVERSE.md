# Dataverse Table Specifications — Project Management Tool

Created from `src/App.tsx` MODELS definition. Use these to create tables when deploying to Power Apps Dataverse.

---

## 1. pm_resource (Resource)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Resource ID | pm_resourceid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (150) | Yes | |
| Role | pm_role | Single Line of Text (100) | Yes | |
| Department | pm_department | Choice | Yes | IT, Business |
| Team | pm_team | Choice | No | Alpha, Beta, Gamma, Delta, Platform, Business |
| Email | pm_email | Email (100) | No | |
| Joined Date | pm_joineddate | Date Only | Yes | |
| Leave Date | pm_leavedate | Date Only | No | |
| Cost | pm_cost | Currency / Decimal | No | Monthly cost |
| Status | pm_status | Choice | Yes | Active, Inactive, On Leave |

---

## 2. pm_capability (Capability)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Capability ID | pm_capabilityid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Description | pm_description | Multiple Lines of Text (2000) | No | |
| Type | pm_capabilitytype | Lookup → pm_config | No | Filtered: pm_type = 'capability_type' |
| Cost | pm_cost | Currency / Decimal | No | Monthly operating cost |

---

## 3. pm_product (Product)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Product ID | pm_productid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Journey Name | pm_journeyname | Single Line of Text (200) | No | |
| Short Name | pm_shortname | Single Line of Text (50) | No | |
| Value Stream | pm_valuestream | Lookup → pm_config | No | Filtered: pm_type = 'value_stream' |
| Governance Status | pm_governancestatus | Choice | No | Approved, Pending, Rejected, N/A |
| Contact | pm_contact | Single Line of Text (150) | No | |

> **Note:** Date fields removed. Product timeline is derived from linked projects.

---

## 4. pm_capabilityproduct (Capability-Product Link — N:N Manual)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Link ID | pm_capabilityproductid | Primary Key (GUID) | Auto | |
| Capability | pm_capabilityid | Lookup → pm_capability | Yes | |
| Product | pm_productname | Lookup → pm_product | Yes | |

---

## 5. pm_requirement (Requirement)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Requirement ID | pm_requirementid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Capability | pm_capabilityid | Lookup → pm_capability | No | |
| Project | pm_projectname | Lookup → pm_project | No | Product derived from project |
| Status | pm_status | Choice | Yes | New, Prioritized, Linked |
| PSC Approval Required | pm_pscapprovalrequired | Choice | Yes | Yes, No |
| PSC Approval Status | pm_pscapprovalstatus | Choice | No | Pending, Approved, Rejected, N/A |

> **Note:** `pm_productname` removed — product is derived from the linked project via `pm_projectname` → `pm_project.pm_productname`.

---

## 6. pm_project (Project)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Project ID | pm_projectid | Primary Key (GUID) | Auto | |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Product | pm_productname | Lookup → pm_product | No | |
| Start Date | pm_startdate | Date Only | No | |
| Target Delivery Date | pm_targetdeliverydate | Date Only | No | |
| Status | pm_status | Choice | Yes | Onboarding, Development Phase 1, Development Phase 2, Review, Live |
| Est. Effort (days) | pm_estimateeffort | Whole Number | No | |
| Overall Completion (%) | pm_overallcompletion | Whole Number (0-100) | No | |
| Enhancement Type | pm_enhancementtype | Choice | No | New Integration, BAU Enhancement |
| Priority | pm_priority | Choice | No | Low, Medium, High, Critical |
| Scope | pm_scope | Multiple Lines of Text (4000) | No | |
| Year / Quarter | pm_yearquarter | Single Line of Text (20) | No | e.g., 2025/Q3 |

---

## 7. pm_control (Control)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Control ID | pm_controlid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Project | pm_projectname | Lookup → pm_project | No | |

---

## 8. pm_epic (Epic)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Epic ID | pm_epicid | Primary Key (GUID) | Auto | |
| Title | pm_title | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Project | pm_projectname | Lookup → pm_project | No | |
| Jira Link | pm_jiralink | Single Line of Text (500) | No | URL format |
| Effort (days) | pm_effort | Whole Number | No | |
| Release Date | pm_releasedate | Date Only | No | |
| Start Date | pm_startdate | Date Only | No | |
| Completed Date | pm_completeddate | Date Only | No | |
| RAG Status | pm_ragstatus | Choice | No | G, A, R (Green, Amber, Red) |

> **Note:** `pm_developers` removed. Developer assignments are now in `pm_assignment` table.

---

## 9. pm_userstory (User Story)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| User Story ID | pm_userstoryid | Primary Key (GUID) | Auto | |
| Detail | pm_detail | Multiple Lines of Text (4000) | Yes | |
| Epic | pm_epicid | Lookup → pm_epic | No | |
| Acceptance Criteria | pm_acceptancecriteria | Multiple Lines of Text (4000) | No | |

---

## 10. pm_risk (Risk)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Risk ID | pm_riskid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Project | pm_projectname | Lookup → pm_project | No | |

---

## 11. pm_dependency (Dependency)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Dependency ID | pm_dependencyid | Primary Key (GUID) | Auto | |
| Summary | pm_summary | Single Line of Text (300) | Yes | |
| Detail | pm_detail | Multiple Lines of Text (4000) | No | |
| Risk | pm_riskid | Lookup → pm_risk | No | |

---

## 12. pm_config (Configuration)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Config ID | pm_configid | Primary Key (GUID) | Auto | |
| Type | pm_type | Choice | Yes | value_stream, team, department, enhancement_type, capability_type |
| Name | pm_name | Single Line of Text (200) | Yes | |
| Description | pm_description | Single Line of Text (500) | No | |

> **Purpose:** Central lookup table for all configurable values. Referenced by `pm_product.pm_valuestream`, `pm_capability.pm_capabilitytype`, and optionally `pm_resource.pm_team/pm_department`, `pm_project.pm_enhancementtype`.

---

## 13. pm_release (Release)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Release ID | pm_releaseid | Primary Key (GUID) | Auto | |
| Release Name | pm_releasename | Single Line of Text (200) | Yes | |
| Status | pm_status | Choice | Yes | Draft → Open → In Review → Released |
| Release Date | pm_releasedate | Date Only | No | Target release date |
| Cutoff Date | pm_cutoffdate | Date Only | No | Registration cutoff |
| Description | pm_description | Multiple Lines of Text (2000) | No | Release notes |

> **Workflow:** Draft → Open (registration) → In Review (PO signoff) → Released. Manual advance by Release Manager. Can stay Open if delayed.

---

## 14. pm_releaseitem (Release Item)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Release Item ID | pm_releaseitemid | Primary Key (GUID) | Auto | |
| Release | pm_release | Lookup → pm_release | Yes | |
| User Story | pm_userstory | Lookup → pm_userstory | Yes | Can be in multiple releases |
| Signoff Status | pm_signoff_status | Choice | No | Pending, Approved, Rejected |
| Signoff Note | pm_signoff_note | Single Line of Text (500) | No | |
| Signoff By | pm_signoff_by | Single Line of Text (100) | No | |
| Signoff Date | pm_signoff_date | Date Only | No | |
| Registered By | pm_registered_by | Single Line of Text (100) | No | Developer name |
| Registered Date | pm_registered_date | Date Only | No | |

---

## 15. pm_assignment (Assignment)

| Display Name | Schema Name | Type | Required | Choices / Notes |
|---|---|---|---|---|
| Assignment ID | pm_assignmentid | Primary Key (GUID) | Auto | |
| Resource | pm_resource | Lookup → pm_resource | Yes | Developer assigned |
| Epic | pm_epic | Lookup → pm_epic | Yes | Epic they work on |
| Allocation % | pm_allocationpct | Whole Number (0-100) | No | Capacity percentage |
| Start Date | pm_startdate | Date Only | No | |
| End Date | pm_enddate | Date Only | No | Empty = ongoing |

> **Purpose:** Proper relational join replacing the old `pm_developers` comma-separated text field. Enables capacity tracking per resource and querying "which epics is Bob working on?"

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

## Current DEV Seed Data

| Table | Records |
|---|---|
| pm_resource | 10 resources |
| pm_capability | 6 capabilities (with types + costs) |
| pm_product | 6 products (with value streams) |
| pm_capabilityproduct | 9 linking records |
| pm_requirement | 8 requirements |
| pm_project | 6 projects (5 pipeline stages) |
| pm_control | 4 controls |
| pm_epic | 6 epics |
| pm_userstory | 8 stories |
| pm_risk | 6 risks |
| pm_dependency | 6 dependencies |
| pm_config | 19 entries (3 value streams, 6 teams, 2 departments, 2 enhancement types, 6 capability types) |
| pm_release | 3 releases |
| pm_releaseitem | 6 release items |
| pm_assignment | 11 assignments |
| **Total** | **~195 records** |
