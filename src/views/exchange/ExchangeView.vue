<script setup>
import { computed, onMounted, ref } from 'vue'
import { RefreshCw, Download } from 'lucide-vue-next'
import { fetchExchange, syncExchange } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const perm = usePermissionStore()
const list = ref([])
const log = ref([
  { t: '2026-08-16 21:04:12', msg: '慢病档案 5 条字段映射失败：职业编码未对齐省标 GB/T 6565' },
  { t: '2026-08-16 21:00:08', msg: '传染病网报卡 128 条校验通过，已推送山东省公卫平台' },
  { t: '2026-08-15 22:10:33', msg: '随访履约记录 HMAC 签名校验通过' },
])

const canWrite = computed(() => perm.canWrite(auth.role, 'M5'))
const canExport = computed(() => perm.canExport(auth.role, 'M5') || auth.role === 'AUDITOR')

const statusClass = {
  SUCCESS: 'bg-emerald-50 text-emerald-700',
  PARTIAL: 'bg-amber-50 text-amber-700',
  PENDING: 'bg-sky-50 text-sky-700',
  FAILED: 'bg-rose-50 text-rose-700',
}

async function load() {
  list.value = await fetchExchange()
}

async function sync(row) {
  if (!canWrite.value) return
  await syncExchange(row.id)
  log.value.unshift({ t: new Date().toISOString().slice(0, 19).replace('T', ' '), msg: `${row.dataset} 重新清洗并推送完成` })
  await load()
}

function exportAudit() {
  const blob = new Blob([JSON.stringify(list.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'sdphm-exchange-audit.json'
  a.click()
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">卫健委标准接口与数据交换池</h1>
        <p class="mt-1 text-sm text-slate-500">国标 / 省标清洗、映射转换与直报状态审计</p>
      </div>
      <button v-if="canExport" class="btn-ghost" @click="exportAudit">
        <Download class="h-4 w-4" /> 导出审计包
      </button>
    </div>

    <div class="panel overflow-hidden">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>数据集</th>
              <th>标准</th>
              <th>状态</th>
              <th>记录 / 映射 / 失败</th>
              <th>最近同步</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="font-medium">{{ r.dataset }}</td>
              <td class="text-xs">{{ r.standard }}</td>
              <td><span class="badge" :class="statusClass[r.status]">{{ r.status }}</span></td>
              <td class="font-mono text-xs">{{ r.records }} / {{ r.mapped }} / {{ r.failed }}</td>
              <td class="text-xs">{{ r.last_sync || '未同步' }}</td>
              <td>
                <button v-if="canWrite" class="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline" @click="sync(r)">
                  <RefreshCw class="h-3.5 w-3.5" /> 重推
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">直报状态审计流水</div>
      <ul class="divide-y divide-slate-100 text-sm">
        <li v-for="(l, i) in log" :key="i" class="flex gap-4 px-4 py-3">
          <span class="shrink-0 font-mono text-xs text-slate-400">{{ l.t }}</span>
          <span class="text-slate-700">{{ l.msg }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
