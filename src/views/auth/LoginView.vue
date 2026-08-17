<script setup>
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin@sdphm.cn')
const password = ref('Admin@2026!')
const loading = ref(false)
const errorMsg = ref('')

const demos = [
  { label: '超级管理员', username: 'admin@sdphm.cn', password: 'Admin@2026!' },
  { label: '公卫科主任', username: 'director@sdphm.cn', password: 'Director@2026!' },
  { label: '临床医生', username: 'doctor@sdphm.cn', password: 'Doctor@2026!' },
  { label: '随访护士', username: 'nurse@sdphm.cn', password: 'Nurse@2026!' },
  { label: '质控审计', username: 'auditor@sdphm.cn', password: 'Auditor@2026!' },
]

function fillDemo(d) {
  username.value = d.username
  password.value = d.password
}

async function submit() {
  errorMsg.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push(route.query.redirect || '/dashboard')
  } catch (e) {
    errorMsg.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <form class="panel space-y-5 p-6" @submit.prevent="submit">
    <div>
      <h2 class="text-lg font-semibold text-slate-800">身份认证</h2>
      <p class="mt-1 text-xs text-slate-400">RBAC · JWT · PHI 字段级脱敏会话</p>
    </div>

    <div class="space-y-3">
      <label class="block text-xs text-slate-500">
        工作邮箱
        <input v-model="username" type="email" required class="input-light" autocomplete="username" />
      </label>
      <label class="block text-xs text-slate-500">
        密码
        <input v-model="password" type="password" required class="input-light" autocomplete="current-password" />
      </label>
    </div>

    <p v-if="errorMsg" class="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
      {{ errorMsg }}
    </p>

    <button type="submit" class="btn-primary w-full" :disabled="loading">
      {{ loading ? '校验中…' : '登录控制台' }}
    </button>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="d in demos"
        :key="d.username"
        type="button"
        class="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:border-primary-400 hover:text-primary-700"
        @click="fillDemo(d)"
      >
        {{ d.label }}
      </button>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
      <RouterLink to="/forgot-password" class="text-primary-600 hover:text-primary-500">忘记密码</RouterLink>
      <span class="font-mono text-slate-400">SDGP370000000202602007491</span>
    </div>
  </form>
</template>
