import type { Record_ } from '../types'

const TABLE_MAP: Record<string, string> = {
  pm_test: 'cr506_PMT_pm_test1',
  pm_resource: 'cr506_PMT_resource',
  pm_capability: 'cr506_PMT_capability',
  pm_product: 'cr506_PMT_product',
  pm_capabilityproduct: 'cr506_PMT_capabilityproduct',
  pm_requirement: 'cr506_PMT_requirement',
  pm_project: 'cr506_PMT_project',
  pm_control: 'cr506_PMT_control',
  pm_epic: 'cr506_PMT_epic',
  pm_userstory: 'cr506_PMT_userstory',
  pm_assignment: 'cr506_PMT_assignment',
  pm_risk: 'cr506_PMT_risk',
  pm_dependency: 'cr506_PMT_dependency',
  pm_demand: 'cr506_PMT_demand',
  pm_release: 'cr506_PMT_release',
  pm_releaseitem: 'cr506_PMT_releaseitem',
  pm_config: 'cr506_PMT_config',
  pm_checkpoint: 'cr506_PMT_checkpoint',
  pm_user: 'cr506_PMT_user',
}

const DV_TABLES = Object.keys(TABLE_MAP)

function tableToLogical(table: string): string {
  return TABLE_MAP[table] || table
}

export async function createDataverseService() {
  let module: any
  try {
    module = await import('@microsoft/power-apps/data')
  } catch {
    return null
  }

  let client: any
  try {
    client = module.getClient({ dataSources: [] })
  } catch {
    return null
  }

  if (!client) return null

  const service = {
    getAll: async (table: string): Promise<any[]> => {
      if (!DV_TABLES.includes(table)) return []
      const logical = tableToLogical(table)
      try {
        const result = await client.retrieveMultipleRecordsAsync(logical)
        return result.success ? (result.value || []) : []
      } catch { return [] }
    },

    getById: async (table: string, id: string): Promise<any | null> => {
      if (!DV_TABLES.includes(table)) return null
      try {
        const result = await client.retrieveRecordAsync(tableToLogical(table), id)
        return result.success ? (result.value || null) : null
      } catch { return null }
    },

    create: async (table: string, record: Record_): Promise<any | null> => {
      if (!DV_TABLES.includes(table)) return null
      try {
        const result = await client.createRecordAsync(tableToLogical(table), record)
        return result.success ? (result.value || record) : null
      } catch { return null }
    },

    update: async (table: string, id: string, updates: Record_): Promise<any | null> => {
      if (!DV_TABLES.includes(table)) return null
      try {
        const result = await client.updateRecordAsync(tableToLogical(table), id, updates)
        return result.success ? updates : null
      } catch { return null }
    },

    delete: async (table: string, id: string): Promise<boolean> => {
      if (!DV_TABLES.includes(table)) return false
      try {
        const result = await client.deleteRecordAsync(tableToLogical(table), id)
        return result.success
      } catch { return false }
    },

    query: async (table: string, filters: Record<string, any>): Promise<any[]> => {
      const all = await service.getAll(table)
      if (!all.length) return []
      return all.filter((r: any) =>
        Object.keys(filters).every(k => {
          if (!filters[k]) return true
          const v = r[k]
          const fv = filters[k]
          return typeof fv === 'string'
            ? (v ?? '').toString().toLowerCase().includes(fv.toLowerCase())
            : v === fv
        })
      )
    },

    getLookupName: async (table: string, id: string): Promise<string> => {
      if (!id) return '—'
      const rec = await service.getById(table, id)
      if (!rec) return '—'
      return rec.pm_name || rec.pm_title || rec.pm_summary || rec.pm_detail || rec.id || '—'
    },

    getResourceName: async (id: string): Promise<string> => {
      return await service.getLookupName('pm_resource', id)
    },
  }

  return service
}
