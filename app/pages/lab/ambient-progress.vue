<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Play, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const copied = ref(false)
const demoRef = ref<HTMLElement | null>(null)

// Processing state
const isProcessing = ref(false)
const progress = ref(0)
const processingTimeout = ref<NodeJS.Timeout | null>(null)

// Configuration
const config = ref({
  mode: 'luminosity' as 'luminosity' | 'edge-glow' | 'color-drift' | 'grain',
  duration: 4,
  intensity: 0.5,
  speed: 1.5,
  showComparison: true
})

const defaults = {
  mode: 'luminosity' as const,
  duration: 4,
  intensity: 0.5,
  speed: 1.5,
  showComparison: true
}

const modeDescriptions = {
  luminosity: 'Breathing glow with radiating light and pulsing shadow',
  'edge-glow': 'Bright light beam sweeps along the border with soft bloom',
  'color-drift': 'Aurora shimmer with shifting gradient colors',
  grain: 'Elegant shimmer sweep with subtle texture'
}

const resetConfig = () => {
  config.value = { ...defaults }
  stopProcessing()
}

// Start simulated processing
const startProcessing = () => {
  if (isProcessing.value) return
  
  isProcessing.value = true
  progress.value = 0
  
  // Simulate progress over duration
  const startTime = Date.now()
  const duration = config.value.duration * 1000
  
  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min(elapsed / duration, 1)
    
    if (progress.value < 1 && isProcessing.value) {
      processingTimeout.value = setTimeout(updateProgress, 50)
    } else {
      completeProcessing()
    }
  }
  
  updateProgress()
}

const completeProcessing = () => {
  progress.value = 1
  
  // Brief settle delay
  setTimeout(() => {
    isProcessing.value = false
    progress.value = 0
  }, 300)
}

const stopProcessing = () => {
  if (processingTimeout.value) {
    clearTimeout(processingTimeout.value)
  }
  isProcessing.value = false
  progress.value = 0
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

onUnmounted(() => {
  if (processingTimeout.value) {
    clearTimeout(processingTimeout.value)
  }
})

// Dynamic styles based on mode and processing state
const ambientStyle = computed(() => {
  if (!isProcessing.value) return {}
  
  const intensity = config.value.intensity
  const speed = config.value.speed
  
  return {
    '--ambient-intensity': intensity,
    '--ambient-speed': `${speed}s`
  }
})

const generatedCode = computed(() => {
  const modeStyles = {
    luminosity: `/* Luminosity Breathing */
.ambient-container {
  animation: ambient-breathe ${config.value.speed}s ease-in-out infinite;
}

@keyframes ambient-breathe {
  0%, 100% { 
    filter: brightness(1); 
  }
  50% { 
    filter: brightness(${1 + config.value.intensity * 0.15}); 
  }
}`,
    'edge-glow': `/* Edge Glow */
.ambient-container {
  position: relative;
}

.ambient-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: conic-gradient(
    from var(--angle), 
    transparent 60%, 
    rgba(255,255,255,${config.value.intensity * 0.5}) 80%, 
    transparent 100%
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: rotate ${config.value.speed}s linear infinite;
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes rotate {
  to { --angle: 360deg; }
}`,
    'color-drift': `/* Color Temperature Drift */
.ambient-container {
  animation: color-drift ${config.value.speed * 2}s ease-in-out infinite;
}

@keyframes color-drift {
  0%, 100% { 
    filter: sepia(0) hue-rotate(0deg); 
  }
  50% { 
    filter: sepia(${config.value.intensity * 0.1}) hue-rotate(${config.value.intensity * 10}deg); 
  }
}`,
    grain: `/* Grain Texture */
.ambient-container {
  position: relative;
}

.ambient-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise texture */
  opacity: ${config.value.intensity * 0.3};
  animation: grain ${config.value.speed * 0.1}s steps(10) infinite;
  pointer-events: none;
}

@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-1%, -1%); }
  /* ... more steps for grain movement */
}`
  }

  return `// Ambient Progress - Peripheral awareness loading state
// Mode: ${config.value.mode}

${modeStyles[config.value.mode]}

// Usage
const isProcessing = ref(false)

// Start ambient state
isProcessing.value = true

// Complete - the settling IS the notification
isProcessing.value = false`
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
      <span class="text-lg font-medium tracking-tight">Ambient Progress</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[60vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16"
    >
      <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      <p class="mb-8 max-w-md text-center font-mono text-xs text-white/40">
        {{ modeDescriptions[config.mode] }}
      </p>

      <!-- Demo Cards Container -->
      <div class="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        
        <!-- Ambient Progress Card -->
        <div class="flex flex-col items-center gap-4">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/30">Ambient</span>
          <div
            :class="[
              'ambient-card relative flex h-48 w-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-dark-800 p-6 transition-all',
              isProcessing ? `ambient-${config.mode}` : ''
            ]"
            :style="ambientStyle"
          >
            <!-- Edge glow overlay -->
            <div 
              v-if="config.mode === 'edge-glow' && isProcessing"
              class="edge-glow-overlay"
              :style="{ '--ambient-intensity': config.intensity, '--ambient-speed': `${config.speed}s` }"
            />
            
            <!-- Grain overlay -->
            <div 
              v-if="config.mode === 'grain' && isProcessing"
              class="grain-overlay"
              :style="{ '--ambient-intensity': config.intensity, '--ambient-speed': `${config.speed}s` }"
            />

            <!-- Card content -->
            <div class="relative z-10 text-center">
              <div class="mb-3 h-12 w-12 mx-auto rounded-xl bg-white/10" />
              <h3 class="text-sm font-medium text-white">Processing Data</h3>
              <p class="mt-1 text-xs text-white/40">
                {{ isProcessing ? 'Working...' : 'Ready' }}
              </p>
            </div>

            <!-- Subtle progress indicator (optional) -->
            <div class="absolute bottom-4 left-4 right-4">
              <div class="h-0.5 rounded-full bg-white/5 overflow-hidden">
                <div 
                  class="h-full bg-white/20 transition-all duration-300 ease-out"
                  :style="{ width: `${progress * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- VS Divider -->
        <div v-if="config.showComparison" class="flex flex-col items-center gap-2">
          <div class="h-8 w-px bg-white/10 md:h-px md:w-8" />
          <span class="font-mono text-[10px] text-white/20">vs</span>
          <div class="h-8 w-px bg-white/10 md:h-px md:w-8" />
        </div>

        <!-- Traditional Spinner Card -->
        <div v-if="config.showComparison" class="flex flex-col items-center gap-4">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/30">Traditional</span>
          <div class="relative flex h-48 w-72 flex-col items-center justify-center rounded-2xl border border-white/10 bg-dark-800 p-6">
            <!-- Card content -->
            <div class="relative z-10 text-center">
              <div class="mb-3 h-12 w-12 mx-auto rounded-xl bg-white/10 flex items-center justify-center">
                <Loader2 
                  v-if="isProcessing"
                  class="h-6 w-6 text-white/60 animate-spin"
                />
              </div>
              <h3 class="text-sm font-medium text-white">Processing Data</h3>
              <p class="mt-1 text-xs text-white/40">
                {{ isProcessing ? 'Working...' : 'Ready' }}
              </p>
            </div>

            <!-- Traditional progress bar -->
            <div class="absolute bottom-4 left-4 right-4">
              <div class="h-1 rounded-full bg-white/10 overflow-hidden">
                <div 
                  class="h-full bg-white/40 transition-all duration-300 ease-out"
                  :style="{ width: `${progress * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trigger Button -->
      <button
        class="mt-10 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-mono text-sm transition-all hover:bg-white/10 disabled:opacity-50"
        :disabled="isProcessing"
        @click="startProcessing"
      >
        <Play class="h-4 w-4" />
        {{ isProcessing ? `Processing... ${Math.round(progress * 100)}%` : 'Start Processing' }}
      </button>

      <p class="mt-6 max-w-lg text-center font-mono text-[11px] leading-relaxed text-white/30">
        Notice how the ambient version lets you look away — the settling when complete is itself the notification.
        The traditional spinner demands your attention.
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
          <!-- Mode Selection -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Ambient Mode</h3>
            
            <div class="space-y-2">
              <button
                v-for="mode in ['luminosity', 'edge-glow', 'color-drift', 'grain']"
                :key="mode"
                :class="[
                  'w-full flex items-center justify-between border px-4 py-3 text-left transition-colors',
                  config.mode === mode 
                    ? 'border-white/40 bg-white/10' 
                    : 'border-white/10 hover:border-white/20'
                ]"
                @click="config.mode = mode as typeof config.mode"
              >
                <div>
                  <span class="font-mono text-sm capitalize text-white">
                    {{ mode.replace('-', ' ') }}
                  </span>
                  <p class="mt-0.5 font-mono text-[10px] text-white/40">
                    {{ modeDescriptions[mode as keyof typeof modeDescriptions] }}
                  </p>
                </div>
                <div 
                  :class="[
                    'h-3 w-3 rounded-full border',
                    config.mode === mode 
                      ? 'border-white bg-white' 
                      : 'border-white/30'
                  ]"
                />
              </button>
            </div>
          </div>

          <!-- Parameters -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Parameters</h3>

            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Processing Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.duration }}s</span>
              </div>
              <input
                v-model.number="config.duration"
                type="range"
                min="2"
                max="10"
                step="0.5"
                class="w-full"
              >
            </div>

            <!-- Intensity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Effect Intensity</label>
                <span class="font-mono text-xs text-white/40">{{ Math.round(config.intensity * 100) }}%</span>
              </div>
              <input
                v-model.number="config.intensity"
                type="range"
                min="0.2"
                max="1"
                step="0.1"
                class="w-full"
              >
            </div>

            <!-- Speed -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Animation Speed</label>
                <span class="font-mono text-xs text-white/40">{{ config.speed }}s</span>
              </div>
              <input
                v-model.number="config.speed"
                type="range"
                min="0.5"
                max="4"
                step="0.25"
                class="w-full"
              >
            </div>

            <!-- Show Comparison -->
            <div class="flex items-center justify-between pt-2">
              <div>
                <label class="font-mono text-xs text-white/60">Show Comparison</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Compare with traditional spinner</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.showComparison ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.showComparison = !config.showComparison"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.showComparison ? 'translate-x-5' : 'translate-x-0.5'
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
          Traditional loading indicators demand focal attention — you watch the spinner, 
          stare at the progress bar. Ambient Progress communicates state through peripheral 
          awareness. You sense that something is happening without actively watching it, 
          and the settling to rest when complete is itself the notification.
        </p>

        <!-- Psychology -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">The Psychology</h3>
          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Peripheral processing</span> — humans notice ambient changes without focal attention</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Reduced anxiety</span> — no bar to obsess over, no percentage to watch</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Honest communication</span> — says "working" not "47% complete" (which is often a lie)</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Completion as absence</span> — the stopping of ambient activity signals done</p>
            </div>
          </div>
        </div>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Modes Explained</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Luminosity</span> — pulsing brightness with radiating box-shadow glow and inner light</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Edge Glow</span> — dual-layer rotating beam with sharp highlight and soft outer bloom</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Color Drift</span> — aurora-style gradient animation with pulsing inner glow</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Grain</span> — diagonal shimmer sweep with subtle noise overlay</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">AI processing</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">File uploads</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Background sync</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Data exports</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Auto-saving</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Long operations</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS Animations</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS Filters</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Conic Gradients</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS @property</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">SVG Noise</span>
          </div>
        </div>

        <!-- Accessibility Note -->
        <div class="mt-12 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <h3 class="font-mono text-xs font-medium text-yellow-500">Accessibility Note</h3>
          <p class="mt-2 font-mono text-xs leading-relaxed text-white/60">
            Respect <code class="text-white/80">prefers-reduced-motion</code>. For users who need it, 
            fall back to a static indicator or subtle opacity change instead of continuous animation.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ============================================
   LUMINOSITY MODE - Breathing glow with shadow
   ============================================ */
.ambient-luminosity {
  animation: 
    luminosity-breathe var(--ambient-speed, 1.5s) ease-in-out infinite,
    luminosity-shadow var(--ambient-speed, 1.5s) ease-in-out infinite;
}

@keyframes luminosity-breathe {
  0%, 100% { 
    filter: brightness(1);
    border-color: rgba(255, 255, 255, 0.1);
  }
  50% { 
    filter: brightness(calc(1 + var(--ambient-intensity, 0.5) * 0.12));
    border-color: rgba(255, 255, 255, calc(0.1 + var(--ambient-intensity, 0.5) * 0.2));
  }
}

@keyframes luminosity-shadow {
  0%, 100% { 
    box-shadow: 
      0 0 0 0 rgba(255, 255, 255, 0),
      0 4px 20px -4px rgba(0, 0, 0, 0.3),
      inset 0 0 0 0 rgba(255, 255, 255, 0);
  }
  50% { 
    box-shadow: 
      0 0 calc(40px * var(--ambient-intensity, 0.5)) calc(5px * var(--ambient-intensity, 0.5)) rgba(120, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.15)),
      0 4px 30px -4px rgba(0, 0, 0, 0.4),
      inset 0 0 calc(30px * var(--ambient-intensity, 0.5)) rgba(255, 255, 255, calc(var(--ambient-intensity, 0.5) * 0.03));
  }
}

/* ============================================
   EDGE GLOW MODE - Smooth traveling light beam
   ============================================ */
.ambient-edge-glow {
  overflow: visible;
}

.edge-glow-overlay {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
}

/* Primary bright beam */
.edge-glow-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: conic-gradient(
    from var(--glow-angle, 0deg) at 50% 50%,
    transparent 0deg,
    transparent 30deg,
    rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.1)) 45deg,
    rgba(150, 220, 255, calc(var(--ambient-intensity, 0.5) * 0.6)) 60deg,
    rgba(255, 255, 255, calc(var(--ambient-intensity, 0.5) * 0.9)) 90deg,
    rgba(150, 220, 255, calc(var(--ambient-intensity, 0.5) * 0.6)) 120deg,
    rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.1)) 135deg,
    transparent 150deg,
    transparent 360deg
  );
  mask: 
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  animation: edge-rotate var(--ambient-speed, 1.5s) linear infinite;
}

/* Outer glow/bloom effect */
.edge-glow-overlay::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: calc(1rem + 8px);
  padding: 10px;
  background: conic-gradient(
    from var(--glow-angle, 0deg) at 50% 50%,
    transparent 0deg,
    transparent 45deg,
    rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.2)) 70deg,
    rgba(150, 200, 255, calc(var(--ambient-intensity, 0.5) * 0.3)) 90deg,
    rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.2)) 110deg,
    transparent 135deg,
    transparent 360deg
  );
  filter: blur(12px);
  mask: 
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  animation: edge-rotate var(--ambient-speed, 1.5s) linear infinite;
  opacity: 0.8;
}

@property --glow-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes edge-rotate {
  to {
    --glow-angle: 360deg;
  }
}

/* ============================================
   COLOR DRIFT MODE - Aurora shimmer effect
   ============================================ */
.ambient-color-drift {
  position: relative;
  overflow: hidden;
}

.ambient-color-drift::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(100, 150, 255, 0) 0%,
    rgba(100, 150, 255, calc(var(--ambient-intensity, 0.5) * 0.08)) 25%,
    rgba(180, 100, 255, calc(var(--ambient-intensity, 0.5) * 0.06)) 50%,
    rgba(100, 200, 200, calc(var(--ambient-intensity, 0.5) * 0.08)) 75%,
    rgba(100, 150, 255, 0) 100%
  );
  background-size: 300% 300%;
  animation: aurora-shift calc(var(--ambient-speed, 1.5s) * 2) ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

.ambient-color-drift::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 40px rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.1));
  animation: aurora-pulse calc(var(--ambient-speed, 1.5s) * 1.5) ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}

@keyframes aurora-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes aurora-pulse {
  0%, 100% {
    box-shadow: inset 0 0 30px rgba(100, 180, 255, calc(var(--ambient-intensity, 0.5) * 0.05));
  }
  50% {
    box-shadow: inset 0 0 50px rgba(150, 120, 255, calc(var(--ambient-intensity, 0.5) * 0.12));
  }
}

/* ============================================
   GRAIN MODE - Refined shimmer particles
   ============================================ */
.ambient-grain {
  position: relative;
  overflow: hidden;
}

.grain-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
}

/* Shimmer sweep */
.grain-overlay::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, calc(var(--ambient-intensity, 0.5) * 0.03)) 45%,
    rgba(255, 255, 255, calc(var(--ambient-intensity, 0.5) * 0.08)) 50%,
    rgba(255, 255, 255, calc(var(--ambient-intensity, 0.5) * 0.03)) 55%,
    transparent 60%,
    transparent 100%
  );
  animation: shimmer-sweep var(--ambient-speed, 1.5s) ease-in-out infinite;
}

/* Subtle noise texture */
.grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: calc(var(--ambient-intensity, 0.5) * 0.15);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
  animation: grain-flicker calc(var(--ambient-speed, 1.5s) * 0.05) steps(3) infinite;
}

@keyframes shimmer-sweep {
  0% {
    transform: translateX(-30%) rotate(25deg);
  }
  100% {
    transform: translateX(30%) rotate(25deg);
  }
}

@keyframes grain-flicker {
  0% { transform: translate(0, 0); }
  33% { transform: translate(0.5%, 0.5%); }
  66% { transform: translate(-0.5%, 0.5%); }
  100% { transform: translate(0, 0); }
}

/* ============================================
   SHARED CARD ENHANCEMENT
   ============================================ */
.ambient-card {
  transition: 
    box-shadow 0.4s ease-out,
    border-color 0.4s ease-out,
    transform 0.4s ease-out;
}

.ambient-card.ambient-luminosity,
.ambient-card.ambient-edge-glow,
.ambient-card.ambient-color-drift,
.ambient-card.ambient-grain {
  border-color: rgba(255, 255, 255, 0.15);
}

/* ============================================
   RANGE INPUT STYLING
   ============================================ */
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

/* ============================================
   REDUCED MOTION
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  .ambient-luminosity {
    animation: none;
    box-shadow: 0 0 20px 2px rgba(120, 180, 255, 0.1);
  }
  
  .edge-glow-overlay::before,
  .edge-glow-overlay::after {
    animation: none;
    opacity: 0.3;
  }
  
  .ambient-color-drift::before,
  .ambient-color-drift::after {
    animation: none;
  }
  
  .grain-overlay::before,
  .grain-overlay::after {
    animation: none;
  }
}
</style>
