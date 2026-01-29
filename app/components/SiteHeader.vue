<script setup lang="ts">
const route = useRoute()

const isLab = computed(() => route.path.startsWith('/lab'))
</script>

<template>
  <header class="fixed top-0 left-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 py-5 backdrop-blur-md md:px-12">
    <div class="flex items-center gap-8">
      <NuxtLink to="/" class="font-mono text-xs tracking-[0.3em] uppercase transition-colors hover:text-white/70">
        Patnova
      </NuxtLink>
      <div class="h-4 w-px bg-white/20" />
      <nav class="flex items-center gap-6">
        <NuxtLink
          to="/"
          :class="[
            'font-mono text-xs transition-colors',
            route.path === '/' ? 'text-white' : 'text-white/40 hover:text-white'
          ]"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/lab"
          :class="[
            'font-mono text-xs transition-colors',
            isLab ? 'text-white' : 'text-white/40 hover:text-white'
          ]"
        >
          Lab
        </NuxtLink>
      </nav>
    </div>
    <div class="flex items-center gap-3">
      <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span class="font-mono text-[10px] text-white/40">Live</span>
    </div>
  </header>
</template>
