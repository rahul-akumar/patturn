<script setup lang="ts">
import { Star } from 'lucide-vue-next'

const route = useRoute()

const isLab = computed(() => route.path.startsWith('/lab'))
</script>

<template>
  <header class="sticky top-0 z-50 flex h-[53px] w-full shrink-0 items-center border-b border-white/10 bg-dark-900">
    <!-- Left section: mirrors the LabNav sidebar width -->
    <div class="flex h-full w-64 shrink-0 items-center border-r border-white/10 px-6">
      <div class="flex items-center gap-8">
        <NuxtLink to="/" class="font-mono text-xs tracking-[0.3em] uppercase transition-colors hover:text-white/70">
          Patturn
        </NuxtLink>
        <div class="h-4 w-px bg-white/20" />
        <nav class="flex items-center gap-6">
          <NuxtLink to="/" :class="[
            'font-mono text-xs transition-colors',
            route.path === '/' ? 'text-white' : 'text-white/40 hover:text-white'
          ]">
            Home
          </NuxtLink>
          <NuxtLink to="/lab" :class="[
            'font-mono text-xs transition-colors',
            isLab ? 'text-white' : 'text-white/40 hover:text-white'
          ]">
            Lab
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Right section: mirrors the main content area, right-aligns the CTA -->
    <div class="flex flex-1 items-center justify-end px-6">
      <a href="https://github.com/your-username/patturn" target="_blank" rel="noopener noreferrer">
        <MagneticButton :strength="0.4" size="sm" :icon="Star" icon-position="left">
          Star on GitHub
        </MagneticButton>
      </a>
    </div>
  </header>
</template>
