<script setup>
import { RouterView } from 'vue-router'
import TopBanner from '@/components/TopBanner.vue'
</script>

<template>
  <TopBanner />
  <div class="min-h-screen" style="padding-top: 40px">
    <RouterView />
  </div>
</template>
