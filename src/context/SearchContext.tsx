import React, { useState, createContext, useContext } from 'react'

export const SearchContext = createContext<{ term: string; setTerm: (t: string) => void }>({ term: '', setTerm: () => {} })
export function SearchProvider({ children }: { children: React.ReactNode }) { const [term, setTerm] = useState(''); return <SearchContext.Provider value={{ term, setTerm }}>{children}</SearchContext.Provider> }
export function useSearch() { return useContext(SearchContext) }

