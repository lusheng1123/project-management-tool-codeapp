import { createLocalStorageService } from './localStorage'

// In DEV (localhost): always use localStorage (sync, fast, no auth needed)
// In PROD (Power Apps host): would use Dataverse, but we keep localStorage
//   as the primary backend until each table is migrated.
// To enable Dataverse per-table: call createDataverseService() explicitly.
// 
// Auto-detection (future):
//   const isPowerApps = !!(window as any).__POWERAPPS__
//   export const DS = isPowerApps
//     ? await createDataverseService()
//     : createLocalStorageService()
// 
// For now, localStorage is always used so nothing breaks.

export { createLocalStorageService, genId } from './localStorage'
export { createDataverseService } from './dataverse'

export const DS = createLocalStorageService()
