<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center px-12">
    <div class="max-w-lg text-center">
      <div class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/10">
        <Sparkles class="h-6 w-6 text-white/40" />
      </div>
      <h1 class="text-3xl font-bold tracking-tight">Component Lab</h1>
      <p class="mt-4 font-mono text-sm leading-relaxed text-white/50">
        Select a component from the sidebar to explore.<br >
        Each experiment showcases a unique interaction pattern.
      </p>
      <div class="mt-8 flex items-center justify-center gap-6">
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500" />
          <span class="font-mono text-[10px] text-white/40">Ready</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-yellow-500" />
          <span class="font-mono text-[10px] text-white/40">In Progress</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-white/20" />
          <span class="font-mono text-[10px] text-white/40">Soon</span>
        </div>
      </div>
    </div>
  </div>
</template>
