<script setup>
import { RouterLink } from 'vue-router'
import { ShieldOff } from 'lucide-vue-next'
</script>

<template>
  <div class="mx-auto max-w-lg py-16 text-center">
    <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
      <ShieldOff class="h-7 w-7" />
    </div>
    <h1 class="text-xl font-semibold text-slate-800">403 · 当前角色无权访问该模块</h1>
    <p class="mt-2 text-sm text-slate-500">
      系统已按 RBAC 矩阵拦截。如需开通公卫数据交换或系统审计权限，请由超级管理员在「系统管理」中授权。
    </p>
    <RouterLink to="/dashboard" class="btn-primary mt-6">返回态势大屏</RouterLink>
  </div>
</template>
