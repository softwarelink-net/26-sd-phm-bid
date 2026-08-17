import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const phiMasking = ref(localStorage.getItem('sdphm_mask') !== 'off')
  const realtimeStatus = ref('ONLINE')
  const notices = ref([
    { id: 1, title: '检验科同步 2 条乙肝表面抗原阳性预警', time: '08:21', level: 'high' },
    { id: 2, title: 'ESD 术后随访任务今日到期 5 条', time: '09:04', level: 'medium' },
    { id: 3, title: '省平台直报通道心跳正常', time: '09:30', level: 'low' },
  ])

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setMasking(on) {
    phiMasking.value = on
    localStorage.setItem('sdphm_mask', on ? 'on' : 'off')
  }

  return { sidebarCollapsed, phiMasking, realtimeStatus, notices, toggleSidebar, setMasking }
})
