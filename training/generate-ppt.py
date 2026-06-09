#!/usr/bin/env python3
"""Generate Training PPT — roles + per-page functionality walkthroughs"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR_TYPE
import os

SLIDES = [
    # ── 1: Title ──
    {
        "title": "Project Management Tool",
        "subtitle": "End-to-End Training Guide",
        "body": "Value Stream Driven | 18 Tabs | 8 Roles\nConfigurable Workflows | Role-Based Access\n\n📥 Demand → 📋 Requirement → 📁 Project → ⚡ Epic → 📝 Story → 🚀 Release",
        "img": None,
        "section": "title"
    },
    # ── 2: Overview ──
    {
        "title": "What is the Project Management Tool?",
        "body": "A comprehensive platform for managing the full delivery lifecycle "
                "from demand intake through to production release.\n\n"
                "📥 Demand Intake — anyone can submit a demand against an application\n"
                "🔄 Configurable Workflow — each Value Stream defines its own approval process\n"
                "📁 Project Management — pipeline tracking with governance checkpoints\n"
                "⚡ Agile Delivery — Epics & User Stories with story points\n"
                "🚀 Release Management — sprint tracking & signoff workflow\n"
                "📊 Portfolio View — holistic view across all value streams\n"
                "👤 Role-Based Access — 8 roles with tailored dashboards\n"
                "📋 18 Tabs — each role sees only their relevant pages",
        "img": None,
        "section": "overview"
    },
    # ── 3: How to Read ──
    {
        "title": "How to Read This Guide",
        "body": "This training guide is organized by ROLE — find your role and "
                "review your responsibilities, tabs, and actionable items.\n\n"
                "👤 Who You Are → What You See → What You Can Do\n\n"
                "Slides 4-5: Role matrix & dashboard actions\n"
                "Slides 6-13: Individual role deep-dives\n"
                "Slides 14+: Feature & page walkthroughs\n\n"
                "💡 TIP: Use the role selector in the app header to switch between "
                "roles and see the tool from different perspectives.\n"
                "  (Header dropdown → selected role persists in localStorage)",
        "img": None,
        "section": "guide"
    },
    # ── 4: Role Access Matrix ──
    {
        "title": "Role Access Matrix",
        "body": "Tab/Feature            Adm VSPMO VSO  PO   DL   BA   RM  ITSO\n"
                "────────────────────────────────────────────────────\n"
                "📊 Dashboard           ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📈 Portfolio           ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📥 Demand              ✅   ✅   ✅  ✅   ✅   ✅   —    —\n"
                "🎯 Capabilities        ✅   ✅   ✅   —   ✅   ✅   —    —\n"
                "📦 Products            ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📁 Projects            ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📋 Requirements        ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "⚡ Epics                ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📝 Stories             ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "⚠️ Risks                ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "🔗 Dependencies        ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "🚀 Releases            ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "📋 Sprint Board        ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "✅ Governance          ✅   ✅   ✅  ✅   ✅   ✅  ✅   ✅\n"
                "👥 Resources           ✅   ✅   ✅   —   ✅   ✅   —    —\n"
                "👤 Users               ✅    —    —   —   ✅    —   —    —\n"
                "🧪 Test                ✅    —    —   —    —    —   —    —\n"
                "⚙️ Config              ✅    —    —   —    —    —   —    —\n"
                "────────────────────────────────────────────────────\n"
                "Tab Count               18   15   14  13   16   14  12   12\n\n"
                "🔒 Lock/Unlock Project  ✅   ✅   ✅   —    —    —   —    —\n"
                "📦 Backlog (Unlink)     ✅   ✅   ✅   —    —    —   —    —",
        "img": None,
        "section": "matrix"
    },
    # ── 5: Dashboard Actions ──
    {
        "title": "Dashboard Action Items by Role",
        "body": "What each role sees on their Dashboard Action Items panel:\n\n"
                "👑 Admin: All pending demands (Triage/Assess/Approve/Convert)\n"
                "  + Pending release signoffs + project completion stats\n\n"
                "🏢 Value Stream PMO: Demands to Approve + Pending Signoffs\n"
                "  (oversees all value streams, unfiltered views)\n\n"
                "🌊 Value Stream Owner: Demands to Approve + Pending Signoffs\n"
                "  (filtered to their assigned value streams)\n\n"
                "📦 Product Owner: Demands to Approve + Pending Signoffs\n\n"
                "🚀 Delivery Lead: Demands to Triage/Assess/Convert\n"
                "  + Pending Signoffs\n\n"
                "📊 Business Analyst: Submitted Demands (view only)\n\n"
                "🔖 Release Manager: Pending Signoffs only\n\n"
                "🔒 ITSO: Assessed + PSC Review demands (security review)\n\n"
                "💡 Each card auto-navigates to the relevant tab on click",
        "img": None,
        "section": "actions"
    },
    # ── 6: Admin ──
    {
        "title": "👑 Admin — System Administrator",
        "subtitle": "Full access — all 18 tabs, all actions",
        "body": "RESPONSIBILITIES:\n"
                "• Configure the entire system via ⚙️ Config tab\n"
                "• Manage users and their roles (👤 Users tab)\n"
                "• Approve demands, manage releases, oversee governance\n"
                "• 🔒 Can lock/unlock projects (prevents new requirements + edits)\n"
                "• 📦 Can move requirements back to Backlog\n\n"
                "TABS: All 18 — Dashboard, Portfolio, Demand, Capabilities,\n"
                "  Products, Projects, Requirements, Epics, Stories, Risks,\n"
                "  Dependencies, Releases, Sprints, Governance, Resources,\n"
                "  Users, Test, Config\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Full workflow — Triage, Assess, Approve, Convert, Reject\n"
                "• 🚀 Release: Full lifecycle — Create, Open, Review, Complete, Signoff\n"
                "• ✅ Governance: Full edit (status, owner, dates)\n"
                "• 👤 Users: Create/Edit/Delete users, assign roles\n"
                "• ⚙️ Config: Add/edit/remove configuration entries\n\n"
                "DASHBOARD: All pending items across every entity",
        "img": None,
        "section": "role"
    },
    # ── 7: Value Stream PMO ──
    {
        "title": "🏢 Value Stream PMO",
        "subtitle": "Cross-VS oversight — like Admin without Config/Users",
        "body": "RESPONSIBILITIES:\n"
                "• Cross-VS oversight — sees all value streams unfiltered\n"
                "• Approve demands across any value stream\n"
                "• Manage resources and review governance\n"
                "• 🔒 Can lock/unlock projects\n"
                "• 📦 Can move requirements back to Backlog\n\n"
                "TABS (15): Dashboard, Portfolio, Demand, Capabilities, Products,\n"
                "  Projects, Requirements, Epics, Stories, Risks, Dependencies,\n"
                "  Releases, Sprints, Governance, Resources\n\n"
                "KEY DIFFERENCES FROM ADMIN:\n"
                "• ❌ Cannot access Config tab\n"
                "• ❌ Cannot manage users\n"
                "• ❌ No Test tab access\n"
                "• ✅ Everything else same as Admin\n\n"
                "DASHBOARD: Demands to Approve + Pending Signoffs across all VS",
        "img": None,
        "section": "role"
    },
    # ── 8: Value Stream Owner ──
    {
        "title": "🌊 Value Stream Owner (VSO)",
        "subtitle": "Owns one or more value streams — approves demands within their VS",
        "body": "RESPONSIBILITIES:\n"
                "• Oversee demands across their assigned value streams\n"
                "• Approve demands that have been assessed (Assessed → Approved)\n"
                "• Review Portfolio and Sprint views filtered to their VS\n"
                "• Monitor risks, dependencies, and governance for their VS products\n"
                "• 🔒 Can lock/unlock projects within their VS\n"
                "• 📦 Can move requirements back to Backlog within their VS\n\n"
                "TABS (14): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks,\n"
                "  Dependencies, Releases, Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Approve + Reject demands\n"
                "• 🚀 Release: Signoff pending stories\n"
                "• 📈 Portfolio: Sees only their assigned value stream products\n"
                "• 📋 Sprints: Sees only their assigned VS products\n"
                "• ✅ Governance: Full edit\n\n"
                "CONFIG: Assign value streams via 👤 Users tab\n"
                "  (pm_valuestream field — comma-separated VS config IDs)",
        "img": None,
        "section": "role"
    },
    # ── 9: Product Owner ──
    {
        "title": "📦 Product Owner (PO)",
        "subtitle": "Owns specific products — approves demands, signs off releases",
        "body": "RESPONSIBILITIES:\n"
                "• Product-level demand approval (Assessed → Approved)\n"
                "• Sign off on release items (✍️ Signoff button)\n"
                "• Review epics and stories for their products\n"
                "• ❌ Cannot lock/unlock projects\n"
                "• ❌ Cannot move requirements to Backlog\n\n"
                "TABS (13): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Dependencies, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Approve + Reject (only these two workflow actions)\n"
                "• 🚀 Release: Signoff pending stories (✍️ Signoff button)\n"
                "• ✅ Governance: Can edit items\n"
                "• 📦 Products: View, edit, manage product details\n\n"
                "NOTE: Cannot create/edit demands, cannot triage or assess\n"
                "DASHBOARD: Demands to Approve + Pending Release Signoffs",
        "img": None,
        "section": "role"
    },
    # ── 10: Delivery Lead ──
    {
        "title": "🚀 Delivery Lead (DL)",
        "subtitle": "Manages delivery — projects, epics, resources, releases",
        "body": "RESPONSIBILITIES:\n"
                "• Own demand workflow: Triage → Assess → Convert\n"
                "• Manage projects, epics, stories, resources\n"
                "• Register stories into releases\n"
                "• Review governance checklists\n"
                "• ❌ Cannot lock/unlock projects\n"
                "• ❌ Cannot move requirements to Backlog\n\n"
                "TABS (16): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks,\n"
                "  Dependencies, Releases, Sprints, Governance, Resources, Users\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Triage, Assess, Convert, Reject (+ Raise Demand)\n"
                "• 🚀 Release: Register stories (+ Create/Edit/Delete releases)\n"
                "• ✅ Governance: Full edit all items\n"
                "• 👥 Resources: Full CRUD\n"
                "• 👤 Users: Can manage users and their roles\n\n"
                "DASHBOARD: Demands to Triage/Assess/Convert + Pending Signoffs",
        "img": None,
        "section": "role"
    },
    # ── 11: Business Analyst ──
    {
        "title": "📊 Business Analyst (BA)",
        "subtitle": "Raises demands, analyzes requirements — read-only on most views",
        "body": "RESPONSIBILITIES:\n"
                "• Raise new demands (+ Raise Demand button)\n"
                "• View demand status and track progress\n"
                "• Review requirements and products\n"
                "• ❌ Cannot edit existing items (except own demands)\n"
                "• ❌ Cannot lock/unlock projects\n"
                "• ❌ Cannot move requirements to Backlog\n\n"
                "TABS (14): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks,\n"
                "  Dependencies, Releases, Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Can raise new demands (Submit)\n"
                "• ❌ Cannot edit existing demands / Triage/Assess/Approve/Reject\n"
                "• ✅ Governance: READ-ONLY (inputs disabled, Generate hidden)\n"
                "• All other views: READ-ONLY\n\n"
                "DASHBOARD: Submitted demands only\n"
                "SPRINT BOARD: Only shows products linked to their demands",
        "img": None,
        "section": "role"
    },
    # ── 12: Release Manager ──
    {
        "title": "🔖 Release Manager (RM)",
        "subtitle": "Manages release lifecycle and signoffs",
        "body": "RESPONSIBILITIES:\n"
                "• Full release lifecycle: Create → Open → Review → Complete\n"
                "• Sign off on release items\n"
                "• Register stories into releases\n"
                "• ❌ No access to 📥 Demand tab\n"
                "• ❌ Cannot lock/unlock projects\n"
                "• ❌ Cannot move requirements to Backlog\n\n"
                "TABS (12): Dashboard, Portfolio, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Dependencies, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 🚀 Release: ALL actions — Create, Open, Review, Complete,\n"
                "  Signoff, Register\n"
                "• ✅ Governance: Can edit items\n"
                "• All other tabs: View-only\n\n"
                "DASHBOARD: Pending signoffs only",
        "img": None,
        "section": "role"
    },
    # ── 13: ITSO ──
    {
        "title": "🔒 ITSO — IT Security Officer",
        "subtitle": "Reviews demands and risks from a security perspective",
        "body": "RESPONSIBILITIES:\n"
                "• Security review of demands in Assessed or PSC Review status\n"
                "• Monitor risks and dependencies across all products\n"
                "• Review requirements for security compliance\n"
                "• ❌ Cannot create/edit/change status on demands\n"
                "• ❌ Cannot lock/unlock projects\n\n"
                "TABS (12): Dashboard, Portfolio, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Dependencies, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: READ-ONLY (cannot create/edit/change status)\n"
                "• ⚠️ Risks & 🔗 Dependencies: View-only\n"
                "• ✅ Governance: READ-ONLY\n"
                "• ❌ No Demand tab access (uses Dashboard for security review)\n\n"
                "DASHBOARD: Demands in Assessed + PSC Review status\n"
                "  (for security review purposes)",
        "img": None,
        "section": "role"
    },
    # ── 14: Dashboard ──
    {
        "title": "📊 Dashboard",
        "subtitle": "Role-filtered action items and key metrics",
        "body": "PURPOSE: Central landing page showing each user's actionable items\n"
                "based on their role.\n\n"
                "COMPONENTS:\n"
                "• Action Items panel — role-filtered demands requiring attention\n"
                "  (e.g., Admin sees all pending; VSO sees only their VS demands)\n"
                "• Product Health — status of all products\n"
                "• Releases Snapshot — upcoming and in-review releases\n"
                "• Clickable cards — clicking navigates to the relevant tab\n\n"
                "ROLE FILTERING:\n"
                "• Each role sees different action items (see Slide 5)\n"
                "• Items auto-navigate to the relevant view for deeper action\n\n"
                "ACCESS: All 8 roles",
        "img": None,
        "section": "feature"
    },
    # ── 15: Portfolio ──
    {
        "title": "📈 Portfolio View",
        "subtitle": "Value Stream grouped product cards with holistic metrics",
        "body": "PURPOSE: Executive-level view of products grouped by Value Stream.\n\n"
                "PER-PRODUCT CARD:\n"
                "• Demand count with status breakdown (Submitted/Triaging/etc.)\n"
                "• Project count (active vs live)\n"
                "• Story Points: done/total with progress bar\n"
                "• Teams involved (derived from assignment chain)\n"
                "• Active sprints count\n"
                "• Risk & dependency counts\n\n"
                "VALUE STREAM HEADER:\n"
                "• Flow step count badge (e.g. '3 steps')\n"
                "• Product count within that VS\n\n"
                "ROLE FILTERING:\n"
                "• VSO: only their assigned value stream products\n"
                "• All others: full view\n\n"
                "Click any card → navigates to Products tab",
        "img": None,
        "section": "feature"
    },
    # ── 16: Demand Intake ──
    {
        "title": "📥 Demand Intake",
        "subtitle": "Configurable workflow per Value Stream",
        "body": "PURPOSE: Submit & manage demands through configurable approval flows.\n\n"
                "HOW TO RAISE:\n"
                "1. Click + Raise Demand\n"
                "2. Fill Title, Detail, Type, Priority\n"
                "3. Select Value Stream (determines workflow steps)\n"
                "4. Select Product\n"
                "5. Save → status set to first flow step\n\n"
                "WORKFLOW BY VALUE STREAM:\n"
                "• Customer Experience: Submitted → Triaging (2 steps)\n"
                "• Operational Efficiency: Submitted → Triaging → Assessed (3 steps)\n"
                "• Risk & Compliance: Submitted → Triaging → Assessed → PSC (4 steps)\n\n"
                "STATUS CONTROL:\n"
                "• Intermediate steps: popup shows only flow progression options\n"
                "• Final step: popup shows ✅ Approve, 📥 Backlog, ❌ Reject\n\n"
                "⚙️ CONFIG: Edit demand_flow entries in Config tab",
        "img": None,
        "section": "feature"
    },
    # ── 17: Demand Workflow Diagram ──
    {
        "title": "📥 Demand Workflow Diagram",
        "subtitle": "Flow steps → terminal actions → convert",
        "body": "",
        "img": None,
        "section": "diagram"
    },
    # ── 18: Capabilities ──
    {
        "title": "🎯 Capabilities",
        "subtitle": "Business capability catalog",
        "body": "PURPOSE: Define and manage business capabilities that link\n"
                "products, demands, and requirements together.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete capabilities\n"
                "• Each capability has: Name, Description, Type, Cost\n"
                "• Capability Type sourced from config (capability_type)\n"
                "• Capability-Product links via linking table\n"
                "   (one capability can serve multiple products)\n\n"
                "USAGE IN WORKFLOW:\n"
                "• Demands reference a capability\n"
                "• Requirements reference a capability\n"
                "• Capabilities bridge business needs to product delivery\n\n"
                "ACCESS: Admin, VSPMO, VSO, DL, BA (5 roles)",
        "img": None,
        "section": "feature"
    },
    # ── 18: Products ──
    {
        "title": "📦 Products",
        "subtitle": "Application catalog linked to Value Streams",
        "body": "PURPOSE: Manage the product/application portfolio.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete products\n"
                "• Each product has: Name, Short Name, Journey Name\n"
                "• Linked to a Value Stream (drives governance template)\n"
                "• Governance Status and Contact fields\n"
                "• Capability-Product links (assign capabilities to products)\n\n"
                "RELATIONSHIPS:\n"
                "• Products are the target of Demands (pm_product)\n"
                "• Projects are linked to products (pm_productname)\n"
                "• Governance templates auto-detect from product's VS\n\n"
                "ACCESS: All 8 roles (editing limited by role permissions)",
        "img": None,
        "section": "feature"
    },
    # ── 19: Projects ──
    {
        "title": "📁 Projects",
        "subtitle": "Pipeline tracking with lock/unlock and governance",
        "body": "PURPOSE: Manage delivery projects with pipeline status and scope control.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete projects\n"
                "• Pipeline Board view (PipelineBoard component)\n"
                "• Each project has: Name, Product, Status, Completion %,\n"
                "  Enhancement Type, Priority, Scope, Year/Quarter\n"
                "• Gov Template override (auto-detect from VS or explicit)\n"
                "• 🔒 Lock/Unlock button (Admin/VSPMO/VSO only)\n"
                "   — Locked: no new requirements, no edits to existing ones\n"
                "   — Unlinked requirements can still be moved out (descope)\n\n"
                "EXPAND ROW: Shows linked requirements with status badges\n\n"
                "ACCESS: All 8 roles (lock/unlock restricted)",
        "img": None,
        "section": "feature"
    },
    # ── 20: Requirements ──
    {
        "title": "📋 Requirements (Backlog)",
        "subtitle": "All/Linked/Backlog modes with priority and project linking",
        "body": "PURPOSE: Manage requirements — both unlinked (Backlog)\n"
                "and linked to projects (Requirements).\n\n"
                "SAME TABLE: pm_requirement serves double duty:\n"
                "• No pm_projectname → Backlog (status: Prioritized)\n"
                "• Has pm_projectname → Requirement (status: Linked)\n\n"
                "VIEW MODES: All | Linked | Backlog\n\n"
                "ACTIONS:\n"
                "• Link to Project — dropdown on backlog items → sets project + Linked\n"
                "  (locked projects are hidden from the dropdown)\n"
                "• 📦 Backlog/Unlink — moves requirement back to backlog\n"
                "  (Admin/VSPMO/VSO only; works even on locked projects)\n"
                "• ✏️ Edit — inline modal (blocked if project is locked)\n"
                "• Priority column for backlog ranking\n\n"
                "Expanded row shows linked epics and assignments",
        "img": None,
        "section": "feature"
    },
    # ── 21: Epics ──
    {
        "title": "⚡ Epics",
        "subtitle": "Project breakdown with effort estimation and RAG status",
        "body": "PURPOSE: Break down projects into manageable epics.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete epics\n"
                "• Each epic has: Title, Detail, Project link\n"
                "• Jira Link for external tracking\n"
                "• Estimated Effort (days)\n"
                "• Release Date, Start Date, Completed Date\n"
                "• RAG Status (G/A/R) for health tracking\n\n"
                "RELATIONSHIPS:\n"
                "• Epics belong to a project\n"
                "• User Stories belong to an epic\n"
                "• Resource Assignments target epics\n"
                "  (team membership derived from assignment→resource→team)\n\n"
                "ACCESS: All roles (except RM/ITSO cannot edit)",
        "img": None,
        "section": "feature"
    },
    # ── 22: User Stories ──
    {
        "title": "📝 User Stories",
        "subtitle": "Detailed requirements with acceptance criteria and story points",
        "body": "PURPOSE: Detailed work items within epics.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete user stories\n"
                "• Each story has: Detail, Epic link\n"
                "• Acceptance Criteria (UAC) — multi-line text\n"
                "• Story Points for estimation\n\n"
                "RELATIONSHIPS:\n"
                "• Stories link to epics (which link to projects)\n"
                "• Stories are registered into releases (via Release Items)\n"
                "• Sprint Board tracks story points per team×product\n\n"
                "USAGE IN SPRINT BOARD:\n"
                "• Completed story points = progress tracking\n"
                "• Acceptance criteria shown in sprint cards (truncated)\n\n"
                "ACCESS: All roles (edit restricted by role permissions)",
        "img": None,
        "section": "feature"
    },
    # ── 23: Risks ──
    {
        "title": "⚠️ Risks",
        "subtitle": "Track risks linked to products and requirements",
        "body": "PURPOSE: Identify and monitor project risks.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete risks\n"
                "• Each risk has: Summary, Detail\n"
                "• Linked to a Product\n"
                "• Optionally linked to a Requirement\n\n"
                "DASHBOARD INTEGRATION:\n"
                "• Risk counts shown on Portfolio product cards\n"
                "• Project rows show risk count in Related column\n\n"
                "ACCESS: All roles (edit restricted by role permissions)",
        "img": None,
        "section": "feature"
    },
    # ── 24: Dependencies ──
    {
        "title": "🔗 Dependencies",
        "subtitle": "Cross-product dependency tracking",
        "body": "PURPOSE: Track dependencies between products and requirements.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete dependencies\n"
                "• Each dependency has: Summary, Detail\n"
                "• Linked to a Product\n"
                "• Optionally linked to a Requirement\n\n"
                "DASHBOARD INTEGRATION:\n"
                "• Dependency counts shown on Portfolio product cards\n"
                "• Helps identify cross-team blockers\n\n"
                "ACCESS: All roles (edit restricted by role permissions)",
        "img": None,
        "section": "feature"
    },
    # ── 25: Releases ──
    {
        "title": "🚀 Release Management",
        "subtitle": "Epic-grouped with signoff workflow",
        "body": "PURPOSE: Manage the release lifecycle from draft to released.\n\n"
                "LIFECYCLE: Draft → Open → In Review → Released\n"
                "  (workflow buttons appear based on current status)\n\n"
                "REGISTERING STORIES:\n"
                "• Click ➕ Register on an Open release\n"
                "• Select unregistered user stories (grouped by epic)\n"
                "• Two-level expand: Release → Epics → Stories\n\n"
                "SIGNOFF WORKFLOW:\n"
                "• Individual story signoff: Pending → Approved / Rejected\n"
                "• ✍️ Signoff modal: Decision + Note\n"
                "• Signoff recorded with by/date metadata\n\n"
                "Click any row → expands epics → expands stories\n\n"
                "ACCESS: All roles (edit restricted)",
        "img": None,
        "section": "feature"
    },
    # ── 26: Sprint Board ──
    {
        "title": "📋 Sprint Board",
        "subtitle": "Team × Product matrix with SP tracking",
        "body": "PURPOSE: Visual grid showing teams vs products with sprint progress.\n\n"
                "HOW IT WORKS:\n"
                "• Teams (rows) derived from resource assignments → epics\n"
                "• Products (columns) from release items → stories → epics\n"
                "  → projects → products\n\n"
                "SPRINT CARD SHOWS:\n"
                "• Sprint name & status badge\n"
                "• Release & cutoff dates\n"
                "• Story count & signoff progress\n"
                "• Story Points: completed/total (e.g., 21/26 SP)\n"
                "• Progress bar for pending signoffs\n\n"
                "FILTERS:\n"
                "• ☑ Active only toggle (hide Released sprints)\n"
                "• VSO: sees only their VS products\n"
                "• BA: sees only products with active demands\n\n"
                "Click card → navigates to Releases tab with auto-expand",
        "img": None,
        "section": "feature"
    },
    # ── 27: Governance ──
    {
        "title": "✅ Governance Checklist",
        "subtitle": "Config-driven phases and tasks per project",
        "body": "PURPOSE: Per-project governance tracking with configurable phases.\n\n"
                "TEMPLATE SYSTEM:\n"
                "• Each project has a governance template (auto-detect or explicit)\n"
                "• Template determines phases (from project_phase config)\n"
                "• Each phase has checklist items (from project_checklist config)\n"
                "• VS-specific or default templates available\n\n"
                "EDITING:\n"
                "• Status dropdown: To Do / In Progress / Done / N/A\n"
                "• Owner, Plan Start/End, Actual Start/End — inline editable\n"
                "• Config-only items auto-create on first edit\n"
                "• 'Generate N Items' creates all missing items at once\n\n"
                "FILTERS:\n"
                "• Project dropdown + Phase dropdown + Search bar\n\n"
                "ROLE: VSO sees only their VS projects; BA sees demand-linked\n"
                "  projects; edit restricted to Admin/DL/VSO/PO/RM/VSPMO",
        "img": None,
        "section": "feature"
    },
    # ── 28: Resources ──
    {
        "title": "👥 Resources",
        "subtitle": "People management with team and department tracking",
        "body": "PURPOSE: Manage human resources / team members.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete resources\n"
                "• Each resource has: Name, Role, Department, Team\n"
                "• Email, Joined/Leave dates\n"
                "• Cost (monthly) for budgeting\n"
                "• Status (Active/Inactive/On Leave)\n\n"
                "RELATIONSHIPS:\n"
                "• Resources assigned to epics via pm_assignment\n"
                "  (allocation %, start/end dates)\n"
                "• Team derived from resource → determines Sprint Board rows\n\n"
                "ACCESS: Admin, VSPMO, DL, BA (plus Users tab for DL)",
        "img": None,
        "section": "feature"
    },
    # ── 29: Users ──
    {
        "title": "👤 Users & Roles",
        "subtitle": "User management with role assignment",
        "body": "PURPOSE: Manage who can access the system and what they can do.\n\n"
                "FEATURES:\n"
                "• Create/Edit/Delete users\n"
                "• Each user has: Username, Display Name, Email\n"
                "• Role assignment (single role per user)\n"
                "• VSO users: assign value streams via checkboxes\n"
                "  (pm_valuestream = comma-separated VS config IDs)\n"
                "• Status field (active/inactive)\n\n"
                "ROLES AVAILABLE:\n"
                "• Admin, Value Stream PMO, Value Stream Owner, Product Owner,\n"
                "  Delivery Lead, Business Analyst, Release Manager, ITSO\n\n"
                "ROLE SELECTOR:\n"
                "• Header dropdown to switch roles (DEV mode)\n"
                "• Persisted in localStorage\n"
                "• Tab visibility and edit permissions change accordingly\n\n"
                "ACCESS: Admin, DL",
        "img": None,
        "section": "feature"
    },
    # ── 30: Config Tab ──
    {
        "title": "⚙️ Configuration",
        "subtitle": "Manage all dropdown options and workflow definitions",
        "body": "PURPOSE: Central configuration for all configurable values.\n\n"
                "CONFIG TYPES (21):\n"
                "• value_stream, team, department, enhancement_type\n"
                "• capability_type, governance_status, priority\n"
                "• rag_status, requirement_status, psc_approval_status\n"
                "• signoff_status, resource_status, project_status\n"
                "• release_status, yes_no, tool, demand_type\n"
                "• demand_flow (workflow definitions)\n"
                "• user_role, project_phase, project_checklist\n\n"
                "WHAT YOU CAN DO:\n"
                "• Add new config entries (e.g., new priority level)\n"
                "• Edit existing entries\n"
                "• Delete unused entries\n"
                "• Change workflow steps (demand_flow)\n"
                "• Add/remove governance phases and checklist items\n\n"
                "💡 Changes take effect immediately — no code changes needed\n\n"
                "ACCESS: Admin only",
        "img": None,
        "section": "feature"
    },
    # ── 31: Lock & Unlink ──
    {
        "title": "🔒 Project Lock & 📦 Requirement Unlink",
        "subtitle": "Scope control — freeze and descope",
        "body": "PROJECT LOCK (🔒):\n"
                "• Toggle button on each project row in 📁 Projects\n"
                "• When locked (pm_locked = 'Yes'):\n"
                "  — No new requirements can be linked to this project\n"
                "  — Existing requirements cannot be edited\n"
                "  — Locked projects hidden from 'Link to Project' dropdowns\n"
                "• 🔒 icon shown next to locked project names everywhere\n\n"
                "REQUIREMENT UNLINK (📦 Backlog):\n"
                "• Button on each linked requirement in 📋 Requirements\n"
                "• Clears pm_projectname, sets status to 'Prioritized'\n"
                "• Item returns to Backlog pool\n"
                "• Works even on locked projects (for descoping)\n\n"
                "WHO CAN DO IT:\n"
                "• 🔒 Lock/Unlock project: Admin, Value Stream PMO, Value Stream Owner\n"
                "• 📦 Move to Backlog: Admin, Value Stream PMO, Value Stream Owner",
        "img": None,
        "section": "feature"
    },
    # ── 32: Quick Reference ──
    {
        "title": "Getting Started — Quick Reference",
        "body": "1️⃣ RAISE A DEMAND: 📥 Demand → + Raise Demand\n"
                "  → Select Value Stream (determines workflow)\n\n"
                "2️⃣ ADVANCE WORKFLOW: Click Change Status on a demand\n"
                "  → Last step (Approved) creates a Requirement\n\n"
                "3️⃣ CREATE A PROJECT: 📁 Projects → + New Project\n"
                "  → Assign a Governance Template if needed\n\n"
                "4️⃣ MANAGE EPICS & STORIES: Break down requirements\n"
                "  → Assign resources to epics (determines Sprint Board teams)\n\n"
                "5️⃣ GOVERNANCE CHECKLIST: ✅ Governance\n"
                "  → Generate Items or edit items individually\n\n"
                "6️⃣ CREATE A RELEASE: 🚀 Releases → + New Release\n"
                "  → Register stories, sign off when ready\n\n"
                "7️⃣ VIEW SPRINTS: 📋 Sprint Board for Team×Product grid\n"
                "  → Toggle 'Active only' as needed\n\n"
                "8️⃣ CHECK PORTFOLIO: 📈 Portfolio for holistic VS view\n\n"
                "9️⃣ LOCK PROJECT: 📁 Projects → 🔒 Lock button\n"
                "  → Admin/VSPMO/VSO only\n\n"
                "🔟 UNLINK REQUIREMENT: 📋 Requirements → 📦 Backlog\n"
                "  → Moves item back to backlog pool\n\n"
                "👤 SWITCH ROLE: Use role dropdown in header (DEV mode)\n"
                "🔄 RESET DATA: Click 🔄 Reset in header to clear all seed data",
        "img": None,
        "section": "reference"
    },
    # ── 33: Q&A ──
    {
        "title": "Q&A",
        "subtitle": "Thank You!",
        "body": "Key Concepts to Remember:\n"
                "• Workflows are CONFIGURABLE — edit in ⚙️ Config, no code changes\n"
                "• Roles determine WHAT you see and WHAT you can do\n"
                "• Dashboard shows only YOUR actionable items\n"
                "• Sprint Board shows team assignments via resource chain\n"
                "• Governance checklist is per-project with VS-specific templates\n"
                "• Demand → Requirement conversion happens on Approved status\n"
                "• Lock/Unlock is restricted to Admin/VSPMO/VSO roles\n"
                "• Unlink works even on locked projects (for descoping)\n\n"
                "Questions? Contact your system administrator.",
        "img": None,
        "section": "qa"
    }
]

def hex_to_rgb(h):
    h = h.lstrip('#')
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

PRIMARY = hex_to_rgb('6366f1')
DARK = hex_to_rgb('0f172a')
MUTED = hex_to_rgb('64748b')
WHITE = RGBColor(255, 255, 255)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK_LAYOUT = prs.slide_layouts[6]

screenshot_dir = os.path.join(os.path.dirname(__file__), 'screenshots')

def add_slide_number(slide, num, total):
    box = slide.shapes.add_textbox(Inches(12.2), Inches(0.85), Inches(0.8), Inches(0.3))
    p = box.text_frame.paragraphs[0]
    p.text = f"{num}/{total}"
    p.font.size = Pt(10)
    p.font.color.rgb = RGBColor(199, 210, 254)
    p.alignment = PP_ALIGN.RIGHT

def add_top_bar(slide, title, subtitle=None):
    bar = slide.shapes.add_shape(1, Inches(0), Inches(0), prs.slide_width, Inches(1.2))
    bar.fill.solid()
    bar.fill.fore_color.rgb = PRIMARY
    bar.line.fill.background()
    tx = slide.shapes.add_textbox(Inches(0.8), Inches(0.15), Inches(11.5), Inches(0.65))
    p = tx.text_frame.paragraphs[0]
    p.text = title
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = WHITE
    p.alignment = PP_ALIGN.LEFT
    if subtitle:
        st = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.5), Inches(0.35))
        sp = st.text_frame.paragraphs[0]
        sp.text = subtitle
        sp.font.size = Pt(14)
        sp.font.color.rgb = RGBColor(199, 210, 254)
        sp.alignment = PP_ALIGN.LEFT

def add_footer(slide):
    ft = slide.shapes.add_textbox(Inches(0.5), Inches(7.05), Inches(12.3), Inches(0.3))
    p = ft.text_frame.paragraphs[0]
    p.text = "Project Management Tool — Training Guide"
    p.font.size = Pt(8)
    p.font.color.rgb = MUTED
    p.alignment = PP_ALIGN.CENTER

def add_body(slide, text, left=0.8, top=1.5, width=11.7, height=5.5, size=13):
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = DARK
    p.line_spacing = Pt(size + 6)

def add_rounded_box(slide, left, top, width, height, text, fill_color, font_color=None, font_size=11):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill_color
    shape.line.fill.background()
    tf = shape.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = True
    p.font.color.rgb = font_color or WHITE
    shape.text_frame.margin_top = Emu(0)
    shape.text_frame.margin_bottom = Emu(0)
    return shape

def add_arrow(slide, left, top, width=0.5, height=0.25, color=None):
    if color is None:
        color = RGBColor(100, 116, 139)
    arrow = slide.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(left), Inches(top), Inches(width), Inches(height))
    arrow.fill.solid()
    arrow.fill.fore_color.rgb = color
    arrow.line.fill.background()
    return arrow

def add_down_arrow(slide, left, top, width=0.25, height=0.4, color=None):
    if color is None:
        color = RGBColor(100, 116, 139)
    arrow = slide.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(left), Inches(top), Inches(width), Inches(height))
    arrow.fill.solid()
    arrow.fill.fore_color.rgb = color
    arrow.line.fill.background()
    return arrow

def draw_workflow_diagram(slide):
    FLOW = RGBColor(99, 102, 241)
    GREEN = RGBColor(34, 197, 94)
    AMBER = RGBColor(234, 179, 8)
    RED = RGBColor(239, 68, 68)
    PURPLE = RGBColor(139, 92, 246)
    GRAY = RGBColor(100, 116, 139)
    LG = RGBColor(148, 163, 184)
    BG = RGBColor(248, 250, 252)

    bg = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.3), Inches(1.3), Inches(12.7), Inches(5.8))
    bg.fill.solid(); bg.fill.fore_color.rgb = BG
    bg.line.color.rgb = LG; bg.line.width = Pt(1)

    b = (lambda s, l, t, w, h, fc, fs=11: add_rounded_box(slide, l, t, w, h, s, fc, font_size=fs))

    # Legend
    tx = slide.shapes.add_textbox(Inches(0.5), Inches(1.4), Inches(2), Inches(0.25))
    tx.text_frame.paragraphs[0].text = "Workflow Patterns by Value Stream"
    tx.text_frame.paragraphs[0].font.size = Pt(12)
    tx.text_frame.paragraphs[0].font.bold = True
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY

    # ── Customer Experience (2 steps) ──
    tx = slide.shapes.add_textbox(Inches(0.5), Inches(1.75), Inches(5), Inches(0.25))
    tx.text_frame.paragraphs[0].text = "Customer Experience  (2 steps)"
    tx.text_frame.paragraphs[0].font.size = Pt(10)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    y = 2.05
    b("Submitted", 0.5, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 1.9, y + 0.08, 0.4, 0.24)
    b("Triaging", 2.4, y, 1.3, 0.4, FLOW)
    add_down_arrow(slide, 2.95, y + 0.42, 0.2, 0.3, GRAY)
    tx = slide.shapes.add_textbox(Inches(2.55), Inches(y + 0.75), Inches(1.5), Inches(0.2))
    tx.text_frame.paragraphs[0].text = "Terminal >>"
    tx.text_frame.paragraphs[0].font.size = Pt(7)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    tx.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ── Operational Efficiency (3 steps) ──
    tx = slide.shapes.add_textbox(Inches(0.5), Inches(2.6), Inches(5), Inches(0.25))
    tx.text_frame.paragraphs[0].text = "Operational Efficiency  (3 steps)"
    tx.text_frame.paragraphs[0].font.size = Pt(10)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    y = 2.9
    b("Submitted", 0.5, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 1.9, y + 0.08, 0.4, 0.24)
    b("Triaging", 2.4, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 3.8, y + 0.08, 0.4, 0.24)
    b("Assessed", 4.3, y, 1.3, 0.4, FLOW)
    add_down_arrow(slide, 4.85, y + 0.42, 0.2, 0.3, GRAY)
    tx = slide.shapes.add_textbox(Inches(4.45), Inches(y + 0.75), Inches(1.5), Inches(0.2))
    tx.text_frame.paragraphs[0].text = "Terminal >>"
    tx.text_frame.paragraphs[0].font.size = Pt(7)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    tx.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ── Risk & Compliance (4 steps) ──
    tx = slide.shapes.add_textbox(Inches(0.5), Inches(3.45), Inches(5), Inches(0.25))
    tx.text_frame.paragraphs[0].text = "Risk & Compliance  (4 steps)"
    tx.text_frame.paragraphs[0].font.size = Pt(10)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    y = 3.75
    b("Submitted", 0.5, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 1.9, y + 0.08, 0.4, 0.24)
    b("Triaging", 2.4, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 3.8, y + 0.08, 0.4, 0.24)
    b("Assessed", 4.3, y, 1.3, 0.4, FLOW)
    add_arrow(slide, 5.7, y + 0.08, 0.4, 0.24)
    b("PSC Review", 6.2, y, 1.3, 0.4, FLOW)
    add_down_arrow(slide, 6.75, y + 0.42, 0.2, 0.3, GRAY)
    tx = slide.shapes.add_textbox(Inches(6.35), Inches(y + 0.75), Inches(1.5), Inches(0.2))
    tx.text_frame.paragraphs[0].text = "Terminal >>"
    tx.text_frame.paragraphs[0].font.size = Pt(7)
    tx.text_frame.paragraphs[0].font.color.rgb = GRAY
    tx.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ── Terminal Actions ──
    ty = 1.65
    b("✅ Approve", 8.0, ty, 1.5, 0.55, GREEN)
    b("📥 Backlog", 8.0, ty + 0.75, 1.5, 0.55, AMBER)
    b("❌ Reject", 8.0, ty + 1.5, 1.5, 0.55, RED)

    # Convert path
    add_down_arrow(slide, 8.65, ty + 0.58, 0.2, 0.15, GREEN)
    b("Convert\nModal", 8.0, ty + 2.4, 1.5, 0.8, PURPLE, 9)
    tx = slide.shapes.add_textbox(Inches(8.0), Inches(ty + 3.25), Inches(1.5), Inches(0.5))
    tf = tx.text_frame; tf.word_wrap = True
    tf.paragraphs[0].text = "Requirement (linked)\nor Backlog (unlinked)"
    tf.paragraphs[0].font.size = Pt(8)
    tf.paragraphs[0].font.color.rgb = GRAY
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER

    # ── Legend Box ──
    lx, ly = 0.5, 5.0
    b("Flow Step", lx, ly, 0.7, 0.25, FLOW, 8)
    b("Approve", lx + 0.85, ly, 0.7, 0.25, GREEN, 8)
    b("Backlog", lx + 1.7, ly, 0.7, 0.25, AMBER, 8)
    b("Reject", lx + 2.55, ly, 0.7, 0.25, RED, 8)
    b("Convert", lx + 3.4, ly, 0.7, 0.25, PURPLE, 8)
    tx = slide.shapes.add_textbox(Inches(0.5), Inches(5.35), Inches(11), Inches(0.8))
    tf = tx.text_frame; tf.word_wrap = True
    tf.paragraphs[0].text = ("💡 At intermediate steps: only flow progression options shown.\n"
                             "At the FINAL step: terminal actions appear (Approved / Backlog / Reject).\n"
                             "Convert creates a Requirement (linked to project) or Backlog item (unlinked).")
    tf.paragraphs[0].font.size = Pt(10)
    tf.paragraphs[0].font.color.rgb = GRAY
    tf.paragraphs[0].line_spacing = Pt(16)

TOTAL = len(SLIDES)

for i, slide_data in enumerate(SLIDES):
    slide = prs.slides.add_slide(BLANK_LAYOUT)
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = WHITE

    section = slide_data.get("section", "")
    subtitle = slide_data.get("subtitle", "")
    
    if section == "title":
        add_top_bar(slide, slide_data["title"])
        tx = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(4.5))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = slide_data.get("subtitle", "") + "\n\n" + slide_data.get("body", "")
        p.font.size = Pt(20)
        p.font.color.rgb = MUTED
        p.line_spacing = Pt(32)
        p.alignment = PP_ALIGN.LEFT
        add_slide_number(slide, i + 1, TOTAL)
        add_footer(slide)
        continue

    if section == "role":
        add_top_bar(slide, slide_data["title"], subtitle)
        add_body(slide, slide_data.get("body", ""))
    elif section == "feature":
        add_top_bar(slide, slide_data["title"], subtitle)
        add_body(slide, slide_data.get("body", ""))
    elif section == "diagram":
        add_top_bar(slide, slide_data["title"], subtitle)
        draw_workflow_diagram(slide)
    elif section == "qa":
        add_top_bar(slide, slide_data["title"], subtitle if subtitle else None)
        add_body(slide, slide_data.get("body", ""), left=0.5, top=1.5, width=12.3, height=5.5, size=18)
    elif section == "matrix":
        add_top_bar(slide, slide_data["title"])
        add_body(slide, slide_data.get("body", ""), size=10)
    elif section == "overview":
        add_top_bar(slide, slide_data["title"])
        add_body(slide, slide_data.get("body", ""), size=15)
    else:
        add_top_bar(slide, slide_data["title"], subtitle if subtitle else None)
        add_body(slide, slide_data.get("body", ""))

    add_slide_number(slide, i + 1, TOTAL)
    add_footer(slide)

output_path = os.path.join(os.path.dirname(__file__), 'Training-PM-Tool.pptx')
prs.save(output_path)
print(f"PPT saved: {output_path}")
print(f"Total slides: {len(SLIDES)}")
