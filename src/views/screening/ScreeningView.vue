<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { CalendarPlus, Phone, X } from 'lucide-vue-next'
import {
  fetchFollowup,
  fetchChronic,
  assignFollowup,
  completeFollowup,
  FOLLOW_STATUS,
  FOLLOW_METHOD,
  displayName,
} from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const app = useAppStore()
const perm = usePermissionStore()
const tasks = ref([])
const records = ref([])
const drawer = ref(false)
const execId = ref('')
const form = reactive({
  chronic_record_id: '',
  plan_followup_date: '2026-08-25',
  followup_method: 'PHONE',
  executor_id: 'u_nurse',
})
const execForm = reactive({ clinical_feedback: '', followup_status: 'COMPLETED', actual_followup_date: '2026-08-17', next_followup_date: '2026-11-15' })

const masked = computed(() => perm.mustMask(auth.role) || app.phiMasking)
const canAssign = computed(() => auth.role === 'SUPER_ADMIN' || auth.role === 'PH_DIRECTOR' || auth.role === 'CLINIC_DOCTOR')
const canExec = computed(() => auth.role === 'SUPER_ADMIN' || auth.role === 'FOLLOWUP_NURSE' || auth.role === 'PH_DIRECTOR')

const statusClass = {
  PENDING: 'bg-sky-50 text-sky-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  MISSED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
}

async function load() {
  tasks.value = await fetchFollowup()
  records.value = await fetchChronic()
}

async function assign() {
  const rec = records.value.find((r) => r.id === form.chronic_record_id)
  await assignFollowup({
    ...form,
    patient_name_mask: rec?.patient_name_mask,
    disease_type: rec?.disease_type,
  })
  drawer.value = false
  await load()
}

async function saveExec() {
  await completeFollowup(execId.value, { ...execForm })
  execId.value = ''
  await load()
}

function openExec(row) {
  execId.value = row.id
  execForm.clinical_feedback = row.clinical_feedback || ''
  execForm.followup_status = 'COMPLETED'
  execForm.actual_followup_date = new Date().toISOString().slice(0, 10)
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">消化道早癌筛查与随访履约引擎</h1>
        <p class="mt-1 text-sm text-slate-500">筛查队列、高危预警、自动化随访计划生成与执行回填</p>
      </div>
      <button v-if="canAssign" class="btn-secondary" @click="drawer = true">
        <CalendarPlus class="h-4 w-4" /> 派发随访任务
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-3">
      <div class="panel p-4"><p class="label-muted">待执行</p><p class="stat-value mt-1">{{ tasks.filter(t => t.followup_status === 'PENDING').length }}</p></div>
      <div class="panel p-4"><p class="label-muted">已完成</p><p class="stat-value mt-1 text-secondary-700">{{ tasks.filter(t => t.followup_status === 'COMPLETED').length }}</p></div>
      <div class="panel p-4"><p class="label-muted">失访</p><p class="stat-value mt-1 text-rose-600">{{ tasks.filter(t => t.followup_status === 'MISSED').length }}</p></div>
    </div>

    <div class="panel overflow-hidden">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>患者 / 病种</th>
              <th>计划日期</th>
              <th>方式</th>
              <th>状态</th>
              <th>临床反馈</th>
              <th>下次随访</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tasks" :key="t.id">
              <td>
                <p class="font-medium">{{ displayName(t, masked) }}</p>
                <p class="text-xs text-slate-400">{{ t.disease_type }}</p>
              </td>
              <td>{{ t.plan_followup_date }}</td>
              <td>{{ FOLLOW_METHOD[t.followup_method] }}</td>
              <td><span class="badge" :class="statusClass[t.followup_status]">{{ FOLLOW_STATUS[t.followup_status] }}</span></td>
              <td class="max-w-xs text-xs">{{ t.clinical_feedback || '—' }}</td>
              <td>{{ t.next_followup_date || '—' }}</td>
              <td>
                <button
                  v-if="canExec && t.followup_status === 'PENDING'"
                  class="inline-flex items-center gap-1 text-xs text-primary-700 hover:underline"
                  @click="openExec(t)"
                >
                  <Phone class="h-3.5 w-3.5" /> 执行回填
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-slate-900/40" @click.self="drawer = false">
      <aside class="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">派发随访任务</h2>
          <button @click="drawer = false"><X class="h-4 w-4" /></button>
        </div>
        <form class="space-y-3" @submit.prevent="assign">
          <label class="block text-xs text-slate-500">关联慢病档案
            <select v-model="form.chronic_record_id" required class="input-light">
              <option disabled value="">请选择</option>
              <option v-for="r in records" :key="r.id" :value="r.id">{{ r.patient_name_mask }} · {{ r.disease_type }}</option>
            </select>
          </label>
          <label class="block text-xs text-slate-500">计划日期<input v-model="form.plan_followup_date" type="date" class="input-light" /></label>
          <label class="block text-xs text-slate-500">随访方式
            <select v-model="form.followup_method" class="input-light">
              <option value="PHONE">电话</option>
              <option value="WECHAT">微信</option>
              <option value="CLINIC_VISIT">门诊复诊</option>
              <option value="HOME_VISIT">入户</option>
            </select>
          </label>
          <button class="btn-primary w-full">生成任务</button>
        </form>
      </aside>
    </div>

    <div v-if="execId" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40" @click.self="execId = ''">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 class="mb-4 text-lg font-semibold">随访执行记录</h2>
        <form class="space-y-3" @submit.prevent="saveExec">
          <label class="block text-xs text-slate-500">实际随访日期<input v-model="execForm.actual_followup_date" type="date" class="input-light" /></label>
          <label class="block text-xs text-slate-500">结果
            <select v-model="execForm.followup_status" class="input-light">
              <option value="COMPLETED">已完成</option>
              <option value="MISSED">失访</option>
              <option value="CANCELLED">取消</option>
            </select>
          </label>
          <label class="block text-xs text-slate-500">症状与用药遵从度<textarea v-model="execForm.clinical_feedback" rows="4" required class="input-light" placeholder="如：无黑便，质子泵抑制剂规律服用…" /></label>
          <label class="block text-xs text-slate-500">下次随访<input v-model="execForm.next_followup_date" type="date" class="input-light" /></label>
          <div class="flex gap-2">
            <button type="button" class="btn-ghost flex-1" @click="execId = ''">取消</button>
            <button class="btn-primary flex-1">保存记录</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
