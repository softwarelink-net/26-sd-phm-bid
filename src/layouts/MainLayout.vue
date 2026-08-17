<script setup>
import { computed, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  FolderHeart,
  Siren,
  CalendarCheck,
  ArrowLeftRight,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const auth = useAuthStore()
const app = useAppStore()
const perm = usePermissionStore()
const route = useRoute()
const router = useRouter()
const showNotices = ref(false)

const iconMap = {
  dashboard: LayoutDashboard,
  chronic: FolderHeart,
  infectious: Siren,
  screening: CalendarCheck,
  exchange: ArrowLeftRight,
  system: Shield,
}

const visibleNav = computed(() =>
  perm.navCatalog.filter((item) => perm.canAccess(auth.role, item.module)).map((item) => ({
    ...item,
    icon: iconMap[item.name],
  })),
)

const breadcrumbs = computed(() => {
  const crumbs = [{ label: '公卫工作台', to: '/dashboard' }]
  if (route.name && route.name !== 'dashboard') {
    crumbs.push({ label: route.meta.title || String(route.name), to: null })
  }
  return crumbs
})

const maskLocked = computed(() => perm.mustMask(auth.role))
const effectiveMask = computed(() => maskLocked.value || app.phiMasking)

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-40px)] bg-slate-50">
    <aside
      :class="[
        'sticky top-[40px] h-[calc(100vh-40px)] shrink-0 border-r border-slate-800 bg-slate-900 text-slate-100 transition-all duration-200',
        app.sidebarCollapsed ? 'w-[72px]' : 'w-60',
      ]"
    >
      <div class="flex h-14 items-center justify-between border-b border-slate-800 px-3">
        <div v-if="!app.sidebarCollapsed" class="min-w-0">
          <p class="truncate text-sm font-semibold text-sky-300">26-SD-PHM-BID</p>
          <p class="truncate text-[10px] text-slate-400">山一大附属消化病医院 · 公卫平台</p>
        </div>
        <button class="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" :title="app.sidebarCollapsed ? '展开' : '收起'" @click="app.toggleSidebar()">
          <ChevronRight v-if="app.sidebarCollapsed" class="h-4 w-4" />
          <ChevronLeft v-else class="h-4 w-4" />
        </button>
      </div>

      <nav class="space-y-1 overflow-y-auto p-2" style="max-height: calc(100vh - 180px)">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          :class="{ 'bg-sky-600/20 text-sky-300 ring-1 ring-sky-500/30': route.name === item.name }"
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span v-if="!app.sidebarCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-3">
        <div v-if="!app.sidebarCollapsed" class="mb-2 flex items-center gap-2 text-xs text-slate-400">
          <Shield class="h-3.5 w-3.5 text-emerald-400" />
          <span class="truncate">{{ auth.roleLabel }}</span>
        </div>
        <button class="inline-flex w-full items-center justify-start gap-2 rounded-md px-2 py-2 text-sm text-slate-300 hover:bg-slate-800" @click="logout">
          <LogOut class="h-4 w-4" />
          <span v-if="!app.sidebarCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-[40px] z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
        <nav class="flex items-center gap-2 text-sm text-slate-500">
          <template v-for="(c, i) in breadcrumbs" :key="i">
            <RouterLink v-if="c.to" :to="c.to" class="hover:text-primary-600">{{ c.label }}</RouterLink>
            <span v-else class="text-slate-800">{{ c.label }}</span>
            <span v-if="i < breadcrumbs.length - 1" class="text-slate-300">/</span>
          </template>
        </nav>
        <div class="flex items-center gap-3 text-xs">
          <button
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
            :class="effectiveMask ? 'border-teal-200 bg-teal-50 text-teal-800' : 'border-amber-200 bg-amber-50 text-amber-800'"
            :disabled="maskLocked"
            :title="maskLocked ? '审计角色强制脱敏，不可关闭' : '切换 PHI 字段脱敏'"
            @click="!maskLocked && app.setMasking(!app.phiMasking)"
          >
            <EyeOff v-if="effectiveMask" class="h-3.5 w-3.5" />
            <Eye v-else class="h-3.5 w-3.5" />
            {{ effectiveMask ? '脱敏开' : '脱敏关' }}
          </button>
          <div class="relative">
            <button class="relative rounded-md p-1.5 text-slate-500 hover:bg-slate-100" @click="showNotices = !showNotices">
              <Bell class="h-4 w-4" />
              <span class="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </button>
            <div v-if="showNotices" class="absolute right-0 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <p class="px-2 py-1 text-[11px] font-semibold text-slate-500">系统通知</p>
              <ul class="divide-y divide-slate-100">
                <li v-for="n in app.notices" :key="n.id" class="px-2 py-2">
                  <p class="text-slate-700">{{ n.title }}</p>
                  <p class="mt-0.5 text-[11px] text-slate-400">{{ n.time }}</p>
                </li>
              </ul>
            </div>
          </div>
          <div class="hidden items-center gap-2 sm:flex">
            <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span class="text-slate-400">D1 {{ app.realtimeStatus }}</span>
          </div>
          <div class="text-right">
            <p class="font-medium text-slate-800">{{ auth.displayName }}</p>
            <p class="text-slate-400">{{ auth.user?.department }} · {{ auth.roleLabel }}</p>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
