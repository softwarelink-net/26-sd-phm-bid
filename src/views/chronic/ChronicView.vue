<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Search, X } from 'lucide-vue-next'
import { fetchChronic, saveChronic, RISK_LABEL, RISK_CLASS, displayName } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const app = useAppStore()
const perm = usePermissionStore()

const list = ref([])
const keyword = ref('')
const risk = ref('')
const drawer = ref(false)
const saving = ref(false)
const form = reactive({
  patient_name: '',
  patient_id_card: '',
  gender: 'M',
  age: 50,
  disease_type: '慢性萎缩性胃炎伴中度肠化',
  risk_level: 'MEDIUM',
  hospital_record_no: '',
  first_diagnosis_date: '2026-08-17',
  district: '历下区',
})

const masked = computed(() => perm.mustMask(auth.role) || app.phiMasking)
const canEnter = computed(() => perm.canWrite(auth.role, 'M2'))

const filtered = computed(() =>
  list.value.filter((r) => {
    const hit = !keyword.value || `${r.patient_name_mask}${r.hospital_record_no}${r.disease_type}`.includes(keyword.value)
    return hit && (!risk.value || r.risk_level === risk.value)
  }),
)

async function load() {
  list.value = await fetchChronic()
}

async function submit() {
  if (!form.patient_name || !form.hospital_record_no) return
  saving.value = true
  try {
    await saveChronic({ ...form, diagnosis_doctor_id: auth.user?.id })
    drawer.value = false
    await load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">消化专科慢病建档与管理</h1>
        <p class="mt-1 text-sm text-slate-500">慢性萎缩性胃炎、溃疡性结肠炎、胃肠息肉术后、脂肪肝等档案生命周期与健康评级</p>
      </div>
      <button v-if="canEnter" class="btn-primary" @click="drawer = true">
        <Plus class="h-4 w-4" /> 新建档案
      </button>
    </div>

    <div class="panel flex flex-wrap items-center gap-3 p-3">
      <div class="relative min-w-[220px] flex-1">
        <Search class="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input v-model="keyword" class="input-light pl-9" placeholder="检索脱敏姓名 / 病历号 / 病种" />
      </div>
      <select v-model="risk" class="input-light w-40">
        <option value="">全部风险</option>
        <option value="LOW">低危</option>
        <option value="MEDIUM">中危</option>
        <option value="HIGH">高危</option>
        <option value="CRITICAL">极高危</option>
      </select>
    </div>

    <div class="panel overflow-hidden">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>患者</th>
              <th>证件号</th>
              <th>病种</th>
              <th>风险</th>
              <th>病历号</th>
              <th>首诊日期</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td class="font-medium">{{ displayName(r, masked) }} · {{ r.gender === 'M' ? '男' : '女' }}/{{ r.age }}</td>
              <td class="font-mono text-xs">{{ r.patient_id_card_mask }}</td>
              <td>{{ r.disease_type }}</td>
              <td>
                <span class="badge" :class="RISK_CLASS[r.risk_level]">{{ RISK_LABEL[r.risk_level] }}</span>
              </td>
              <td class="font-mono text-xs">{{ r.hospital_record_no }}</td>
              <td>{{ r.first_diagnosis_date }}</td>
              <td><span class="badge bg-sky-50 text-sky-700">{{ r.current_status }}</span></td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="py-10 text-center text-slate-400">暂无匹配档案</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="drawer" class="fixed inset-0 z-50 flex justify-end bg-slate-900/40" @click.self="drawer = false">
      <aside class="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">新建专科慢病档案</h2>
          <button @click="drawer = false"><X class="h-4 w-4" /></button>
        </div>
        <form class="space-y-3" @submit.prevent="submit">
          <label class="block text-xs text-slate-500">患者姓名<input v-model="form.patient_name" required class="input-light" /></label>
          <label class="block text-xs text-slate-500">身份证号<input v-model="form.patient_id_card" required class="input-light" placeholder="演示环境将自动脱敏落库" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block text-xs text-slate-500">性别
              <select v-model="form.gender" class="input-light"><option value="M">男</option><option value="F">女</option></select>
            </label>
            <label class="block text-xs text-slate-500">年龄<input v-model.number="form.age" type="number" min="1" class="input-light" /></label>
          </div>
          <label class="block text-xs text-slate-500">病种
            <select v-model="form.disease_type" class="input-light">
              <option>慢性萎缩性胃炎伴中度肠化</option>
              <option>结肠多发腺瘤切除术后</option>
              <option>早期胃癌 ESD 术后</option>
              <option>溃疡性结肠炎（缓解期）</option>
              <option>非酒精性脂肪性肝炎</option>
              <option>胃溃疡愈合期</option>
            </select>
          </label>
          <label class="block text-xs text-slate-500">风险评级
            <select v-model="form.risk_level" class="input-light">
              <option value="LOW">低危</option>
              <option value="MEDIUM">中危</option>
              <option value="HIGH">高危</option>
              <option value="CRITICAL">极高危</option>
            </select>
          </label>
          <label class="block text-xs text-slate-500">院内病历号<input v-model="form.hospital_record_no" required class="input-light" /></label>
          <label class="block text-xs text-slate-500">首诊日期<input v-model="form.first_diagnosis_date" type="date" class="input-light" /></label>
          <button class="btn-primary w-full" :disabled="saving">{{ saving ? '保存中…' : '提交建档' }}</button>
        </form>
      </aside>
    </div>
  </div>
</template>
