<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, type Component } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Droplets, Snowflake, Layers, Palette, Diamond, Aperture, Blend, CloudRain, GlassWater } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const glassRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const reflectionRef = ref<HTMLElement | null>(null)
const holoRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Drag state
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

// Active preset
const activePreset = ref('Frosted')

// Configuration state
const config = ref({
  // Glass core
  blur: 20,
  opacity: 0.15,
  borderOpacity: 0.3,
  saturation: 1.8,
  // Reflection
  reflectionSize: 150,
  reflectionOpacity: 0.4,
  reflectionBlur: 40,
  // Tilt
  tiltStrength: 15,
  tiltDuration: 0.5,
  // Drag
  dragEnabled: true,
  dragEase: 0.15,
  // Fractal (striation)
  striationWidth: 8,
  striationOpacity: 0.25,
  striationGap: 4,
  // Tinted
  tintColor: '#3b82f6',
  tintOpacity: 0.15,
  // Crystalline
  iridescenceOpacity: 0.15,
  noiseOpacity: 0.06,
  // Holographic
  holoIntensity: 0.2,
  holoSpread: 200,
  // Gradient
  gradientDirection: 'to bottom',
  gradientStrength: 0.3,
  // Wet
  dropletDensity: 'medium',
  streakOpacity: 0.12,
  // Apple
  refractionStrength: 0.5,
  depthShadow: 0.1
})

// Preset definitions
const glassPresets = [
  {
    name: 'Plain',
    icon: 'Droplets',
    description: 'Minimal, nearly transparent',
    config: {
      blur: 4,
      opacity: 0.05,
      borderOpacity: 0.15,
      saturation: 1.0,
      reflectionSize: 80,
      reflectionOpacity: 0.15,
      reflectionBlur: 50
    }
  },
  {
    name: 'Frosted',
    icon: 'Snowflake',
    description: 'Classic glassmorphism',
    config: {
      blur: 20,
      opacity: 0.15,
      borderOpacity: 0.3,
      saturation: 1.8,
      reflectionSize: 150,
      reflectionOpacity: 0.4,
      reflectionBlur: 40
    }
  },
  {
    name: 'Fractal',
    icon: 'Layers',
    description: 'Ribbed glass striations',
    config: {
      blur: 8,
      opacity: 0.08,
      borderOpacity: 0.2,
      saturation: 1.5,
      reflectionSize: 120,
      reflectionOpacity: 0.25,
      reflectionBlur: 30,
      striationWidth: 8,
      striationOpacity: 0.25,
      striationGap: 4
    }
  },
  {
    name: 'Tinted',
    icon: 'Palette',
    description: 'Colored stained glass',
    config: {
      blur: 16,
      opacity: 0.2,
      borderOpacity: 0.25,
      saturation: 2.0,
      reflectionSize: 140,
      reflectionOpacity: 0.35,
      reflectionBlur: 40,
      tintColor: '#3b82f6',
      tintOpacity: 0.15
    }
  },
  {
    name: 'Crystalline',
    icon: 'Diamond',
    description: 'Prismatic iridescence',
    config: {
      blur: 12,
      opacity: 0.1,
      borderOpacity: 0.35,
      saturation: 2.2,
      reflectionSize: 180,
      reflectionOpacity: 0.5,
      reflectionBlur: 35,
      iridescenceOpacity: 0.15,
      noiseOpacity: 0.06
    }
  },
  {
    name: 'Holographic',
    icon: 'Aperture',
    description: 'Dichroic color-shifting glass',
    config: {
      blur: 14,
      opacity: 0.12,
      borderOpacity: 0.3,
      saturation: 2.0,
      reflectionSize: 160,
      reflectionOpacity: 0.45,
      reflectionBlur: 35,
      holoIntensity: 0.2,
      holoSpread: 200
    }
  },
  {
    name: 'Gradient',
    icon: 'Blend',
    description: 'Gradient opacity fade',
    config: {
      blur: 18,
      opacity: 0.15,
      borderOpacity: 0.25,
      saturation: 1.6,
      reflectionSize: 140,
      reflectionOpacity: 0.35,
      reflectionBlur: 40,
      gradientDirection: 'to bottom',
      gradientStrength: 0.3
    }
  },
  {
    name: 'Wet',
    icon: 'CloudRain',
    description: 'Rain-covered glass',
    config: {
      blur: 10,
      opacity: 0.1,
      borderOpacity: 0.2,
      saturation: 1.4,
      reflectionSize: 100,
      reflectionOpacity: 0.3,
      reflectionBlur: 45,
      dropletDensity: 'medium',
      streakOpacity: 0.12
    }
  },
  {
    name: 'Apple',
    icon: 'GlassWater',
    description: 'iOS liquid glass refraction',
    config: {
      blur: 24,
      opacity: 0.08,
      borderOpacity: 0.4,
      saturation: 1.9,
      reflectionSize: 200,
      reflectionOpacity: 0.3,
      reflectionBlur: 50,
      refractionStrength: 0.5,
      depthShadow: 0.1
    }
  }
]

// Tint sub-presets
const tintColors = [
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Cyan', color: '#06b6d4' }
]

// Gradient direction options
const gradientDirections = [
  { name: '↓', value: 'to bottom' },
  { name: '↑', value: 'to top' },
  { name: '→', value: 'to right' },
  { name: '←', value: 'to left' },
  { name: '↘', value: 'to bottom right' }
]

const presetIcons: Record<string, Component> = {
  Droplets,
  Snowflake,
  Layers,
  Palette,
  Diamond,
  Aperture,
  Blend,
  CloudRain,
  GlassWater
}

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
  dragEase: 0.15,
  striationWidth: 8,
  striationOpacity: 0.25,
  striationGap: 4,
  tintColor: '#3b82f6',
  tintOpacity: 0.15,
  iridescenceOpacity: 0.15,
  noiseOpacity: 0.06,
  holoIntensity: 0.2,
  holoSpread: 200,
  gradientDirection: 'to bottom',
  gradientStrength: 0.3,
  dropletDensity: 'medium',
  streakOpacity: 0.12,
  refractionStrength: 0.5,
  depthShadow: 0.1
}

const applyPreset = (presetName: string) => {
  const preset = glassPresets.find(p => p.name === presetName)
  if (preset) {
    activePreset.value = presetName
    Object.assign(config.value, preset.config)
  }
}

const resetConfig = () => {
  config.value = { ...defaults }
  activePreset.value = 'Frosted'
  position.value = { x: 0, y: 0 }
  if (wrapperRef.value) {
    gsap.to(wrapperRef.value, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
  }
}

// Glass styles
const glassStyle = computed(() => {
  const base: Record<string, string> = {
    backdropFilter: `blur(${config.value.blur}px) saturate(${config.value.saturation})`,
    WebkitBackdropFilter: `blur(${config.value.blur}px) saturate(${config.value.saturation})`,
    backgroundColor: `rgba(255, 255, 255, ${config.value.opacity})`,
    border: `1px solid rgba(255, 255, 255, ${config.value.borderOpacity})`
  }

  // Apple preset: add box-shadow for refraction + depth
  if (activePreset.value === 'Apple') {
    base.boxShadow = `
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, ${config.value.refractionStrength}),
      inset 1px 0 0 rgba(255, 255, 255, ${config.value.refractionStrength * 0.5}),
      inset -1px 0 0 rgba(255, 255, 255, ${config.value.refractionStrength * 0.5}),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05),
      inset 0 4px 30px rgba(0, 0, 0, ${config.value.depthShadow})
    `
  }

  return base
})

const reflectionStyle = computed(() => ({
  width: `${config.value.reflectionSize}px`,
  height: `${config.value.reflectionSize}px`,
  opacity: config.value.reflectionOpacity,
  filter: `blur(${config.value.reflectionBlur}px)`
}))

const striationStyle = computed(() => ({
  background: `repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, ${config.value.striationOpacity}) 0px,
    rgba(255, 255, 255, ${config.value.striationOpacity * 0.3}) ${config.value.striationWidth * 0.3}px,
    transparent ${config.value.striationWidth * 0.5}px,
    transparent ${config.value.striationWidth}px,
    rgba(255, 255, 255, ${config.value.striationOpacity * 0.6}) ${config.value.striationWidth + config.value.striationGap * 0.5}px,
    transparent ${config.value.striationWidth + config.value.striationGap}px
  )`,
  opacity: 1
}))

const tintStyle = computed(() => ({
  backgroundColor: config.value.tintColor,
  opacity: config.value.tintOpacity
}))

const iridescenceStyle = computed(() => ({
  opacity: config.value.iridescenceOpacity
}))

const noiseStyle = computed(() => ({
  opacity: config.value.noiseOpacity
}))

const holoStyle = computed(() => ({
  opacity: config.value.holoIntensity,
  width: `${config.value.holoSpread * 2}px`,
  height: `${config.value.holoSpread * 2}px`
}))

const gradientOverlayStyle = computed(() => ({
  background: `linear-gradient(${config.value.gradientDirection}, rgba(255, 255, 255, ${config.value.gradientStrength}), transparent)`,
  opacity: 1
}))

// Wet: generate droplet positions
const dropletCounts: Record<string, number> = { sparse: 8, medium: 16, heavy: 28 }

const dropletBackground = computed(() => {
  // Deterministic pseudo-random positions based on density
  const count = dropletCounts[config.value.dropletDensity] || 16
  const drops: string[] = []
  for (let i = 0; i < count; i++) {
    const x = ((i * 37 + 13) % 90) + 5
    const y = ((i * 53 + 7) % 85) + 5
    const size = 2 + (i % 4)
    const opacity = 0.2 + (i % 3) * 0.15
    drops.push(`radial-gradient(circle ${size}px at ${x}% ${y}%, rgba(255, 255, 255, ${opacity}) 0%, transparent 100%)`)
  }
  return drops.join(', ')
})

const streakStyle = computed(() => ({
  background: `repeating-linear-gradient(
    175deg,
    transparent,
    transparent 18px,
    rgba(255, 255, 255, ${config.value.streakOpacity}) 18px,
    rgba(255, 255, 255, ${config.value.streakOpacity * 0.5}) 19px,
    transparent 20px
  )`,
  opacity: 1
}))

const appleSpecularStyle = computed(() => ({
  background: `linear-gradient(to bottom, rgba(255, 255, 255, ${config.value.refractionStrength * 0.6}) 0%, transparent 40%)`,
  opacity: 1
}))

// Card description per preset
const presetDescriptions: Record<string, string> = {
  Plain: 'Minimal transparency with a subtle glass hint.',
  Frosted: 'Classic frosted glass with blur and saturation.',
  Fractal: 'Ribbed glass with vertical striations that refract light.',
  Tinted: 'Colored glass with a tinted overlay effect.',
  Crystalline: 'Prismatic glass with iridescent rainbow refraction.',
  Holographic: 'Dichroic glass that shifts color as you move.',
  Gradient: 'Glass with gradient opacity — dense to clear.',
  Wet: 'Rain-covered glass with droplets and streaks.',
  Apple: 'iOS-style liquid glass with edge refraction.'
}

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

  // Holographic: update conic gradient position
  if (activePreset.value === 'Holographic' && holoRef.value) {
    const angle = (x / rect.width) * 360
    holoRef.value.style.setProperty('--holo-angle', `${angle}deg`)
    holoRef.value.style.setProperty('--holo-x', `${x}px`)
    holoRef.value.style.setProperty('--holo-y', `${y}px`)
  }
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
  let code = `.glass {
  backdrop-filter: blur(${config.value.blur}px) saturate(${config.value.saturation});
  -webkit-backdrop-filter: blur(${config.value.blur}px) saturate(${config.value.saturation});
  background: rgba(255, 255, 255, ${config.value.opacity});
  border: 1px solid rgba(255, 255, 255, ${config.value.borderOpacity});
  border-radius: 24px;
  position: relative;
  overflow: hidden;
}`

  if (activePreset.value === 'Fractal') {
    code += `

/* Fractal / Ribbed Glass Striations */
.glass::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, ${config.value.striationOpacity}) 0px,
    transparent ${config.value.striationWidth * 0.5}px,
    transparent ${config.value.striationWidth}px,
    rgba(255, 255, 255, ${config.value.striationOpacity * 0.6}) ${config.value.striationWidth + config.value.striationGap * 0.5}px,
    transparent ${config.value.striationWidth + config.value.striationGap}px
  );
  pointer-events: none;
}`
  }

  if (activePreset.value === 'Tinted') {
    code += `

/* Tinted Glass Overlay */
.glass .tint-layer {
  position: absolute;
  inset: 0;
  background-color: ${config.value.tintColor};
  opacity: ${config.value.tintOpacity};
  mix-blend-mode: overlay;
  pointer-events: none;
  border-radius: inherit;
}`
  }

  if (activePreset.value === 'Crystalline') {
    code += `

/* Crystalline Iridescence */
.glass .iridescence-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 0, 0, 0.15),
    rgba(255, 165, 0, 0.12),
    rgba(255, 255, 0, 0.1),
    rgba(0, 255, 0, 0.12),
    rgba(0, 100, 255, 0.15),
    rgba(128, 0, 255, 0.12),
    rgba(255, 0, 128, 0.1)
  );
  background-size: 300% 300%;
  animation: iridescenceShift 6s ease-in-out infinite;
  mix-blend-mode: color-dodge;
  opacity: ${config.value.iridescenceOpacity};
  pointer-events: none;
}

@keyframes iridescenceShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}`
  }

  if (activePreset.value === 'Holographic') {
    code += `

/* Holographic / Dichroic Glass */
.glass .holo-layer {
  position: absolute;
  background: conic-gradient(
    from var(--holo-angle, 0deg) at var(--holo-x, 50%) var(--holo-y, 50%),
    #ff0000, #ff8800, #ffff00, #00ff00,
    #00ffff, #0000ff, #8800ff, #ff0000
  );
  mix-blend-mode: color-dodge;
  opacity: ${config.value.holoIntensity};
  pointer-events: none;
  border-radius: inherit;
}

/* Update --holo-angle and --holo-x/y on mousemove via JS */`
  }

  if (activePreset.value === 'Gradient') {
    code += `

/* Gradient Opacity Fade */
.glass .gradient-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(${config.value.gradientDirection},
    rgba(255, 255, 255, ${config.value.gradientStrength}), transparent);
  pointer-events: none;
  border-radius: inherit;
}`
  }

  if (activePreset.value === 'Wet') {
    code += `

/* Wet Glass — Rain Droplets */
.glass .droplet-layer {
  position: absolute;
  inset: 0;
  background: /* multiple radial-gradient droplets */;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* Rain Streaks */
.glass .streak-layer {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    175deg,
    transparent, transparent 18px,
    rgba(255, 255, 255, ${config.value.streakOpacity}) 18px,
    rgba(255, 255, 255, ${config.value.streakOpacity * 0.5}) 19px,
    transparent 20px
  );
  animation: rainDrip 4s linear infinite;
  pointer-events: none;
}

@keyframes rainDrip {
  0% { transform: translateY(0); }
  100% { transform: translateY(20px); }
}`
  }

  if (activePreset.value === 'Apple') {
    code += `

/* Apple iOS Liquid Glass */
.glass {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, ${config.value.refractionStrength}),
    inset 1px 0 0 rgba(255, 255, 255, ${config.value.refractionStrength * 0.5}),
    inset -1px 0 0 rgba(255, 255, 255, ${config.value.refractionStrength * 0.5}),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    inset 0 4px 30px rgba(0, 0, 0, ${config.value.depthShadow});
}

/* Specular Top Highlight */
.glass .specular-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, ${config.value.refractionStrength * 0.6}) 0%,
    transparent 40%);
  pointer-events: none;
  border-radius: inherit;
}`
  }

  code += `

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

  return code
})

const copyCode = async () => {
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- SVG Filters (hidden) -->
    <svg width="0" height="0" class="absolute">
      <defs>
        <filter id="crystalline-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="desaturated" />
          <feBlend in="SourceGraphic" in2="desaturated" mode="overlay" />
        </filter>
      </defs>
    </svg>

    <!-- Header -->
    <header
      class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Liquid Glass</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef"
      class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden">
      <!-- Sharp Background Pattern -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Grid pattern -->
        <div class="absolute inset-0 opacity-20"
          style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;" />

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
        <div
          class="absolute left-0 top-[30%] h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div
          class="absolute left-0 bottom-[40%] h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <!-- Instructions (part of background so glass blurs them) -->
        <div class="absolute inset-x-0 top-8 text-center font-mono text-[10px] uppercase tracking-widest text-white/40">
          Interactive Demo — Drag to move</div>
        <div class="absolute inset-x-0 bottom-8 text-center font-mono text-xs leading-relaxed text-white/40 px-6">Drag
          to move the card. Hover to see 3D tilt and light reflection.</div>
      </div>

      <!-- Glass Card Wrapper (for dragging) -->
      <div ref="wrapperRef" class="perspective-1000"
        :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging && config.dragEnabled }">
        <div ref="glassRef"
          class="relative h-72 w-80 rounded-3xl p-8 shadow-2xl transform-gpu select-none overflow-hidden"
          :style="glassStyle" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
          <!-- Reflection -->
          <div ref="reflectionRef"
            class="pointer-events-none absolute rounded-full bg-gradient-radial from-white to-transparent"
            :style="reflectionStyle" />

          <!-- Edge highlight -->
          <div
            class="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent" />

          <!-- Fractal: Striation overlay -->
          <div v-if="activePreset === 'Fractal'"
            class="striation-layer pointer-events-none absolute inset-0 rounded-3xl" :style="striationStyle" />

          <!-- Tinted: Color overlay -->
          <div v-if="activePreset === 'Tinted'" class="tint-layer pointer-events-none absolute inset-0 rounded-3xl"
            :style="tintStyle" />

          <!-- Crystalline: Iridescence overlay -->
          <div v-if="activePreset === 'Crystalline'"
            class="iridescence-layer pointer-events-none absolute inset-0 rounded-3xl" :style="iridescenceStyle" />

          <!-- Crystalline: Noise texture overlay -->
          <div v-if="activePreset === 'Crystalline'"
            class="noise-layer pointer-events-none absolute inset-0 rounded-3xl" :style="noiseStyle" />

          <!-- Holographic: Conic gradient overlay -->
          <div v-if="activePreset === 'Holographic'" ref="holoRef"
            class="holo-layer pointer-events-none absolute rounded-full" :style="holoStyle" />

          <!-- Gradient: Opacity fade overlay -->
          <div v-if="activePreset === 'Gradient'"
            class="gradient-overlay pointer-events-none absolute inset-0 rounded-3xl" :style="gradientOverlayStyle" />

          <!-- Wet: Droplet layer -->
          <div v-if="activePreset === 'Wet'" class="droplet-layer pointer-events-none absolute inset-0 rounded-3xl"
            :style="{ background: dropletBackground }" />

          <!-- Wet: Streak layer -->
          <div v-if="activePreset === 'Wet'" class="streak-layer pointer-events-none absolute inset-0 rounded-3xl"
            :style="streakStyle" />

          <!-- Apple: Specular highlight -->
          <div v-if="activePreset === 'Apple'" class="pointer-events-none absolute inset-0 rounded-3xl"
            :style="appleSpecularStyle" />

          <!-- Content -->
          <div class="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div class="mb-2 h-8 w-8 rounded-full bg-white/20" />
              <h3 class="text-xl font-semibold text-white">Glass Card</h3>
              <p class="mt-2 text-sm text-white/60">
                {{ presetDescriptions[activePreset] }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-green-400" />
              <span class="text-xs text-white/50">{{ activePreset }}</span>
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
          <button class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="resetConfig">
            <RotateCcw class="h-3 w-3" />
            Reset
          </button>
        </div>

        <!-- Glass Preset -->
        <div class="mb-8 space-y-3">
          <label class="font-mono text-xs text-white/60">Glass Preset</label>
          <div class="flex flex-wrap gap-2">
            <button v-for="preset in glassPresets" :key="preset.name" :class="[
              'group flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-all duration-300',
              activePreset === preset.name
                ? 'border-white/30 bg-white/10 text-white shadow-lg shadow-white/5'
                : 'border-white/10 bg-white/[0.02] text-white/50 hover:border-white/20 hover:bg-white/[0.05] hover:text-white/70'
            ]" @click="applyPreset(preset.name)">
              <component :is="presetIcons[preset.icon]" class="h-3.5 w-3.5 transition-colors"
                :class="activePreset === preset.name ? 'text-white' : 'text-white/40 group-hover:text-white/60'" />
              <span>{{ preset.name }}</span>
            </button>
          </div>
          <p class="font-mono text-[10px] text-white/30">
            {{glassPresets.find(p => p.name === activePreset)?.description}}
          </p>
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
              <input v-model.number="config.blur" type="range" min="0" max="50" step="1" class="w-full">
            </div>

            <!-- Background Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Background Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.opacity }}</span>
              </div>
              <input v-model.number="config.opacity" type="range" min="0.05" max="0.5" step="0.05" class="w-full">
            </div>

            <!-- Border Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Border Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.borderOpacity }}</span>
              </div>
              <input v-model.number="config.borderOpacity" type="range" min="0" max="0.6" step="0.05" class="w-full">
            </div>

            <!-- Saturation -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Saturation</label>
                <span class="font-mono text-xs text-white/40">{{ config.saturation }}</span>
              </div>
              <input v-model.number="config.saturation" type="range" min="1" max="3" step="0.1" class="w-full">
            </div>

            <!-- Fractal-specific controls -->
            <template v-if="activePreset === 'Fractal'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Striation</h4>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Rib Width</label>
                    <span class="font-mono text-xs text-white/40">{{ config.striationWidth }}px</span>
                  </div>
                  <input v-model.number="config.striationWidth" type="range" min="3" max="24" step="1" class="w-full">
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Rib Gap</label>
                    <span class="font-mono text-xs text-white/40">{{ config.striationGap }}px</span>
                  </div>
                  <input v-model.number="config.striationGap" type="range" min="1" max="16" step="1" class="w-full">
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Rib Opacity</label>
                    <span class="font-mono text-xs text-white/40">{{ config.striationOpacity }}</span>
                  </div>
                  <input v-model.number="config.striationOpacity" type="range" min="0.05" max="0.6" step="0.05"
                    class="w-full">
                </div>
              </div>
            </template>

            <!-- Tinted-specific controls -->
            <template v-if="activePreset === 'Tinted'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Tint</h4>

                <div class="space-y-2">
                  <label class="font-mono text-xs text-white/60">Tint Color</label>
                  <div class="flex items-center gap-3">
                    <input v-model="config.tintColor" type="color"
                      class="h-8 w-12 cursor-pointer rounded border border-white/20 bg-transparent">
                    <div class="flex flex-wrap gap-1.5">
                      <button v-for="tc in tintColors" :key="tc.name" class="h-6 w-6 rounded-full border transition-all"
                        :class="config.tintColor === tc.color ? 'border-white scale-110' : 'border-white/20 hover:border-white/40'"
                        :style="{ backgroundColor: tc.color }" :title="tc.name" @click="config.tintColor = tc.color" />
                    </div>
                  </div>
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Tint Intensity</label>
                    <span class="font-mono text-xs text-white/40">{{ config.tintOpacity }}</span>
                  </div>
                  <input v-model.number="config.tintOpacity" type="range" min="0.05" max="0.4" step="0.05"
                    class="w-full">
                </div>
              </div>
            </template>

            <!-- Crystalline-specific controls -->
            <template v-if="activePreset === 'Crystalline'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Crystalline</h4>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Iridescence</label>
                    <span class="font-mono text-xs text-white/40">{{ config.iridescenceOpacity }}</span>
                  </div>
                  <input v-model.number="config.iridescenceOpacity" type="range" min="0.05" max="0.4" step="0.05"
                    class="w-full">
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Noise Texture</label>
                    <span class="font-mono text-xs text-white/40">{{ config.noiseOpacity }}</span>
                  </div>
                  <input v-model.number="config.noiseOpacity" type="range" min="0" max="0.2" step="0.01" class="w-full">
                </div>
              </div>
            </template>

            <!-- Holographic-specific controls -->
            <template v-if="activePreset === 'Holographic'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Holographic</h4>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Intensity</label>
                    <span class="font-mono text-xs text-white/40">{{ config.holoIntensity }}</span>
                  </div>
                  <input v-model.number="config.holoIntensity" type="range" min="0.05" max="0.5" step="0.05"
                    class="w-full">
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Spread</label>
                    <span class="font-mono text-xs text-white/40">{{ config.holoSpread }}px</span>
                  </div>
                  <input v-model.number="config.holoSpread" type="range" min="80" max="400" step="20" class="w-full">
                </div>
              </div>
            </template>

            <!-- Gradient-specific controls -->
            <template v-if="activePreset === 'Gradient'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Gradient</h4>

                <div class="space-y-2">
                  <label class="font-mono text-xs text-white/60">Direction</label>
                  <div class="flex flex-wrap gap-1.5">
                    <button v-for="dir in gradientDirections" :key="dir.value"
                      class="flex h-8 w-8 items-center justify-center rounded border font-mono text-sm transition-all"
                      :class="config.gradientDirection === dir.value ? 'border-white bg-white/10 text-white' : 'border-white/20 text-white/40 hover:border-white/40'"
                      :title="dir.value" @click="config.gradientDirection = dir.value">
                      {{ dir.name }}
                    </button>
                  </div>
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Strength</label>
                    <span class="font-mono text-xs text-white/40">{{ config.gradientStrength }}</span>
                  </div>
                  <input v-model.number="config.gradientStrength" type="range" min="0.1" max="0.6" step="0.05"
                    class="w-full">
                </div>
              </div>
            </template>

            <!-- Wet-specific controls -->
            <template v-if="activePreset === 'Wet'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Rain</h4>

                <div class="space-y-2">
                  <label class="font-mono text-xs text-white/60">Droplet Density</label>
                  <div class="flex gap-2">
                    <button v-for="density in ['sparse', 'medium', 'heavy']" :key="density"
                      class="rounded border px-3 py-1.5 font-mono text-xs transition-all"
                      :class="config.dropletDensity === density ? 'border-white bg-white/10 text-white' : 'border-white/20 text-white/40 hover:border-white/40'"
                      @click="config.dropletDensity = density">
                      {{ density }}
                    </button>
                  </div>
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Streak Opacity</label>
                    <span class="font-mono text-xs text-white/40">{{ config.streakOpacity }}</span>
                  </div>
                  <input v-model.number="config.streakOpacity" type="range" min="0.05" max="0.3" step="0.01"
                    class="w-full">
                </div>
              </div>
            </template>

            <!-- Apple-specific controls -->
            <template v-if="activePreset === 'Apple'">
              <div class="border-t border-white/10 pt-4">
                <h4 class="mb-4 font-mono text-xs text-white/40 uppercase tracking-wider">Refraction</h4>

                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Edge Refraction</label>
                    <span class="font-mono text-xs text-white/40">{{ config.refractionStrength }}</span>
                  </div>
                  <input v-model.number="config.refractionStrength" type="range" min="0.1" max="1" step="0.05"
                    class="w-full">
                </div>

                <div class="mt-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-mono text-xs text-white/60">Depth Shadow</label>
                    <span class="font-mono text-xs text-white/40">{{ config.depthShadow }}</span>
                  </div>
                  <input v-model.number="config.depthShadow" type="range" min="0" max="0.3" step="0.01" class="w-full">
                </div>
              </div>
            </template>
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
              <input v-model.number="config.reflectionSize" type="range" min="50" max="300" step="10" class="w-full">
            </div>

            <!-- Reflection Opacity -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reflection Opacity</label>
                <span class="font-mono text-xs text-white/40">{{ config.reflectionOpacity }}</span>
              </div>
              <input v-model.number="config.reflectionOpacity" type="range" min="0.1" max="0.8" step="0.05"
                class="w-full">
            </div>

            <!-- Reflection Blur -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Reflection Blur</label>
                <span class="font-mono text-xs text-white/40">{{ config.reflectionBlur }}px</span>
              </div>
              <input v-model.number="config.reflectionBlur" type="range" min="10" max="80" step="5" class="w-full">
            </div>

            <!-- Tilt Strength -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Tilt Strength</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltStrength }}°</span>
              </div>
              <input v-model.number="config.tiltStrength" type="range" min="0" max="30" step="1" class="w-full">
            </div>

            <!-- Tilt Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Tilt Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.tiltDuration }}s</span>
              </div>
              <input v-model.number="config.tiltDuration" type="range" min="0.1" max="1" step="0.05" class="w-full">
            </div>

            <!-- Drag Enabled -->
            <div class="flex items-center justify-between pt-2">
              <label class="font-mono text-xs text-white/60">Drag Enabled</label>
              <button :class="[
                'h-5 w-10 rounded-full transition-colors',
                config.dragEnabled ? 'bg-white' : 'bg-white/20'
              ]" @click="config.dragEnabled = !config.dragEnabled">
                <div :class="[
                  'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                  config.dragEnabled ? 'translate-x-5' : 'translate-x-0.5'
                ]" />
              </button>
            </div>

            <!-- Drag Smoothness -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Drag Smoothness</label>
                <span class="font-mono text-xs text-white/40">{{ config.dragEase }}s</span>
              </div>
              <input v-model.number="config.dragEase" type="range" min="0" max="0.5" step="0.05" class="w-full">
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
          <button class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="copyCode">
            <component :is="copied ? Check : Copy" class="h-3 w-3" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre
          class="mt-4 overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80">
      <code>{{ generatedCode }}</code></pre>
      </div>
    </section>

    <!-- Info Section -->
    <section class="border-t border-white/10 px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">About</h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
          Liquid glass (glassmorphism) creates depth and hierarchy through transparency and blur.
          This implementation features 9 distinct presets — from minimal plain glass to Apple's iOS-style
          liquid glass with edge refraction — each with realistic light reflection and 3D perspective tilt.
        </p>

        <!-- Presets Guide -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Presets</h3>
          <div class="mt-4 space-y-4">
            <div v-for="preset in glassPresets" :key="preset.name" class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20">
                <component :is="presetIcons[preset.icon]" class="h-3 w-3 text-white/60" />
              </span>
              <div>
                <p class="font-mono text-sm text-white/80">{{ preset.name }}</p>
                <p class="font-mono text-xs text-white/40">{{ preset.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60"><code class="text-white/80">backdrop-filter: blur()</code>
                creates the frosted glass effect</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Semi-transparent background + border adds depth layers</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Radial gradient follows cursor to simulate light reflection
              </p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">3D transforms (rotateX/Y) create perspective tilt on hover</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">5</span>
              <p class="font-mono text-sm text-white/60">Overlay layers (striations, tint, holo, rain, refraction) add
                preset-specific character</p>
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
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">SVG Filters</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">mix-blend-mode</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">conic-gradient</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">box-shadow</span>
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

/* Fractal striation layer */
.striation-layer {
  mix-blend-mode: overlay;
}

/* Tint layer */
.tint-layer {
  mix-blend-mode: overlay;
}

/* Crystalline iridescence */
.iridescence-layer {
  background: linear-gradient(135deg,
      rgba(255, 0, 60, 0.2) 0%,
      rgba(255, 165, 0, 0.15) 15%,
      rgba(255, 255, 0, 0.12) 30%,
      rgba(0, 255, 100, 0.15) 45%,
      rgba(0, 100, 255, 0.2) 60%,
      rgba(128, 0, 255, 0.15) 75%,
      rgba(255, 0, 128, 0.12) 90%,
      rgba(255, 0, 60, 0.2) 100%);
  background-size: 300% 300%;
  animation: iridescenceShift 6s ease-in-out infinite;
  mix-blend-mode: color-dodge;
}

/* Noise texture */
.noise-layer {
  filter: url(#crystalline-noise);
  background: rgba(255, 255, 255, 0.5);
  mix-blend-mode: overlay;
}

/* Holographic conic gradient */
.holo-layer {
  --holo-angle: 0deg;
  --holo-x: 50%;
  --holo-y: 50%;
  background: conic-gradient(from var(--holo-angle) at var(--holo-x) var(--holo-y),
      #ff0044,
      #ff8800,
      #ffee00,
      #00ff66,
      #00ccff,
      #4400ff,
      #aa00ff,
      #ff0044);
  mix-blend-mode: color-dodge;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: blur(20px);
}

/* Gradient overlay */
.gradient-overlay {
  mix-blend-mode: normal;
}

/* Wet: droplet layer */
.droplet-layer {
  mix-blend-mode: overlay;
}

/* Wet: streak layer */
.streak-layer {
  mix-blend-mode: overlay;
  animation: rainDrip 4s linear infinite;
}

@keyframes iridescenceShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  25% {
    background-position: 100% 0%;
  }

  50% {
    background-position: 100% 100%;
  }

  75% {
    background-position: 0% 100%;
  }
}

@keyframes rainDrip {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(20px);
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
