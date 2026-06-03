import type { Record_ } from './types'

export function genId(prefix = 'tbl') { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }

export const DS = {
  getAll(table: string): any[] { return JSON.parse(localStorage.getItem(table) || '[]') },
  getById(table: string, id: string): any | null { return this.getAll(table).find((r: any) => r.id === id) || null },
  create(table: string, record: Record_) { const d = this.getAll(table); record.id = genId(table); d.push(record); localStorage.setItem(table, JSON.stringify(d)); return record },
  update(table: string, id: string, updates: Record_) { const d = this.getAll(table); const i = d.findIndex((r: any) => r.id === id); if (i === -1) return null; d[i] = { ...d[i], ...updates }; localStorage.setItem(table, JSON.stringify(d)); return d[i] },
  delete(table: string, id: string) { const d = this.getAll(table).filter((r: any) => r.id !== id); localStorage.setItem(table, JSON.stringify(d)); return true },
  query(table: string, filters: Record<string, any>) { return this.getAll(table).filter((r: any) => Object.keys(filters).every(k => { if (!filters[k]) return true; const v = r[k]; const fv = filters[k]; return typeof fv === 'string' ? (v ?? '').toString().toLowerCase().includes(fv.toLowerCase()) : v === fv })) },
  getProductsByCapability(capId: string) { const links = this.query('pm_capabilityproduct', { pm_capabilityid: capId }); const products = this.getAll('pm_product'); return links.map((l: any) => products.find((p: any) => p.id === l.pm_productname)).filter(Boolean) },
  getCapabilitiesByProduct(prodId: string) { const links = this.query('pm_capabilityproduct', { pm_productname: prodId }); const caps = this.getAll('pm_capability'); return links.map((l: any) => caps.find((c: any) => c.id === l.pm_capabilityid)).filter(Boolean) },
  getEpicsByProject(projId: string) { return this.query('pm_epic', { pm_projectname: projId }) },
  getUserStoriesByEpic(epicId: string) { return this.query('pm_userstory', { pm_epicid: epicId }) },
  getRisksByProject(projId: string) { return this.query('pm_risk', { pm_projectname: projId }) },
  getDependenciesByRisk(riskId: string) { return this.query('pm_dependency', { pm_riskid: riskId }) },
  getLookupName(table: string, id: string): string { if (!id) return '—'; const rec = this.getById(table, id); return rec ? (rec.pm_name || rec.pm_title || rec.pm_summary || rec.pm_detail || rec.id) : '—' },
  getResourceName(id: string): string { return this.getLookupName('pm_resource', id) }
}

