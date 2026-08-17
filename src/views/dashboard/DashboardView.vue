<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Activity, FolderHeart, Siren, CalendarCheck, Timer } from 'lucide-vue-next'
import { fetchStats } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const stats = ref(null)
const funnelRef = ref(null)
const trendRef = ref(null)
const districtRef = ref(null)
let charts = []

const countdown = computed(() => {
  const end = new Date('2026-08-25T09:00:00+08:00').getTime()
  const diff = Math.max(0, end - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
})

let timer = null

async function renderCharts() {
  charts.forEach((c) => c.dispose())
  charts = []
  const s = stats.value
  if (!s) return
  const echarts = await import('echarts')

  if (funnelRef.value) {
    const c = echarts.init(funnelRef.value)
    c.setOption({
      color: ['#0284c7', '#0ea5e9', '#14b8a6', '#0f766e', '#0369a1'],
      tooltip: { trigger: 'item' },
      series: [{
        type: 'funnel',
        left: '8%',
        width: '84%',
        minSize: '18%',
        gap: 4,
        label: { formatter: '{b}\n{c}' },
        data: s.funnel,
      }],
    })
    charts.push(c)
  }

  if (trendRef.value) {
    const c = echarts.init(trendRef.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['乙肝', '结核', '戊肝', '其他'] },
      grid: { left: 40, right: 16, top: 36, bottom: 28 },
      xAxis: { type: 'category', data: s.infectious_trend.months },
      yAxis: { type: 'value' },
      series: [
        { name: '乙肝', type: 'line', smooth: true, data: s.infectious_trend.hbv },
        { name: '结核', type: 'line', smooth: true, data: s.infectious_trend.tb },
        { name: '戊肝', type: 'line', smooth: true, data: s.infectious_trend.hev },
        { name: '其他', type: 'line', smooth: true, data: s.infectious_trend.other },
      ],
      color: ['#0284c7', '#f97316', '#0f766e', '#64748b'],
    })
    charts.push(c)
  }

  if (districtRef.value) {
    const c = echarts.init(districtRef.value)
    c.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 56, right: 16, top: 16, bottom: 28 },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: s.districts.map((d) => d.name) },
      series: [{
        type: 'bar',
        data: s.districts.map((d) => d.value),
        itemStyle: { color: '#0f766e', borderRadius: [0, 4, 4, 0] },
      }],
    })
    charts.push(c)
  }
}

function onResize() {
  charts.forEach((c) => c.resize())
}

onMounted(async () => {
  stats.value = await fetchStats()
  renderCharts()
  window.addEventListener('resize', onResize)
  timer = setInterval(() => { stats.value = { ...stats.value } }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  charts.forEach((c) => c.dispose())
  clearInterval(timer)
})
</script>

<template>
  <div class="space-y-6">
    <section class="relative overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-700 via-primary-700 to-teal-800 p-6 text-white md:p-8">
      <p class="text-xs uppercase tracking-wider text-sky-100/80">山东第一医科大学附属消化病医院 · 竞争性磋商原型</p>
      <h1 class="mt-2 max-w-3xl text-2xl font-semibold md:text-3xl">消化道早癌筛查 · 专科慢病 · 传染病直报一体化公卫工作台</h1>
      <p class="mt-3 max-w-3xl text-sm leading-relaxed text-sky-100/90">
        项目编号 {{ stats?.tender?.tender_no || 'SDGP370000000202602007491' }} · 采购 1 套公卫管理信息平台 · 预算 {{ stats?.tender?.budget || '100,000.00' }} 元 · 合同履行 60 日历天。
      </p>
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="(unit, key) in { days: '天', hours: '时', minutes: '分', seconds: '秒' }" :key="key" class="rounded-lg bg-white/10 px-3 py-3 text-center backdrop-blur">
          <p class="font-mono text-2xl font-semibold">{{ String(countdown[key] ?? 0).padStart(2, '0') }}</p>
          <p class="mt-1 text-xs text-sky-100/80">{{ unit }}</p>
        </div>
      </div>
      <p class="mt-3 flex items-center gap-2 text-xs text-amber-200">
        <Timer class="h-3.5 w-3.5" />
        响应截止：2026-08-25 09:00（北京时间）
      </p>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="panel p-4">
        <p class="label-muted">早癌筛查覆盖率</p>
        <p class="stat-value mt-2">{{ stats?.screening_coverage ?? '--' }}%</p>
        <p class="mt-1 text-xs text-slate-400">适龄队列完成问卷/便潜血</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">专科慢病建档</p>
        <p class="stat-value mt-2">{{ stats?.chronic_total ?? '--' }}</p>
        <p class="mt-1 text-xs text-slate-400">萎缩性胃炎 / 息肉术后 / 脂肪肝等</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">传染病待审卡片</p>
        <p class="stat-value mt-2 text-orange-600">{{ stats?.infectious_pending ?? '--' }}</p>
        <p class="mt-1 text-xs text-slate-400">检验阳性自动截获待公卫审核</p>
      </div>
      <div class="panel p-4">
        <p class="label-muted">随访履约达标率</p>
        <p class="stat-value mt-2 text-secondary-700">{{ stats?.followup_rate ?? '--' }}%</p>
        <p class="mt-1 text-xs text-slate-400">90 天默认周期 · 多端任务调度</p>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-1">
        <div class="panel-header">消化道早癌筛查漏斗</div>
        <div ref="funnelRef" class="h-72 w-full px-2 py-2" />
      </div>
      <div class="panel lg:col-span-1">
        <div class="panel-header">传染病月度趋势</div>
        <div ref="trendRef" class="h-72 w-full px-2 py-2" />
      </div>
      <div class="panel lg:col-span-1">
        <div class="panel-header">慢病建档地域分布（济南）</div>
        <div ref="districtRef" class="h-72 w-full px-2 py-2" />
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <RouterLink to="/chronic" class="panel group flex items-start gap-4 p-5 transition hover:border-primary-300">
        <div class="rounded-lg bg-sky-50 p-2.5 text-primary-700"><FolderHeart class="h-5 w-5" /></div>
        <div>
          <h3 class="font-medium text-slate-800">慢病档案工作站</h3>
          <p class="mt-1 text-xs text-slate-500">风险评级 · 生命周期 · {{ auth.roleLabel }}</p>
        </div>
      </RouterLink>
      <RouterLink to="/infectious" class="panel group flex items-start gap-4 p-5 transition hover:border-primary-300">
        <div class="rounded-lg bg-orange-50 p-2.5 text-orange-600"><Siren class="h-5 w-5" /></div>
        <div>
          <h3 class="font-medium text-slate-800">传染病预警直报</h3>
          <p class="mt-1 text-xs text-slate-500">LIS/病理阳性拦截与网报卡</p>
        </div>
      </RouterLink>
      <RouterLink to="/screening" class="panel group flex items-start gap-4 p-5 transition hover:border-primary-300">
        <div class="rounded-lg bg-teal-50 p-2.5 text-secondary-700"><CalendarCheck class="h-5 w-5" /></div>
        <div>
          <h3 class="font-medium text-slate-800">随访履约引擎</h3>
          <p class="mt-1 text-xs text-slate-500">高危队列 · 任务派发 · 回填</p>
        </div>
      </RouterLink>
      <div class="panel flex items-start gap-4 p-5">
        <div class="rounded-lg bg-slate-100 p-2.5 text-slate-600"><Activity class="h-5 w-5" /></div>
        <div>
          <h3 class="font-medium text-slate-800">病种结构</h3>
          <p class="mt-1 text-xs text-slate-500">
            <span v-for="d in stats?.disease_mix || []" :key="d.name" class="mr-2">{{ d.name }} {{ d.value }}%</span>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
