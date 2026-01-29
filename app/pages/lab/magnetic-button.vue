<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const copied = ref(false)

let bounds: DOMRect | null = null

// Configuration state
const config = ref({
  strength: 0.4,
  textParallax: 0.5,
  moveDuration: 0.4,
  moveEase: 'power3.out',
  returnDuration: 0.7,
  returnEase: 'elastic.out(1, 0.3)',
  showFill: true
})

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'elastic.out(1, 0.3)',
  'elastic.out(1, 0.5)',
  'bounce.out',
  'circ.out',
  'expo.out'
]

const defaults = {
  strength: 0.4,
  textParallax: 0.5,
  moveDuration: 0.4,
  moveEase: 'power3.out',
  returnDuration: 0.7,
  returnEase: 'elastic.out(1, 0.3)',
  showFill: true
}

const resetConfig = () => {
  config.value = { ...defaults }
}

// Button interaction handlers
const onMouseMove = (e: MouseEvent) => {
  if (!buttonRef.value || !bounds) return
  
  const x = e.clientX - bounds.left - bounds.width / 2
  const y = e.clientY - bounds.top - bounds.height / 2
  
  gsap.to(buttonRef.value, {
    x: x * config.value.strength,
    y: y * config.value.strength,
    duration: config.value.moveDuration,
    ease: config.value.moveEase
  })
  
  if (textRef.value) {
    gsap.to(textRef.value, {
      x: x * config.value.strength * config.value.textParallax,
      y: y * config.value.strength * config.value.textParallax,
      duration: config.value.moveDuration,
      ease: config.value.moveEase
    })
  }
}

const onMouseLeave = () => {
  gsap.to(buttonRef.value, {
    x: 0,
    y: 0,
    duration: config.value.returnDuration,
    ease: config.value.returnEase
  })
  
  if (textRef.value) {
    gsap.to(textRef.value, {
      x: 0,
      y: 0,
      duration: config.value.returnDuration,
      ease: config.value.returnEase
    })
  }
}

const onMouseEnter = () => {
  if (buttonRef.value) {
    bounds = buttonRef.value.getBoundingClientRect()
  }
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  if (buttonRef.value) {
    bounds = buttonRef.value.getBoundingClientRect()
  }
})

const generatedCode = computed(() => {
  return `<script setup>
import { ref } from 'vue'
import gsap from 'gsap'

const buttonRef = ref(null)
const textRef = ref(null)
let bounds = null

const onMouseMove = (e) => {
  const x = e.clientX - bounds.left - bounds.width / 2
  const y = e.clientY - bounds.top - bounds.height / 2
  
  gsap.to(buttonRef.value, {
    x: x * ${config.value.strength},
    y: y * ${config.value.strength},
    duration: ${config.value.moveDuration},
    ease: '${config.value.moveEase}'
  })
  
  gsap.to(textRef.value, {
    x: x * ${(config.value.strength * config.value.textParallax).toFixed(2)},
    y: y * ${(config.value.strength * config.value.textParallax).toFixed(2)},
    duration: ${config.value.moveDuration},
    ease: '${config.value.moveEase}'
  })
}

const onMouseLeave = () => {
  gsap.to([buttonRef.value, textRef.value], {
    x: 0,
    y: 0,
    duration: ${config.value.returnDuration},
    ease: '${config.value.returnEase}'
  })
}

const onMouseEnter = () => {
  bounds = buttonRef.value.getBoundingClientRect()
}
<\/script>`
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
      <span class="text-lg font-medium tracking-tight">Magnetic Button</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef" class="flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <!-- Configurable Demo Button -->
      <button
        ref="buttonRef"
        class="group relative overflow-hidden border border-white/20 bg-transparent px-12 py-5 transition-colors hover:border-white/40"
        @mouseenter="onMouseEnter"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <span
          ref="textRef"
          class="relative z-10 block font-mono text-sm uppercase tracking-[0.2em]"
        >
          Hover Me
        </span>
        <span
          v-if="config.showFill"
          class="absolute inset-0 -z-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
        />
        <span
          v-if="config.showFill"
          class="absolute inset-0 z-10 flex items-center justify-center font-mono text-sm uppercase tracking-[0.2em] text-dark-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          Hover Me
        </span>
      </button>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        The button follows your cursor with configurable physics.<br />
        Adjust the controls below to experiment.
      </p>
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
          <!-- Movement Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Movement</h3>
            
            <!-- Strength -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Strength</label>
                <span class="font-mono text-xs text-white/40">{{ config.strength }}</span>
              </div>
              <input
                v-model.number="config.strength"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                class="w-full"
              />
            </div>

            <!-- Text Parallax -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Text Parallax</label>
                <span class="font-mono text-xs text-white/40">{{ config.textParallax }}</span>
              </div>
              <input
                v-model.number="config.textParallax"
                type="range"
                min="0"
                max="1"
                step="0.1"
                class="w-full"
              />
            </div>

            <!-- Move Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Move Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.moveDuration }}s</span>
              </div>
              <input
                v-model.number="config.moveDuration"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                class="w-full"
              />
            </div>

            <!-- Move Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Move Easing</label>
              <select
                v-model="config.moveEase"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>
          </div>

          <!-- Return Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Return Animation</h3>
            
            <!-- Return Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Return Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.returnDuration }}s</span>
              </div>
              <input
                v-model.number="config.returnDuration"
                type="range"
                min="0.2"
                max="1.5"
                step="0.05"
                class="w-full"
              />
            </div>

            <!-- Return Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Return Easing</label>
              <select
                v-model="config.returnEase"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>

            <!-- Show Fill -->
            <div class="flex items-center justify-between pt-4">
              <label class="font-mono text-xs text-white/60">Show Fill Animation</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.showFill ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.showFill = !config.showFill"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.showFill ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
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
          Magnetic buttons create a subtle interaction that makes UI elements feel alive. 
          The button follows the cursor within its bounds using GSAP, 
          then snaps back when the cursor leaves with configurable physics.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Calculate cursor offset from button center</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Multiply offset by strength to get displacement</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Animate button and text with GSAP (text at reduced parallax)</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">On mouse leave, animate back with elastic easing</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">getBoundingClientRect</span>
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
