<script setup>
import { computed, onMounted, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { fetchSystem, updateConfig } from '@/api/client'
import { ROLE_LABELS as LABELS } from '@/stores/permission'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const perm = usePermissionStore()
const data = ref({ users: [], configs: [], audit: [] })

const canWrite = computed(() => auth.role === 'SUPER_ADMIN')
const canExport = computed(() => perm.canExport(auth.role, 'M6'))

async function load() {
  data.value = await fetchSystem()
}

async function toggleFlag(row) {
  if (!canWrite.value || !row.is_feature_flag) return
  const next = row.config_value === 'true' ? 'false' : 'true'
  await updateConfig(row.config_key, next)
  await load()
}

function exportLogs() {
  const blob = new Blob([JSON.stringify(data.value.audit, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'sdphm-audit-logs.json'
  a.click()
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">系统管理与审计追溯</h1>
        <p class="mt-1 text-sm text-slate-500">用户角色、Feature Flags、PHI 脱敏规则与不可篡改访问日志</p>
      </div>
      <button v-if="canExport" class="btn-ghost" @click="exportLogs">
        <Download class="h-4 w-4" /> 导出审计日志
      </button>
    </div>

    <section class="panel overflow-hidden">
      <div class="panel-header">角色与账号</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>账号</th>
              <th>科室</th>
              <th>角色</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in data.users" :key="u.id">
              <td>{{ u.real_name }}</td>
              <td class="font-mono text-xs">{{ u.username }}</td>
              <td>{{ u.department }}</td>
              <td>{{ LABELS[u.role] || u.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel overflow-hidden">
      <div class="panel-header">Feature Flags / 系统配置</div>
      <ul class="divide-y divide-slate-100">
        <li v-for="c in data.configs" :key="c.config_key" class="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p class="font-mono text-xs text-slate-500">{{ c.config_key }}</p>
            <p class="text-sm text-slate-700">{{ c.description }}</p>
          </div>
          <button
            v-if="c.is_feature_flag"
            class="rounded-full px-3 py-1 text-xs font-medium"
            :class="c.config_value === 'true' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
            :disabled="!canWrite"
            @click="toggleFlag(c)"
          >
            {{ c.config_value === 'true' ? '已开启' : '已关闭' }}
          </button>
          <span v-else class="max-w-xs truncate font-mono text-xs text-slate-500">{{ c.config_value }}</span>
        </li>
      </ul>
    </section>

    <section class="panel overflow-hidden">
      <div class="panel-header">数据访问审计</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>时间</th>
              <th>操作者</th>
              <th>动作</th>
              <th>资源</th>
              <th>详情</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data.audit" :key="a.id">
              <td class="whitespace-nowrap font-mono text-xs">{{ a.created_at }}</td>
              <td>{{ a.actor || a.user_id }}</td>
              <td><span class="badge bg-slate-100 text-slate-700">{{ a.action_type }}</span></td>
              <td class="font-mono text-xs">{{ a.resource_target }}</td>
              <td class="text-xs">{{ a.details }}</td>
              <td class="font-mono text-xs">{{ a.ip_address }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
