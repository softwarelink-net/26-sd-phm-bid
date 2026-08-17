import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as apiLogin } from '@/api/client'
import { ROLE_LABELS, usePermissionStore } from '@/stores/permission'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('sdphm_token') || '')
  const user = ref(JSON.parse(localStorage.getItem('sdphm_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const role = computed(() => user.value?.role || '')
  const roleLabel = computed(() => ROLE_LABELS[role.value] || role.value)
  const displayName = computed(() => user.value?.real_name || user.value?.username || '访客')

  function hasRole(roles = []) {
    if (!roles.length) return true
    if (role.value === 'SUPER_ADMIN') return true
    return roles.includes(role.value)
  }

  function canAccessModule(moduleCode) {
    return usePermissionStore().canAccess(role.value, moduleCode)
  }

  async function login(username, password) {
    const res = await apiLogin(username, password)
    if (!res.success) throw new Error(res.error || '登录失败')
    token.value = res.token
    user.value = res.user
    localStorage.setItem('sdphm_token', res.token)
    localStorage.setItem('sdphm_user', JSON.stringify(res.user))
    return res.user
  }

  function switchRolePreview(nextUser) {
    user.value = nextUser
    localStorage.setItem('sdphm_user', JSON.stringify(nextUser))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('sdphm_token')
    localStorage.removeItem('sdphm_user')
  }

  return {
    token,
    user,
    isAuthenticated,
    role,
    roleLabel,
    displayName,
    hasRole,
    canAccessModule,
    login,
    switchRolePreview,
    logout,
  }
})
