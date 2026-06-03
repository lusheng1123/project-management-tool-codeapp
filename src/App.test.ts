import { describe, it, expect, beforeEach } from 'vitest'
import {
  DS,
  seedAllIfNeeded,
  badgeClass,
  getFields,
  getModelName,
  genId,
  MODELS
} from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('DataService (DS)', () => {
  beforeEach(() => {
    localStorage.clear()
    DS.create('pm_resource', { pm_name: 'Test User', pm_role: 'Dev', pm_department: 'IT', pm_status: 'Active' })
  })

  it('getAll returns records for a table', () => {
    const records = DS.getAll('pm_resource')
    expect(records).toHaveLength(1)
    expect(records[0].pm_name).toBe('Test User')
  })

  it('getAll returns empty array for unknown table', () => {
    expect(DS.getAll('nonexistent')).toEqual([])
  })

  it('create adds a record with generated id', () => {
    const rec = DS.create('pm_resource', { pm_name: 'New User', pm_status: 'Active' })
    expect(rec.id).toBeDefined()
    expect(rec.id).toMatch(/^pm_resource_/)
    expect(DS.getAll('pm_resource')).toHaveLength(2)
  })

  it('getById finds a record', () => {
    const all = DS.getAll('pm_resource')
    const id = all[0].id
    const found = DS.getById('pm_resource', id)
    expect(found).toBeDefined()
    expect(found?.pm_name).toBe('Test User')
  })

  it('getById returns null for non-existent id', () => {
    expect(DS.getById('pm_resource', 'nonexistent')).toBeNull()
  })

  it('update modifies a record', () => {
    const all = DS.getAll('pm_resource')
    const id = all[0].id
    DS.update('pm_resource', id, { pm_name: 'Updated Name', pm_status: 'Inactive' })
    const updated = DS.getById('pm_resource', id)
    expect(updated?.pm_name).toBe('Updated Name')
    expect(updated?.pm_status).toBe('Inactive')
    expect(updated?.pm_role).toBe('Dev')
  })

  it('update returns null for non-existent id', () => {
    expect(DS.update('pm_resource', 'nonexistent', { pm_name: 'X' })).toBeNull()
  })

  it('delete removes a record', () => {
    const all = DS.getAll('pm_resource')
    const id = all[0].id
    DS.delete('pm_resource', id)
    expect(DS.getAll('pm_resource')).toHaveLength(0)
    expect(DS.getById('pm_resource', id)).toBeNull()
  })

  it('query filters by string (case-insensitive partial match)', () => {
    DS.create('pm_resource', { pm_name: 'Alice Johnson', pm_department: 'Business', pm_status: 'Active' })
    DS.create('pm_resource', { pm_name: 'Bob Smith', pm_department: 'IT', pm_status: 'On Leave' })
    const results = DS.query('pm_resource', { pm_department: 'business' })
    expect(results).toHaveLength(1)
    expect(results[0].pm_name).toBe('Alice Johnson')
  })

  it('query filters by exact match for non-strings', () => {
    const filtered = DS.query('pm_resource', { pm_status: 'Active' })
    expect(filtered).toHaveLength(1)
  })

  it('query returns all when no filters', () => {
    expect(DS.query('pm_resource', {})).toHaveLength(1)
  })

  it('getLookupName returns display name', () => {
    const name = DS.getLookupName('pm_resource', DS.getAll('pm_resource')[0].id)
    expect(name).toBe('Test User')
  })

  it('getLookupName returns em dash for empty id', () => {
    expect(DS.getLookupName('pm_resource', '')).toBe('\u2014')
  })

  it('getResourceName delegates to getLookupName', () => {
    const id = DS.getAll('pm_resource')[0].id
    expect(DS.getResourceName(id)).toBe('Test User')
  })

  it('create and delete are independent between tables', () => {
    DS.create('pm_product', { pm_name: 'Product A' })
    expect(DS.getAll('pm_resource')).toHaveLength(1)
    expect(DS.getAll('pm_product')).toHaveLength(1)
    DS.delete('pm_resource', DS.getAll('pm_resource')[0].id)
    expect(DS.getAll('pm_product')).toHaveLength(1)
  })
})

describe('seedAllIfNeeded', () => {
  it('does nothing when already seeded', () => {
    localStorage.setItem('pm_seeded', 'true')
    seedAllIfNeeded()
    expect(DS.getAll('pm_resource')).toHaveLength(0)
  })

  it('seeds all 12 tables', () => {
    seedAllIfNeeded()
    expect(DS.getAll('pm_resource')).toHaveLength(10)
    expect(DS.getAll('pm_capability')).toHaveLength(6)
    expect(DS.getAll('pm_product')).toHaveLength(6)
    expect(DS.getAll('pm_capabilityproduct').length).toBeGreaterThan(0)
    expect(DS.getAll('pm_requirement')).toHaveLength(8)
    expect(DS.getAll('pm_project')).toHaveLength(6)
    expect(DS.getAll('pm_control').length).toBeGreaterThan(0)
    expect(DS.getAll('pm_epic')).toHaveLength(6)
    expect(DS.getAll('pm_userstory')).toHaveLength(8)
    expect(DS.getAll('pm_risk')).toHaveLength(6)
    expect(DS.getAll('pm_dependency')).toHaveLength(6)
    expect(DS.getAll('pm_config').length).toBeGreaterThan(0)
  })

  it('sets pm_seeded flag', () => {
    seedAllIfNeeded()
    expect(localStorage.getItem('pm_seeded')).toBe('true')
  })

  it('is idempotent', () => {
    seedAllIfNeeded()
    const count = DS.getAll('pm_resource').length
    seedAllIfNeeded()
    expect(DS.getAll('pm_resource')).toHaveLength(count)
  })

  it('seeded data has cross-references', () => {
    seedAllIfNeeded()
    const resources = DS.getAll('pm_resource')
    const projects = DS.getAll('pm_project')
    expect(resources.every((r: any) => r.id && r.pm_name)).toBe(true)
    expect(projects.every((p: any) => p.id && p.pm_name)).toBe(true)
  })
})

describe('badgeClass', () => {
  it('returns badge-green for active/approved/live/new/completed/g', () => {
    for (const v of ['Active', 'Approved', 'Live', 'G', 'Completed', 'New', 'Linked']) {
      expect(badgeClass(v)).toBe('badge-green')
    }
  })

  it('returns badge-amber for pending/review/onboarding/in progress/a', () => {
    for (const v of ['Pending', 'Review', 'Onboarding', 'In Progress', 'On Leave', 'A', 'Prioritized']) {
      expect(badgeClass(v)).toBe('badge-amber')
    }
  })

  it('returns badge-blue for inactive/rejected/critical/r/dev phases', () => {
    for (const v of ['Inactive', 'Rejected', 'Critical', 'R', 'Development Phase 1', 'Development Phase 2', 'On Hold']) {
      expect(badgeClass(v)).toBe('badge-blue')
    }
  })

  it('returns badge-gray for unknown/null/empty', () => {
    expect(badgeClass('Unknown')).toBe('badge-gray')
    expect(badgeClass('')).toBe('badge-gray')
    expect(badgeClass(null as any)).toBe('badge-gray')
    expect(badgeClass(undefined as any)).toBe('badge-gray')
  })

  it('is case-insensitive', () => {
    expect(badgeClass('active')).toBe('badge-green')
  })
})

describe('genId', () => {
  it('generates id with prefix', () => {
    expect(genId('test')).toMatch(/^test_\d+_[a-z0-9]+$/)
  })

  it('generates unique ids', () => {
    const ids = Array.from({ length: 10 }, () => genId())
    expect(new Set(ids).size).toBe(10)
  })

  it('uses default prefix tbl', () => {
    expect(genId()).toMatch(/^tbl_/)
  })
})

describe('getFields', () => {
  it('returns fields for known table', () => {
    const fields = getFields('pm_resource')
    expect(fields).toHaveLength(9)
    expect(fields[0].name).toBe('pm_name')
  })

  it('returns empty array for unknown table', () => {
    expect(getFields('unknown')).toEqual([])
  })

})

describe('getModelName', () => {
  it('returns display name', () => {
    expect(getModelName('pm_resource')).toBe('Resource')
    expect(getModelName('pm_project')).toBe('Project')
  })

  it('returns table name for unknown', () => {
    expect(getModelName('unknown')).toBe('unknown')
  })
})

describe('MODELS', () => {
  it('has all 12 tables', () => {
    const tables = ['pm_resource', 'pm_capability', 'pm_product', 'pm_requirement', 'pm_project', 'pm_control', 'pm_epic', 'pm_userstory', 'pm_risk', 'pm_dependency', 'pm_capabilityproduct', 'pm_config']
    tables.forEach(t => {
      expect(MODELS[t]).toBeDefined()
      expect(MODELS[t].name).toBeTruthy()
      expect(Array.isArray(MODELS[t].fields)).toBe(true)
      expect(MODELS[t].fields.length).toBeGreaterThan(0)
    })
  })
})

describe('DS relationship methods (seeded)', () => {
  beforeEach(() => {
    localStorage.clear()
    seedAllIfNeeded()
  })

  it('getProductsByCapability returns linked products', () => {
    const products = DS.getProductsByCapability('cap_1')
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((p: any) => p.id && p.pm_name)).toBe(true)
  })

  it('getCapabilitiesByProduct returns linked capabilities', () => {
    const caps = DS.getCapabilitiesByProduct('prod_5')
    expect(caps.length).toBeGreaterThan(0)
  })

  it('getEpicsByProject returns epics for a project', () => {
    const epics = DS.getEpicsByProject('proj_1')
    expect(epics.length).toBeGreaterThan(0)
    expect(epics[0].pm_projectname).toBe('proj_1')
  })

  it('getUserStoriesByEpic returns stories', () => {
    const stories = DS.getUserStoriesByEpic('epic_1')
    expect(stories.length).toBeGreaterThan(0)
  })

  it('getRisksByProduct returns risks', () => {
    const risks = DS.getRisksByProduct('prod_1')
    expect(risks.length).toBeGreaterThan(0)
  })

  it('getDependenciesByProduct returns deps', () => {
    const deps = DS.getDependenciesByProduct('prod_1')
    expect(deps.length).toBeGreaterThan(0)
  })
})
