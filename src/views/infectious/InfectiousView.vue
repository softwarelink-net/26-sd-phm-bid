<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, ShieldCheck, X } from 'lucide-vue-next'
import { fetchInfectious, submitInfectious, reviewInfectious, REPORT_STATUS, displayName } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const app = useAppStore()
const perm = usePermissionStore()
const list = ref([])
const drawer = ref(false)
const intercept = ref(true)
const form = reactive({
  patient_name: '赵志强',
  disease_name: '乙型病毒性肝炎',
  disease_category: '乙类',
  source_department: '检验科',
  lab_indicator: 'HBsAg 阳性 / HBV-DNA 1.8E3 IU/mL',
})

const masked = computed(() => perm.mustMask(auth.role) || app.phiMasking)
const canReport = computed(() => perm.canWrite(auth.role, 'M3'))
const canReview = computed(() => perm.canReview(auth.role, 'M3'))

const statusClass = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-700',
  APPROVED_REPORTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-rose-50 text-rose-700',
}

async function load() {
  list.value = await fetchInfectious()
}

async function createCard() {
  await submitInfectious({ ...form, reporter_id: auth.user?.id })
  drawer.value = false
  await load()
}

async function review(row, status) {
  await reviewInfectious(row.id, status)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">传染病与阳性指征智能预警直报</h1>
        <p class="mt-1 text-sm text-slate-500">对接检验 / 病理 / 内镜，病毒性肝炎、结核等阳性自动截获并生成网报卡</p>
      </div>
      <button v-if="canReport" class="btn-primary" @click="drawer = true">
        <Plus class="h-4 w-4" /> 一键生成网报卡
      </button>
    </div>

    <div class="panel flex items-start gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <label class="mt-0.5 flex items-center gap-2">
        <input v-model="intercept" type="checkbox" class="rounded border-amber-300 text-primary-600" />
        检验科阳性自动拦截
      </label>
      <p v-if="intercept">已模拟截获 HBsAg、HEV-IgM、T-SPOT 阳性样本，待公卫科审核后直报省平台。</p>
    </div>

    <div class="panel overflow-hidden">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>报卡编号</th>
              <th>患者</th>
              <th>病种 / 类别</th>
              <th>发现科室</th>
              <th>阳性指标</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="font-mono text-xs">{{ r.report_code }}</td>
              <td>{{ displayName(r, masked) }}</td>
              <td>{{ r.disease_name }} <span class="text-slate-400">/ {{ r.disease_category }}</span></td>
              <td>{{ r.source_department }}</td>
              <td class="max-w-xs text-xs">{{ r.lab_indicator }}</td>
              <td><span class="badge" :class="statusClass[r.report_status]">{{ REPORT_STATUS[r.report_status] }}</span></td>
              <td class="space-x-2 whitespace-nowrap">
                <button
                  v-if="canReview && r.report_status === 'PENDING_REVIEW'"
                  class="text-xs text-emerald-700 hover:underline"
                  @click="review(r, 'APPROVED_REPORTED')"
                >审核直报</button>
                <button
                  v-if="canReview && r.report_status === 'PENDING_REVIEW'"
                  class="text-xs text-rose-600 hover:underline"
                  @click="review(r, 'REJECTED')"
                >驳回</button>
                <span v-else class="text-xs text-slate-400">{{ r.reported_at || '—' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-slate-900/40" @click.self="drawer = false">
      <aside class="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="flex items-center gap-2 text-lg font-semibold"><ShieldCheck class="h-5 w-5 text-primary-600" /> 网报卡生成</h2>
          <button @click="drawer = false"><X class="h-4 w-4" /></button>
        </div>
        <form class="space-y-3" @submit.prevent="createCard">
          <label class="block text-xs text-slate-500">患者姓名<input v-model="form.patient_name" class="input-light" required /></label>
          <label class="block text-xs text-slate-500">病种<input v-model="form.disease_name" class="input-light" required /></label>
          <label class="block text-xs text-slate-500">类别
            <select v-model="form.disease_category" class="input-light">
              <option>甲类</option><option>乙类</option><option>丙类</option><option>阳性预警</option>
            </select>
          </label>
          <label class="block text-xs text-slate-500">发现科室<input v-model="form.source_department" class="input-light" /></label>
          <label class="block text-xs text-slate-500">阳性指标<textarea v-model="form.lab_indicator" rows="3" class="input-light" /></label>
          <button class="btn-primary w-full">提交待审</button>
        </form>
      </aside>
    </div>
  </div>
</template>
