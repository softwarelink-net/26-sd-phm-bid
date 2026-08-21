<template>
  <div class="phm-top-banner">
    <div class="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pr-3">
      <span class="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400"></span>
      <span class="truncate">山东第一医科大学附属消化病医院公共卫生管理平台原型演示</span>
    </div>
    <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
      <span class="hidden xl:inline">获取网站源码，请访问：</span>
      <a
        href="https://github.com/softwarelink-net/26-sd-phm-bid"
        target="_blank"
        rel="noopener noreferrer"
        class="font-semibold underline transition-colors duration-150 hover:text-amber-300"
      >
        <span class="xl:hidden">GitHub 源码</span>
        <span class="hidden xl:inline">https://github.com/softwarelink-net/26-sd-phm-bid</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.phm-top-banner {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  width: 100%;
  height: 40px;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background-image: linear-gradient(to right, #1d4ed8, #4338ca, #0f766e);
  padding: 0 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.25);
}
@media (min-width: 640px) {
  .phm-top-banner {
    font-size: 0.875rem;
  }
}
</style>
