<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const cursorDotRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const isHovering = ref(false)

// Configuration state
const config = ref({
  ring: {
    size: 40,
    duration: 0.5,
    ease: 'power3.out',
    opacity: 0.5,
    borderWidth: 1,
    mixBlend: true
  },
  dot: {
    size: 8,
    duration: 0.1,
    opacity: 1
  }
})

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'elastic.out(1, 0.3)',
  'bounce.out',
  'circ.out',
  'expo.out'
]

const defaults = {
  ring: { size: 40, duration: 0.5, ease: 'power3.out', opacity: 0.5, borderWidth: 1, mixBlend: true },
  dot: { size: 8, duration: 0.1, opacity: 1 }
}

const resetConfig = () => {
  config.value = JSON.parse(JSON.stringify(defaults))
}

// Computed styles
const ringStyle = computed(() => ({
  width: `${config.value.ring.size}px`,
  height: `${config.value.ring.size}px`,
  borderWidth: `${config.value.ring.borderWidth}px`,
  opacity: isHovering.value ? config.value.ring.opacity : 0,
  mixBlendMode: config.value.ring.mixBlend ? 'difference' : 'normal'
}))

const dotStyle = computed(() => ({
  width: `${config.value.dot.size}px`,
  height: `${config.value.dot.size}px`,
  opacity: isHovering.value ? config.value.dot.opacity : 0
}))

const onMouseMove = (e: MouseEvent) => {
  if (!demoRef.value) return
  
  const rect = demoRef.value.getBoundingClientRect()
  const isInside = (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  )
  
  if (!isInside) return
  
  const ringOffset = config.value.ring.size / 2
  const dotOffset = config.value.dot.size / 2
  
  if (cursorRef.value) {
    gsap.to(cursorRef.value, {
      x: e.clientX - rect.left - ringOffset,
      y: e.clientY - rect.top - ringOffset,
      duration: config.value.ring.duration,
      ease: config.value.ring.ease
    })
  }
  if (cursorDotRef.value) {
    gsap.to(cursorDotRef.value, {
      x: e.clientX - rect.left - dotOffset,
      y: e.clientY - rect.top - dotOffset,
      duration: config.value.dot.duration
    })
  }
}

const onMouseEnter = () => {
  isHovering.value = true
}

const onMouseLeave = () => {
  isHovering.value = false
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

const generatedCode = computed(() => {
  return `const onMouseMove = (e) => {
  // Ring
  gsap.to(ringRef, {
    x: e.clientX - ${config.value.ring.size / 2},
    y: e.clientY - ${config.value.ring.size / 2},
    duration: ${config.value.ring.duration},
    ease: '${config.value.ring.ease}'
  })
  // Dot
  gsap.to(dotRef, {
    x: e.clientX - ${config.value.dot.size / 2},
    y: e.clientY - ${config.value.dot.size / 2},
    duration: ${config.value.dot.duration}
  })
}`
})

const copyCode = async () => {
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Fluid Cursor</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden"
      style="cursor: none;"
      @mousemove="onMouseMove"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <!-- Custom Cursor (scoped to demo area) -->
      <div
        ref="cursorRef"
        class="pointer-events-none absolute top-0 left-0 rounded-full border border-white transition-opacity duration-300"
        :style="ringStyle"
      />
      <div
        ref="cursorDotRef"
        class="pointer-events-none absolute top-0 left-0 rounded-full bg-white transition-opacity duration-300"
        :style="dotStyle"
      />

      <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      <p class="mb-8 font-mono text-sm text-white/60">Move your cursor in this area</p>
      
      <!-- Demo Interactive Elements -->
      <div class="flex flex-wrap items-center justify-center gap-8">
        <div class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
          <span class="font-mono text-xs text-white/50 group-hover:text-white">Hover</span>
        </div>
        <div class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
          <span class="font-mono text-xs text-white/50 group-hover:text-white">Me</span>
        </div>
        <div class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
          <span class="font-mono text-xs text-white/50 group-hover:text-white">Too</span>
        </div>
      </div>
    </section>

    <!-- Controls Section -->
    <section class="border-b border-white/10 px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-6 flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Controls</span>
          <button
            class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="resetConfig"
          >
            <RotateCcw class="h-3 w-3" />
            Reset
          </button>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <!-- Ring Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Ring</h3>
            
            <!-- Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.ring.size }}px</span>
              </div>
              <input
                v-model.number="config.ring.size"
                type="range"
                min="20"
                max="100"
                step="2"
                class="w-full accent-white"
              />
            </div>

            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.ring.duration }}s</span>
              </div>
              <input
                v-model.number="config.ring.duration"
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                class="w-full accent-white"
              />
            </div>

            <!-- Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Easing</label>
              <select
                v-model="config.ring.ease"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>

            <!-- Border Width -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Border Width</label>
                <span class="font-mono text-xs text-white/40">{{ config.ring.borderWidth }}px</span>
              </div>
              <input
                v-model.number="config.ring.borderWidth"
                type="range"
                min="1"
                max="4"
                step="1"
                class="w-full accent-white"
              />
            </div>

            <!-- Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.ring.opacity }}</span>
              </div>
              <input
                v-model.number="config.ring.opacity"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                class="w-full accent-white"
              />
            </div>

            <!-- Mix Blend -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Mix Blend Difference</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.ring.mixBlend ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.ring.mixBlend = !config.ring.mixBlend"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.ring.mixBlend ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
          </div>

          <!-- Dot Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Dot</h3>
            
            <!-- Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.dot.size }}px</span>
              </div>
              <input
                v-model.number="config.dot.size"
                type="range"
                min="2"
                max="20"
                step="1"
                class="w-full accent-white"
              />
            </div>

            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.dot.duration }}s</span>
              </div>
              <input
                v-model.number="config.dot.duration"
                type="range"
                min="0"
                max="0.5"
                step="0.025"
                class="w-full accent-white"
              />
            </div>

            <!-- Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.dot.opacity }}</span>
              </div>
              <input
                v-model.number="config.dot.opacity"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                class="w-full accent-white"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Generated Code Section -->
    <section class="px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Generated Code</span>
          <button
            class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="copyCode"
          >
            <component :is="copied ? Check : Copy" class="h-3 w-3" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="mt-4 overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80"><code>{{ generatedCode }}</code></pre>
      </div>
    </section>

    <!-- Info Section -->
    <section class="border-t border-white/10 px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">About</h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
          Custom cursors add personality to interactive experiences. This implementation uses 
          two elements — a larger ring with delayed movement and a precise dot — to create 
          a fluid, organic feel. GSAP handles the smooth interpolation.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Hide the native cursor with <code class="text-white/80">cursor: none</code></p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Track mouse position with <code class="text-white/80">mousemove</code> event</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Animate cursor elements with different GSAP durations</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Use <code class="text-white/80">mix-blend-difference</code> for color inversion</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS mix-blend-mode</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
