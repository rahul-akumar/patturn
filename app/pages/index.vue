<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { MoveUpRight } from 'lucide-vue-next'

const heroRef = ref<HTMLElement | null>(null)
const titleChars = ref<HTMLElement[]>([])
const labItems = ref<HTMLElement[]>([])

const experiments = [
  { id: '001', title: 'Magnetic Buttons', status: 'ready' },
  { id: '002', title: 'Fluid Cursor', status: 'active' },
  { id: '003', title: 'Morphing Shapes', status: 'soon' },
  { id: '004', title: 'Scroll Velocity', status: 'soon' },
  { id: '005', title: 'Text Distortion', status: 'soon' },
  { id: '006', title: '3D Interactions', status: 'soon' }
]

onMounted(() => {
  // Hero animation
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
  
  tl.from(titleChars.value, {
    y: 120,
    opacity: 0,
    rotateX: -90,
    stagger: 0.05,
    duration: 1.2
  })
  .from('.hero-line', {
    scaleX: 0,
    duration: 1,
    transformOrigin: 'left'
  }, '-=0.5')
  .from('.hero-subtitle', {
    y: 30,
    opacity: 0,
    duration: 0.8
  }, '-=0.5')
  .from(labItems.value, {
    y: 60,
    opacity: 0,
    stagger: 0.1,
    duration: 0.8
  }, '-=0.3')
})

const setTitleRef = (el: any, index: number) => {
  if (el) titleChars.value[index] = el
}

const setLabRef = (el: any, index: number) => {
  if (el) labItems.value[index] = el
}
</script>

<template>
  <div class="relative overflow-hidden">
    <!-- Hero Section -->
    <section ref="heroRef" class="relative flex min-h-[calc(100vh-61px)] flex-col justify-center px-6 md:px-12">
      <div class="max-w-6xl">
        <!-- Main Title -->
        <h1 class="mb-4 overflow-hidden font-sans text-[12vw] font-bold leading-[0.85] tracking-[-0.04em] md:text-[10vw]">
          <span class="inline-block perspective-1000">
            <span
              v-for="(char, i) in 'PATTURN'.split('')"
              :key="i"
              :ref="(el) => setTitleRef(el, i)"
              class="inline-block"
            >{{ char }}</span>
          </span>
        </h1>

        <!-- Horizontal Line -->
        <div class="hero-line mb-8 h-px w-full bg-white/20" />

        <!-- Subtitle -->
        <p class="hero-subtitle max-w-md font-mono text-sm leading-relaxed text-white/50">
          An experimental playground for next-gen interfaces,<br />
          interactions, and motion design.
        </p>

        <!-- CTA -->
        <div class="hero-subtitle mt-12">
          <NuxtLink to="/lab">
            <MagneticButton :strength="0.4">
              Enter Lab
            </MagneticButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-12 left-6 md:left-12">
        <div class="flex items-center gap-3">
          <div class="h-12 w-px bg-white/20">
            <div class="h-4 w-px animate-bounce bg-white" />
          </div>
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Scroll</span>
        </div>
      </div>

      <!-- Version Badge -->
      <div class="absolute bottom-12 right-6 md:right-12">
        <span class="font-mono text-[10px] text-white/30">v0.0.1 — experiments</span>
      </div>
    </section>

    <!-- Lab Section -->
    <section class="min-h-screen px-6 py-32 md:px-12">
      <div class="mb-16 flex items-end justify-between">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Lab / Experiments</span>
          <h2 class="mt-2 text-4xl font-bold tracking-tight md:text-5xl">In Progress</h2>
        </div>
        <span class="font-mono text-xs text-white/40">{{ experiments.length }} items</span>
      </div>

      <!-- Experiment Grid -->
      <div class="grid gap-1">
        <div
          v-for="(exp, index) in experiments"
          :key="exp.id"
          :ref="(el) => setLabRef(el, index)"
          class="group relative flex cursor-pointer items-center justify-between border-t border-white/10 py-6 transition-colors hover:bg-white/[0.02]"
        >
          <div class="flex items-center gap-8">
            <span class="font-mono text-xs text-white/30">{{ exp.id }}</span>
            <span class="text-lg font-medium tracking-tight transition-transform group-hover:translate-x-2">
              {{ exp.title }}
            </span>
          </div>
          <div class="flex items-center gap-6">
            <span
              :class="[
                'font-mono text-[10px] uppercase tracking-widest',
                exp.status === 'active' ? 'text-green-500' : exp.status === 'ready' ? 'text-white/60' : 'text-white/30'
              ]"
            >
              {{ exp.status }}
            </span>
            <MoveUpRight
              class="h-4 w-4 text-white/30 transition-all group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 px-6 py-12 md:px-12">
      <div class="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div class="font-mono text-xs text-white/40">
          © 2026 Patturn. Experimental Design Lab.
        </div>
        <div class="flex items-center gap-8">
          <a href="#" class="font-mono text-xs text-white/40 transition-colors hover:text-white">GitHub</a>
          <a href="#" class="font-mono text-xs text-white/40 transition-colors hover:text-white">Twitter</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
</style>
