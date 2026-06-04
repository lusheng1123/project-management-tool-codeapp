import { createContext, useContext, useState } from 'react'

const TABS_BY_ROLE: Record<string, string[]> = {
  Admin: ['dashboard','demand','capabilities','products','projects','requirements','epics','stories','risks','dependencies','releases','resources','config','copilot'],
  'Value Stream Owner': ['dashboard','demand','products','capabilities','requirements','epics','stories','risks','dependencies'],
  'Product Owner': ['dashboard','demand','products','requirements','epics','stories'],
  'Delivery Lead': ['dashboard','demand','projects','epics','stories','requirements','releases','resources','risks','dependencies'],
  'Business Analyst': ['dashboard','demand','requirements','products','capabilities'],
  'Release Manager': ['dashboard','releases','epics','stories','requirements'],
  ITSO: ['dashboard','demand','risks','dependencies','requirements']
}

export function getAllowedTabs(roles: string[]): string[] {
  if (roles.includes('Admin')) return TABS_BY_ROLE.Admin
  const union = new Set<string>()
  for (const r of roles) {
    (TABS_BY_ROLE[r] || []).forEach(t => union.add(t))
  }
  return [...union]
}

export function canViewerEdit(roles: string[]): boolean {
  return !roles.every(r => r === 'Viewer')
}

const RoleContext = createContext<{
  roles: string[]; roleName: string
  setRole: (r: string) => void
  hasRole: (r: string) => boolean
  isAdmin: () => boolean
}>({
  roles: ['Admin'], roleName: 'Admin',
  setRole: () => {}, hasRole: () => false, isAdmin: () => false
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [roleName, setRoleName] = useState(() => localStorage.getItem('pm_current_role') || 'Admin')
  const roles = roleName.split(',').map(s => s.trim()).filter(Boolean)
  if (roles.length === 0) roles.push('Admin')

  const setRole = (r: string) => {
    setRoleName(r)
    localStorage.setItem('pm_current_role', r)
    window.location.reload()
  }

  const hasRole = (r: string) => roles.includes(r)
  const isAdmin = () => roles.includes('Admin')

  return <RoleContext.Provider value={{ roles, roleName, setRole, hasRole, isAdmin }}>{children}</RoleContext.Provider>
}

export function useRole() { return useContext(RoleContext) }
