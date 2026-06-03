import type { FieldDef, Model } from './types'

export const MODELS: Record<string, Model> = {
  pm_resource: { name: 'Resource', fields: [
    { name: 'pm_name', label: 'Name', type: 'text', required: true },
    { name: 'pm_role', label: 'Role', type: 'text', required: true },
    { name: 'pm_department', label: 'Department', type: 'text' },
    { name: 'pm_team', label: 'Team', type: 'text' },
    { name: 'pm_email', label: 'Email', type: 'email' },
    { name: 'pm_joineddate', label: 'Joined Date', type: 'date', required: true },
    { name: 'pm_leavedate', label: 'Leave Date', type: 'date' },
    { name: 'pm_cost', label: 'Cost (Monthly)', type: 'number', step: '0.01' },
    { name: 'pm_status', label: 'Status', type: 'text' }
  ]},
  pm_capability: { name: 'Capability', fields: [
    { name: 'pm_name', label: 'Capability Name', type: 'text', required: true },
    { name: 'pm_description', label: 'Description', type: 'multiline' },
    { name: 'pm_capabilitytype', label: 'Type', type: 'lookup', target: 'pm_config' },
    { name: 'pm_cost', label: 'Cost', type: 'number', step: '0.01' }
  ]},
  pm_product: { name: 'Product', fields: [
    { name: 'pm_name', label: 'Product Name', type: 'text', required: true },
    { name: 'pm_journeyname', label: 'Journey Name', type: 'text' },
    { name: 'pm_shortname', label: 'Short Name', type: 'text' },
    { name: 'pm_valuestream', label: 'Value Stream', type: 'lookup', target: 'pm_config' },
    { name: 'pm_governancestatus', label: 'Governance Status', type: 'text' },
    { name: 'pm_contact', label: 'Contact', type: 'text' }
  ]},
  pm_capabilityproduct: { name: 'Capability-Product Link', isLinkingTable: true, fields: [
    { name: 'pm_capabilityid', label: 'Capability', type: 'lookup', target: 'pm_capability', required: true },
    { name: 'pm_productname', label: 'Product', type: 'lookup', target: 'pm_product', required: true }
  ]},
  pm_requirement: { name: 'Requirement', fields: [
    { name: 'pm_detail', label: 'Requirement Detail', type: 'multiline', required: true },
    { name: 'pm_capabilityid', label: 'Capability', type: 'lookup', target: 'pm_capability' },
    { name: 'pm_projectname', label: 'Project', type: 'lookup', target: 'pm_project' },
    { name: 'pm_status', label: 'Status', type: 'text' },
    { name: 'pm_pscapprovalrequired', label: 'PSC Approval Required', type: 'text' },
    { name: 'pm_pscapprovalstatus', label: 'PSC Approval Status', type: 'text' },
    { name: 'pm_effort', label: 'Effort (days)', type: 'number' }
  ]},
  pm_project: { name: 'Project', fields: [
    { name: 'pm_name', label: 'Project Name', type: 'text', required: true },
    { name: 'pm_productname', label: 'Product', type: 'lookup', target: 'pm_product' },
    { name: 'pm_startdate', label: 'Start Date', type: 'date' },
    { name: 'pm_targetdeliverydate', label: 'Target Delivery Date', type: 'date' },
    { name: 'pm_status', label: 'Project Status', type: 'text' },
    { name: 'pm_estimateeffort', label: 'Estimate Effort (days)', type: 'number' },
    { name: 'pm_overallcompletion', label: 'Overall Completion (%)', type: 'number', min: 0, max: 100 },
    { name: 'pm_enhancementtype', label: 'Enhancement Type', type: 'text' },
    { name: 'pm_priority', label: 'Priority', type: 'text' },
    { name: 'pm_scope', label: 'Scope', type: 'multiline' },
    { name: 'pm_yearquarter', label: 'Year/Quarter', type: 'text' }
  ]},
  pm_control: { name: 'Control', fields: [
    { name: 'pm_detail', label: 'Control Detail', type: 'multiline', required: true },
    { name: 'pm_projectname', label: 'Project', type: 'lookup', target: 'pm_project' }
  ]},
  pm_epic: { name: 'Epic', fields: [
    { name: 'pm_title', label: 'Epic Title', type: 'text', required: true },
    { name: 'pm_detail', label: 'Epic Detail', type: 'multiline' },
    { name: 'pm_projectname', label: 'Project', type: 'lookup', target: 'pm_project' },
    { name: 'pm_jiralink', label: 'Jira Link', type: 'text' },
    { name: 'pm_estimatedeffort', label: 'Estimated Effort (days)', type: 'number' },
    { name: 'pm_releasedate', label: 'Release Date', type: 'date' },
    { name: 'pm_startdate', label: 'Start Date', type: 'date' },
    { name: 'pm_completeddate', label: 'Completed Date', type: 'date' },
    { name: 'pm_ragstatus', label: 'RAG Status', type: 'text' }
  ]},
  pm_userstory: { name: 'User Story', fields: [
    { name: 'pm_detail', label: 'User Story Detail', type: 'multiline', required: true },
    { name: 'pm_epicid', label: 'Epic', type: 'lookup', target: 'pm_epic' },
    { name: 'pm_acceptancecriteria', label: 'Acceptance Criteria', type: 'multiline' },
    { name: 'pm_storypoint', label: 'Story Points', type: 'number' }
  ]},
  pm_assignment: { name: 'Assignment', fields: [
    { name: 'pm_resource', label: 'Resource', type: 'lookup', target: 'pm_resource', required: true },
    { name: 'pm_epic', label: 'Epic', type: 'lookup', target: 'pm_epic', required: true },
    { name: 'pm_allocationpct', label: 'Allocation %', type: 'number', min: 0, max: 100 },
    { name: 'pm_startdate', label: 'Start Date', type: 'date' },
    { name: 'pm_enddate', label: 'End Date', type: 'date' }
  ]},
  pm_risk: { name: 'Risk', fields: [
    { name: 'pm_summary', label: 'Risk Summary', type: 'text', required: true },
    { name: 'pm_detail', label: 'Risk Detail', type: 'multiline' },
    { name: 'pm_projectname', label: 'Project', type: 'lookup', target: 'pm_project' }
  ]},
  pm_dependency: { name: 'Dependency', fields: [
    { name: 'pm_summary', label: 'Dependency Summary', type: 'text', required: true },
    { name: 'pm_detail', label: 'Dependency Detail', type: 'multiline' },
    { name: 'pm_riskid', label: 'Risk', type: 'lookup', target: 'pm_risk' }
  ]},
  pm_demand: { name: 'Demand', fields: [
    { name: 'pm_title', label: 'Title', type: 'text', required: true },
    { name: 'pm_detail', label: 'Detail', type: 'multiline' },
    { name: 'pm_type', label: 'Type', type: 'text' },
    { name: 'pm_priority', label: 'Priority', type: 'text' },
    { name: 'pm_status', label: 'Status', type: 'text' },
    { name: 'pm_capability', label: 'Capability', type: 'lookup', target: 'pm_capability' },
    { name: 'pm_product', label: 'Product', type: 'lookup', target: 'pm_product', required: true },
    { name: 'pm_submitted_by', label: 'Submitted By', type: 'text' },
    { name: 'pm_submitted_date', label: 'Submitted Date', type: 'date' },
    { name: 'pm_assessment_notes', label: 'Assessment Notes', type: 'multiline' },
    { name: 'pm_converted_to', label: 'Converted To', type: 'lookup', target: 'pm_requirement' },
    { name: 'pm_converted_date', label: 'Converted Date', type: 'date' }
  ]},
  pm_release: { name: 'Release', fields: [
    { name: 'pm_releasename', label: 'Release Name', type: 'text', required: true },
    { name: 'pm_status', label: 'Status', type: 'text' },
    { name: 'pm_releasedate', label: 'Release Date', type: 'date' },
    { name: 'pm_cutoffdate', label: 'Cutoff Date', type: 'date' },
    { name: 'pm_description', label: 'Description', type: 'multiline' }
  ]},
  pm_releaseitem: { name: 'Release Item', fields: [
    { name: 'pm_release', label: 'Release', type: 'lookup', target: 'pm_release', required: true },
    { name: 'pm_userstory', label: 'User Story', type: 'lookup', target: 'pm_userstory', required: true },
    { name: 'pm_signoff_status', label: 'Signoff Status', type: 'text' },
    { name: 'pm_signoff_note', label: 'Signoff Note', type: 'text' },
    { name: 'pm_signoff_by', label: 'Signoff By', type: 'text' },
    { name: 'pm_signoff_date', label: 'Signoff Date', type: 'date' },
    { name: 'pm_registered_by', label: 'Registered By', type: 'text' },
    { name: 'pm_registered_date', label: 'Registered Date', type: 'date' },
    { name: 'pm_tool', label: 'Tool', type: 'text' }
  ]},
   pm_config: { name: 'Configuration', fields: [
     { name: 'pm_type', label: 'Type', type: 'text', required: true },
     { name: 'pm_name', label: 'Name', type: 'text', required: true },
     { name: 'pm_description', label: 'Description', type: 'text' },
     { name: 'pm_hardcoded', label: 'Code Change?', type: 'choice', choices: ['No', 'Yes'] }
   ]}
}

export function getFields(tableName: string): FieldDef[] { return MODELS[tableName]?.fields ?? [] }
export function getModelName(tableName: string): string { return MODELS[tableName]?.name ?? tableName }

