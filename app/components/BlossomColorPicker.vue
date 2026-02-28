<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import gsap from 'gsap'

interface Props {
  modelValue?: string
  petalCount?: number
  petalRadius?: number
  orbitRadius?: number
  outerRingRadius?: number
  outerRingWidth?: number
  centerRadius?: number
  bloomDuration?: number
  bloomEase?: string
  closeDuration?: number
  closeEase?: string
  staggerDelay?: number
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#ff6b6b',
  petalCount: 12,
  petalRadius: 36,
  orbitRadius: 52,
  outerRingRadius: 100,
  outerRingWidth: 14,
  centerRadius: 22,
  bloomDuration: 0.55,
  bloomEase: 'back.out(1.6)',
  closeDuration: 0.35,
  closeEase: 'power2.in',
  staggerDelay: 0.035,
  showPreview: true
})

const emit = defineEmits<{
  'update:modelValue': [color: string]
  'change': [color: string]
  'preview': [color: string | null]
}>()

// ─── Color math ──────────────────────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hueLabel(hue: number): string {
  if (hue < 15 || hue >= 345) return 'Red'
  if (hue < 45) return 'Orange'
  if (hue < 75) return 'Yellow'
  if (hue < 150) return 'Green'
  if (hue < 195) return 'Cyan'
  if (hue < 255) return 'Blue'
  if (hue < 285) return 'Indigo'
  if (hue < 315) return 'Violet'
  return 'Pink'
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const palette = computed(() => {
  const colors: { hue: number; hex: string; label: string }[] = []
  const count = props.petalCount
  const l = 5 + lightness.value * 90
  const s = Math.round(saturation.value * 100)
  for (let i = 0; i < count; i++) {
    const hue = Math.round((i / count) * 360)
    colors.push({ hue, hex: hslToHex(hue, s, l), label: hueLabel(hue) })
  }
  return colors
})

// ─── SVG geometry ────────────────────────────────────────────────────────────

// Extra padding for the arc slider that sits outside the outer ring
const arcPadding = computed(() => props.outerRingWidth + 20)
const svgSize = computed(() => (props.outerRingRadius + arcPadding.value) * 2)
const cx = computed(() => svgSize.value / 2)
const cy = computed(() => svgSize.value / 2)

function petalCenter(index: number): { x: number; y: number } {
  const count = props.petalCount
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2
  return {
    x: cx.value + props.orbitRadius * Math.cos(angle),
    y: cy.value + props.orbitRadius * Math.sin(angle)
  }
}

// ─── Arc slider geometry ──────────────────────────────────────────────────────
// Right arc: lightness — runs OUTSIDE the outer ring on the right side.
// Left arc:  saturation — runs OUTSIDE the outer ring on the left side (mirror).
// Angles in SVG: 0° = right (3 o'clock), measured clockwise.

const arcStartAngleDeg = -45  // top-right
const arcEndAngleDeg = 45     // bottom-right

// Left arc mirrors the right arc on the left side.
// Right arc: -45° (top-right) → +45° (bottom-right), sweep clockwise (sweep=1)
// Left arc:  -135° (top-left) → +135° (bottom-left), sweep clockwise (sweep=1)
// In SVG y-down: cos(-135°)<0,sin(-135°)<0 → top-left; cos(135°)<0,sin(135°)>0 → bottom-left
// Gradient: top (-135°) = hue (sat=1), bottom (+135°) = grey (sat=0)
const leftArcTopAngleDeg = -135  // top-left
const leftArcBottomAngleDeg = 135  // bottom-left

const arcR = computed(() => props.outerRingRadius + props.outerRingWidth + 8)  // outside the outer ring

function degToRad(deg: number) { return deg * Math.PI / 180 }

// Point on the arc at a given angle (degrees from 3 o'clock, clockwise)
function arcPoint(angleDeg: number): { x: number; y: number } {
  const rad = degToRad(angleDeg)
  return {
    x: cx.value + arcR.value * Math.cos(rad),
    y: cy.value + arcR.value * Math.sin(rad)
  }
}

// Build the arc path for the right (lightness) track
const arcTrackPath = computed(() => {
  const start = arcPoint(arcStartAngleDeg)
  const end = arcPoint(arcEndAngleDeg)
  const r = arcR.value
  // large-arc-flag = 0 since span is 90° < 180°
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
})

// Lightness 0–1 → angle along arc (1=top=arcStart, 0=bottom=arcEnd)
function lightnessToAngle(l: number): number {
  return arcStartAngleDeg + (1 - l) * (arcEndAngleDeg - arcStartAngleDeg)
}

// Thumb position based on current lightness
const thumbPos = computed(() => arcPoint(lightnessToAngle(lightness.value)))

// ─── Left arc (saturation) geometry ──────────────────────────────────────────
// Arc drawn clockwise from 135° (top-left) to 225° (bottom-left).
// top = full saturation (1), bottom = grey (0)

function leftArcPoint(angleDeg: number): { x: number; y: number } {
  const rad = degToRad(angleDeg)
  return {
    x: cx.value + arcR.value * Math.cos(rad),
    y: cy.value + arcR.value * Math.sin(rad)
  }
}

const leftArcTrackPath = computed(() => {
  const start = leftArcPoint(leftArcTopAngleDeg)    // -135° = top-left
  const end = leftArcPoint(leftArcBottomAngleDeg) // +135° = bottom-left
  const r = arcR.value
  // large-arc-flag=1 because span is 270° > 180° going clockwise from -135 to +135
  // But we want the SHORT arc (90°) on the left side → sweep=0 (counter-clockwise) with large-arc=0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`
})

// Saturation 0–1 → angle along left arc
// sat=1 → top (-135°, hue end), sat=0 → bottom (+135°, grey end)
// The arc is 90° wide, going counter-clockwise from -135° through ±180° to +135°.
// Midpoint at 180°. Interpolate through ±180°.
function saturationToAngle(s: number): number {
  // Span = 90°. Going counter-clockwise: -135° → -180°/+180° → +135°
  const offset = (1 - s) * 90  // 0° at top (s=1), 90° at bottom (s=0)
  let angle = leftArcTopAngleDeg - offset  // -135 - offset
  // Normalize to (-180, 180]
  if (angle <= -180) angle += 360
  return angle
}

const leftThumbPos = computed(() => leftArcPoint(saturationToAngle(saturation.value)))

// ─── State ───────────────────────────────────────────────────────────────────

const isOpen = ref(false)
const isAnimating = ref(false)
const hoveredIndex = ref<number | null>(null)

const selectedHue = ref(0)
const previewHue = ref<number | null>(null)
const lightness = ref(0.5)
const saturation = ref(0.85)

const outputColor = computed(() => {
  const hue = previewHue.value ?? selectedHue.value
  const l = 5 + lightness.value * 90
  const s = Math.round(saturation.value * 100)
  return hslToHex(hue, s, l)
})

// Initialize from modelValue
const initHsl = hexToHsl(props.modelValue)
selectedHue.value = initHsl.h
lightness.value = initHsl.l / 100
saturation.value = initHsl.s / 100

const svgRef = ref<SVGSVGElement | null>(null)
const petalsGroupRef = ref<SVGGElement | null>(null)
const centerRef = ref<SVGCircleElement | null>(null)
const arcGroupRef = ref<SVGGElement | null>(null)
const leftArcGroupRef = ref<SVGGElement | null>(null)

const pureHueColor = computed(() => hslToHex(previewHue.value ?? selectedHue.value, 85, 65))
const greyColor = computed(() => {
  const l = Math.round(5 + lightness.value * 90)
  return `hsl(0, 0%, ${l}%)`
})

// Gradient IDs (stable, no random)
const arcGradientId = 'blossom-arc-gradient'
const satGradientId = 'blossom-sat-gradient'

// ─── Bloom animations ────────────────────────────────────────────────────────

function openBlossom() {
  if (isAnimating.value) return
  isOpen.value = true
  isAnimating.value = true

  nextTick(() => {
    const group = petalsGroupRef.value
    if (!group) { isAnimating.value = false; return }
    const petals = Array.from(group.querySelectorAll<SVGCircleElement>('circle'))
    if (!petals.length) { isAnimating.value = false; return }
    // Use svgOrigin to set transform origin in SVG coordinate space (the center of the picker)
    gsap.set(petals, { scale: 0, opacity: 0, svgOrigin: `${cx.value} ${cy.value}` })
    gsap.to(petals, {
      scale: 1, opacity: 1,
      duration: props.bloomDuration,
      ease: props.bloomEase,
      stagger: { each: props.staggerDelay, from: 'start' },
      svgOrigin: `${cx.value} ${cy.value}`,
      onComplete: () => { isAnimating.value = false }
    })
    if (centerRef.value) {
      gsap.to(centerRef.value, { scale: 0.82, duration: 0.18, ease: 'power2.out', svgOrigin: `${cx.value} ${cy.value}`, yoyo: true, repeat: 1 })
    }
    // Animate arc sliders in with a slight delay after petals start
    if (arcGroupRef.value) {
      gsap.fromTo(arcGroupRef.value,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'back.out(1.4)', delay: props.bloomDuration * 0.35 }
      )
    }
    if (leftArcGroupRef.value) {
      gsap.fromTo(leftArcGroupRef.value,
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'back.out(1.4)', delay: props.bloomDuration * 0.35 }
      )
    }
  })
}

function closeBlossom() {
  if (isAnimating.value) return
  isAnimating.value = true
  const group = petalsGroupRef.value
  if (!group) { isAnimating.value = false; return }
  const petals = Array.from(group.querySelectorAll<SVGCircleElement>('circle'))
  if (!petals.length) { isAnimating.value = false; return }
  // Animate arc sliders out first
  if (arcGroupRef.value) {
    gsap.to(arcGroupRef.value, { opacity: 0, x: 10, duration: 0.2, ease: 'power2.in' })
  }
  if (leftArcGroupRef.value) {
    gsap.to(leftArcGroupRef.value, { opacity: 0, x: -10, duration: 0.2, ease: 'power2.in' })
  }
  gsap.to(petals, {
    scale: 0, opacity: 0,
    duration: props.closeDuration,
    ease: props.closeEase,
    stagger: { each: props.staggerDelay * 0.5, from: 'end' },
    svgOrigin: `${cx.value} ${cy.value}`,
    onComplete: () => {
      isOpen.value = false
      isAnimating.value = false
      hoveredIndex.value = null
      previewHue.value = null
    }
  })
}

function toggleBlossom() {
  if (isOpen.value) closeBlossom()
  else openBlossom()
}

// ─── Petal interactions ──────────────────────────────────────────────────────

function onPetalHover(index: number) {
  if (!isOpen.value || isAnimating.value) return
  hoveredIndex.value = index
  previewHue.value = palette.value[index]?.hue ?? null
  emit('preview', outputColor.value)
  // No GSAP animation - using CSS filter for hover effect to avoid displacement flicker
}

function onPetalLeave(index: number) {
  if (!isOpen.value) return
  if (hoveredIndex.value === index) {
    hoveredIndex.value = null
    previewHue.value = null
    emit('preview', null)
  }
  // No GSAP animation - CSS handles the visual state
}

function onPetalClick(index: number) {
  if (!isOpen.value) return
  const hue = palette.value[index]?.hue
  if (hue === undefined) return
  selectedHue.value = hue
  emit('update:modelValue', outputColor.value)
  emit('change', outputColor.value)

  const group = petalsGroupRef.value
  if (!group) return
  const petal = group.querySelectorAll<SVGCircleElement>('circle')[index]
  if (petal) {
    gsap.timeline()
      .to(petal, { scale: 1.28, duration: 0.1, ease: 'power2.out', svgOrigin: `${cx.value} ${cy.value}` })
      .to(petal, { scale: 1, duration: 0.35, ease: 'elastic.out(1, 0.4)', svgOrigin: `${cx.value} ${cy.value}` })
  }
  setTimeout(() => closeBlossom(), 180)
}

// ─── Arc slider interaction ───────────────────────────────────────────────────

const isDraggingSlider = ref(false)
const isDraggingLeftSlider = ref(false)
const arcSliderRef = ref<SVGPathElement | null>(null)

function angleToBoundedLightness(angleDeg: number): number {
  // Clamp angle to arc range
  const clamped = Math.max(arcStartAngleDeg, Math.min(arcEndAngleDeg, angleDeg))
  // Map: arcStart → lightness=1 (white), arcEnd → lightness=0 (black)
  return 1 - (clamped - arcStartAngleDeg) / (arcEndAngleDeg - arcStartAngleDeg)
}

function angleToBoundedSaturation(angleDeg: number): number {
  // Mirror of angleToBoundedLightness but for the left arc.
  // Left arc: top=-135° (sat=1/hue), bottom=+135° (sat=0/grey).
  // The arc spans 270° going counter-clockwise through ±180° (the left side).
  // We use the same approach as the right arc but offset by 180°:
  // Shift the angle by -180° so the left arc maps to the same range as the right arc.
  let a = angleDeg - 180
  // Normalize to (-180, 180]
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  // Now: left arc top (-135°) → shifted to +45°, left arc bottom (+135°) → shifted to -45°
  // This maps to the right arc range: clamp to [-45, +45]
  const clamped = Math.max(-45, Math.min(45, a))
  // +45 (was top of left arc, hue) → sat=1, -45 (was bottom, grey) → sat=0
  return (clamped - (-45)) / (45 - (-45))
}

function svgPointFromEvent(e: PointerEvent): { x: number; y: number } | null {
  if (!svgRef.value) return null
  const rect = svgRef.value.getBoundingClientRect()
  const scaleX = svgSize.value / rect.width
  const scaleY = svgSize.value / rect.height
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function updateLightnessFromPoint(pt: { x: number; y: number }) {
  const dx = pt.x - cx.value
  const dy = pt.y - cy.value
  const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI
  lightness.value = angleToBoundedLightness(angleDeg)
}

function updateSaturationFromPoint(pt: { x: number; y: number }) {
  const dx = pt.x - cx.value
  const dy = pt.y - cy.value
  let angleDeg = Math.atan2(dy, dx) * 180 / Math.PI
  if (angleDeg < 0) angleDeg += 360
  saturation.value = angleToBoundedSaturation(angleDeg)
}

function onArcPointerDown(e: PointerEvent) {
  isDraggingSlider.value = true
    ; (e.currentTarget as Element).setPointerCapture(e.pointerId)
  const pt = svgPointFromEvent(e)
  if (pt) updateLightnessFromPoint(pt)
}

function onArcPointerMove(e: PointerEvent) {
  if (!isDraggingSlider.value) return
  const pt = svgPointFromEvent(e)
  if (pt) updateLightnessFromPoint(pt)
}

function onArcPointerUp() {
  isDraggingSlider.value = false
  emit('update:modelValue', outputColor.value)
  emit('change', outputColor.value)
}

function onLeftArcPointerDown(e: PointerEvent) {
  isDraggingLeftSlider.value = true
    ; (e.currentTarget as Element).setPointerCapture(e.pointerId)
  const pt = svgPointFromEvent(e)
  if (pt) updateSaturationFromPoint(pt)
}

function onLeftArcPointerMove(e: PointerEvent) {
  if (!isDraggingLeftSlider.value) return
  const pt = svgPointFromEvent(e)
  if (pt) updateSaturationFromPoint(pt)
}

function onLeftArcPointerUp() {
  isDraggingLeftSlider.value = false
  emit('update:modelValue', outputColor.value)
  emit('change', outputColor.value)
}

// ─── Outside click ────────────────────────────────────────────────────────────

function onDocumentClick(e: MouseEvent) {
  if (!isOpen.value) return
  const target = e.target as Node
  if (svgRef.value && !svgRef.value.contains(target)) closeBlossom()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div class="blossom-picker inline-flex flex-col items-center gap-4">
    <div class="relative select-none">
      <svg ref="svgRef" :width="svgSize" :height="svgSize" :viewBox="`0 0 ${svgSize} ${svgSize}`"
        class="overflow-visible" style="filter: drop-shadow(0 6px 24px rgba(0,0,0,0.4))">
        <!-- Gradient defs for arc sliders -->
        <defs>
          <!-- Right arc: lightness gradient (top=white, mid=hue, bottom=black) -->
          <linearGradient :id="arcGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="white" />
            <stop offset="50%" :stop-color="pureHueColor" />
            <stop offset="100%" stop-color="black" />
          </linearGradient>
          <!-- Left arc: saturation gradient (top=hue, bottom=grey) — mirrors right arc convention -->
          <linearGradient :id="satGradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" :stop-color="pureHueColor" />
            <stop offset="100%" :stop-color="greyColor" />
          </linearGradient>
        </defs>

        <!-- Outer decorative ring (dim track) -->
        <circle :cx="cx" :cy="cy" :r="outerRingRadius" fill="none"
          :stroke="isOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.07)'" :stroke-width="outerRingWidth"
          style="transition: stroke 0.4s ease" />

        <!-- Left arc slider (saturation) — animated in/out with GSAP -->
        <g ref="leftArcGroupRef" v-show="isOpen" style="opacity: 0">
          <!-- Wide transparent hit area -->
          <path :d="leftArcTrackPath" fill="none" stroke="transparent" :stroke-width="outerRingWidth + 20"
            stroke-linecap="round" class="cursor-pointer" @click.stop @pointerdown.stop="onLeftArcPointerDown"
            @pointermove.stop="onLeftArcPointerMove" @pointerup.stop="onLeftArcPointerUp" />
          <!-- Arc track with gradient stroke (visual) -->
          <path :d="leftArcTrackPath" fill="none" :stroke="`url(#${satGradientId})`" :stroke-width="outerRingWidth"
            stroke-linecap="round" class="pointer-events-none" />
          <!-- Arc slider thumb -->
          <circle :cx="leftThumbPos.x" :cy="leftThumbPos.y" :r="outerRingWidth / 2 + 3" fill="white"
            stroke="rgba(0,0,0,0.25)" stroke-width="1.5" class="pointer-events-none"
            style="filter: drop-shadow(0 1px 4px rgba(0,0,0,0.5))" />
          <circle :cx="leftThumbPos.x" :cy="leftThumbPos.y" :r="outerRingWidth / 2 - 1" :fill="outputColor"
            class="pointer-events-none" style="transition: fill 0.15s ease" />
        </g>

        <!-- Right arc slider (lightness) — animated in/out with GSAP -->
        <g ref="arcGroupRef" v-show="isOpen" style="opacity: 0">
          <!-- Wide transparent hit area for easy interaction -->
          <path :d="arcTrackPath" fill="none" stroke="transparent" :stroke-width="outerRingWidth + 20"
            stroke-linecap="round" class="cursor-pointer" @click.stop @pointerdown.stop="onArcPointerDown"
            @pointermove.stop="onArcPointerMove" @pointerup.stop="onArcPointerUp" />
          <!-- Arc track with gradient stroke (visual) -->
          <path ref="arcSliderRef" :d="arcTrackPath" fill="none" :stroke="`url(#${arcGradientId})`"
            :stroke-width="outerRingWidth" stroke-linecap="round" class="pointer-events-none" />

          <!-- Arc slider thumb -->
          <circle :cx="thumbPos.x" :cy="thumbPos.y" :r="outerRingWidth / 2 + 3" fill="white" stroke="rgba(0,0,0,0.25)"
            stroke-width="1.5" class="pointer-events-none" style="filter: drop-shadow(0 1px 4px rgba(0,0,0,0.5))" />
          <circle :cx="thumbPos.x" :cy="thumbPos.y" :r="outerRingWidth / 2 - 1" :fill="outputColor"
            class="pointer-events-none" style="transition: fill 0.15s ease" />
        </g>

        <!-- Petals group -->
        <g ref="petalsGroupRef" v-if="isOpen">
          <circle v-for="(color, i) in palette" :key="i" :cx="petalCenter(i).x" :cy="petalCenter(i).y" :r="petalRadius"
            :fill="color.hex" :style="{
              cursor: 'pointer',
              transition: 'filter 0.15s ease, opacity 0.15s ease',
              filter: hoveredIndex === i
                ? `drop-shadow(0 0 14px ${color.hex}cc) brightness(1.15)`
                : selectedHue === color.hue
                  ? `drop-shadow(0 0 8px ${color.hex}88) brightness(1.05)`
                  : 'none',
              opacity: hoveredIndex !== null && hoveredIndex !== i ? 0.65 : 1
            }" @mouseenter="onPetalHover(i)" @mouseleave="onPetalLeave(i)" @click.stop="onPetalClick(i)" />
        </g>

        <!-- Center hub background -->
        <circle :cx="cx" :cy="cy" :r="centerRadius + 6" fill="rgba(20,20,28,0.95)" stroke="rgba(255,255,255,0.1)"
          stroke-width="1" />

        <!-- Center color swatch -->
        <circle ref="centerRef" :cx="cx" :cy="cy" :r="centerRadius" :fill="outputColor" class="cursor-pointer"
          style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); transition: fill 0.2s ease"
          @click.stop="toggleBlossom" />

        <!-- Center +/× icon -->
        <g :transform="`translate(${cx}, ${cy})`" class="pointer-events-none">
          <line x1="-6" y1="0" x2="6" y2="0" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"
            :transform="isOpen ? 'rotate(45)' : 'rotate(0)'" style="transition: transform 0.3s ease" />
          <line x1="0" y1="-6" x2="0" y2="6" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" stroke-linecap="round"
            :transform="isOpen ? 'rotate(45)' : 'rotate(0)'" style="transition: transform 0.3s ease" />
        </g>
      </svg>
    </div>

    <!-- Color preview label -->
    <div v-if="showPreview"
      class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
      <span class="h-3 w-3 rounded-full border border-white/20"
        :style="{ background: outputColor, transition: 'background 0.2s ease' }" />
      <span class="font-mono text-[10px] uppercase tracking-widest text-white/60">
        {{ outputColor }}
      </span>
    </div>
  </div>
</template>
