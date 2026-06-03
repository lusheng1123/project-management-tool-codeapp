import { useSearch } from '../context/SearchContext'

export function SearchBar() { const { term, setTerm } = useSearch(); return (<div className="filter-bar"><input className="search-input" placeholder="🔍 Search..." value={term} onChange={e => setTerm(e.target.value)} />{term && <button className="btn btn-reset btn-sm" onClick={() => setTerm('')}>Clear</button>}</div>) }
