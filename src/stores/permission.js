import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const ROLE_LABELS = {
  SUPER_ADMIN: '超级管理员',
  PH_DIRECTOR: '公卫科主任',
  CLINIC_DOCTOR: '专科/门诊临床医生',
  FOLLOWUP_NURSE: '专职随访护士',
  AUDITOR: '医院质控/审计员',
}

export const MODULE_MATRIX = {
  SUPER_ADMIN: { M1: 'rw', M2: 'rw', M3: 'rw', M4: 'rw', M5: 'rw', M6: 'rw' },
  PH_DIRECTOR: { M1: 'read_export', M2: 'rw_review', M3: 'rw_review', M4: 'rw_review', M5: 'rw_export', M6: 'read' },
  CLINIC_DOCTOR: { M1: 'read', M2: 'read_enter', M3: 'read_report', M4: 'read_assign', M5: 'none', M6: 'none' },
  FOLLOWUP_NURSE: { M1: 'read', M2: 'read', M3: 'none', M4: 'read_exec', M5: 'none', M6: 'none' },
  AUDITOR: { M1: 'read', M2: 'mask_read', M3: 'mask_read', M4: 'mask_read', M5: 'audit_read', M6: 'read_export' },
}

export const ROUTE_MODULE = {
  dashboard: 'M1',
  chronic: 'M2',
  infectious: 'M3',
  screening: 'M4',
  exchange: 'M5',
  system: 'M6',
}

export const usePermissionStore = defineStore('permission', () => {
  function accessOf(role, moduleCode) {
    return MODULE_MATRIX[role]?.[moduleCode] || 'none'
  }

  function canAccess(role, moduleCode) {
    if (!role) return false
    if (role === 'SUPER_ADMIN') return true
    return accessOf(role, moduleCode) !== 'none'
  }

  function canWrite(role, moduleCode) {
    const a = accessOf(role, moduleCode)
    return a.includes('rw') || a.includes('enter') || a.includes('report') || a.includes('assign') || a.includes('exec')
  }

  function canReview(role, moduleCode) {
    return role === 'SUPER_ADMIN' || accessOf(role, moduleCode).includes('review')
  }

  function canExport(role, moduleCode) {
    return role === 'SUPER_ADMIN' || accessOf(role, moduleCode).includes('export')
  }

  function mustMask(role) {
    return role === 'AUDITOR' || accessOf(role, 'M2') === 'mask_read'
  }

  const navCatalog = computed(() => [
    { name: 'dashboard', label: '公卫态势大屏', module: 'M1' },
    { name: 'chronic', label: '专科慢病建档', module: 'M2' },
    { name: 'infectious', label: '传染病预警直报', module: 'M3' },
    { name: 'screening', label: '早癌筛查随访', module: 'M4' },
    { name: 'exchange', label: '公卫数据交换', module: 'M5' },
    { name: 'system', label: '系统管理审计', module: 'M6' },
  ])

  return { accessOf, canAccess, canWrite, canReview, canExport, mustMask, navCatalog }
})

export const useMaskHint = () => {
  const hint = ref('PHI 字段级脱敏已启用')
  return hint
}
