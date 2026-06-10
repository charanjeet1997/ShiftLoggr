import { create } from 'zustand'
import type { RoleDef } from '../types'
import { getRoles } from '../api/roles'
import { BUILTIN_ROLES } from '../constants/permissions'

// Caches the roles collection so permission checks don't re-fetch per component.
interface RolesState {
  roles: RoleDef[]
  loaded: boolean
  load: () => Promise<void>
  refresh: () => Promise<void>
}

export const useRolesStore = create<RolesState>((set) => ({
  roles: BUILTIN_ROLES,
  loaded: false,
  load: async () => {
    try {
      set({ roles: await getRoles(), loaded: true })
    } catch {
      set({ roles: BUILTIN_ROLES, loaded: true })
    }
  },
  refresh: async () => {
    try {
      set({ roles: await getRoles() })
    } catch {
      /* keep current */
    }
  },
}))
