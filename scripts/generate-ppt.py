#!/usr/bin/env python3
"""Generate Training PPT for Project Management Tool — with role details"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Emu
import os

SLIDES = [
    # Title
    {
        "title": "Project Management Tool",
        "subtitle": "End-to-End Training Guide",
        "body": "Value Stream Driven | 17 Tabs | 8 Roles | Configurable Workflows\n\n📥 Demand → 📋 Requirement → 📁 Project → ⚡ Epic → 📝 Story → 🚀 Release",
        "img": None,
        "section": "title"
    },
    # Overview
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
                "👤 Role-Based Access — 8 roles with tailored dashboards",
        "img": "dashboard.png",
        "section": "overview"
    },
    {
        "title": "How to Read This Guide",
        "body": "This training guide is organized by ROLE — find your role below and "
                "review your responsibilities, tabs, and actionable items.\n\n"
                "👤 Who You Are → What You See → What You Can Do\n\n"
                "Slides 4-5: Role matrix & comparison\n"
                "Slides 6-13: Individual role deep-dives\n"
                "Slides 14+: Feature walkthroughs\n\n"
                "💡 TIP: Use the role selector in the app header to switch between "
                "roles and see the tool from different perspectives.",
        "img": None,
        "section": "guide"
    },
    {
        "title": "Role Access Matrix",
        "body": "┌────────────────────┬─────┬──────┬──────┬─────┬──────┬──────┬─────┐\n"
                "│ Tab                │ Adm │VSPMO │ VSO  │ PO  │ DL   │ BA   │ RM  │ITSO │\n"
                "├────────────────────┼─────┼──────┼──────┼─────┼──────┼──────┼─────┤\n"
                "│ 📊 Dashboard       │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 📈 Portfolio       │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 📥 Demand          │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │  — │  —  │\n"
                "│ 📦 Products        │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 📁 Projects        │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 🎯 Capabilities    │  ✅ │  ✅  │  ✅  │  — │  ✅  │  ✅  │  — │  —  │\n"
                "│ 📋 Requirements    │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ ⚡ Epics            │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 📝 Stories         │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ ⚠️ Risks           │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 🔗 Dependencies    │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 🚀 Releases        │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 📋 Sprints         │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ ✅ Governance      │  ✅ │  ✅  │  ✅  │ ✅  │  ✅  │  ✅  │ ✅ │ ✅  │\n"
                "│ 👥 Resources       │  ✅ │  ✅  │  ✅  │  — │  ✅  │  ✅  │  — │  —  │\n"
                "│ 👤 Users           │  ✅ │   —  │   —  │  — │  ✅  │   —  │  — │  —  │\n"
                "│ ⚙️ Config          │  ✅ │   —  │   —  │  — │   —  │   —  │  — │  —  │\n"
                "├────────────────────┼─────┼──────┼──────┼─────┼──────┼──────┼─────┤\n"
                "│ Total Tabs         │ 17  │  16  │  12  │ 11  │  14  │  13  │ 12 │ 11  │\n"
                "└────────────────────┴─────┴──────┴──────┴─────┴──────┴──────┴─────┘",
        "img": None,
        "section": "matrix"
    },
    {
        "title": "Dashboard Actions by Role",
        "body": "What each role sees on their Dashboard Action Items panel:\n\n"
                "👑 Admin: All pending demands (Triage / Assess / Approve / Convert)\n"
                "  + All pending release signoffs\n\n"
                "🏢 Value Stream PMO: Demands to Approve + Pending Signoffs\n"
                "  (oversees all value streams, unfiltered views)\n\n"
                "🌊 Value Stream Owner: Demands to Approve (Assessed status)\n"
                "  + Pending signoffs (only their assigned value streams)\n\n"
                "📦 Product Owner: Demands to Approve + Pending Signoffs\n\n"
                "🚀 Delivery Lead: Demands to Triage / Assess / Convert\n"
                "  + Pending Signoffs\n\n"
                "📊 Business Analyst: Submitted Demands (view only)\n\n"
                "🔖 Release Manager: Pending Signoffs only\n\n"
                "🔒 ITSO: Assessed + PSC Review Demands (security review)\n\n"
                "• Viewers: Stats only (no actionable items)",
        "img": None,
        "section": "actions"
    },
    # === Role Deep Dives ===
    {
        "title": "👑 Admin — System Administrator",
        "subtitle": "Full access — all tabs, all actions",
        "body": "RESPONSIBILITIES:\n"
                "• Configure the entire system via ⚙️ Config tab\n"
                "• Manage users and their roles (👤 Users tab)\n"
                "• Approve demands, manage releases, oversee governance\n"
                "• All CRUD operations across all 17 tabs\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Full workflow — can Triage, Assess, Approve, Convert, Reject\n"
                "• 🚀 Release: Full lifecycle — Create, Open, Review, Complete, Signoff\n"
                "• ✅ Governance: Full edit (status, owner, dates)\n"
                "• 👤 Users: Create/Edit/Delete users, assign roles\n"
                "• ⚙️ Config: Add/edit/remove configuration entries\n\n"
                "DASHBOARD SEES: All pending items across every entity",
        "img": "users.png",
        "section": "role"
    },
    {
        "title": "🌊 Value Stream Owner (VSO)",
        "subtitle": "Owns one or more value streams — approves demands within their VS",
        "body": "RESPONSIBILITIES:\n"
                "• Oversee demands across their assigned value streams\n"
                "• Approve demands that have been assessed (Assessed → Approved)\n"
                "• Review Portfolio and Sprint views filtered to their VS\n"
                "• Monitor risks, dependencies, and governance for their VS products\n\n"
                "TABS VISIBLE (12): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks, Deps,\n"
                "  Releases, Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Approve demands + Reject\n"
                "• 🚀 Release: Signoff pending stories\n"
                "• 📈 Portfolio: Sees only their assigned value stream products\n"
                "• 📋 Sprints: Sees only their assigned value stream products\n"
                "• ✅ Governance: Can edit all items\n\n"
                "CONFIGURATION: Assign value streams via 👤 Users tab\n"
                "  (pm_valuestream field — comma-separated VS IDs)",
        "img": "portfolio.png",
        "section": "role"
    },
    {
        "title": "🏢 Value Stream PMO",
        "subtitle": "Oversees ALL value streams — like Admin but without Config access",
        "body": "RESPONSIBILITIES:\n"
                "• Cross-VS oversight — sees all value streams unfiltered\n"
                "• Approve demands across any value stream\n"
                "• Manage resources and review governance\n\n"
                "TABS VISIBLE (16): All except ⚙️ Config\n\n"
                "KEY DIFFERENCES FROM ADMIN:\n"
                "• ❌ Cannot access Config tab\n"
                "• ❌ Cannot manage users\n"
                "• ✅ Everything else same as Admin\n\n"
                "DASHBOARD SEES: Demands to Approve + Pending Signoffs across all VS",
        "img": "dashboard.png",
        "section": "role"
    },
    {
        "title": "📦 Product Owner (PO)",
        "subtitle": "Owns specific products — approves demands, signs off releases",
        "body": "RESPONSIBILITIES:\n"
                "• Product-level demand approval (Assessed → Approved)\n"
                "• Sign off on release items (✍️ Signoff button)\n"
                "• Review epics and stories for their products\n\n"
                "TABS VISIBLE (11): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Deps, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Approve + Reject (only these two workflow actions)\n"
                "• 🚀 Release: Signoff pending stories (✍️ Signoff button)\n"
                "• ✅ Governance: Can edit items\n"
                "• 📦 Products: View, edit, and manage product details\n\n"
                "DASHBOARD SEES: Demands to Approve + Pending Release Signoffs\n\n"
                "NOTE: Cannot create/edit demands, cannot triage or assess",
        "img": "releases.png",
        "section": "role"
    },
    {
        "title": "🚀 Delivery Lead (DL)",
        "subtitle": "Manages delivery — projects, resources, releases",
        "body": "RESPONSIBILITIES:\n"
                "• Own demand workflow: Triage → Assess → Convert\n"
                "• Manage projects, epics, stories, resources\n"
                "• Register stories into releases\n"
                "• Review governance checklists\n\n"
                "TABS VISIBLE (14): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks, Deps,\n"
                "  Releases, Sprints, Governance, Resources, Users\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Triage, Assess, Convert, Reject (+ Raise Demand)\n"
                "• 🚀 Release: Register stories (+ Create/Edit/Delete releases)\n"
                "• ✅ Governance: Full edit all items\n"
                "• 👥 Resources: Full CRUD\n"
                "• 👤 Users: Can manage users and their roles\n\n"
                "DASHBOARD SEES: Demands to Triage/Assess/Convert + Pending Signoffs",
        "img": "demand.png",
        "section": "role"
    },
    {
        "title": "📊 Business Analyst (BA)",
        "subtitle": "Raises demands, analyzes requirements — read-only on most views",
        "body": "RESPONSIBILITIES:\n"
                "• Raise new demands (+ Raise Demand button)\n"
                "• View demand status and track progress\n"
                "• Review requirements and products\n\n"
                "TABS VISIBLE (13): Dashboard, Portfolio, Demand, Products, Projects,\n"
                "  Capabilities, Requirements, Epics, Stories, Risks, Deps,\n"
                "  Releases, Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: Can raise new demands (Submit)\n"
                "• ❌ Cannot edit existing demands, cannot Triage/Assess/Approve/Reject\n"
                "• ✅ Governance: READ-ONLY (inputs disabled, Generate button hidden)\n"
                "• All other views: READ-ONLY\n\n"
                "DASHBOARD SEES: Submitted demands only\n\n"
                "SPRINT BOARD: Only shows products with active demands",
        "img": "governance.png",
        "section": "role"
    },
    {
        "title": "🔖 Release Manager (RM)",
        "subtitle": "Manages release lifecycle and signoffs",
        "body": "RESPONSIBILITIES:\n"
                "• Full release lifecycle: Create → Open → Review → Complete\n"
                "• Sign off on release items\n"
                "• Register stories into releases\n\n"
                "TABS VISIBLE (12): Dashboard, Portfolio, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Deps, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 🚀 Release: ALL actions — Create, Open, Review, Complete, Signoff, Register\n"
                "• ✅ Governance: Can edit items\n"
                "• ❌ No access to 📥 Demand tab\n"
                "• All other tabs: View-only\n\n"
                "DASHBOARD SEES: Pending signoffs only",
        "img": "sprints.png",
        "section": "role"
    },
    {
        "title": "🔒 ITSO — IT Security Officer",
        "subtitle": "Reviews demands and risks from a security perspective",
        "body": "RESPONSIBILITIES:\n"
                "• Security review of demands in Assessed or PSC Review status\n"
                "• Monitor risks and dependencies across all products\n"
                "• Review requirements for security compliance\n\n"
                "TABS VISIBLE (11): Dashboard, Portfolio, Products, Projects,\n"
                "  Requirements, Epics, Stories, Risks, Deps, Releases,\n"
                "  Sprints, Governance\n\n"
                "KEY ACTIONS:\n"
                "• 📥 Demand: READ-ONLY (cannot create/edit/change status)\n"
                "• ⚠️ Risks & 🔗 Deps: View-only\n"
                "• ✅ Governance: READ-ONLY\n"
                "• ❌ No access to 📥 Demand workflow actions\n\n"
                "DASHBOARD SEES: Demands in Assessed + PSC Review status\n"
                "  (for security review purposes)",
        "img": "risks.png",
        "section": "role"
    },
    # === Feature Walkthroughs ===
    {
        "title": "📥 Demand Intake — Workflow",
        "subtitle": "Configurable per Value Stream",
        "body": "HOW TO RAISE A DEMAND:\n"
                "1. Click + Raise Demand on the 📥 Demand tab\n"
                "2. Fill in Title, Detail, Type, Priority\n"
                "3. Select Value Stream (determines workflow)\n"
                "4. Select Product (the app the demand targets)\n"
                "5. Click Save → status set to first step in VS flow\n\n"
                "WORKFLOW BY VALUE STREAM:\n"
                "• Customer Experience: Submitted → Triaging → Approved (3 steps)\n"
                "• Operational Efficiency: Submitted → Triaging → Assessed → Approved (4 steps)\n"
                "• Risk & Compliance: Submitted → Triaging → Assessed → PSC Review → Approved (5 steps)\n\n"
                "CHANGING STATUS:\n"
                "• Click 'Change Status' button → dropdown shows all next steps from config\n"
                "• Selecting 'Approved' opens Convert to Requirement modal\n"
                "• Selecting 'Rejected' immediately rejects the demand\n\n"
                "⚙️ CONFIG: Edit demand_flow entries in ⚙️ Config tab to add/remove steps",
        "img": "demand.png",
        "section": "feature"
    },
    {
        "title": "📋 Sprint Board — Team × Product Grid",
        "subtitle": "Derived from Resource Assignments to Epics",
        "body": "HOW IT WORKS:\n"
                "• Teams (rows) are derived from resource assignments → epics\n"
                "• Products (columns) are derived from release items → stories → epics → projects → products\n"
                "• Each cell shows sprint cards for that Team × Product combination\n\n"
                "SPRINT CARD SHOWS:\n"
                "• Sprint name & status badge\n"
                "• Release & cutoff dates\n"
                "• Story count & signoff progress\n"
                "• Story Points: completed / total (e.g. 21/26 SP)\n"
                "• Progress bar for pending signoffs\n\n"
                "FILTERS:\n"
                "• ☑ Show completed sprints — toggle to see Released sprints\n"
                "• Role-based: VSO sees only their VS products\n"
                "• BA sees only products with active demands\n\n"
                "Click any card → navigates to Releases tab with auto-expand",
        "img": "sprints.png",
        "section": "feature"
    },
    {
        "title": "✅ Governance Checklist",
        "subtitle": "Per-project, per-phase, fully configurable",
        "body": "HOW IT WORKS:\n"
                "• Each project has a governance template (auto-detect or explicit)\n"
                "• Template determines which phases and checklist items appear\n"
                "• Phases are configurable per value stream\n"
                "• Checklist items are configurable per VS + phase\n\n"
                "PER-PROJECT TEMPLATE ASSIGNMENT:\n"
                "• Edit a project → Gov Template dropdown\n"
                "• 'Auto-detect from VS' — uses product's value stream\n"
                "• Explicit template — locks to a specific VS template\n\n"
                "EDITING ITEMS:\n"
                "• Status dropdown: To Do / In Progress / Done / N/A\n"
                "• Owner input, Plan Start/End, Actual Start/End — all inline editable\n"
                "• Config-only items auto-create on first edit\n"
                "• 'Generate N Items' button creates all missing items at once\n\n"
                "FILTERS: Project dropdown + Phase dropdown + Search bar",
        "img": "governance.png",
        "section": "feature"
    },
    {
        "title": "🚀 Release Management",
        "subtitle": "Epic-grouped with signoff workflow",
        "body": "RELEASE LIFECYCLE:\n"
                "• Draft → Open → In Review → Released\n"
                "• Workflow buttons appear based on current status\n\n"
                "REGISTERING STORIES:\n"
                "• Click ➕ Register on an Open release\n"
                "• Select unregistered user stories\n"
                "• Stories grouped by Epic (two-level expand)\n\n"
                "SIGNOFF WORKFLOW:\n"
                "• Individual story signoff: Pending → Approved / Rejected\n"
                "• ✍️ Signoff button appears on each pending story\n"
                "• Signoff modal: Decision (Approved/Rejected) + Note\n"
                "• Signoff recorded with by/date metadata\n\n"
                "Click any release row → expands epics → expands stories",
        "img": "releases.png",
        "section": "feature"
    },
    {
        "title": "📈 Portfolio View",
        "subtitle": "Value Stream grouped product cards with holistic metrics",
        "body": "PER-PRODUCT CARD SHOWS:\n"
                "• Demand count with status breakdown badges\n"
                "• Project count\n"
                "• Story Points: done/total with progress bar\n"
                "• Teams involved (from assignment chain)\n"
                "• Active sprints count\n"
                "• Risk & dependency counts\n\n"
                "VALUE STREAM HEADER:\n"
                "• Flow step count badge (e.g. '4 steps')\n"
                "• Product count\n\n"
                "ROLE FILTERING:\n"
                "• VSO: only their assigned value stream products\n"
                "• All others: full view\n\n"
                "Click any card → navigates to Products tab",
        "img": "portfolio.png",
        "section": "feature"
    },
    {
        "title": "Getting Started — Quick Reference",
        "body": "1️⃣ RAISE A DEMAND: Go to 📥 Demand → + Raise Demand\n\n"
                "2️⃣ WORKFLOW: Click Change Status on a demand to advance it\n"
                "  → Last step (Approved) creates a Requirement\n\n"
                "3️⃣ CREATE A PROJECT: Go to 📁 Projects → + New Project\n"
                "  → Assign a Governance Template if needed\n\n"
                "4️⃣ MANAGE EPICS & STORIES: Break down requirements\n"
                "  → Assign resources to epics (determines Sprint Board teams)\n\n"
                "5️⃣ GOVERNANCE CHECKLIST: Go to ✅ Governance\n"
                "  → Click Generate Items or edit items individually\n\n"
                "6️⃣ CREATE A RELEASE: Go to 🚀 Releases → + New Release\n"
                "  → Register stories, sign off when ready\n\n"
                "7️⃣ VIEW SPRINTS: Go to 📋 Sprints for Team×Product grid\n"
                "  → Toggle 'Show completed' as needed\n\n"
                "8️⃣ CHECK PORTFOLIO: Go to 📈 Portfolio for holistic view\n\n"
                "🔄 RESET DATA: Click 🔄 Reset in the header to clear all data\n"
                "👤 SWITCH ROLE: Use the role dropdown in the header",
        "img": None,
        "section": "reference"
    },
    {
        "title": "Q&A",
        "subtitle": "Thank You!",
        "body": "Key Concepts to Remember:\n"
                "• Workflows are CONFIGURABLE — edit in ⚙️ Config, no code changes\n"
                "• Roles determine WHAT you see and WHAT you can do\n"
                "• Dashboard shows only YOUR actionable items\n"
                "• Sprint Board shows team assignments derived from resources\n"
                "• Governance checklist is per-project with VS-specific templates\n"
                "• Demand → Requirement conversion happens on Approved status\n\n"
                "Questions?",
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
LIGHT_BG = RGBColor(238, 242, 255)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK_LAYOUT = prs.slide_layouts[6]

screenshot_dir = os.path.join(os.path.dirname(__file__), 'training-screenshots')

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

def add_body(slide, text, left=0.8, top=1.5, width=11.7, height=5.3, size=13):
    tb = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = DARK
    p.line_spacing = Pt(size + 6)

def add_image_left_body_right(slide, img_name, text):
    img_path = os.path.join(screenshot_dir, img_name)
    if os.path.exists(img_path):
        slide.shapes.add_picture(img_path, Inches(0.5), Inches(1.5), Inches(7.5), Inches(5.5))
        add_body(slide, text, left=8.3, top=1.5, width=4.7, height=5.5, size=12)
    else:
        add_body(slide, text, left=0.8, top=1.5, width=11.7, height=5.5, size=14)

def add_role_badge(slide, role_name, color_hex, left, top, width=2.0):
    badge = slide.shapes.add_shape(1, Inches(left), Inches(top), Inches(width), Inches(0.4))
    badge.fill.solid()
    badge.fill.fore_color.rgb = hex_to_rgb(color_hex)
    badge.line.fill.background()
    tx = badge.text_frame
    tx.word_wrap = True
    p = tx.paragraphs[0]
    p.text = role_name
    p.font.size = Pt(10)
    p.font.color.rgb = WHITE
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER

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
        # Full title slide
        add_top_bar(slide, slide_data["title"])
        tx = slide.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.5), Inches(4.5))
        tf = tx.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = slide_data.get("subtitle", "") + "\n\n" + slide_data.get("body", "")
        p.font.size = Pt(20)
        p.font.color.rgb = MUTED
        p.line_spacing = Pt(32)
        p.alignment = PP_ALIGN.CENTER if not subtitle else PP_ALIGN.LEFT
        add_slide_number(slide, i + 1, TOTAL)
        add_footer(slide)
        continue

    if section == "role":
        # Role slide: image left, details right
        add_top_bar(slide, slide_data["title"], subtitle)
        add_image_left_body_right(slide, slide_data.get("img", ""), slide_data.get("body", ""))
    elif section == "feature":
        add_top_bar(slide, slide_data["title"], subtitle)
        add_image_left_body_right(slide, slide_data.get("img", ""), slide_data.get("body", ""))
    elif section == "qa":
        add_top_bar(slide, slide_data["title"], subtitle if subtitle else None)
        add_body(slide, slide_data.get("body", ""), left=0.5, top=1.5, width=12.3, height=5.5, size=18)
    elif slide_data.get("img") and section != "overview":
        add_top_bar(slide, slide_data["title"], subtitle if subtitle else None)
        add_image_left_body_right(slide, slide_data.get("img", ""), slide_data.get("body", ""))
    elif slide_data.get("img"):
        add_top_bar(slide, slide_data["title"])
        add_image_left_body_right(slide, slide_data.get("img", ""), slide_data.get("body", ""))
    else:
        add_top_bar(slide, slide_data["title"], subtitle if subtitle else None)
        add_body(slide, slide_data.get("body", ""))

    add_slide_number(slide, i + 1, TOTAL)
    add_footer(slide)

output_path = os.path.join(os.path.dirname(__file__), '..', 'Training-PM-Tool.pptx')
prs.save(output_path)
print(f"PPT saved: {output_path}")
print(f"Total slides: {len(SLIDES)}")
