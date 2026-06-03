import { useState } from 'react'
import './App.css'
import { SearchProvider } from './context/SearchContext'
import { UIProvider } from './context/UIContext'
import { seedAllIfNeeded } from './seed'
import {
  ResourcesView, CapabilitiesView, ProductsView, RequirementsView,
  ProjectsView, EpicsView, UserStoriesView, RisksView,
  DependenciesView, ReleasesView, DemandView, ConfigView
} from './views'

// Seed data on module load
seedAllIfNeeded()

// Re-exports for backward compat (tests, etc.)
export { DS, genId } from './data'
export { MODELS, getFields, getModelName } from './models'
export { seedAllIfNeeded } from './seed'
export { badgeClass } from './context/UIContext'

const TABS = [{ id: 'demand', label: '📥 Demand' },{ id: 'capabilities', label: '🎯 Capabilities' },{ id: 'products', label: '📦 Products' },{ id: 'projects', label: '📁 Projects' },{ id: 'requirements', label: '📋 Requirements' },{ id: 'epics', label: '⚡ Epics' },{ id: 'stories', label: '📝 Stories' },{ id: 'risks', label: '⚠️ Risks' },{ id: 'dependencies', label: '🔗 Deps' },{ id: 'releases', label: '🚀 Releases' },{ id: 'resources', label: '👥 Resources' },{ id: 'config', label: '⚙️ Config' }]

function App() {
  const [tab, setTab] = useState('demand')
  const handleReset = () => { if (!confirm('Reset all data?')) return; localStorage.clear(); seedAllIfNeeded(); window.location.reload() }
  const renderTab = () => { switch (tab) { case 'resources': return <ResourcesView />; case 'products': return <ProductsView />; case 'projects': return <ProjectsView />; case 'capabilities': return <CapabilitiesView />; case 'requirements': return <RequirementsView />; case 'demand': return <DemandView />; case 'epics': return <EpicsView />; case 'stories': return <UserStoriesView />; case 'risks': return <RisksView />; case 'dependencies': return <DependenciesView />; case 'releases': return <ReleasesView />; case 'config': return <ConfigView />; default: return <DemandView /> } }
  return (<div className="app-root"><header className="app-header"><h1>Project Management Tool</h1><span className="badge-mode mode-dev">DEV</span><button className="btn-sm btn-reset" onClick={handleReset} style={{ marginLeft: 'auto' }}>🔄 Reset</button></header><nav className="tab-nav">{TABS.map(t => (<button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>))}</nav><main className="main-content">{renderTab()}</main></div>)
}

function AppWithProviders() { return (<SearchProvider><UIProvider><App /></UIProvider></SearchProvider>) }

export default AppWithProviders
export { App }
