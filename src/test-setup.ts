import { beforeEach } from 'vitest'

const store: Record<string, string> = {}

const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  get length() { return Object.keys(store).length },
  key: (index: number) => Object.keys(store)[index] ?? null
}

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true })

beforeEach(() => {
  mockLocalStorage.clear()
})
