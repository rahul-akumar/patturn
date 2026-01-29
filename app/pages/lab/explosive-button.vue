<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Sparkles, Heart, Star, Zap, Circle } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const particleContainerRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const clickCount = ref(0)

// Configuration state
const config = ref({
  particleCount: 20,
  particleSize: 8,
  explosionRadius: 120,
  duration: 0.8,
  gravity: 0.5,
  spread: 360,
  particleShape: 'circle',
  colorScheme: 'rainbow',
  buttonScale: true,
  trailEffect: false
})

const defaults = {
  particleCount: 20,
  particleSize: 8,
  explosionRadius: 120,
  duration: 0.8,
  gravity: 0.5,
  spread: 360,
  particleShape: 'circle',
  colorScheme: 'rainbow',
  buttonScale: true,
  trailEffect: false
}

const colorSchemes: Record<string, string[]> = {
  rainbow: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff6b6b'],
  fire: ['#ff4757', '#ff6348', '#ff7f50', '#ffa502', '#ffb142', '#ffdd59'],
  ocean: ['#0abde3', '#48dbfb', '#00d2d3', '#01a3a4', '#74b9ff', '#a29bfe'],
  nature: ['#26de81', '#20bf6b', '#2bcbba', '#0fb9b1', '#fed330', '#f7b731'],
  sunset: ['#fc5c65', '#fd9644', '#fed330', '#f7b731', '#fa8231', '#eb3b5a'],
  monochrome: ['#ffffff', '#f1f2f6', '#dfe4ea', '#ced6e0', '#a4b0be', '#747d8c'],
  neon: ['#ff00ff', '#00ffff', '#ff00aa', '#00ff00', '#ffff00', '#ff3366']
}

const shapeOptions = [
  { id: 'circle', label: 'Circle', icon: Circle },
  { id: 'star', label: 'Star', icon: Star },
  { id: 'heart', label: 'Heart', icon: Heart },
  { id: 'spark', label: 'Spark', icon: Zap },
  { id: 'square', label: 'Square', icon: null }
]

const resetConfig = () => {
  config.value = { ...defaults }
}

// Create particle element
const createParticle = (x: number, y: number, color: string): HTMLElement => {
  const particle = document.createElement('div')
  particle.className = 'particle'
  
  const size = config.value.particleSize + Math.random() * 4 - 2
  
  particle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 100;
  `
  
  // Shape styles
  switch (config.value.particleShape) {
    case 'circle':
      particle.style.borderRadius = '50%'
      particle.style.backgroundColor = color
      break
    case 'square':
      particle.style.backgroundColor = color
      break
    case 'star':
      particle.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="${size * 2}" height="${size * 2}"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`
      particle.style.width = 'auto'
      particle.style.height = 'auto'
      break
    case 'heart':
      particle.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="${size * 2}" height="${size * 2}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
      particle.style.width = 'auto'
      particle.style.height = 'auto'
      break
    case 'spark':
      particle.style.width = `${size / 2}px`
      particle.style.height = `${size * 2}px`
      particle.style.backgroundColor = color
      particle.style.borderRadius = '2px'
      break
  }
  
  return particle
}

// Explode!
const explode = () => {
  if (!buttonRef.value || !particleContainerRef.value) return
  
  clickCount.value++
  
  const rect = buttonRef.value.getBoundingClientRect()
  const containerRect = particleContainerRef.value.getBoundingClientRect()
  
  const centerX = rect.left + rect.width / 2 - containerRect.left
  const centerY = rect.top + rect.height / 2 - containerRect.top
  
  const colors = colorSchemes[config.value.colorScheme]
  
  // Button squash animation
  if (config.value.buttonScale) {
    gsap.timeline()
      .to(buttonRef.value, {
        scale: 0.9,
        duration: 0.1,
        ease: 'power2.in'
      })
      .to(buttonRef.value, {
        scale: 1.1,
        duration: 0.15,
        ease: 'back.out(3)'
      })
      .to(buttonRef.value, {
        scale: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.4)'
      })
  }
  
  // Create particles
  for (let i = 0; i < config.value.particleCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)]
    const particle = createParticle(centerX, centerY, color)
    particleContainerRef.value.appendChild(particle)
    
    // Calculate angle based on spread
    const spreadRad = (config.value.spread / 360) * Math.PI * 2
    const startAngle = -spreadRad / 2 - Math.PI / 2 // Start from top
    const angle = startAngle + Math.random() * spreadRad
    
    const velocity = config.value.explosionRadius * (0.5 + Math.random() * 0.5)
    const destX = Math.cos(angle) * velocity
    const destY = Math.sin(angle) * velocity + (config.value.gravity * velocity * 0.5)
    
    const rotation = Math.random() * 720 - 360
    const scale = Math.random() * 0.5 + 0.5
    
    // Trail effect - create fading duplicates
    if (config.value.trailEffect) {
      gsap.to(particle, {
        x: destX,
        y: destY,
        rotation: rotation,
        scale: 0,
        opacity: 0,
        duration: config.value.duration,
        ease: 'power2.out',
        onUpdate: function() {
          if (Math.random() > 0.7 && particleContainerRef.value) {
            const trail = particle.cloneNode(true) as HTMLElement
            trail.style.opacity = '0.3'
            trail.style.transform = particle.style.transform
            particleContainerRef.value.appendChild(trail)
            gsap.to(trail, {
              opacity: 0,
              scale: 0,
              duration: 0.3,
              onComplete: () => trail.remove()
            })
          }
        },
        onComplete: () => particle.remove()
      })
    } else {
      gsap.to(particle, {
        x: destX,
        y: destY,
        rotation: rotation,
        scale: scale,
        duration: config.value.duration * 0.3,
        ease: 'power2.out'
      })
      
      gsap.to(particle, {
        y: `+=${config.value.gravity * 100}`,
        opacity: 0,
        scale: 0,
        duration: config.value.duration * 0.7,
        delay: config.value.duration * 0.3,
        ease: 'power2.in',
        onComplete: () => particle.remove()
      })
    }
  }
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
  return `const explode = (button, container) => {
  const colors = ${JSON.stringify(colorSchemes[config.value.colorScheme])}
  const rect = button.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  
  // Button animation
  gsap.timeline()
    .to(button, { scale: 0.9, duration: 0.1 })
    .to(button, { scale: 1.1, duration: 0.15, ease: 'back.out(3)' })
    .to(button, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' })
  
  // Create ${config.value.particleCount} particles
  for (let i = 0; i < ${config.value.particleCount}; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = \`
      position: fixed;
      left: \${centerX}px;
      top: \${centerY}px;
      width: ${config.value.particleSize}px;
      height: ${config.value.particleSize}px;
      background: \${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${config.value.particleShape === 'circle' ? '50%' : '0'};
      pointer-events: none;
    \`
    container.appendChild(particle)
    
    const angle = (Math.random() * ${config.value.spread} - ${config.value.spread / 2}) * Math.PI / 180 - Math.PI / 2
    const velocity = ${config.value.explosionRadius} * (0.5 + Math.random() * 0.5)
    
    gsap.to(particle, {
      x: Math.cos(angle) * velocity,
      y: Math.sin(angle) * velocity + ${config.value.gravity * 50},
      rotation: Math.random() * 720 - 360,
      opacity: 0,
      duration: ${config.value.duration},
      ease: 'power2.out',
      onComplete: () => particle.remove()
    })
  }
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
      <span class="text-lg font-medium tracking-tight">Explosive Button</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden px-6 py-16"
    >
      <!-- Particle container -->
      <div ref="particleContainerRef" class="pointer-events-none absolute inset-0 overflow-hidden" />
      
      <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      <p class="mb-12 font-mono text-xs text-white/40">Click count: {{ clickCount }}</p>
      
      <!-- Explosive Button -->
      <button
        ref="buttonRef"
        class="group relative overflow-hidden rounded-xl border-2 border-white/20 bg-gradient-to-br from-white/10 to-white/5 px-12 py-5 backdrop-blur-sm transition-colors hover:border-white/40"
        @click="explode"
      >
        <span class="relative z-10 flex items-center gap-3 font-medium tracking-wide">
          <Sparkles class="h-5 w-5" />
          Click Me!
        </span>
        
        <!-- Hover glow -->
        <div class="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Smash that button and watch the particles fly!
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
          <!-- Particle Settings -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Particles</h3>
            
            <!-- Particle Count -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Particle Count</label>
                <span class="font-mono text-xs text-white/40">{{ config.particleCount }}</span>
              </div>
              <input
                v-model.number="config.particleCount"
                type="range"
                min="5"
                max="50"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Particle Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Particle Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.particleSize }}px</span>
              </div>
              <input
                v-model.number="config.particleSize"
                type="range"
                min="4"
                max="20"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Explosion Radius -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Explosion Radius</label>
                <span class="font-mono text-xs text-white/40">{{ config.explosionRadius }}px</span>
              </div>
              <input
                v-model.number="config.explosionRadius"
                type="range"
                min="50"
                max="250"
                step="10"
                class="w-full"
              >
            </div>

            <!-- Spread -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Spread Angle</label>
                <span class="font-mono text-xs text-white/40">{{ config.spread }}°</span>
              </div>
              <input
                v-model.number="config.spread"
                type="range"
                min="45"
                max="360"
                step="15"
                class="w-full"
              >
            </div>

            <!-- Particle Shape -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Particle Shape</label>
              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="shape in shapeOptions"
                  :key="shape.id"
                  :class="[
                    'flex flex-col items-center gap-1 border py-2 transition-colors',
                    config.particleShape === shape.id 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.particleShape = shape.id"
                >
                  <component :is="shape.icon || 'div'" class="h-4 w-4" :class="{ 'h-4 w-4 bg-current': !shape.icon }" />
                  <span class="font-mono text-[9px]">{{ shape.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Animation & Color -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation & Color</h3>
            
            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.duration }}s</span>
              </div>
              <input
                v-model.number="config.duration"
                type="range"
                min="0.3"
                max="2"
                step="0.1"
                class="w-full"
              >
            </div>

            <!-- Gravity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Gravity</label>
                <span class="font-mono text-xs text-white/40">{{ config.gravity }}</span>
              </div>
              <input
                v-model.number="config.gravity"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full"
              >
            </div>

            <!-- Color Scheme -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Color Scheme</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="(colors, name) in colorSchemes"
                  :key="name"
                  :class="[
                    'flex flex-col items-center gap-1 border py-2 transition-colors',
                    config.colorScheme === name 
                      ? 'border-white/40 bg-white/10' 
                      : 'border-white/10 hover:border-white/20'
                  ]"
                  @click="config.colorScheme = name"
                >
                  <div class="flex -space-x-1">
                    <div
                      v-for="(color, i) in colors.slice(0, 4)"
                      :key="i"
                      class="h-3 w-3 rounded-full border border-dark-900"
                      :style="{ backgroundColor: color }"
                    />
                  </div>
                  <span class="font-mono text-[9px] capitalize text-white/60">{{ name }}</span>
                </button>
              </div>
            </div>

            <!-- Button Scale -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Button Squash Effect</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.buttonScale ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.buttonScale = !config.buttonScale"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.buttonScale ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Trail Effect -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Trail Effect</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.trailEffect ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.trailEffect = !config.trailEffect"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.trailEffect ? 'translate-x-5' : 'translate-x-0.5'
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
          Explosive buttons add satisfying micro-feedback to user interactions. The particle 
          burst creates a moment of delight that makes clicking feel rewarding. Great for 
          like buttons, submit actions, or celebration moments.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">On click, spawn particles at the button's center position</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Calculate random angles within the spread range for direction</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">GSAP animates position, rotation, and opacity with easing</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Gravity pulls particles down over time for natural feel</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Like/Heart buttons</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Form submissions</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Achievement unlocks</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Celebrations</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Game actions</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">DOM Particles</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Trigonometry</span>
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
