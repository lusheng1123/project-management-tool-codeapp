import { createContext, useContext, useState } from 'react'

const NavContext = createContext<{
  tab: string; navigate: (tab: string, focusId?: string) => void
  focusId: string | null; clearFocus: () => void
}>({ tab: 'dashboard', navigate: () => {}, focusId: null, clearFocus: () => {} })

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState('dashboard')
  const [focusId, setFocusId] = useState<string | null>(null)
  const navigate = (tab: string, id?: string) => { setTab(tab); setFocusId(id || null) }
  const clearFocus = () => setFocusId(null)
  return <NavContext.Provider value={{ tab, navigate, focusId, clearFocus }}>{children}</NavContext.Provider>
}

export function useNavigation() { return useContext(NavContext) }
