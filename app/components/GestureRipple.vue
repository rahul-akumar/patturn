<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { MousePointer, Fingerprint, Waves } from 'lucide-vue-next'

type RippleStyle = 'circle' | 'square' | 'ring'

const props = withDefaults(defineProps<{
  rippleColor?: string
  rippleOpacity?: number
  rippleSize?: number
  rippleDuration?: number
  rippleCount?: number
  enableTrail?: boolean
  trailLength?: number
  trailFade?: boolean
  trailColor?: string
  trailWidth?: number
  enableGlow?: boolean
  glowIntensity?: number
  rippleStyle?: RippleStyle
}>(), {
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
  rippleStyle: 'circle'
})

const emit = defineEmits<{
  ripple: [{ x: number; y: number }]
  trailStart: [{ x: number; y: number }]
  trailEnd: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const interactionAreaRef = ref<HTMLElement | null>(null)
const interactionCount = ref(0)
const isDragging = ref(false)

// Trail points for canvas rendering
const trailPoints = ref<Array<{ x: number; y: number; age: number }>>([])
let animationFrameId: number | null = null

// Create ripple effect
const createRipple = (x: number, y: number) => {
  if (!interactionAreaRef.value) return

  interactionCount.value++
  emit('ripple', { x, y })

  const container = interactionAreaRef.value

  for (let i = 0; i < props.rippleCount; i++) {
    const ripple = document.createElement('div')
    ripple.className = 'ripple-element'

    const delay = i * 0.1
    const size = props.rippleSize * (1 - i * 0.15)

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
    if (props.rippleStyle === 'circle') {
      ripple.style.borderRadius = '50%'
      ripple.style.backgroundColor = props.rippleColor
      ripple.style.opacity = String(props.rippleOpacity)
    } else if (props.rippleStyle === 'ring') {
      ripple.style.borderRadius = '50%'
      ripple.style.border = `2px solid ${props.rippleColor}`
      ripple.style.opacity = String(props.rippleOpacity)
    } else if (props.rippleStyle === 'square') {
      ripple.style.backgroundColor = props.rippleColor
      ripple.style.opacity = String(props.rippleOpacity)
    }

    // Add glow effect
    if (props.enableGlow) {
      ripple.style.boxShadow = `0 0 ${20 * props.glowIntensity}px ${10 * props.glowIntensity}px ${props.rippleColor}`
    }

    container.appendChild(ripple)

    // Animate the ripple
    gsap.to(ripple, {
      width: size,
      height: size,
      opacity: 0,
      duration: props.rippleDuration,
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

  if ('touches' in e && e.touches[0]) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else if ('clientX' in e) {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  } else {
    return
  }

  createRipple(x, y)
  isDragging.value = true

  if (props.enableTrail) {
    trailPoints.value = [{ x, y, age: 0 }]
    emit('trailStart', { x, y })
  }
}

const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !props.enableTrail || !interactionAreaRef.value) return

  const rect = interactionAreaRef.value.getBoundingClientRect()
  let x: number, y: number

  if ('touches' in e && e.touches[0]) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else if ('clientX' in e) {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  } else {
    return
  }

  trailPoints.value.push({ x, y, age: 0 })

  // Keep trail at max length
  if (trailPoints.value.length > props.trailLength) {
    trailPoints.value.shift()
  }
}

const handleInteractionEnd = () => {
  isDragging.value = false
  emit('trailEnd')
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

  if (trailPoints.value.length > 1 && props.enableTrail) {
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
      if (!point) continue

      const progress = i / trailPoints.value.length

      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }

      // Gradient-like effect with varying width
      if (props.trailFade) {
        ctx.lineWidth = props.trailWidth * progress
        ctx.strokeStyle = props.trailColor + Math.round(progress * (isDragging.value ? 255 : 255 - point.age * 8)).toString(16).padStart(2, '0')
      } else {
        ctx.lineWidth = props.trailWidth
        ctx.strokeStyle = props.trailColor
      }
    }

    ctx.stroke()

    // Draw glow
    if (props.enableGlow && trailPoints.value.length > 0) {
      const lastPoint = trailPoints.value[trailPoints.value.length - 1]
      if (lastPoint) {
        const gradient = ctx.createRadialGradient(
          lastPoint.x, lastPoint.y, 0,
          lastPoint.x, lastPoint.y, 30 * props.glowIntensity
        )
        gradient.addColorStop(0, props.trailColor + '60')
        gradient.addColorStop(1, props.trailColor + '00')

        ctx.beginPath()
        ctx.arc(lastPoint.x, lastPoint.y, 30 * props.glowIntensity, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
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

// Expose methods for parent components
defineExpose({
  createRipple,
  interactionCount
})
</script>

<template>
  <div ref="containerRef" class="gesture-ripple-demo flex h-full w-full flex-col items-center justify-center p-6">
    <div ref="interactionAreaRef"
      class="relative min-h-[320px] flex-1 w-full cursor-crosshair overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent"
      :class="$attrs.class" @mousedown="handleInteractionStart" @mousemove="handleInteractionMove"
      @touchstart.prevent="handleInteractionStart" @touchmove.prevent="handleInteractionMove">
      <!-- Canvas for trail -->
      <canvas ref="canvasRef" class="pointer-events-none absolute inset-0 h-full w-full" />

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

    <p class="mt-4 font-mono text-xs text-white/40">
      Interactions: {{ interactionCount }}
    </p>
  </div>
</template>
