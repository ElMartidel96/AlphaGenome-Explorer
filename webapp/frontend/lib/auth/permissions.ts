import type { UserRole } from '@/lib/supabase/types'

export type Permission =
  | 'analyze_variant'
  | 'analyze_batch'
  | 'use_ai_coach'
  | 'export_vcf'
  | 'export_pdf'
  | 'save_analysis'
  | 'share_analysis'
  | 'use_crispr_sim'
  | 'use_organism_designer'
  | 'use_drug_target'
  | 'api_unlimited'
  | 'manage_users'
  | 'view_admin_panel'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  FREE: [
    'analyze_variant',
    'save_analysis',
    'export_vcf',
  ],
  PREMIUM: [
    'analyze_variant',
    'analyze_batch',
    'use_ai_coach',
    'export_vcf',
    'export_pdf',
    'save_analysis',
    'share_analysis',
    'use_crispr_sim',
    'use_organism_designer',
    'use_drug_target',
  ],
  ADMIN: [
    'analyze_variant',
    'analyze_batch',
    'use_ai_coach',
    'export_vcf',
    'export_pdf',
    'save_analysis',
    'share_analysis',
    'use_crispr_sim',
    'use_organism_designer',
    'use_drug_target',
    'api_unlimited',
    'manage_users',
    'view_admin_panel',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function isPremiumTool(toolName: string): boolean {
  const premiumTools = [
    'epigenetic-coach',
    'organism-designer',
    'drug-target-finder',
    'batch-analyzer',
    'gene-therapy-companion',
    'rare-variants-network',
  ]
  return premiumTools.includes(toolName)
}
