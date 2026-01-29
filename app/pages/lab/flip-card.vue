<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Send, CheckCircle, ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const isFlipped = ref(false)

// Configuration state
const config = ref({
  flipDirection: 'horizontal',
  flipDuration: 0.6,
  perspective: 1000,
  easing: 'power2.inOut',
  frontBg: 'glass',
  backBg: 'success',
  autoReset: true,
  autoResetDelay: 3
})

const defaults = {
  flipDirection: 'horizontal',
  flipDuration: 0.6,
  perspective: 1000,
  easing: 'power2.inOut',
  frontBg: 'glass',
  backBg: 'success',
  autoReset: true,
  autoResetDelay: 3
}

const easingOptions = [
  'none',
  'power1.inOut',
  'power2.inOut',
  'power3.inOut',
  'power4.inOut',
  'back.inOut(1.7)',
  'elastic.out(1, 0.5)',
  'bounce.out'
]

const resetConfig = () => {
  config.value = { ...defaults }
  isFlipped.value = false
}

// Flip the card
const flipCard = () => {
  isFlipped.value = true
  
  // Auto reset after delay if enabled
  if (config.value.autoReset) {
    setTimeout(() => {
      isFlipped.value = false
    }, config.value.autoResetDelay * 1000)
  }
}

const resetCard = () => {
  isFlipped.value = false
}

// Computed styles
const containerStyle = computed(() => ({
  perspective: `${config.value.perspective}px`
}))

const _cardStyle = computed(() => {
  const rotation = config.value.flipDirection === 'horizontal' 
    ? `rotateY(${isFlipped.value ? 180 : 0}deg)`
    : `rotateX(${isFlipped.value ? 180 : 0}deg)`
  
  return {
    transform: rotation,
    transition: `transform ${config.value.flipDuration}s`
  }
})

const backFaceStyle = computed(() => ({
  transform: config.value.flipDirection === 'horizontal' 
    ? 'rotateY(180deg)' 
    : 'rotateX(180deg)'
}))

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

const generatedCode = computed(() => {
  return `<template>
  <div class="flip-container" style="perspective: ${config.value.perspective}px;">
    <div 
      class="flip-card"
      :class="{ 'is-flipped': isFlipped }"
    >
      <!-- Front -->
      <div class="flip-face flip-front">
        <button @click="isFlipped = true">
          Submit
        </button>
      </div>
      
      <!-- Back -->
      <div class="flip-face flip-back">
        <p>Success!</p>
        <button @click="isFlipped = false">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.flip-container {
  perspective: ${config.value.perspective}px;
}

.flip-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform ${config.value.flipDuration}s ${config.value.easing.includes('elastic') || config.value.easing.includes('bounce') ? 'ease-out' : 'ease-in-out'};
}

.flip-card.is-flipped {
  transform: ${config.value.flipDirection === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)'};
}

.flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-back {
  transform: ${config.value.flipDirection === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)'};
}
</style>`
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
      <span class="text-lg font-medium tracking-tight">Flip Card</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden px-6 py-16"
    >
      <span class="mb-12 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <!-- Flip Card Container -->
      <div 
        class="flip-container h-72 w-80"
        :style="containerStyle"
      >
        <div 
          class="flip-card relative h-full w-full"
          :class="{ 'is-flipped': isFlipped }"
          :style="{ transitionDuration: `${config.flipDuration}s` }"
        >
          <!-- Front Face -->
          <div 
            class="flip-face absolute inset-0 rounded-2xl p-6 flex flex-col"
            :class="{
              'bg-white/10 backdrop-blur-xl border border-white/20': config.frontBg === 'glass',
              'bg-dark-800 border border-white/10': config.frontBg === 'solid',
              'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20': config.frontBg === 'gradient'
            }"
          >
            <div class="flex-1">
              <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Send class="h-5 w-5 text-white/80" />
              </div>
              <h3 class="text-lg font-semibold text-white">Submit Form</h3>
              <p class="mt-2 text-sm text-white/60">
                Click the button below to submit your request and see the flip animation.
              </p>
            </div>
            
            <button
              class="group relative mt-4 w-full overflow-hidden rounded-lg border border-white/20 bg-white/5 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all hover:border-white/40 hover:bg-white/10"
              @click="flipCard"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                <Send class="h-4 w-4" />
                Submit
              </span>
            </button>
          </div>

          <!-- Back Face (Success) -->
          <div 
            class="flip-face flip-back absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center"
            :class="{
              'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30': config.backBg === 'success',
              'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30': config.backBg === 'info',
              'bg-white/10 backdrop-blur-xl border border-white/20': config.backBg === 'glass'
            }"
            :style="backFaceStyle"
          >
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full" :class="config.backBg === 'success' ? 'bg-green-500/20' : config.backBg === 'info' ? 'bg-blue-500/20' : 'bg-white/10'">
              <CheckCircle class="h-8 w-8" :class="config.backBg === 'success' ? 'text-green-400' : config.backBg === 'info' ? 'text-blue-400' : 'text-white'" />
            </div>
            <h3 class="text-xl font-semibold" :class="config.backBg === 'success' ? 'text-green-400' : config.backBg === 'info' ? 'text-blue-400' : 'text-white'">Success!</h3>
            <p class="mt-2 text-center text-sm text-white/60">
              Your request has been submitted successfully.
            </p>
            
            <button
              v-if="!config.autoReset"
              class="group mt-6 flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
              @click="resetCard"
            >
              <ArrowLeft class="h-4 w-4" />
              Go Back
            </button>
            <p v-else class="mt-6 font-mono text-[10px] text-white/30">
              Auto-resetting in {{ config.autoResetDelay }}s
            </p>
          </div>
        </div>
      </div>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Click the submit button to trigger the 3D flip animation.
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
          <!-- Animation Settings -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation</h3>
            
            <!-- Flip Direction -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Flip Direction</label>
              <div class="flex gap-2">
                <button
                  v-for="dir in ['horizontal', 'vertical']"
                  :key="dir"
                  :class="[
                    'flex-1 border py-2 font-mono text-xs capitalize transition-colors',
                    config.flipDirection === dir 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.flipDirection = dir"
                >
                  {{ dir }}
                </button>
              </div>
            </div>

            <!-- Flip Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Flip Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.flipDuration }}s</span>
              </div>
              <input
                v-model.number="config.flipDuration"
                type="range"
                min="0.3"
                max="1.5"
                step="0.1"
                class="w-full"
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

            <!-- Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Easing</label>
              <select
                v-model="config.easing"
                class="w-full border border-white/20 bg-dark-900 px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease">
                  {{ ease }}
                </option>
              </select>
            </div>
          </div>

          <!-- Appearance & Behavior -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Appearance & Behavior</h3>
            
            <!-- Front Background -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Front Style</label>
              <div class="flex gap-2">
                <button
                  v-for="style in ['glass', 'solid', 'gradient']"
                  :key="style"
                  :class="[
                    'flex-1 border py-2 font-mono text-xs capitalize transition-colors',
                    config.frontBg === style 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.frontBg = style"
                >
                  {{ style }}
                </button>
              </div>
            </div>

            <!-- Back Background -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Back Style</label>
              <div class="flex gap-2">
                <button
                  v-for="style in ['success', 'info', 'glass']"
                  :key="style"
                  :class="[
                    'flex-1 border py-2 font-mono text-xs capitalize transition-colors',
                    config.backBg === style 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.backBg = style"
                >
                  {{ style }}
                </button>
              </div>
            </div>

            <!-- Auto Reset -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Auto Reset</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.autoReset ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.autoReset = !config.autoReset"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.autoReset ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Auto Reset Delay -->
            <div v-if="config.autoReset" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reset Delay</label>
                <span class="font-mono text-xs text-white/40">{{ config.autoResetDelay }}s</span>
              </div>
              <input
                v-model.number="config.autoResetDelay"
                type="range"
                min="1"
                max="10"
                step="0.5"
                class="w-full"
              >
            </div>

            <!-- Manual Flip Control -->
            <div class="pt-2">
              <button
                class="w-full border border-white/20 bg-white/5 py-2 font-mono text-xs text-white/60 transition-colors hover:border-white/40 hover:text-white"
                @click="isFlipped = !isFlipped"
              >
                {{ isFlipped ? 'Flip to Front' : 'Flip to Back' }}
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
          The 3D flip card creates an engaging reveal animation perfect for success states, 
          card reveals, or two-sided content. Uses CSS 3D transforms with configurable 
          perspective for realistic depth.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">perspective</code> on container creates 3D space for the card</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">transform-style: preserve-3d</code> maintains 3D for children</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">backface-visibility: hidden</code> hides the reverse side</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Back face is pre-rotated 180° so it shows when card flips</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS 3D Transforms</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">perspective</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">backface-visibility</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.flip-container {
  perspective: 1000px;
}

.flip-card {
  transform-style: preserve-3d;
  transition-timing-function: ease-in-out;
}

.flip-card.is-flipped {
  transform: v-bind("config.flipDirection === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)'");
}

.flip-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-back {
  transform: v-bind("config.flipDirection === 'horizontal' ? 'rotateY(180deg)' : 'rotateX(180deg)'");
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
