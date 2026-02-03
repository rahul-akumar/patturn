<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const route = useRoute()

const isLab = computed(() => route.path.startsWith('/lab'))
</script>

<template>
  <header class="sticky top-0 z-50 flex w-full shrink-0 items-center justify-between border-b border-white/10 bg-dark-900 px-6 py-5 md:px-12">
    <div class="flex items-center gap-8">
      <NuxtLink to="/" class="font-mono text-xs tracking-[0.3em] uppercase transition-colors hover:text-white/70">
        Patturn
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

    <a
      href="https://github.com/your-username/patturn"
      target="_blank"
      rel="noopener noreferrer"
      class="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-mono text-xs transition-all hover:border-white/40 hover:bg-white/5"
    >
      <Star :size="14" />
      <span>Star on GitHub</span>
    </a>
  </header>
</template>
