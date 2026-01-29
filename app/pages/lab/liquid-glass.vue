<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const glassRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const reflectionRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Drag state
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

// Configuration state
const config = ref({
  blur: 20,
  opacity: 0.15,
  borderOpacity: 0.3,
  saturation: 1.8,
  reflectionSize: 150,
  reflectionOpacity: 0.4,
  reflectionBlur: 40,
  tiltStrength: 15,
  tiltDuration: 0.5,
  dragEnabled: true,
  dragEase: 0.15
})

const defaults = {
  blur: 20,
  opacity: 0.15,
  borderOpacity: 0.3,
  saturation: 1.8,
  reflectionSize: 150,
  reflectionOpacity: 0.4,
  reflectionBlur: 40,
  tiltStrength: 15,
  tiltDuration: 0.5,
  dragEnabled: true,
  dragEase: 0.15
}

const resetConfig = () => {
  config.value = { ...defaults }
  position.value = { x: 0, y: 0 }
  if (wrapperRef.value) {
    gsap.to(wrapperRef.value, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }
}

// Glass styles
const glassStyle = computed(() => ({
  backdropFilter: `blur(${config.value.blur}px) saturate(${config.value.saturation})`,
  WebkitBackdropFilter: `blur(${config.value.blur}px) saturate(${config.value.saturation})`,
  backgroundColor: `rgba(255, 255, 255, ${config.value.opacity})`,
  border: `1px solid rgba(255, 255, 255, ${config.value.borderOpacity})`
}))

const reflectionStyle = computed(() => ({
  width: `${config.value.reflectionSize}px`,
  height: `${config.value.reflectionSize}px`,
  opacity: config.value.reflectionOpacity,
  filter: `blur(${config.value.reflectionBlur}px)`
}))

// Drag handlers
const onMouseDown = (e: MouseEvent) => {
  if (!config.value.dragEnabled) return
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
}

const onMouseUp = () => {
  isDragging.value = false
}

const onGlobalMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !config.value.dragEnabled || !wrapperRef.value) return
  
  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y
  
  position.value = { x: newX, y: newY }
  
  gsap.to(wrapperRef.value, {
    x: newX,
    y: newY,
    duration: config.value.dragEase,
    ease: 'power2.out'
  })
}

// Tilt & reflection handlers
const onMouseMove = (e: MouseEvent) => {
  if (!glassRef.value || !reflectionRef.value) return
  
  const rect = glassRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // Calculate tilt
  const tiltX = ((y - centerY) / centerY) * config.value.tiltStrength
  const tiltY = ((centerX - x) / centerX) * config.value.tiltStrength
  
  gsap.to(glassRef.value, {
    rotateX: tiltX,
    rotateY: tiltY,
    duration: config.value.tiltDuration,
    ease: 'power2.out'
  })
  
  // Move reflection
  gsap.to(reflectionRef.value, {
    x: x - config.value.reflectionSize / 2,
    y: y - config.value.reflectionSize / 2,
    duration: 0.3,
    ease: 'power2.out'
  })
}

const onMouseLeave = () => {
  if (!glassRef.value) return
  
  gsap.to(glassRef.value, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.7,
    ease: 'elastic.out(1, 0.5)'
  })
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  // Global mouse events for drag
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onGlobalMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

const generatedCode = computed(() => {
  return `.glass {
  backdrop-filter: blur(${config.value.blur}px) saturate(${config.value.saturation});
  -webkit-backdrop-filter: blur(${config.value.blur}px) saturate(${config.value.saturation});
  background: rgba(255, 255, 255, ${config.value.opacity});
  border: 1px solid rgba(255, 255, 255, ${config.value.borderOpacity});
  border-radius: 24px;
}

.reflection {
  position: absolute;
  width: ${config.value.reflectionSize}px;
  height: ${config.value.reflectionSize}px;
  background: radial-gradient(circle, white 0%, transparent 70%);
  opacity: ${config.value.reflectionOpacity};
  filter: blur(${config.value.reflectionBlur}px);
  pointer-events: none;
}

/* 3D Tilt on hover */
gsap.to(element, {
  rotateX: tiltX * ${config.value.tiltStrength},
  rotateY: tiltY * ${config.value.tiltStrength},
  duration: ${config.value.tiltDuration}
})`
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
      <span class="text-lg font-medium tracking-tight">Liquid Glass</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden"
    >
      <!-- Sharp Background Pattern -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;" />
        
        <!-- Sharp colored shapes -->
        <div class="absolute left-[10%] top-[15%] h-32 w-32 rotate-12 bg-purple-500" />
        <div class="absolute right-[15%] top-[20%] h-24 w-24 rotate-45 bg-blue-500" />
        <div class="absolute left-[20%] bottom-[20%] h-40 w-20 -rotate-12 bg-pink-500" />
        <div class="absolute right-[25%] bottom-[15%] h-28 w-28 rounded-full bg-cyan-500" />
        <div class="absolute left-[45%] top-[10%] h-16 w-40 bg-yellow-500" />
        <div class="absolute right-[10%] top-[50%] h-36 w-12 rotate-45 bg-green-500" />
        
        <!-- Text elements -->
        <div class="absolute left-[5%] top-[40%] font-bold text-8xl text-white/30">GLASS</div>
        <div class="absolute right-[8%] bottom-[35%] font-bold text-6xl text-white/20">BLUR</div>
        
        <!-- Lines -->
        <div class="absolute left-0 top-[30%] h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div class="absolute left-0 bottom-[40%] h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        <!-- Instructions (part of background so glass blurs them) -->
        <div class="absolute inset-x-0 top-8 text-center font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo — Drag to move</div>
        <div class="absolute inset-x-0 bottom-8 text-center font-mono text-xs leading-relaxed text-white/40 px-6">Drag to move the card. Hover to see 3D tilt and light reflection.</div>
      </div>
      
      <!-- Glass Card Wrapper (for dragging) -->
      <div
        ref="wrapperRef"
        class="perspective-1000"
        :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging && config.dragEnabled }"
      >
        <div
          ref="glassRef"
          class="relative h-72 w-80 rounded-3xl p-8 shadow-2xl transform-gpu select-none"
          :style="glassStyle"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        >
          <!-- Reflection -->
          <div
            ref="reflectionRef"
            class="pointer-events-none absolute rounded-full bg-gradient-radial from-white to-transparent"
            :style="reflectionStyle"
          />
          
          <!-- Edge highlight -->
          <div class="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />
          
          <!-- Content -->
          <div class="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div class="mb-2 h-8 w-8 rounded-full bg-white/20" />
              <h3 class="text-xl font-semibold text-white">Glass Card</h3>
              <p class="mt-2 text-sm text-white/60">
                Hover and move your cursor to see the liquid glass effect with realistic light refraction.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-green-400" />
              <span class="text-xs text-white/50">Interactive</span>
            </div>
          </div>
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
          <!-- Glass Properties -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Glass Properties</h3>
            
            <!-- Blur -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Blur</label>
                <span class="font-mono text-xs text-white/40">{{ config.blur }}px</span>
              </div>
              <input
                v-model.number="config.blur"
                type="range"
                min="0"
                max="50"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Background Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Background Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.opacity }}</span>
              </div>
              <input
                v-model.number="config.opacity"
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Border Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Border Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.borderOpacity }}</span>
              </div>
              <input
                v-model.number="config.borderOpacity"
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Saturation -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Saturation</label>
                <span class="font-mono text-xs text-white/40">{{ config.saturation }}</span>
              </div>
              <input
                v-model.number="config.saturation"
                type="range"
                min="1"
                max="3"
                step="0.1"
                class="w-full"
              >
            </div>
          </div>

          <!-- Reflection & Tilt -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Reflection & Tilt</h3>
            
            <!-- Reflection Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reflection Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.reflectionSize }}px</span>
              </div>
              <input
                v-model.number="config.reflectionSize"
                type="range"
                min="50"
                max="300"
                step="10"
                class="w-full"
              >
            </div>

            <!-- Reflection Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reflection Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.reflectionOpacity }}</span>
              </div>
              <input
                v-model.number="config.reflectionOpacity"
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Reflection Blur -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reflection Blur</label>
                <span class="font-mono text-xs text-white/40">{{ config.reflectionBlur }}px</span>
              </div>
              <input
                v-model.number="config.reflectionBlur"
                type="range"
                min="10"
                max="80"
                step="5"
                class="w-full"
              >
            </div>

            <!-- Tilt Strength -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Tilt Strength</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltStrength }}°</span>
              </div>
              <input
                v-model.number="config.tiltStrength"
                type="range"
                min="0"
                max="30"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Tilt Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Tilt Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltDuration }}s</span>
              </div>
              <input
                v-model.number="config.tiltDuration"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Drag Enabled -->
            <div class="flex items-center justify-between pt-2">
              <label class="font-mono text-xs text-white/60">Drag Enabled</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.dragEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.dragEnabled = !config.dragEnabled"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.dragEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Drag Smoothness -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Drag Smoothness</label>
                <span class="font-mono text-xs text-white/40">{{ config.dragEase }}s</span>
              </div>
              <input
                v-model.number="config.dragEase"
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                class="w-full"
              >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Code Section -->
    <section class="px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Code</span>
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
          Liquid glass (glassmorphism) creates depth and hierarchy through transparency and blur. 
          This implementation adds realistic light reflection that follows the cursor and 
          3D perspective tilt for an immersive, tactile feel.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">backdrop-filter: blur()</code> creates the frosted glass effect</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Semi-transparent background + border adds depth layers</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Radial gradient follows cursor to simulate light reflection</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">3D transforms (rotateX/Y) create perspective tilt on hover</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS backdrop-filter</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS 3D Transforms</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.bg-gradient-radial {
  background: radial-gradient(circle, white 0%, transparent 70%);
}

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
