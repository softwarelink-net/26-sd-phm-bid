import { createRouter, createWebHistory } from 'vue-router'
import { setupGuards } from './guard'

const ALL = ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'FOLLOWUP_NURSE', 'AUDITOR']

const routes = [
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { public: true, title: '登录' },
      },
    ],
  },
  {
    path: '/forgot-password',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue'),
        meta: { public: true, title: '找回密码' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '公卫态势大屏', module: 'M1', roles: ALL },
      },
      {
        path: 'chronic',
        name: 'chronic',
        component: () => import('@/views/chronic/ChronicView.vue'),
        meta: { title: '消化专科慢病建档', module: 'M2', roles: ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'FOLLOWUP_NURSE', 'AUDITOR'] },
      },
      {
        path: 'infectious',
        name: 'infectious',
        component: () => import('@/views/infectious/InfectiousView.vue'),
        meta: { title: '传染病预警直报', module: 'M3', roles: ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'AUDITOR'] },
      },
      {
        path: 'screening',
        name: 'screening',
        component: () => import('@/views/screening/ScreeningView.vue'),
        meta: { title: '早癌筛查与随访', module: 'M4', roles: ['SUPER_ADMIN', 'PH_DIRECTOR', 'CLINIC_DOCTOR', 'FOLLOWUP_NURSE', 'AUDITOR'] },
      },
      {
        path: 'exchange',
        name: 'exchange',
        component: () => import('@/views/exchange/ExchangeView.vue'),
        meta: { title: '公卫数据交换池', module: 'M5', roles: ['SUPER_ADMIN', 'PH_DIRECTOR', 'AUDITOR'] },
      },
      {
        path: 'system',
        name: 'system',
        component: () => import('@/views/system/SystemView.vue'),
        meta: { title: '系统管理与审计', module: 'M6', roles: ['SUPER_ADMIN', 'PH_DIRECTOR', 'AUDITOR'] },
      },
      {
        path: '403',
        name: 'forbidden',
        component: () => import('@/views/ForbiddenView.vue'),
        meta: { title: '无访问权限', public: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

setupGuards(router)

export default router
