<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, MousePointer, Fingerprint, Waves } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const interactionAreaRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const interactionCount = ref(0)
const isDragging = ref(false)

// Configuration state
const config = ref({
  rippleColor: '#ffffff',
  rippleOpacity: 0.4,
  rippleSize: 200,
  rippleDuration: 0.8,
  rippleCount: 3,
  enableTrail: true,
  trailLength: 20,
  trailFade: true,
  trailColor: '#8b5cf6',
  trailWidth: 4,
  enableGlow: true,
  glowIntensity: 0.6,
  rippleStyle: 'circle' as 'circle' | 'square' | 'ring'
})

const defaults = {
  rippleColor: '#ffffff',
  rippleOpacity: 0.4,
  rippleSize: 200,
  rippleDuration: 0.8,
  rippleCount: 3,
  enableTrail: true,
  trailLength: 20,
  trailFade: true,
  trailColor: '#8b5cf6',
  trailWidth: 4,
  enableGlow: true,
  glowIntensity: 0.6,
  rippleStyle: 'circle' as const
}

const colorPresets = [
  { name: 'White', value: '#ffffff' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' }
]

const resetConfig = () => {
  config.value = { ...defaults }
}

// Trail points for canvas rendering
const trailPoints = ref<Array<{ x: number; y: number; age: number }>>([])
let animationFrameId: number | null = null

// Create ripple effect
const createRipple = (x: number, y: number) => {
  if (!interactionAreaRef.value) return
  
  interactionCount.value++
  
  const container = interactionAreaRef.value
  
  for (let i = 0; i < config.value.rippleCount; i++) {
    const ripple = document.createElement('div')
    ripple.className = 'ripple-element'
    
    const delay = i * 0.1
    const size = config.value.rippleSize * (1 - i * 0.15)
    
    // Base styles
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    `
    
    // Apply style based on rippleStyle
    if (config.value.rippleStyle === 'circle') {
      ripple.style.borderRadius = '50%'
      ripple.style.backgroundColor = config.value.rippleColor
      ripple.style.opacity = String(config.value.rippleOpacity)
    } else if (config.value.rippleStyle === 'ring') {
      ripple.style.borderRadius = '50%'
      ripple.style.border = `2px solid ${config.value.rippleColor}`
      ripple.style.opacity = String(config.value.rippleOpacity)
    } else if (config.value.rippleStyle === 'square') {
      ripple.style.backgroundColor = config.value.rippleColor
      ripple.style.opacity = String(config.value.rippleOpacity)
    }
    
    // Add glow effect
    if (config.value.enableGlow) {
      ripple.style.boxShadow = `0 0 ${20 * config.value.glowIntensity}px ${10 * config.value.glowIntensity}px ${config.value.rippleColor}`
    }
    
    container.appendChild(ripple)
    
    // Animate the ripple
    gsap.to(ripple, {
      width: size,
      height: size,
      opacity: 0,
      duration: config.value.rippleDuration,
      delay: delay,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    })
  }
}

// Handle mouse/touch events
const handleInteractionStart = (e: MouseEvent | TouchEvent) => {
  if (!interactionAreaRef.value) return
  
  const rect = interactionAreaRef.value.getBoundingClientRect()
  let x: number, y: number
  
  if ('touches' in e) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }
  
  createRipple(x, y)
  isDragging.value = true
  
  if (config.value.enableTrail) {
    trailPoints.value = [{ x, y, age: 0 }]
  }
}

const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !config.value.enableTrail || !interactionAreaRef.value) return
  
  const rect = interactionAreaRef.value.getBoundingClientRect()
  let x: number, y: number
  
  if ('touches' in e) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }
  
  trailPoints.value.push({ x, y, age: 0 })
  
  // Keep trail at max length
  if (trailPoints.value.length > config.value.trailLength) {
    trailPoints.value.shift()
  }
}

const handleInteractionEnd = () => {
  isDragging.value = false
}

// Canvas animation loop for trail
const animate = () => {
  if (!canvasRef.value) return
  
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  canvasRef.value.width = rect.width * window.devicePixelRatio
  canvasRef.value.height = rect.height * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  ctx.clearRect(0, 0, rect.width, rect.height)
  
  if (trailPoints.value.length > 1 && config.value.enableTrail) {
    // Age all points
    trailPoints.value = trailPoints.value.map(p => ({ ...p, age: p.age + 1 }))
    
    // Remove old points when not dragging
    if (!isDragging.value) {
      trailPoints.value = trailPoints.value.filter(p => p.age < 30)
    }
    
    // Draw trail
    ctx.beginPath()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    for (let i = 0; i < trailPoints.value.length; i++) {
      const point = trailPoints.value[i]
      const progress = i / trailPoints.value.length
      
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
      
      // Gradient-like effect with varying width
      if (config.value.trailFade) {
        ctx.lineWidth = config.value.trailWidth * progress
        ctx.strokeStyle = config.value.trailColor + Math.round(progress * (isDragging.value ? 255 : 255 - point.age * 8)).toString(16).padStart(2, '0')
      } else {
        ctx.lineWidth = config.value.trailWidth
        ctx.strokeStyle = config.value.trailColor
      }
    }
    
    ctx.stroke()
    
    // Draw glow
    if (config.value.enableGlow && trailPoints.value.length > 0) {
      const lastPoint = trailPoints.value[trailPoints.value.length - 1]
      const gradient = ctx.createRadialGradient(
        lastPoint.x, lastPoint.y, 0,
        lastPoint.x, lastPoint.y, 30 * config.value.glowIntensity
      )
      gradient.addColorStop(0, config.value.trailColor + '60')
      gradient.addColorStop(1, config.value.trailColor + '00')
      
      ctx.beginPath()
      ctx.arc(lastPoint.x, lastPoint.y, 30 * config.value.glowIntensity, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
    }
  }
  
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  animate()
  
  // Global mouse up listener
  window.addEventListener('mouseup', handleInteractionEnd)
  window.addEventListener('touchend', handleInteractionEnd)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('mouseup', handleInteractionEnd)
  window.removeEventListener('touchend', handleInteractionEnd)
})

const generatedCode = computed(() => {
  return `// Gesture Ripple - Create satisfying interaction feedback
const createRipple = (container, x, y, options = {}) => {
  const {
    color = '${config.value.rippleColor}',
    opacity = ${config.value.rippleOpacity},
    size = ${config.value.rippleSize},
    duration = ${config.value.rippleDuration},
    count = ${config.value.rippleCount},
    style = '${config.value.rippleStyle}',
    glow = ${config.value.enableGlow}
  } = options

  for (let i = 0; i < count; i++) {
    const ripple = document.createElement('div')
    const delay = i * 0.1
    const rippleSize = size * (1 - i * 0.15)
    
    Object.assign(ripple.style, {
      position: 'absolute',
      left: \`\${x}px\`,
      top: \`\${y}px\`,
      width: '0',
      height: '0',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      borderRadius: style === 'square' ? '0' : '50%',
      ${config.value.rippleStyle === 'ring' 
        ? `border: '2px solid \${color}',` 
        : `backgroundColor: color,`}
      opacity: String(opacity),
      ${config.value.enableGlow ? `boxShadow: \`0 0 \${20 * ${config.value.glowIntensity}}px \${color}\`,` : ''}
    })
    
    container.appendChild(ripple)
    
    gsap.to(ripple, {
      width: rippleSize,
      height: rippleSize,
      opacity: 0,
      duration,
      delay,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    })
  }
}

// Usage: Listen to clicks on your container
container.addEventListener('click', (e) => {
  const rect = container.getBoundingClientRect()
  createRipple(container, e.clientX - rect.left, e.clientY - rect.top)
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
      <span class="text-lg font-medium tracking-tight">Gesture Ripple</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[55vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden px-6 py-16"
    >
      <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      <p class="mb-8 font-mono text-xs text-white/40">Interactions: {{ interactionCount }}</p>
      
      <!-- Interaction Area -->
      <div 
        ref="interactionAreaRef"
        class="relative h-80 w-full max-w-2xl cursor-crosshair overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent"
        @mousedown="handleInteractionStart"
        @mousemove="handleInteractionMove"
        @touchstart.prevent="handleInteractionStart"
        @touchmove.prevent="handleInteractionMove"
      >
        <!-- Canvas for trail -->
        <canvas
          ref="canvasRef"
          class="pointer-events-none absolute inset-0 h-full w-full"
        />
        
        <!-- Center prompt -->
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div class="mb-4 flex items-center gap-4">
            <MousePointer class="h-5 w-5 text-white/20" />
            <Fingerprint class="h-5 w-5 text-white/20" />
            <Waves class="h-5 w-5 text-white/20" />
          </div>
          <p class="font-mono text-sm text-white/30">Click and drag anywhere</p>
          <p class="mt-1 font-mono text-[10px] text-white/20">Feel the feedback</p>
        </div>
        
        <!-- Corner decorations -->
        <div class="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-white/10" />
        <div class="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-white/10" />
        <div class="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/10" />
        <div class="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/10" />
      </div>
      
      <p class="mt-8 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Satisfying visual feedback that responds to every interaction.
        Click to ripple, drag to trail.
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
          <!-- Ripple Settings -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Ripple Effect</h3>
            
            <!-- Ripple Style -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Ripple Style</label>
              <div class="flex gap-2">
                <button
                  v-for="style in ['circle', 'ring', 'square']"
                  :key="style"
                  :class="[
                    'flex-1 border py-2 font-mono text-xs capitalize transition-colors',
                    config.rippleStyle === style 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.rippleStyle = style as typeof config.rippleStyle"
                >
                  {{ style }}
                </button>
              </div>
            </div>
            
            <!-- Ripple Color -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Ripple Color</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.value"
                  :class="[
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    config.rippleColor === preset.value ? 'border-white scale-110' : 'border-transparent'
                  ]"
                  :style="{ backgroundColor: preset.value }"
                  :title="preset.name"
                  @click="config.rippleColor = preset.value"
                />
                <input
                  v-model="config.rippleColor"
                  type="color"
                  class="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                  title="Custom color"
                >
              </div>
            </div>

            <!-- Ripple Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Ripple Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.rippleSize }}px</span>
              </div>
              <input
                v-model.number="config.rippleSize"
                type="range"
                min="50"
                max="400"
                step="10"
                class="w-full"
              >
            </div>

            <!-- Ripple Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.rippleDuration }}s</span>
              </div>
              <input
                v-model.number="config.rippleDuration"
                type="range"
                min="0.3"
                max="2"
                step="0.1"
                class="w-full"
              >
            </div>

            <!-- Ripple Count -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Ripple Count</label>
                <span class="font-mono text-xs text-white/40">{{ config.rippleCount }}</span>
              </div>
              <input
                v-model.number="config.rippleCount"
                type="range"
                min="1"
                max="5"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Ripple Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ Math.round(config.rippleOpacity * 100) }}%</span>
              </div>
              <input
                v-model.number="config.rippleOpacity"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                class="w-full"
              >
            </div>
          </div>

          <!-- Trail & Glow Settings -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Trail & Glow</h3>
            
            <!-- Enable Trail -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Enable Trail</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Show drag trail effect</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.enableTrail ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.enableTrail = !config.enableTrail"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.enableTrail ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Trail Color -->
            <div v-if="config.enableTrail" class="space-y-2">
              <label class="font-mono text-xs text-white/60">Trail Color</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="preset in colorPresets"
                  :key="preset.value"
                  :class="[
                    'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                    config.trailColor === preset.value ? 'border-white scale-110' : 'border-transparent'
                  ]"
                  :style="{ backgroundColor: preset.value }"
                  :title="preset.name"
                  @click="config.trailColor = preset.value"
                />
                <input
                  v-model="config.trailColor"
                  type="color"
                  class="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                  title="Custom color"
                >
              </div>
            </div>

            <!-- Trail Length -->
            <div v-if="config.enableTrail" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Trail Length</label>
                <span class="font-mono text-xs text-white/40">{{ config.trailLength }}</span>
              </div>
              <input
                v-model.number="config.trailLength"
                type="range"
                min="5"
                max="50"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Trail Width -->
            <div v-if="config.enableTrail" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Trail Width</label>
                <span class="font-mono text-xs text-white/40">{{ config.trailWidth }}px</span>
              </div>
              <input
                v-model.number="config.trailWidth"
                type="range"
                min="1"
                max="12"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Trail Fade -->
            <div v-if="config.enableTrail" class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Trail Fade Effect</label>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.trailFade ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.trailFade = !config.trailFade"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.trailFade ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Enable Glow -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Enable Glow</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Add glow to effects</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.enableGlow ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.enableGlow = !config.enableGlow"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.enableGlow ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Glow Intensity -->
            <div v-if="config.enableGlow" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Glow Intensity</label>
                <span class="font-mono text-xs text-white/40">{{ Math.round(config.glowIntensity * 100) }}%</span>
              </div>
              <input
                v-model.number="config.glowIntensity"
                type="range"
                min="0.2"
                max="1.5"
                step="0.1"
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
          Gesture Ripple provides immediate, satisfying visual feedback for user interactions.
          Based on Material Design's ripple effect but enhanced with customizable trails,
          glows, and multiple styles. Creates a tactile feel that makes interfaces 
          feel responsive and alive.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Click events spawn DOM elements at the exact interaction point</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">GSAP animates scale and opacity with easing for natural feel</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Drag trails use Canvas 2D API for smooth, performant rendering</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Point aging creates natural fade-out when interaction ends</p>
            </div>
          </div>
        </div>

        <!-- UX Benefits -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">UX Benefits</h3>
          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Immediate feedback</span> — Users know their action was registered</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Spatial awareness</span> — Shows exactly where interaction occurred</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Delight factor</span> — Creates satisfying, tactile feeling</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Accessibility</span> — Visual confirmation helps all users</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Buttons</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Cards & tiles</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Navigation items</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Interactive canvases</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Touch interfaces</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Creative tools</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Canvas 2D</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">requestAnimationFrame</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Touch Events</span>
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

input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}
</style>
