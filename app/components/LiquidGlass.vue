<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'

// Types
type GlassPreset = 'Plain' | 'Frosted' | 'Fractal' | 'Tinted' | 'Crystalline' | 'Holographic' | 'Gradient' | 'Apple'
type GlassVariant = 'card' | 'button' | 'nav'

interface Props {
  // Variant
  variant?: GlassVariant
  // Glass core
  blur?: number
  opacity?: number
  borderOpacity?: number
  saturation?: number
  // Reflection
  reflectionSize?: number
  reflectionOpacity?: number
  reflectionBlur?: number
  // Tilt
  tiltEnabled?: boolean
  tiltStrength?: number
  tiltDuration?: number
  // Drag
  dragEnabled?: boolean
  dragEase?: number
  // Preset
  preset?: GlassPreset
  // Fractal
  striationWidth?: number
  striationOpacity?: number
  striationGap?: number
  // Tinted
  tintColor?: string
  tintOpacity?: number
  // Crystalline
  iridescenceOpacity?: number
  noiseOpacity?: number
  // Holographic
  holoIntensity?: number
  holoSpread?: number
  // Gradient
  gradientDirection?: string
  gradientStrength?: number
  // Apple
  refractionStrength?: number
  depthShadow?: number
}

const props = withDefaults(defineProps<Props>(), {
  // Variant
  variant: 'card',
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
  tiltEnabled: true,
  tiltStrength: 15,
  tiltDuration: 0.5,
  // Drag
  dragEnabled: true,
  dragEase: 0.15,
  // Preset
  preset: 'Frosted',
  // Fractal
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
  // Apple
  refractionStrength: 0.5,
  depthShadow: 0.1
})

const emit = defineEmits<{
  'drag:start': []
  'drag:end': []
  'tilt': [{ tiltX: number; tiltY: number }]
  'presetChange': [preset: GlassPreset]
}>()

// Refs
const glassRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const reflectionRef = ref<HTMLElement | null>(null)
const holoRef = ref<HTMLElement | null>(null)

// Drag state
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

// Preset configurations (for reference/external use)
const _presetConfigs: Record<GlassPreset, Partial<Props>> = {
  Plain: {
    blur: 0,
    opacity: 0.02,
    borderOpacity: 0.08,
    saturation: 1.0,
    reflectionSize: 0,
    reflectionOpacity: 0,
    reflectionBlur: 0
  },
  Frosted: {
    blur: 20,
    opacity: 0.15,
    borderOpacity: 0.3,
    saturation: 1.8,
    reflectionSize: 150,
    reflectionOpacity: 0.4,
    reflectionBlur: 40
  },
  Fractal: {
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
  },
  Tinted: {
    blur: 16,
    opacity: 0.2,
    borderOpacity: 0.25,
    saturation: 2.0,
    reflectionSize: 140,
    reflectionOpacity: 0.35,
    reflectionBlur: 40,
    tintColor: '#3b82f6',
    tintOpacity: 0.15
  },
  Crystalline: {
    blur: 12,
    opacity: 0.1,
    borderOpacity: 0.35,
    saturation: 2.2,
    reflectionSize: 180,
    reflectionOpacity: 0.5,
    reflectionBlur: 35,
    iridescenceOpacity: 0.15,
    noiseOpacity: 0.06
  },
  Holographic: {
    blur: 14,
    opacity: 0.12,
    borderOpacity: 0.3,
    saturation: 2.0,
    reflectionSize: 160,
    reflectionOpacity: 0.45,
    reflectionBlur: 35,
    holoIntensity: 0.2,
    holoSpread: 200
  },
  Gradient: {
    blur: 18,
    opacity: 0.15,
    borderOpacity: 0.25,
    saturation: 1.6,
    reflectionSize: 140,
    reflectionOpacity: 0.35,
    reflectionBlur: 40,
    gradientDirection: 'to bottom',
    gradientStrength: 0.3
  },
  Apple: {
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

// Computed effective values - merge preset defaults with individual props
const effectiveBlur = computed(() => _presetConfigs[props.preset]?.blur ?? props.blur)
const effectiveOpacity = computed(() => _presetConfigs[props.preset]?.opacity ?? props.opacity)
const effectiveBorderOpacity = computed(() => _presetConfigs[props.preset]?.borderOpacity ?? props.borderOpacity)
const effectiveSaturation = computed(() => _presetConfigs[props.preset]?.saturation ?? props.saturation)
const effectiveReflectionSize = computed(() => _presetConfigs[props.preset]?.reflectionSize ?? props.reflectionSize)
const effectiveReflectionOpacity = computed(() => _presetConfigs[props.preset]?.reflectionOpacity ?? props.reflectionOpacity)
const effectiveReflectionBlur = computed(() => _presetConfigs[props.preset]?.reflectionBlur ?? props.reflectionBlur)
const effectiveStriationWidth = computed(() => _presetConfigs[props.preset]?.striationWidth ?? props.striationWidth)
const effectiveStriationOpacity = computed(() => _presetConfigs[props.preset]?.striationOpacity ?? props.striationOpacity)
const effectiveStriationGap = computed(() => _presetConfigs[props.preset]?.striationGap ?? props.striationGap)
const effectiveTintColor = computed(() => _presetConfigs[props.preset]?.tintColor ?? props.tintColor)
const effectiveTintOpacity = computed(() => _presetConfigs[props.preset]?.tintOpacity ?? props.tintOpacity)
const effectiveIridescenceOpacity = computed(() => _presetConfigs[props.preset]?.iridescenceOpacity ?? props.iridescenceOpacity)
const effectiveNoiseOpacity = computed(() => _presetConfigs[props.preset]?.noiseOpacity ?? props.noiseOpacity)
const effectiveHoloIntensity = computed(() => _presetConfigs[props.preset]?.holoIntensity ?? props.holoIntensity)
const effectiveHoloSpread = computed(() => _presetConfigs[props.preset]?.holoSpread ?? props.holoSpread)
const effectiveGradientDirection = computed(() => _presetConfigs[props.preset]?.gradientDirection ?? props.gradientDirection)
const effectiveGradientStrength = computed(() => _presetConfigs[props.preset]?.gradientStrength ?? props.gradientStrength)
const effectiveRefractionStrength = computed(() => _presetConfigs[props.preset]?.refractionStrength ?? props.refractionStrength)
const effectiveDepthShadow = computed(() => _presetConfigs[props.preset]?.depthShadow ?? props.depthShadow)

// Computed styles
const glassStyle = computed(() => {
  const base: Record<string, string> = {
    backdropFilter: `blur(${effectiveBlur.value}px) saturate(${effectiveSaturation.value})`,
    WebkitBackdropFilter: `blur(${effectiveBlur.value}px) saturate(${effectiveSaturation.value})`,
    backgroundColor: `rgba(255, 255, 255, ${effectiveOpacity.value})`,
    border: `1px solid rgba(255, 255, 255, ${effectiveBorderOpacity.value})`
  }

  // Apple preset: add box-shadow for refraction + depth
  if (props.preset === 'Apple') {
    base.boxShadow = `
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, ${effectiveRefractionStrength.value}),
      inset 1px 0 0 rgba(255, 255, 255, ${effectiveRefractionStrength.value * 0.5}),
      inset -1px 0 0 rgba(255, 255, 255, ${effectiveRefractionStrength.value * 0.5}),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05),
      inset 0 4px 30px rgba(0, 0, 0, ${effectiveDepthShadow.value})
    `
  }

  return base
})

const reflectionStyle = computed(() => ({
  width: `${effectiveReflectionSize.value}px`,
  height: `${effectiveReflectionSize.value}px`,
  opacity: effectiveReflectionOpacity.value,
  filter: `blur(${effectiveReflectionBlur.value}px)`
}))

const striationStyle = computed(() => ({
  background: `repeating-linear-gradient(
    90deg,
    rgba(255, 255, 255, ${effectiveStriationOpacity.value}) 0px,
    rgba(255, 255, 255, ${effectiveStriationOpacity.value * 0.3}) ${effectiveStriationWidth.value * 0.3}px,
    transparent ${effectiveStriationWidth.value * 0.5}px,
    transparent ${effectiveStriationWidth.value}px,
    rgba(255, 255, 255, ${effectiveStriationOpacity.value * 0.6}) ${effectiveStriationWidth.value + effectiveStriationGap.value * 0.5}px,
    transparent ${effectiveStriationWidth.value + effectiveStriationGap.value}px
  )`,
  opacity: 1
}))

const tintStyle = computed(() => ({
  backgroundColor: effectiveTintColor.value,
  opacity: effectiveTintOpacity.value
}))

const iridescenceStyle = computed(() => ({
  opacity: effectiveIridescenceOpacity.value
}))

const noiseStyle = computed(() => ({
  opacity: effectiveNoiseOpacity.value
}))

const holoStyle = computed(() => ({
  opacity: effectiveHoloIntensity.value,
  width: `${effectiveHoloSpread.value * 2}px`,
  height: `${effectiveHoloSpread.value * 2}px`
}))

const gradientOverlayStyle = computed(() => ({
  background: `linear-gradient(${effectiveGradientDirection.value}, rgba(255, 255, 255, ${effectiveGradientStrength.value}), transparent)`,
  opacity: 1
}))

const appleSpecularStyle = computed(() => ({
  background: `linear-gradient(to bottom, rgba(255, 255, 255, ${effectiveRefractionStrength.value * 0.6}) 0%, transparent 40%)`,
  opacity: 1
}))

// Drag handlers
const onMouseDown = (e: MouseEvent) => {
  if (!props.dragEnabled) return
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  emit('drag:start')
}

const onMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    emit('drag:end')
  }
}

const onGlobalMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !props.dragEnabled || !wrapperRef.value) return

  const newX = e.clientX - dragStart.value.x
  const newY = e.clientY - dragStart.value.y

  position.value = { x: newX, y: newY }

  gsap.to(wrapperRef.value, {
    x: newX,
    y: newY,
    duration: props.dragEase,
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
  const tiltX = ((y - centerY) / centerY) * props.tiltStrength
  const tiltY = ((centerX - x) / centerX) * props.tiltStrength

  if (props.tiltEnabled) {
    gsap.to(glassRef.value, {
      rotateX: tiltX,
      rotateY: tiltY,
      duration: props.tiltDuration,
      ease: 'power2.out'
    })

    emit('tilt', { tiltX, tiltY })
  }

  // Move reflection
  gsap.to(reflectionRef.value, {
    x: x - effectiveReflectionSize.value / 2,
    y: y - effectiveReflectionSize.value / 2,
    duration: 0.3,
    ease: 'power2.out'
  })

  // Holographic: update conic gradient position
  if (props.preset === 'Holographic' && holoRef.value) {
    const angle = (x / rect.width) * 360
    holoRef.value.style.setProperty('--holo-angle', `${angle}deg`)
    holoRef.value.style.setProperty('--holo-x', `${x}px`)
    holoRef.value.style.setProperty('--holo-y', `${y}px`)
  }
}

const onMouseLeave = () => {
  if (!glassRef.value) return

  if (props.tiltEnabled) {
    gsap.to(glassRef.value, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.5)'
    })
  }
}

// Watch for preset changes
watch(() => props.preset, (newPreset) => {
  emit('presetChange', newPreset)
})

// Lifecycle
onMounted(() => {
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onGlobalMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
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

  <!-- Glass Card Wrapper (for dragging) -->
  <div ref="wrapperRef" class="perspective-1000"
    :class="{ 'cursor-grabbing': isDragging, 'cursor-grab': !isDragging && dragEnabled && variant === 'card' }">
    <div ref="glassRef" class="relative shadow-2xl transform-gpu select-none overflow-hidden" :class="{
      'rounded-3xl': variant === 'card',
      'rounded-full': variant === 'button',
      'rounded-xl': variant === 'nav',
      'h-72 w-80 p-8': variant === 'card',
      'px-6 py-3': variant === 'button',
      'px-6 py-4': variant === 'nav'
    }" :style="glassStyle" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <!-- Reflection -->
      <div ref="reflectionRef"
        class="pointer-events-none absolute rounded-full bg-gradient-radial from-white to-transparent"
        :style="reflectionStyle" />

      <!-- Edge highlight -->
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
        :class="{
          'rounded-3xl': variant === 'card',
          'rounded-full': variant === 'button',
          'rounded-xl': variant === 'nav'
        }" />

      <!-- Fractal: Striation overlay -->
      <div v-if="preset === 'Fractal'" class="striation-layer pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="striationStyle" />

      <!-- Tinted: Color overlay -->
      <div v-if="preset === 'Tinted'" class="tint-layer pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="tintStyle" />

      <!-- Crystalline: Iridescence overlay -->
      <div v-if="preset === 'Crystalline'" class="iridescence-layer pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="iridescenceStyle" />

      <!-- Crystalline: Noise texture overlay -->
      <div v-if="preset === 'Crystalline'" class="noise-layer pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="noiseStyle" />

      <!-- Holographic: Conic gradient overlay -->
      <div v-if="preset === 'Holographic'" ref="holoRef" class="holo-layer pointer-events-none absolute rounded-full"
        :style="holoStyle" />

      <!-- Gradient: Opacity fade overlay -->
      <div v-if="preset === 'Gradient'" class="gradient-overlay pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="gradientOverlayStyle" />

      <!-- Apple: Specular highlight -->
      <div v-if="preset === 'Apple'" class="pointer-events-none absolute inset-0" :class="{
        'rounded-3xl': variant === 'card',
        'rounded-full': variant === 'button',
        'rounded-xl': variant === 'nav'
      }" :style="appleSpecularStyle" />

      <!-- Content -->
      <div class="relative z-10"
        :class="{ 'flex items-center justify-center': variant === 'button', 'flex items-center gap-4': variant === 'nav' }">
        <slot name="header" />
        <slot />
        <slot name="footer" />
      </div>
    </div>
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
</style>
