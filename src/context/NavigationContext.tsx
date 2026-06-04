import { createContext, useContext, useState } from 'react'

const NavContext = createContext<{ tab: string; navigate: (id: string) => void }>({
  tab: 'dashboard',
  navigate: () => {}
})

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState('dashboard')
  const navigate = (id: string) => setTab(id)
  return <NavContext.Provider value={{ tab, navigate }}>{children}</NavContext.Provider>
}

export function useNavigation() { return useContext(NavContext) }
