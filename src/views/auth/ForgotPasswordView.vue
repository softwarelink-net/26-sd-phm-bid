<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel space-y-4 p-6">
    <h2 class="text-lg font-semibold text-slate-800">找回密码</h2>
    <p class="text-sm leading-relaxed text-slate-500">
      演示环境不开放自助重置。请使用 README 中的角色演示账号，或联系医院信息技术部开通院内统一身份认证。
    </p>
    <ul class="list-disc space-y-1 pl-5 text-xs text-slate-500">
      <li>超级管理员：admin@sdphm.cn</li>
      <li>公卫科主任：director@sdphm.cn</li>
      <li>临床医生：doctor@sdphm.cn</li>
      <li>随访护士：nurse@sdphm.cn</li>
    </ul>
    <RouterLink to="/login" class="btn-primary inline-flex">返回登录</RouterLink>
  </div>
</template>
