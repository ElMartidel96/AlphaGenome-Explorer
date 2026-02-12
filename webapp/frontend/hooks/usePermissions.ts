'use client'

import { useProfileStore } from '@/lib/store'
import { hasPermission, getPermissions, type Permission } from '@/lib/auth/permissions'
import type { UserRole } from '@/lib/supabase/types'

export function usePermissions() {
  const role = useProfileStore((s) => s.role)

  return {
    role,
    can: (permission: Permission) => hasPermission(role, permission),
    permissions: getPermissions(role),
    isPremium: role === 'PREMIUM' || role === 'ADMIN',
    isAdmin: role === 'ADMIN',
  }
}
