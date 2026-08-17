<template>
  <div
    class="fixed top-0 left-0 z-[9999] flex h-[40px] w-full items-center justify-between bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 px-4 text-xs font-medium text-white shadow-md sm:text-sm"
  >
    <div class="flex items-center space-x-2 truncate">
      <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
      <span class="truncate">山东第一医科大学附属消化病医院公共卫生管理平台原型演示</span>
    </div>
    <div class="flex shrink-0 items-center space-x-3">
      <span class="hidden sm:inline">获取网站源码，请访问：</span>
      <a
        href="https://github.com/softwarelink-net/26-sd-phm-bid"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold underline transition-colors duration-150 hover:text-amber-300"
      >
        https://github.com/softwarelink-net/26-sd-phm-bid
      </a>
    </div>
  </div>
</template>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 40px;
  z-index: 9999;
}
</style>
