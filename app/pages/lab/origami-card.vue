<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const isUnfolded = ref(false)

// Configuration state
const config = ref({
  foldCount: 3,
  foldDuration: 0.6,
  staggerDelay: 0.15,
  foldAngle: 180,
  perspective: 1000,
  easeOpen: 'power3.out',
  easeClose: 'power3.inOut',
  shadowIntensity: 0.3,
  autoPlay: false
})

const defaults = {
  foldCount: 3,
  foldDuration: 0.6,
  staggerDelay: 0.15,
  foldAngle: 180,
  perspective: 1000,
  easeOpen: 'power3.out',
  easeClose: 'power3.inOut',
  shadowIntensity: 0.3,
  autoPlay: false
}

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'elastic.out(1, 0.5)',
  'bounce.out',
  'circ.out',
  'expo.out'
]

const resetConfig = () => {
  config.value = { ...defaults }
  isUnfolded.value = false
  resetFolds()
}

// Generate fold segments
const foldSegments = computed(() => {
  return Array.from({ length: config.value.foldCount }, (_, i) => ({
    id: i,
    isEven: i % 2 === 0
  }))
})

// Content for each segment
const segmentContent = [
  { icon: '◈', title: 'Design', desc: 'Crafted with precision' },
  { icon: '◇', title: 'Animate', desc: 'Fluid transitions' },
  { icon: '○', title: 'Interact', desc: 'Touch and respond' },
  { icon: '△', title: 'Create', desc: 'Build experiences' },
  { icon: '□', title: 'Explore', desc: 'Discover patterns' }
]

// Reset all folds to initial state
const resetFolds = () => {
  const segments = document.querySelectorAll('.fold-segment')
  segments.forEach((segment, i) => {
    const inner = segment.querySelector('.fold-inner') as HTMLElement
    if (inner) {
      // Even segments fold forward, odd segments fold backward
      const direction = i % 2 === 0 ? -1 : 1
      gsap.set(inner, { 
        rotateX: config.value.foldAngle * direction,
        opacity: 0
      })
    }
  })
}

// Toggle fold animation
const toggleFold = () => {
  const segments = document.querySelectorAll('.fold-segment')
  
  if (isUnfolded.value) {
    // Close: animate in reverse order
    const reversedSegments = Array.from(segments).reverse()
    reversedSegments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      const actualIndex = segments.length - 1 - i
      const direction = actualIndex % 2 === 0 ? -1 : 1
      
      gsap.to(inner, {
        rotateX: config.value.foldAngle * direction,
        opacity: 0,
        duration: config.value.foldDuration,
        delay: i * config.value.staggerDelay,
        ease: config.value.easeClose
      })
    })
  } else {
    // Open: animate in order
    segments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      
      gsap.to(inner, {
        rotateX: 0,
        opacity: 1,
        duration: config.value.foldDuration,
        delay: i * config.value.staggerDelay,
        ease: config.value.easeOpen
      })
    })
  }
  
  isUnfolded.value = !isUnfolded.value
}

// Auto-play animation
let autoPlayInterval: ReturnType<typeof setInterval> | null = null

const startAutoPlay = () => {
  if (autoPlayInterval) return
  autoPlayInterval = setInterval(() => {
    toggleFold()
  }, (config.value.foldDuration + config.value.staggerDelay * config.value.foldCount) * 1000 + 1500)
}

const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// Watch for autoPlay changes
const toggleAutoPlay = () => {
  config.value.autoPlay = !config.value.autoPlay
  if (config.value.autoPlay) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  // Set initial folded state
  setTimeout(resetFolds, 100)
})

const generatedCode = computed(() => {
  const scriptClose = '<' + '/script>'
  const styleClose = '<' + '/style>'
  
  return `<template>
  <div class="origami-card" @click="toggleFold">
    <!-- Base card (always visible) -->
    <div class="base-card">
      <h3>Origami Card</h3>
      <p>Click to unfold</p>
    </div>
    
    <!-- Folding segments -->
    <div 
      v-for="(segment, i) in ${config.value.foldCount}" 
      :key="i"
      class="fold-segment"
    >
      <div class="fold-inner">
        <div class="fold-front">
          <!-- Segment content -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'

const isUnfolded = ref(false)

// Initialize: hide segments
onMounted(() => {
  document.querySelectorAll('.fold-inner').forEach((el, i) => {
    const direction = i % 2 === 0 ? -1 : 1
    gsap.set(el, { rotateX: ${config.value.foldAngle} * direction, opacity: 0 })
  })
})

const toggleFold = () => {
  const segments = document.querySelectorAll('.fold-inner')
  
  segments.forEach((inner, i) => {
    const direction = i % 2 === 0 ? -1 : 1
    
    gsap.to(inner, {
      rotateX: isUnfolded.value ? ${config.value.foldAngle} * direction : 0,
      opacity: isUnfolded.value ? 0 : 1,
      duration: ${config.value.foldDuration},
      delay: i * ${config.value.staggerDelay},
      ease: '${config.value.easeOpen}'
    })
  })
  
  isUnfolded.value = !isUnfolded.value
}
${scriptClose}

<style>
.origami-card {
  perspective: ${config.value.perspective}px;
}

.fold-segment {
  transform-style: preserve-3d;
  transform-origin: top center;
}

.fold-inner {
  transform-style: preserve-3d;
  transform-origin: top center;
}
${styleClose}`
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
      <span class="text-lg font-medium tracking-tight">Origami Card</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef" class="flex min-h-[60vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo — Click to Unfold</span>
      
      <!-- Origami Card -->
      <div 
        ref="cardRef"
        class="origami-container cursor-pointer"
        :style="{ perspective: `${config.perspective}px` }"
        @click="toggleFold"
      >
        <!-- Base segment (always visible) -->
        <div class="fold-base relative w-64 rounded-t-xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-6">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg">
              ✦
            </div>
            <div>
              <h3 class="font-medium text-white">Origami Card</h3>
              <p class="font-mono text-[10px] text-white/40">Click to unfold</p>
            </div>
          </div>
        </div>
        
        <!-- Folding segments -->
        <div 
          v-for="(segment, index) in foldSegments" 
          :key="segment.id"
          class="fold-segment w-64"
          :style="{ 
            zIndex: foldSegments.length - index,
            transformStyle: 'preserve-3d',
            transformOrigin: 'top center'
          }"
        >
          <div 
            class="fold-inner relative opacity-0"
            :style="{ 
              transformStyle: 'preserve-3d',
              transformOrigin: 'top center'
            }"
          >
            <!-- Front face -->
            <div 
              class="fold-front border-x border-b border-white/20 p-6"
              :class="[
                index === foldSegments.length - 1 ? 'rounded-b-xl' : '',
                segment.isEven ? 'bg-gradient-to-b from-white/8 to-white/5' : 'bg-gradient-to-b from-white/6 to-white/3'
              ]"
              :style="{
                backfaceVisibility: 'hidden',
                boxShadow: `inset 0 1px 0 rgba(255,255,255,${config.shadowIntensity * 0.3})`
              }"
            >
              <div class="flex items-center gap-3">
                <span class="text-xl text-white/60">{{ segmentContent[index % segmentContent.length].icon }}</span>
                <div>
                  <p class="font-medium text-white/80">{{ segmentContent[index % segmentContent.length].title }}</p>
                  <p class="font-mono text-[10px] text-white/40">{{ segmentContent[index % segmentContent.length].desc }}</p>
                </div>
              </div>
            </div>
            
            <!-- Back face (visible when folded) -->
            <div 
              class="fold-back absolute inset-0 border-x border-b border-white/5"
              :class="[
                index === foldSegments.length - 1 ? 'rounded-b-xl' : ''
              ]"
              :style="{
                backfaceVisibility: 'hidden',
                transform: 'rotateX(180deg)',
                background: 'linear-gradient(to bottom, rgba(20,20,20,0.95), rgba(15,15,15,0.98))'
              }"
            />
          </div>
        </div>
      </div>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        {{ isUnfolded ? 'Click to fold the card back up' : 'Click to unfold and reveal content' }}
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
          <!-- Fold Properties -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Fold Properties</h3>
            
            <!-- Fold Count -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Fold Count</label>
                <span class="font-mono text-xs text-white/40">{{ config.foldCount }}</span>
              </div>
              <input
                v-model.number="config.foldCount"
                type="range"
                min="1"
                max="5"
                step="1"
                class="w-full"
                @change="resetFolds"
              >
            </div>

            <!-- Fold Angle -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Fold Angle</label>
                <span class="font-mono text-xs text-white/40">{{ config.foldAngle }}°</span>
              </div>
              <input
                v-model.number="config.foldAngle"
                type="range"
                min="90"
                max="180"
                step="5"
                class="w-full"
                @change="resetFolds"
              >
            </div>

            <!-- Perspective -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Perspective</label>
                <span class="font-mono text-xs text-white/40">{{ config.perspective }}px</span>
              </div>
              <input
                v-model.number="config.perspective"
                type="range"
                min="500"
                max="2000"
                step="100"
                class="w-full"
              >
            </div>

            <!-- Shadow Intensity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Shadow Intensity</label>
                <span class="font-mono text-xs text-white/40">{{ config.shadowIntensity }}</span>
              </div>
              <input
                v-model.number="config.shadowIntensity"
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                class="w-full"
              >
            </div>
          </div>

          <!-- Animation -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation</h3>
            
            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Fold Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.foldDuration }}s</span>
              </div>
              <input
                v-model.number="config.foldDuration"
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
                class="w-full"
              >
            </div>

            <!-- Stagger Delay -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Stagger Delay</label>
                <span class="font-mono text-xs text-white/40">{{ config.staggerDelay }}s</span>
              </div>
              <input
                v-model.number="config.staggerDelay"
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Open Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Open Easing</label>
              <select
                v-model="config.easeOpen"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>

            <!-- Close Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Close Easing</label>
              <select
                v-model="config.easeClose"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>

            <!-- Auto Play -->
            <div class="flex items-center justify-between pt-2">
              <label class="font-mono text-xs text-white/60">Auto Play</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.autoPlay ? 'bg-white' : 'bg-white/20'
                ]"
                @click="toggleAutoPlay"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.autoPlay ? 'translate-x-5' : 'translate-x-0.5'
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
          The Origami Card creates a paper-folding effect using CSS 3D transforms. 
          Each segment folds along the X-axis, alternating direction to create 
          an accordion-like reveal that mimics real paper folding.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Each fold segment uses <code class="text-white/80">transform-style: preserve-3d</code> for true 3D space</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Segments have front/back faces with <code class="text-white/80">backface-visibility: hidden</code></p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Even segments fold forward (-180°), odd segments fold backward (+180°)</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">GSAP animates <code class="text-white/80">rotateX</code> with staggered delays for cascade effect</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Feature reveals</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Step-by-step guides</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Accordion content</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Interactive menus</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Storytelling</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS 3D Transforms</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">preserve-3d</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.origami-container {
  transform-style: preserve-3d;
}

.fold-segment {
  transform-style: preserve-3d;
}

.fold-inner {
  transform-style: preserve-3d;
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
