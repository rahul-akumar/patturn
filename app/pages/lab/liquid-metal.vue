<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Zap, Star, Shield } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Metal presets
const metalPresets = [
  { name: 'Silver', color1: '#71717a', color2: '#fafafa', color3: '#3f3f46', color4: '#a1a1aa' },
  { name: 'Gold', color1: '#a16207', color2: '#fef08a', color3: '#713f12', color4: '#facc15' },
  { name: 'Rose Gold', color1: '#9f1239', color2: '#fecdd3', color3: '#881337', color4: '#fb7185' },
  { name: 'Bronze', color1: '#78350f', color2: '#fcd34d', color3: '#451a03', color4: '#b45309' },
  { name: 'Copper', color1: '#9a3412', color2: '#fed7aa', color3: '#7c2d12', color4: '#ea580c' },
  { name: 'Platinum', color1: '#52525b', color2: '#ffffff', color3: '#27272a', color4: '#d4d4d8' },
  { name: 'Chrome', color1: '#3f3f46', color2: '#ffffff', color3: '#18181b', color4: '#71717a' },
  { name: 'Titanium', color1: '#475569', color2: '#e2e8f0', color3: '#1e293b', color4: '#94a3b8' },
  { name: 'Brass', color1: '#854d0e', color2: '#fef9c3', color3: '#713f12', color4: '#ca8a04' },
  { name: 'Gunmetal', color1: '#27272a', color2: '#a1a1aa', color3: '#09090b', color4: '#52525b' }
]

const selectedPreset = ref('Silver')

// Configuration state
const config = ref({
  // Mode
  fillEnabled: true,
  borderEnabled: true,
  // Border
  borderWidth: 2,
  borderRadius: 16,
  // Colors
  color1: '#71717a',
  color2: '#fafafa',
  color3: '#3f3f46',
  color4: '#a1a1aa',
  // Animation
  flowSpeed: 8,
  waveIntensity: 20,
  shimmerEnabled: true,
  shimmerSpeed: 4,
  // Glow
  glowEnabled: true,
  glowIntensity: 0.4,
  glowSpread: 25,
  // Tilt
  tiltEnabled: true,
  tiltStrength: 15,
  tiltDuration: 0.5
})

const defaults = {
  fillEnabled: true,
  borderEnabled: true,
  borderWidth: 2,
  borderRadius: 16,
  color1: '#71717a',
  color2: '#fafafa',
  color3: '#3f3f46',
  color4: '#a1a1aa',
  flowSpeed: 8,
  waveIntensity: 20,
  shimmerEnabled: true,
  shimmerSpeed: 4,
  glowEnabled: true,
  glowIntensity: 0.4,
  glowSpread: 25,
  tiltEnabled: true,
  tiltStrength: 15,
  tiltDuration: 0.5
}

const applyPreset = (presetName: string) => {
  const preset = metalPresets.find(p => p.name === presetName)
  if (preset) {
    selectedPreset.value = presetName
    config.value.color1 = preset.color1
    config.value.color2 = preset.color2
    config.value.color3 = preset.color3
    config.value.color4 = preset.color4
  }
}

const resetConfig = () => {
  config.value = { ...defaults }
}

// Computed styles
const cardStyle = computed(() => ({
  '--border-width': `${config.value.borderWidth}px`,
  '--border-radius': `${config.value.borderRadius}px`,
  '--color-1': config.value.color1,
  '--color-2': config.value.color2,
  '--color-3': config.value.color3,
  '--color-4': config.value.color4,
  '--flow-speed': `${config.value.flowSpeed}s`,
  '--wave-intensity': `${config.value.waveIntensity}%`,
  '--shimmer-speed': `${config.value.shimmerSpeed}s`,
  '--glow-intensity': config.value.glowIntensity,
  '--glow-spread': `${config.value.glowSpread}px`,
  borderRadius: `${config.value.borderRadius}px`
}))

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

// Tilt handlers
const onMouseMove = (e: MouseEvent) => {
  if (!cardRef.value || !config.value.tiltEnabled) return
  
  const rect = cardRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const tiltX = ((y - centerY) / centerY) * config.value.tiltStrength
  const tiltY = ((centerX - x) / centerX) * config.value.tiltStrength
  
  gsap.to(cardRef.value, {
    rotateX: tiltX,
    rotateY: tiltY,
    duration: config.value.tiltDuration,
    ease: 'power2.out'
  })
}

const onMouseLeave = () => {
  if (!cardRef.value) return
  
  gsap.to(cardRef.value, {
    rotateX: 0,
    rotateY: 0,
    duration: 0.7,
    ease: 'elastic.out(1, 0.5)'
  })
}

const generatedCode = computed(() => {
  return `.liquid-metal-card {
  position: relative;
  border-radius: ${config.value.borderRadius}px;
  ${config.value.fillEnabled ? `background: linear-gradient(
    135deg,
    ${config.value.color1} 0%,
    ${config.value.color2} 25%,
    ${config.value.color3} 50%,
    ${config.value.color2} 75%,
    ${config.value.color4} 100%
  );
  background-size: 400% 400%;
  animation: liquidFlow ${config.value.flowSpeed}s ease-in-out infinite;` : 'background: #0a0a0a;'}
}
${config.value.borderEnabled ? `
.liquid-metal-card::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: ${config.value.borderWidth}px;
  border-radius: ${config.value.borderRadius}px;
  background: linear-gradient(
    135deg,
    ${config.value.color1} 0%,
    ${config.value.color2} ${50 - config.value.waveIntensity/2}%,
    ${config.value.color3} 50%,
    ${config.value.color2} ${50 + config.value.waveIntensity/2}%,
    ${config.value.color4} 100%
  );
  background-size: 300% 300%;
  animation: liquidFlow ${config.value.flowSpeed}s ease-in-out infinite;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask-composite: exclude;
}` : ''}
${config.value.shimmerEnabled ? `
.liquid-metal-card .shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.4) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmer ${config.value.shimmerSpeed}s ease-in-out infinite;
}` : ''}

@keyframes liquidFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
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
      <span class="text-lg font-medium tracking-tight">Liquid Metal</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden px-6 py-16"
    >
      <span class="mb-12 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <!-- Liquid Metal Card -->
      <div class="perspective-1000">
        <div
          ref="cardRef"
          class="liquid-metal-card relative w-full max-w-sm overflow-hidden transform-gpu"
          :class="{ 
            'border-effect': config.borderEnabled,
            'fill-effect': config.fillEnabled,
            'glow-effect': config.glowEnabled
          }"
          :style="cardStyle"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
        >
        <!-- Shimmer overlay -->
        <div 
          v-if="config.shimmerEnabled"
          class="shimmer pointer-events-none absolute inset-0 z-20"
          :style="{ borderRadius: `${config.borderRadius}px` }"
        />
        
        <!-- Card Content -->
        <div class="relative z-10 p-6" :class="{ 'bg-dark-900': !config.fillEnabled }" :style="{ borderRadius: config.fillEnabled ? '0' : `${config.borderRadius - config.borderWidth}px`, margin: config.borderEnabled && !config.fillEnabled ? `${config.borderWidth}px` : '0' }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg" :class="config.fillEnabled ? 'bg-black/30' : 'bg-white/10'">
              <Zap class="h-5 w-5" :class="config.fillEnabled ? 'text-black/80' : 'text-white'" />
            </div>
            <div class="flex items-center gap-1">
              <Star class="h-4 w-4" :class="config.fillEnabled ? 'fill-black/60 text-black/60' : 'fill-yellow-500 text-yellow-500'" />
              <span class="font-mono text-xs" :class="config.fillEnabled ? 'text-black/70' : 'text-white/60'">Premium</span>
            </div>
          </div>
          
          <h3 class="text-lg font-semibold" :class="config.fillEnabled ? 'text-black/90' : 'text-white'">Liquid Metal Card</h3>
          <p class="mt-2 text-sm leading-relaxed" :class="config.fillEnabled ? 'text-black/60' : 'text-white/60'">
            A premium card with flowing metallic effect. The gradient animates like liquid mercury.
          </p>
          
          <div class="mt-6 flex items-center gap-4">
            <div class="flex items-center gap-2">
              <Shield class="h-4 w-4" :class="config.fillEnabled ? 'text-black/50' : 'text-white/40'" />
              <span class="text-xs" :class="config.fillEnabled ? 'text-black/50' : 'text-white/40'">Secure</span>
            </div>
            <div class="h-4 w-px" :class="config.fillEnabled ? 'bg-black/30' : 'bg-white/20'" />
            <span class="text-xs" :class="config.fillEnabled ? 'text-black/50' : 'text-white/40'">v2.0</span>
          </div>
        </div>
        </div>
      </div>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Flowing metallic gradient with optional shimmer highlight. Hover to tilt.
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
          <!-- Mode & Appearance -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Mode & Appearance</h3>
            
            <!-- Metal Preset -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Metal Preset</label>
              <select
                v-model="selectedPreset"
                class="w-full border border-white/20 bg-dark-900 px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
                @change="applyPreset(selectedPreset)"
              >
                <option v-for="preset in metalPresets" :key="preset.name" :value="preset.name">
                  {{ preset.name }}
                </option>
              </select>
            </div>

            <!-- Fill Enabled -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Liquid Metal Fill</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.fillEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.fillEnabled = !config.fillEnabled"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.fillEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Border Enabled -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Liquid Metal Border</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.borderEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.borderEnabled = !config.borderEnabled"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.borderEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Border Width -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Border Width</label>
                <span class="font-mono text-xs text-white/40">{{ config.borderWidth }}px</span>
              </div>
              <input
                v-model.number="config.borderWidth"
                type="range"
                min="1"
                max="6"
                step="1"
                class="w-full"
              />
            </div>

            <!-- Border Radius -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Border Radius</label>
                <span class="font-mono text-xs text-white/40">{{ config.borderRadius }}px</span>
              </div>
              <input
                v-model.number="config.borderRadius"
                type="range"
                min="0"
                max="32"
                step="2"
                class="w-full"
              />
            </div>

            <!-- Gradient Colors -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Metal Colors</label>
              <div class="grid grid-cols-4 gap-2">
                <div class="flex flex-col items-center gap-1">
                  <input
                    v-model="config.color1"
                    type="color"
                    class="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                  <span class="font-mono text-[9px] text-white/30">Dark</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <input
                    v-model="config.color2"
                    type="color"
                    class="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                  <span class="font-mono text-[9px] text-white/30">Bright</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <input
                    v-model="config.color3"
                    type="color"
                    class="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                  <span class="font-mono text-[9px] text-white/30">Shadow</span>
                </div>
                <div class="flex flex-col items-center gap-1">
                  <input
                    v-model="config.color4"
                    type="color"
                    class="h-8 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                  <span class="font-mono text-[9px] text-white/30">Mid</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Animation & Effects -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation & Effects</h3>
            
            <!-- Flow Speed -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Flow Speed</label>
                <span class="font-mono text-xs text-white/40">{{ config.flowSpeed }}s</span>
              </div>
              <input
                v-model.number="config.flowSpeed"
                type="range"
                min="4"
                max="20"
                step="1"
                class="w-full"
              />
            </div>

            <!-- Wave Intensity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Wave Intensity</label>
                <span class="font-mono text-xs text-white/40">{{ config.waveIntensity }}%</span>
              </div>
              <input
                v-model.number="config.waveIntensity"
                type="range"
                min="5"
                max="40"
                step="5"
                class="w-full"
              />
            </div>

            <!-- Shimmer Enabled -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Shimmer Effect</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.shimmerEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.shimmerEnabled = !config.shimmerEnabled"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.shimmerEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Shimmer Speed -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Shimmer Speed</label>
                <span class="font-mono text-xs text-white/40">{{ config.shimmerSpeed }}s</span>
              </div>
              <input
                v-model.number="config.shimmerSpeed"
                type="range"
                min="2"
                max="10"
                step="0.5"
                class="w-full"
              />
            </div>

            <!-- Glow Enabled -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Glow Effect</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.glowEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.glowEnabled = !config.glowEnabled"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.glowEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Glow Intensity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Glow Intensity</label>
                <span class="font-mono text-xs text-white/40">{{ config.glowIntensity }}</span>
              </div>
              <input
                v-model.number="config.glowIntensity"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                class="w-full"
              />
            </div>
          </div>

          <!-- Tilt -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Tilt</h3>
            
            <!-- Tilt Enabled -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Enable Tilt</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.tiltEnabled ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.tiltEnabled = !config.tiltEnabled"
              >
                <div
                  :class="['h-4 w-4 rounded-full bg-dark-900 transition-transform', config.tiltEnabled ? 'translate-x-5' : 'translate-x-0.5']"
                />
              </button>
            </div>
            
            <!-- Tilt Strength -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Strength</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltStrength }}°</span>
              </div>
              <input
                v-model.number="config.tiltStrength"
                type="range"
                min="5"
                max="30"
                step="1"
                class="w-full"
              />
            </div>
            
            <!-- Tilt Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltDuration }}s</span>
              </div>
              <input
                v-model.number="config.tiltDuration"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                class="w-full"
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
          Liquid metal creates a flowing chrome effect using animated gradient backgrounds.
          The gradient smoothly shifts position creating an organic, mercury-like movement.
          Add shimmer for realistic light reflection.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Multi-color gradient with <code class="text-white/80">background-size: 300%</code> for overflow</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">background-position</code> animates with ease-in-out for organic flow</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Shimmer uses a sharp gradient that sweeps across the surface</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Border uses <code class="text-white/80">mask-composite</code> to show gradient only on edges</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS Animations</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">background-position</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">mask-composite</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Gradients</span>
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

.liquid-metal-card {
  position: relative;
  isolation: isolate;
}

/* Liquid fill effect */
.liquid-metal-card.fill-effect {
  background: linear-gradient(
    135deg,
    var(--color-1) 0%,
    var(--color-2) 25%,
    var(--color-3) 50%,
    var(--color-2) 75%,
    var(--color-4) 100%
  );
  background-size: 300% 300%;
  animation: liquidFlow var(--flow-speed) ease-in-out infinite;
}

/* Border effect */
.liquid-metal-card.border-effect::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: var(--border-width);
  border-radius: var(--border-radius);
  background: linear-gradient(
    135deg,
    var(--color-1) 0%,
    var(--color-2) calc(50% - var(--wave-intensity) / 2),
    var(--color-3) 50%,
    var(--color-2) calc(50% + var(--wave-intensity) / 2),
    var(--color-4) 100%
  );
  background-size: 300% 300%;
  animation: liquidFlow var(--flow-speed) ease-in-out infinite;
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Glow effect */
.liquid-metal-card.glow-effect::after {
  content: '';
  position: absolute;
  inset: calc(var(--glow-spread) * -1);
  border-radius: calc(var(--border-radius) + var(--glow-spread));
  background: linear-gradient(
    135deg,
    transparent 0%,
    color-mix(in srgb, var(--color-2) calc(var(--glow-intensity) * 100%), transparent) 50%,
    transparent 100%
  );
  background-size: 300% 300%;
  animation: liquidFlow var(--flow-speed) ease-in-out infinite;
  filter: blur(var(--glow-spread));
  z-index: -1;
  pointer-events: none;
}

/* Shimmer sweep */
.shimmer {
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: shimmer var(--shimmer-speed) ease-in-out infinite;
}

@keyframes liquidFlow {
  0%, 100% { 
    background-position: 0% 50%;
  }
  50% { 
    background-position: 100% 50%;
  }
}

@keyframes shimmer {
  0% { 
    background-position: 200% 0;
  }
  100% { 
    background-position: -200% 0;
  }
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

input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 2px;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>
