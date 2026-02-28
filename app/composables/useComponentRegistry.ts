import type { Component } from 'vue'

export interface ComponentProp {
  name: string
  type: string
  default: string
  description: string
}

export interface ComponentEvent {
  name: string
  payload: string
  description: string
}

export interface ControlOption {
  value: string | number | boolean
  label: string
}

export interface ControlConfig {
  type: 'slider' | 'select' | 'toggle' | 'color'
  key: string
  label: string
  group: string
  default: string | number | boolean
  // Slider-specific
  min?: number
  max?: number
  step?: number
  // Select-specific
  options?: ControlOption[]
}

export interface ComponentRegistryItem {
  id: string
  slug: string
  title: string
  status: 'ready' | 'soon' | 'progress'
  component?: Component
  sourceCode: string
  props: ComponentProp[]
  events: ComponentEvent[]
  about: {
    description: string
    howItWorks: string[]
    builtWith: string[]
  }
  controls?: ControlConfig[]
}

export const useComponentRegistry = () => {
  const registry: Record<string, ComponentRegistryItem> = {
    'magnetic-button': {
      id: '001',
      slug: 'magnetic-button',
      title: 'Magnetic Button',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/MagneticButton.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, onMounted, computed, type Component } from 'vue'
import gsap from 'gsap'

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type ButtonCorners = 'sharp' | 'rounded' | 'squarcle' | 'pill' | 'message'
type ButtonColor = 'white' | 'dark'
type IconPosition = 'left' | 'right'

interface Props {
  strength?: number
  size?: ButtonSize
  corners?: ButtonCorners
  color?: ButtonColor
  icon?: Component
  iconPosition?: IconPosition
  textParallax?: number
  moveDuration?: number
  moveEase?: string
  returnDuration?: number
  returnEase?: string
  showFill?: boolean
  showBorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  strength: 0.5,
  size: 'md',
  corners: 'sharp',
  color: 'white',
  icon: undefined,
  iconPosition: 'left',
  textParallax: 0.5,
  moveDuration: 0.4,
  moveEase: 'power3.out',
  returnDuration: 0.7,
  returnEase: 'elastic.out(1, 0.3)',
  showFill: true,
  showBorder: true
})

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[8px]',
  sm: 'px-3 py-1.5 text-[10px]',
  md: 'px-8 py-4 text-xs',
  lg: 'px-10 py-5 text-sm',
  xl: 'px-12 py-6 text-base'
}

const cornerClasses: Record<ButtonCorners, string> = {
  sharp: '',
  rounded: 'rounded-lg',
  squarcle: 'rounded-2xl',
  pill: 'rounded-full',
  message: 'rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-none'
}

const iconSizes: Record<ButtonSize, number> = {
  xs: 10, sm: 12, md: 14, lg: 18, xl: 20
}

const colorClasses: Record<ButtonColor, { border: string; fill: string; text: string; hoverText: string }> = {
  white: {
    border: 'border-white/20',
    fill: 'bg-white',
    text: 'text-white',
    hoverText: 'text-dark-900'
  },
  dark: {
    border: 'border-dark-900/20',
    fill: 'bg-dark-900',
    text: 'text-dark-900',
    hoverText: 'text-white'
  }
}

const buttonClasses = computed(() => [
  'group relative overflow-hidden bg-transparent transition-colors',
  props.showBorder ? 'border hover:border-white/40' : 'border-none hover:border-none',
  sizeClasses[props.size],
  cornerClasses[props.corners],
  props.showBorder ? colorClasses[props.color].border : ''
])

const fillColor = computed(() => colorClasses[props.color].fill)
const textColor = computed(() => colorClasses[props.color].text)
const hoverTextColor = computed(() => colorClasses[props.color].hoverText)
const iconSize = computed(() => iconSizes[props.size])

const buttonRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
let bounds: DOMRect | null = null

const onMouseMove = (e: MouseEvent) => {
  if (!buttonRef.value || !bounds) return
  const x = e.clientX - bounds.left - bounds.width / 2
  const y = e.clientY - bounds.top - bounds.height / 2

  gsap.to(buttonRef.value, {
    x: x * props.strength,
    y: y * props.strength,
    duration: props.moveDuration,
    ease: props.moveEase
  })

  if (textRef.value) {
    gsap.to(textRef.value, {
      x: x * props.strength * props.textParallax,
      y: y * props.strength * props.textParallax,
      duration: props.moveDuration,
      ease: props.moveEase
    })
  }
}

const onMouseLeave = () => {
  gsap.to(buttonRef.value, { x: 0, y: 0, duration: props.returnDuration, ease: props.returnEase })
  if (textRef.value) {
    gsap.to(textRef.value, { x: 0, y: 0, duration: props.returnDuration, ease: props.returnEase })
  }
}

const onMouseEnter = () => {
  if (buttonRef.value) bounds = buttonRef.value.getBoundingClientRect()
}

onMounted(() => {
  if (buttonRef.value) bounds = buttonRef.value.getBoundingClientRect()
})
` + '<' + '/script>' + `

<template>
  <button ref="buttonRef" :class="buttonClasses" @mouseenter="onMouseEnter" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
    <span v-if="showFill" :class="['absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100', fillColor]" />
    <span ref="textRef" :class="['relative z-10 flex items-center gap-2 font-mono uppercase tracking-[0.2em]', textColor]">
      <component v-if="icon && iconPosition === 'left'" :is="icon" :size="iconSize" />
      <slot />
      <component v-if="icon && iconPosition === 'right'" :is="icon" :size="iconSize" />
    </span>
    <span v-if="showFill" :class="['absolute inset-0 z-10 flex items-center justify-center gap-2 font-mono uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100', hoverTextColor]">
      <component v-if="icon && iconPosition === 'left'" :is="icon" :size="iconSize" />
      <slot />
      <component v-if="icon && iconPosition === 'right'" :is="icon" :size="iconSize" />
    </span>
  </button>
</template>`,
      props: [
        { name: 'strength', type: 'number', default: '0.5', description: 'Magnetic pull strength (0.1 - 1)' },
        { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'T-shirt sizing for button dimensions' },
        { name: 'corners', type: "'sharp' | 'rounded' | 'squarcle' | 'pill' | 'message'", default: "'sharp'", description: 'Border radius style' },
        { name: 'color', type: "'white' | 'dark'", default: "'white'", description: 'Color theme for border, text, and fill' },
        { name: 'icon', type: 'Component', default: 'undefined', description: 'Lucide icon component to display' },
        { name: 'iconPosition', type: "'left' | 'right'", default: "'left'", description: 'Position of the icon relative to text' },
        { name: 'showBorder', type: 'boolean', default: 'true', description: 'Toggle the border visibility' },
        { name: 'showFill', type: 'boolean', default: 'true', description: 'Toggle the fill animation on hover' },
        { name: 'textParallax', type: 'number', default: '0.5', description: 'Text movement multiplier relative to button (0 - 1)' },
        { name: 'moveDuration', type: 'number', default: '0.4', description: 'Duration of magnetic movement animation (seconds)' },
        { name: 'moveEase', type: 'string', default: "'power3.out'", description: 'GSAP easing for magnetic movement' },
        { name: 'returnDuration', type: 'number', default: '0.7', description: 'Duration of return animation (seconds)' },
        { name: 'returnEase', type: 'string', default: "'elastic.out(1, 0.3)'", description: 'GSAP easing for return animation' }
      ],
      events: [
        { name: 'click', payload: 'MouseEvent', description: 'Emitted when the button is clicked' },
        { name: 'mouseenter', payload: 'MouseEvent', description: 'Emitted when mouse enters the button area' },
        { name: 'mouseleave', payload: 'MouseEvent', description: 'Emitted when mouse leaves the button area' }
      ],
      about: {
        description: 'Magnetic buttons create a subtle interaction that makes UI elements feel alive. The button follows the cursor within its bounds using GSAP, then snaps back when the cursor leaves with elastic easing.',
        howItWorks: [
          'Calculate cursor offset from button center',
          'Multiply offset by strength to get displacement',
          'Animate button and text with GSAP (text at reduced parallax)',
          'On mouse leave, animate back with elastic easing'
        ],
        builtWith: ['GSAP', 'Vue 3', 'Lucide Icons']
      },
      controls: [
        // Style group
        { type: 'select', key: 'size', label: 'Size', group: 'Style',
          options: [
            { value: 'xs', label: 'XS' },
            { value: 'sm', label: 'SM' },
            { value: 'md', label: 'MD' },
            { value: 'lg', label: 'LG' },
            { value: 'xl', label: 'XL' }
          ],
          default: 'xl'
        },
        { type: 'select', key: 'color', label: 'Color', group: 'Style',
          options: [
            { value: 'white', label: 'White' },
            { value: 'dark', label: 'Dark' }
          ],
          default: 'white'
        },
        { type: 'select', key: 'corners', label: 'Roundness', group: 'Style',
          options: [
            { value: 'sharp', label: 'Sharp' },
            { value: 'rounded', label: 'Rounded' },
            { value: 'squarcle', label: 'Squarcle' },
            { value: 'pill', label: 'Pill' },
            { value: 'message', label: 'Comment' }
          ],
          default: 'sharp'
        },
        // Content group
        { type: 'select', key: 'icon', label: 'Icon', group: 'Content',
          options: [
            { value: 'none', label: 'None' },
            { value: 'star', label: 'Star' },
            { value: 'sparkles', label: 'Sparkles' },
            { value: 'arrow-right', label: 'Arrow Right' },
            { value: 'message-circle', label: 'Message' },
            { value: 'eye', label: 'Eye' }
          ],
          default: 'none'
        },
        { type: 'select', key: 'iconPosition', label: 'Icon Position', group: 'Content',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' }
          ],
          default: 'left'
        },
        { type: 'toggle', key: 'showBorder', label: 'Show Border', group: 'Content', default: true },
        { type: 'toggle', key: 'showFill', label: 'Show Fill', group: 'Content', default: true },
        // Animation group
        { type: 'slider', key: 'strength', label: 'Strength', min: 0.1, max: 1, step: 0.05, default: 0.5, group: 'Animation' },
        { type: 'slider', key: 'textParallax', label: 'Text Parallax', min: 0, max: 1, step: 0.1, default: 0.5, group: 'Animation' },
        { type: 'slider', key: 'moveDuration', label: 'Move Duration', min: 0.1, max: 1, step: 0.05, default: 0.4, group: 'Animation' },
        { type: 'slider', key: 'returnDuration', label: 'Return Duration', min: 0.2, max: 1.5, step: 0.05, default: 0.7, group: 'Animation' }
      ]
    },
    'fluid-cursor': {
      id: '002',
      slug: 'fluid-cursor',
      title: 'Fluid Cursor',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/FluidCursor.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, computed } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  ringSize?: number
  ringDuration?: number
  ringEase?: string
  ringOpacity?: number
  ringBorderWidth?: number
  ringMixBlend?: boolean
  dotSize?: number
  dotDuration?: number
  dotOpacity?: number
}>(), {
  ringSize: 40,
  ringDuration: 0.5,
  ringEase: 'power3.out',
  ringOpacity: 0.5,
  ringBorderWidth: 1,
  ringMixBlend: true,
  dotSize: 8,
  dotDuration: 0.1,
  dotOpacity: 1
})

const containerRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const cursorDotRef = ref<HTMLElement | null>(null)
const isHovering = ref(false)

const ringStyle = computed(() => ({
  width: props.ringSize + 'px',
  height: props.ringSize + 'px',
  borderWidth: props.ringBorderWidth + 'px',
  opacity: isHovering.value ? props.ringOpacity : 0,
  mixBlendMode: props.ringMixBlend ? 'difference' : 'normal'
}))

const dotStyle = computed(() => ({
  width: props.dotSize + 'px',
  height: props.dotSize + 'px',
  opacity: isHovering.value ? props.dotOpacity : 0
}))

const onMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  const ringOffset = props.ringSize / 2
  const dotOffset = props.dotSize / 2
  if (cursorRef.value) {
    gsap.to(cursorRef.value, {
      x: e.clientX - rect.left - ringOffset,
      y: e.clientY - rect.top - ringOffset,
      duration: props.ringDuration,
      ease: props.ringEase
    })
  }
  if (cursorDotRef.value) {
    gsap.to(cursorDotRef.value, {
      x: e.clientX - rect.left - dotOffset,
      y: e.clientY - rect.top - dotOffset,
      duration: props.dotDuration
    })
  }
}

const onMouseEnter = () => { isHovering.value = true }
const onMouseLeave = () => { isHovering.value = false }
<` + `/script>

<template>
  <div ref="containerRef" class="relative" style="cursor: none;"
    @mousemove="onMouseMove" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div ref="cursorRef" class="pointer-events-none absolute top-0 left-0 rounded-full border border-white"
      :style="ringStyle" />
    <div ref="cursorDotRef" class="pointer-events-none absolute top-0 left-0 rounded-full bg-white"
      :style="dotStyle" />
    <slot />
  </div>
</template>`,
      props: [
        { name: 'ringSize', type: 'number', default: '40', description: 'Size of the cursor ring in pixels' },
        { name: 'ringDuration', type: 'number', default: '0.5', description: 'Animation duration for ring movement (seconds)' },
        { name: 'ringEase', type: 'string', default: "'power3.out'", description: 'GSAP easing function for ring animation' },
        { name: 'ringOpacity', type: 'number', default: '0.5', description: 'Opacity of the ring (0-1)' },
        { name: 'ringBorderWidth', type: 'number', default: '1', description: 'Border width of the ring in pixels' },
        { name: 'ringMixBlend', type: 'boolean', default: 'true', description: 'Enable mix-blend-mode: difference' },
        { name: 'dotSize', type: 'number', default: '8', description: 'Size of the cursor dot in pixels' },
        { name: 'dotDuration', type: 'number', default: '0.1', description: 'Animation duration for dot movement (seconds)' },
        { name: 'dotOpacity', type: 'number', default: '1', description: 'Opacity of the dot (0-1)' }
      ],
      events: [
        { name: 'mousemove', payload: 'MouseEvent', description: 'Triggered on mouse movement within the demo area' },
        { name: 'mouseenter', payload: 'MouseEvent', description: 'Triggered when mouse enters the demo area' },
        { name: 'mouseleave', payload: 'MouseEvent', description: 'Triggered when mouse leaves the demo area' }
      ],
      about: {
        description: 'A custom cursor component with a trailing ring and dot. The ring follows the cursor with configurable easing, while the dot provides immediate feedback.',
        howItWorks: [
          'Hide the native cursor with cursor: none',
          'Track mouse position with mousemove event',
          'Animate ring element with GSAP using configurable duration and easing',
          'Dot follows instantly for precise feedback',
          'Use mix-blend-difference for color inversion effect'
        ],
        builtWith: ['GSAP', 'Vue 3']
      },
      controls: [
        // Ring group
        { type: 'slider', key: 'ringSize', label: 'Ring Size', min: 20, max: 80, step: 5, default: 40, group: 'Ring' },
        { type: 'slider', key: 'ringDuration', label: 'Ring Duration', min: 0.1, max: 1, step: 0.05, default: 0.5, group: 'Ring' },
        { type: 'slider', key: 'ringOpacity', label: 'Ring Opacity', min: 0.1, max: 1, step: 0.1, default: 0.5, group: 'Ring' },
        { type: 'slider', key: 'ringBorderWidth', label: 'Border Width', min: 1, max: 4, step: 1, default: 1, group: 'Ring' },
        { type: 'toggle', key: 'ringMixBlend', label: 'Mix Blend', group: 'Ring', default: true },
        // Dot group
        { type: 'slider', key: 'dotSize', label: 'Dot Size', min: 4, max: 16, step: 2, default: 8, group: 'Dot' },
        { type: 'slider', key: 'dotDuration', label: 'Dot Duration', min: 0.05, max: 0.3, step: 0.05, default: 0.1, group: 'Dot' },
        { type: 'slider', key: 'dotOpacity', label: 'Dot Opacity', min: 0.1, max: 1, step: 0.1, default: 1, group: 'Dot' }
      ]
    },
    'liquid-glass': {
      id: '003',
      slug: 'liquid-glass',
      title: 'Liquid Glass',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/LiquidGlass.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'

type GlassPreset = 'Plain' | 'Frosted' | 'Fractal' | 'Tinted' | 'Crystalline' | 'Holographic' | 'Gradient' | 'Wet' | 'Apple'
type DropletDensity = 'sparse' | 'medium' | 'heavy'

interface Props {
  blur?: number
  opacity?: number
  borderOpacity?: number
  saturation?: number
  reflectionSize?: number
  reflectionOpacity?: number
  reflectionBlur?: number
  tiltEnabled?: boolean
  tiltStrength?: number
  tiltDuration?: number
  dragEnabled?: boolean
  dragEase?: number
  preset?: GlassPreset
  striationWidth?: number
  striationOpacity?: number
  striationGap?: number
  tintColor?: string
  tintOpacity?: number
  iridescenceOpacity?: number
  noiseOpacity?: number
  holoIntensity?: number
  holoSpread?: number
  gradientDirection?: string
  gradientStrength?: number
  dropletDensity?: DropletDensity
  streakOpacity?: number
  refractionStrength?: number
  depthShadow?: number
}

const props = withDefaults(defineProps<Props>(), {
  blur: 20,
  opacity: 0.15,
  borderOpacity: 0.3,
  saturation: 1.8,
  reflectionSize: 150,
  reflectionOpacity: 0.4,
  reflectionBlur: 40,
  tiltEnabled: true,
  tiltStrength: 15,
  tiltDuration: 0.5,
  dragEnabled: true,
  dragEase: 0.15,
  preset: 'Frosted',
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
})

const emit = defineEmits<{
  'drag:start': []
  'drag:end': []
  'tilt': [{ tiltX: number; tiltY: number }]
  'presetChange': [preset: GlassPreset]
}>()

const glassRef = ref<HTMLElement | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const reflectionRef = ref<HTMLElement | null>(null)
const holoRef = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const position = ref({ x: 0, y: 0 })
const dragStart = ref({ x: 0, y: 0 })

const glassStyle = computed(() => ({
  backdropFilter: \`blur(\${props.blur}px) saturate(\${props.saturation})\`,
  WebkitBackdropFilter: \`blur(\${props.blur}px) saturate(\${props.saturation})\`,
  backgroundColor: \`rgba(255, 255, 255, \${props.opacity})\`,
  border: \`1px solid rgba(255, 255, 255, \${props.borderOpacity})\`,
  ...(props.preset === 'Apple' && {
    boxShadow: \`
      0 8px 32px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, \${props.refractionStrength}),
      inset 1px 0 0 rgba(255, 255, 255, \${props.refractionStrength * 0.5}),
      inset -1px 0 0 rgba(255, 255, 255, \${props.refractionStrength * 0.5}),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05),
      inset 0 4px 30px rgba(0, 0, 0, \${props.depthShadow})
    \`
  })
}))

const reflectionStyle = computed(() => ({
  width: \`\${props.reflectionSize}px\`,
  height: \`\${props.reflectionSize}px\`,
  opacity: props.reflectionOpacity,
  filter: \`blur(\${props.reflectionBlur}px)\`
}))

// ... additional computed styles for each preset

const onMouseMove = (e: MouseEvent) => {
  if (!glassRef.value || !reflectionRef.value) return
  const rect = glassRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const tiltX = ((y - centerY) / centerY) * props.tiltStrength
  const tiltY = ((centerX - x) / centerX) * props.tiltStrength

  if (props.tiltEnabled) {
    gsap.to(glassRef.value, { rotateX: tiltX, rotateY: tiltY, duration: props.tiltDuration, ease: 'power2.out' })
    emit('tilt', { tiltX, tiltY })
  }
  gsap.to(reflectionRef.value, { x: x - props.reflectionSize / 2, y: y - props.reflectionSize / 2, duration: 0.3, ease: 'power2.out' })
}

const onMouseLeave = () => {
  if (!glassRef.value) return
  if (props.tiltEnabled) {
    gsap.to(glassRef.value, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' })
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onGlobalMouseMove)
  window.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onGlobalMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
<` + `/script>

<template>
  <div ref="wrapperRef" class="perspective-1000">
    <div ref="glassRef" class="relative rounded-3xl shadow-2xl overflow-hidden" :style="glassStyle"
      @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <div ref="reflectionRef" class="absolute rounded-full bg-gradient-radial from-white to-transparent" :style="reflectionStyle" />
      <!-- Preset-specific layers rendered conditionally -->
      <div class="relative z-10">
        <slot name="header" />
        <slot />
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>`,
      props: [
        { name: 'variant', type: "'card' | 'button' | 'nav'", default: "'card'", description: 'Glass use case variant' },
        { name: 'blur', type: 'number', default: '20', description: 'Backdrop blur in pixels' },
        { name: 'opacity', type: 'number', default: '0.15', description: 'Background opacity (0-1)' },
        { name: 'borderOpacity', type: 'number', default: '0.3', description: 'Border opacity (0-1)' },
        { name: 'saturation', type: 'number', default: '1.8', description: 'Backdrop saturation multiplier' },
        { name: 'reflectionSize', type: 'number', default: '150', description: 'Reflection diameter in pixels' },
        { name: 'reflectionOpacity', type: 'number', default: '0.4', description: 'Reflection opacity (0-1)' },
        { name: 'reflectionBlur', type: 'number', default: '40', description: 'Reflection blur in pixels' },
        { name: 'tiltEnabled', type: 'boolean', default: 'true', description: 'Enable 3D tilt on hover' },
        { name: 'tiltStrength', type: 'number', default: '15', description: 'Maximum tilt degrees' },
        { name: 'tiltDuration', type: 'number', default: '0.5', description: 'Tilt animation duration in seconds' },
        { name: 'dragEnabled', type: 'boolean', default: 'true', description: 'Enable card dragging' },
        { name: 'dragEase', type: 'number', default: '0.15', description: 'Drag animation smoothness' },
        { name: 'preset', type: "'Plain' | 'Frosted' | 'Fractal' | 'Tinted' | 'Crystalline' | 'Holographic' | 'Gradient' | 'Apple'", default: "'Frosted'", description: 'Glass preset name' },
        { name: 'striationWidth', type: 'number', default: '8', description: 'Fractal: rib width in pixels' },
        { name: 'striationOpacity', type: 'number', default: '0.25', description: 'Fractal: striation opacity' },
        { name: 'striationGap', type: 'number', default: '4', description: 'Fractal: gap between striations' },
        { name: 'tintColor', type: 'string', default: "'#3b82f6'", description: 'Tinted: tint color hex value' },
        { name: 'tintOpacity', type: 'number', default: '0.15', description: 'Tinted: tint intensity' },
        { name: 'iridescenceOpacity', type: 'number', default: '0.15', description: 'Crystalline: rainbow refraction intensity' },
        { name: 'noiseOpacity', type: 'number', default: '0.06', description: 'Crystalline: noise texture opacity' },
        { name: 'holoIntensity', type: 'number', default: '0.2', description: 'Holographic: dichroic effect intensity' },
        { name: 'holoSpread', type: 'number', default: '200', description: 'Holographic: conic gradient spread' },
        { name: 'gradientDirection', type: 'string', default: "'to bottom'", description: 'Gradient: CSS gradient direction' },
        { name: 'gradientStrength', type: 'number', default: '0.3', description: 'Gradient: gradient opacity strength' },
        { name: 'refractionStrength', type: 'number', default: '0.5', description: 'Apple: edge refraction intensity' },
        { name: 'depthShadow', type: 'number', default: '0.1', description: 'Apple: inner shadow depth' }
      ],
      events: [
        { name: 'drag:start', payload: '-', description: 'Emitted when drag begins' },
        { name: 'drag:end', payload: '-', description: 'Emitted when drag ends' },
        { name: 'tilt', payload: '{ tiltX: number, tiltY: number }', description: 'Emitted on tilt with current angles' },
        { name: 'presetChange', payload: 'GlassPreset', description: 'Emitted when preset changes' }
      ],
      about: {
        description: 'Liquid Glass creates depth and hierarchy through glassmorphism with transparency and blur. Features 9 distinct presets — from minimal plain glass to Apple\'s iOS-style liquid glass with edge refraction — each with realistic light reflection and 3D perspective tilt.',
        howItWorks: [
          'backdrop-filter: blur() creates the frosted glass effect',
          'Semi-transparent background + border adds depth layers',
          'Radial gradient follows cursor to simulate light reflection',
          '3D transforms (rotateX/Y) create perspective tilt on hover',
          'Overlay layers (striations, tint, holo, rain, refraction) add preset-specific character'
        ],
        builtWith: ['GSAP', 'Vue 3', 'CSS backdrop-filter', 'CSS 3D Transforms', 'SVG Filters', 'mix-blend-mode', 'conic-gradient']
      },
      controls: [
        // Variant group
        { type: 'select', key: 'variant', label: 'Variant', group: 'Variant',
          options: [
            { value: 'card', label: 'Card' },
            { value: 'button', label: 'Button' },
            { value: 'nav', label: 'Nav' }
          ],
          default: 'card'
        },
        // Preset group
        { type: 'select', key: 'preset', label: 'Preset', group: 'Preset',
          options: [
            { value: 'Plain', label: 'Plain' },
            { value: 'Frosted', label: 'Frosted' },
            { value: 'Fractal', label: 'Fractal' },
            { value: 'Tinted', label: 'Tinted' },
            { value: 'Crystalline', label: 'Crystalline' },
            { value: 'Holographic', label: 'Holographic' },
            { value: 'Gradient', label: 'Gradient' },
            { value: 'Apple', label: 'Apple' }
          ],
          default: 'Frosted'
        },
        // Glass group
        { type: 'slider', key: 'blur', label: 'Blur', min: 0, max: 50, step: 1, default: 20, group: 'Glass' },
        { type: 'slider', key: 'opacity', label: 'Opacity', min: 0.05, max: 0.5, step: 0.05, default: 0.15, group: 'Glass' },
        { type: 'slider', key: 'borderOpacity', label: 'Border Opacity', min: 0, max: 0.6, step: 0.05, default: 0.3, group: 'Glass' },
        { type: 'slider', key: 'saturation', label: 'Saturation', min: 1, max: 3, step: 0.1, default: 1.8, group: 'Glass' },
        // Reflection group
        { type: 'slider', key: 'reflectionSize', label: 'Reflection Size', min: 50, max: 300, step: 10, default: 150, group: 'Reflection' },
        { type: 'slider', key: 'reflectionOpacity', label: 'Reflection Opacity', min: 0.1, max: 0.8, step: 0.05, default: 0.4, group: 'Reflection' },
        { type: 'slider', key: 'reflectionBlur', label: 'Reflection Blur', min: 10, max: 80, step: 5, default: 40, group: 'Reflection' },
        // Tilt group
        { type: 'toggle', key: 'tiltEnabled', label: 'Tilt Enabled', group: 'Tilt', default: true },
        { type: 'slider', key: 'tiltStrength', label: 'Tilt Strength', min: 0, max: 30, step: 1, default: 15, group: 'Tilt' },
        { type: 'slider', key: 'tiltDuration', label: 'Tilt Duration', min: 0.1, max: 1, step: 0.05, default: 0.5, group: 'Tilt' },
        // Drag group
        { type: 'toggle', key: 'dragEnabled', label: 'Drag Enabled', group: 'Drag', default: true },
        { type: 'slider', key: 'dragEase', label: 'Drag Smoothness', min: 0, max: 0.5, step: 0.05, default: 0.15, group: 'Drag' },
        // Tint Color group (for Tinted preset)
        { type: 'color', key: 'tintColor', label: 'Tint Color', group: 'Tint',
          options: [
            { value: '#3b82f6', label: 'Blue' },
            { value: '#f43f5e', label: 'Rose' },
            { value: '#f59e0b', label: 'Amber' },
            { value: '#10b981', label: 'Emerald' },
            { value: '#8b5cf6', label: 'Violet' },
            { value: '#06b6d4', label: 'Cyan' }
          ],
          default: '#3b82f6'
        },
        { type: 'slider', key: 'tintOpacity', label: 'Tint Intensity', min: 0.05, max: 0.4, step: 0.05, default: 0.15, group: 'Tint' }
      ]
    },
    'liquid-metal': {
      id: '004',
      slug: 'liquid-metal',
      title: 'Liquid Metal',
      status: 'soon',
      sourceCode: `<!-- LiquidMetal.vue - Coming soon -->`,
      props: [],
      events: [],
      about: {
        description: 'A metallic liquid effect component.',
        howItWorks: [],
        builtWith: ['GSAP', 'Vue 3']
      }
    },
    'flip-card': {
      id: '005',
      slug: 'flip-card',
      title: 'Flip Card',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/FlipCard.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, CheckCircle, ArrowLeft } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  flipDirection?: 'horizontal' | 'vertical'
  flipDuration?: number
  perspective?: number
  frontBg?: 'glass' | 'solid' | 'gradient'
  backBg?: 'success' | 'info' | 'glass'
  autoReset?: boolean
  autoResetDelay?: number
}>(), {
  flipDirection: 'horizontal',
  flipDuration: 0.6,
  perspective: 1000,
  frontBg: 'glass',
  backBg: 'success',
  autoReset: true,
  autoResetDelay: 3
})

const emit = defineEmits<{
  flip: []
  reset: []
}>()

const isFlipped = ref(false)
let autoResetTimer: ReturnType<typeof setTimeout> | null = null

const containerStyle = computed(() => ({
  perspective: props.perspective + 'px'
}))

const cardStyle = computed(() => ({
  transform: isFlipped.value
    ? props.flipDirection === 'horizontal'
      ? 'rotateY(180deg)'
      : 'rotateX(180deg)'
    : 'none',
  transition: 'transform ' + props.flipDuration + 's ease-in-out'
}))

const backFaceStyle = computed(() => ({
  transform: props.flipDirection === 'horizontal'
    ? 'rotateY(180deg)'
    : 'rotateX(180deg)'
}))

const flip = () => {
  isFlipped.value = true
  emit('flip')
  if (autoResetTimer) clearTimeout(autoResetTimer)
  if (props.autoReset) {
    autoResetTimer = setTimeout(() => {
      isFlipped.value = false
      emit('reset')
    }, props.autoResetDelay * 1000)
  }
}

const reset = () => {
  if (autoResetTimer) clearTimeout(autoResetTimer)
  isFlipped.value = false
  emit('reset')
}

defineExpose({ flip, reset, isFlipped })
<` + `/script>

<template>
  <div class="flip-container" :style="containerStyle">
    <div class="flip-card relative h-full w-full" :style="cardStyle" style="transform-style: preserve-3d;">
      <!-- Front Face -->
      <div class="flip-face absolute inset-0 rounded-2xl p-6 flex flex-col backface-hidden"
        :class="{
          'bg-white/10 backdrop-blur-xl border border-white/20': frontBg === 'glass',
          'bg-dark-800 border border-white/10': frontBg === 'solid',
          'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20': frontBg === 'gradient'
        }">
        <slot name="front">
          <!-- Default front content -->
        </slot>
      </div>
      <!-- Back Face -->
      <div class="flip-face absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden"
        :class="{
          'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30': backBg === 'success',
          'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30': backBg === 'info',
          'bg-white/10 backdrop-blur-xl border border-white/20': backBg === 'glass'
        }"
        :style="backFaceStyle">
        <slot name="back">
          <!-- Default back content -->
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>`,
      props: [
        { name: 'flipDirection', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the flip animation' },
        { name: 'flipDuration', type: 'number', default: '0.6', description: 'Duration of flip animation in seconds' },
        { name: 'perspective', type: 'number', default: '1000', description: 'CSS perspective value for 3D effect' },
        { name: 'frontBg', type: "'glass' | 'solid' | 'gradient'", default: "'glass'", description: 'Background style for front face' },
        { name: 'backBg', type: "'success' | 'info' | 'glass'", default: "'success'", description: 'Background style for back face' },
        { name: 'autoReset', type: 'boolean', default: 'true', description: 'Auto flip back after delay' },
        { name: 'autoResetDelay', type: 'number', default: '3', description: 'Delay before auto reset in seconds' }
      ],
      events: [
        { name: 'flip', payload: 'void', description: 'Emitted when card flips to back' },
        { name: 'reset', payload: 'void', description: 'Emitted when card flips back to front' }
      ],
      about: {
        description: 'A 3D flip card component with customizable direction, duration, and styling. Perfect for revealing additional content or confirmation states.',
        howItWorks: [
          'Apply CSS perspective to container for 3D effect',
          'Use transform-style: preserve-3d on card',
          'Rotate card on Y or X axis for flip effect',
          'Hide backface on both faces',
          'Pre-rotate back face 180deg so it shows correctly when flipped'
        ],
        builtWith: ['Vue 3', 'CSS 3D Transforms', 'Lucide Icons']
      },
      controls: [
        // Animation group
        { type: 'select', key: 'flipDirection', label: 'Direction', group: 'Animation',
          options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }],
          default: 'horizontal' },
        { type: 'slider', key: 'flipDuration', label: 'Duration', min: 0.3, max: 1.5, step: 0.1, default: 0.6, group: 'Animation' },
        { type: 'slider', key: 'perspective', label: 'Perspective', min: 500, max: 2000, step: 100, default: 1000, group: 'Animation' },
        // Style group
        { type: 'select', key: 'frontBg', label: 'Front Style', group: 'Style',
          options: [{ value: 'glass', label: 'Glass' }, { value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }],
          default: 'glass' },
        { type: 'select', key: 'backBg', label: 'Back Style', group: 'Style',
          options: [{ value: 'success', label: 'Success' }, { value: 'info', label: 'Info' }, { value: 'glass', label: 'Glass' }],
          default: 'success' },
        // Behavior group
        { type: 'toggle', key: 'autoReset', label: 'Auto Reset', group: 'Behavior', default: true },
        { type: 'slider', key: 'autoResetDelay', label: 'Reset Delay (s)', min: 1, max: 10, step: 1, default: 3, group: 'Behavior' }
      ]
    },
    'explosive-button': {
      id: '006',
      slug: 'explosive-button',
      title: 'Explosive Button',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/ExplosiveButton.vue')),
      sourceCode: `<!-- ExplosiveButton.vue - Particle explosion button -->`,
      props: [
        { name: 'particleCount', type: 'number', default: '20', description: 'Number of particles to spawn' },
        { name: 'particleSize', type: 'number', default: '8', description: 'Base size of particles in pixels' },
        { name: 'explosionRadius', type: 'number', default: '120', description: 'How far particles travel' },
        { name: 'duration', type: 'number', default: '0.8', description: 'Animation duration in seconds' },
        { name: 'gravity', type: 'number', default: '0.5', description: 'Gravity effect on particles' },
        { name: 'spread', type: 'number', default: '360', description: 'Spread angle in degrees' },
        { name: 'particleShape', type: 'string', default: "'circle'", description: 'Shape: circle, star, heart, spark, square' },
        { name: 'colorScheme', type: 'string', default: "'rainbow'", description: 'Color scheme: rainbow, fire, ocean, nature, sunset, monochrome, neon' },
        { name: 'buttonScale', type: 'boolean', default: 'true', description: 'Animate button scale on click' }
      ],
      events: [
        { name: 'click', payload: 'MouseEvent', description: 'Emitted when button is clicked' },
        { name: 'explode', payload: 'void', description: 'Emitted when explosion animation starts' }
      ],
      about: {
        description: 'A button that creates an explosive particle effect on click. Particles burst outward with customizable shapes, colors, and physics.',
        howItWorks: [
          'Create DOM elements for each particle on click',
          'Calculate random angle within spread range',
          'Animate particles outward with GSAP',
          'Apply gravity effect to create arc motion',
          'Remove particles after animation completes'
        ],
        builtWith: ['GSAP', 'Vue 3']
      },
      controls: [
        // Particles group
        { type: 'slider', key: 'particleCount', label: 'Particle Count', min: 5, max: 50, step: 5, default: 20, group: 'Particles' },
        { type: 'slider', key: 'particleSize', label: 'Particle Size', min: 4, max: 16, step: 2, default: 8, group: 'Particles' },
        { type: 'slider', key: 'explosionRadius', label: 'Explosion Radius', min: 50, max: 200, step: 10, default: 120, group: 'Particles' },
        { type: 'slider', key: 'spread', label: 'Spread (deg)', min: 30, max: 360, step: 30, default: 360, group: 'Particles' },
        // Animation group
        { type: 'slider', key: 'duration', label: 'Duration', min: 0.3, max: 1.5, step: 0.1, default: 0.8, group: 'Animation' },
        { type: 'slider', key: 'gravity', label: 'Gravity', min: 0, max: 1, step: 0.1, default: 0.5, group: 'Animation' },
        { type: 'toggle', key: 'buttonScale', label: 'Button Scale', group: 'Animation', default: true },
        // Style group
        { type: 'select', key: 'particleShape', label: 'Shape', group: 'Style',
          options: [
            { value: 'circle', label: 'Circle' },
            { value: 'star', label: 'Star' },
            { value: 'heart', label: 'Heart' },
            { value: 'spark', label: 'Spark' },
            { value: 'square', label: 'Square' }
          ],
          default: 'circle' },
        { type: 'select', key: 'colorScheme', label: 'Colors', group: 'Style',
          options: [
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'fire', label: 'Fire' },
            { value: 'ocean', label: 'Ocean' },
            { value: 'nature', label: 'Nature' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'monochrome', label: 'Mono' },
            { value: 'neon', label: 'Neon' }
          ],
          default: 'rainbow' }
      ]
    },
    'intelligent-input': {
      id: '007',
      slug: 'intelligent-input',
      title: 'Intelligent Input',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/IntelligentInput.vue')),
      sourceCode: `<!-- IntelligentInput.vue - Input with character validation -->`,
      props: [
        { name: 'mode', type: 'string', default: "'alphanumeric'", description: 'Validation mode: alphanumeric, letters, numbers, email, custom' },
        { name: 'customPattern', type: 'string', default: "'[^a-zA-Z0-9]'", description: 'Custom regex pattern for invalid chars' },
        { name: 'maxLength', type: 'number', default: 'undefined', description: 'Maximum character limit' },
        { name: 'blockInput', type: 'boolean', default: 'false', description: 'Block invalid characters from input' },
        { name: 'showCount', type: 'boolean', default: 'true', description: 'Show character count' },
        { name: 'placeholder', type: 'string', default: "'Type something...'", description: 'Placeholder text' },
        { name: 'autoResize', type: 'boolean', default: 'true', description: 'Enable auto-resize' },
        { name: 'minRows', type: 'number', default: '1', description: 'Minimum rows for auto-resize' },
        { name: 'maxRows', type: 'number', default: '6', description: 'Maximum rows for auto-resize' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' }
      ],
      events: [
        { name: 'input', payload: 'string', description: 'Emitted on input with current value' },
        { name: 'invalidChar', payload: '{ char: string, index: number }', description: 'Emitted when invalid character detected' },
        { name: 'maxLengthReached', payload: 'number', description: 'Emitted when max length is reached' }
      ],
      about: {
        description: 'An intelligent input component that validates characters in real-time. Features auto-resize, character counting with remaining display, and animated invalid character feedback.',
        howItWorks: [
          'Uses native textarea with transparent text overlay',
          'Overlay shows colored characters (red for invalid)',
          'Apply regex pattern based on mode',
          'Auto-resize based on content with min/max rows',
          'Character counter shows remaining when maxLength set',
          'GSAP animations for invalid character shake effect'
        ],
        builtWith: ['Vue 3', 'GSAP', 'Tailwind CSS']
      },
      controls: [
        // Validation group
        { type: 'select', key: 'mode', label: 'Mode', group: 'Validation',
          options: [
            { value: 'alphanumeric', label: 'Alphanumeric' },
            { value: 'letters', label: 'Letters Only' },
            { value: 'numbers', label: 'Numbers Only' },
            { value: 'email', label: 'Email Safe' },
            { value: 'custom', label: 'Custom' }
          ],
          default: 'alphanumeric' },
        { type: 'toggle', key: 'blockInput', label: 'Block Invalid', group: 'Validation', default: false },
        { type: 'slider', key: 'maxLength', label: 'Max Length', group: 'Validation',
          min: 0, max: 200, step: 10, default: 0 },
        // Display group
        { type: 'toggle', key: 'showCount', label: 'Show Count', group: 'Display', default: true },
        { type: 'toggle', key: 'autoResize', label: 'Auto Resize', group: 'Display', default: true },
        { type: 'slider', key: 'minRows', label: 'Min Rows', group: 'Display',
          min: 1, max: 4, step: 1, default: 1 },
        { type: 'slider', key: 'maxRows', label: 'Max Rows', group: 'Display',
          min: 2, max: 10, step: 1, default: 6 }
      ]
    },
    'input-2': {
      id: '007B',
      slug: 'input-2',
      title: 'Input 2',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/Input2.vue')),
      sourceCode: `<!-- Input2.vue - Rebuilt intelligent input with validation + suggestions -->`,
      props: [
        { name: 'mode', type: "'alphanumeric' | 'letters' | 'numbers' | 'email' | 'slug' | 'command'", default: "'alphanumeric'", description: 'Validation and behavior mode' },
        { name: 'placeholder', type: 'string', default: "'Type here...'", description: 'Input placeholder text' },
        { name: 'maxLength', type: 'number', default: '120', description: 'Maximum allowed characters' },
        { name: 'minLength', type: 'number', default: '3', description: 'Minimum recommended character length' },
        { name: 'blockInvalid', type: 'boolean', default: 'false', description: 'Remove invalid characters while typing' },
        { name: 'smartSpaces', type: 'boolean', default: 'true', description: 'Collapse repeated spaces into one' },
        { name: 'liveSuggestions', type: 'boolean', default: 'true', description: 'Show suggestion chips based on mode' },
        { name: 'showMetrics', type: 'boolean', default: 'true', description: 'Show quality and length metrics' },
        { name: 'animateInvalidChar', type: 'boolean', default: 'true', description: 'Animate newly invalid character with reject shake' },
        { name: 'animateFieldReject', type: 'boolean', default: 'true', description: 'Animate entire input field on reject' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable user input' }
      ],
      events: [
        { name: 'input', payload: 'string', description: 'Emitted for each value change' },
        { name: 'invalid', payload: '{ removed: string, count: number }', description: 'Emitted when invalid chars are detected' },
        { name: 'suggestionApply', payload: 'string', description: 'Emitted when a suggestion chip is applied' },
        { name: 'submit', payload: 'string', description: 'Emitted on Enter key submit' }
      ],
      about: {
        description: 'Input 2 is a fresh intelligent input built for better behavior under real typing conditions. It combines per-mode sanitization, live quality feedback, and contextual suggestions.',
        howItWorks: [
          'Sanitizes input by mode with optional invalid-character blocking',
          'Normalizes spacing to avoid accidental repeated whitespace',
          'Computes quality and readiness signals from length and validity',
          'Generates mode-aware suggestions (email domains, slug normalization, command matches)',
          'Uses GSAP reject-shake animations for invalid character and/or full field',
          'Supports Enter submit and suggestion chip application events'
        ],
        builtWith: ['Vue 3', 'TypeScript', 'GSAP', 'Tailwind CSS']
      },
      controls: [
        { type: 'select', key: 'mode', label: 'Mode', group: 'Validation',
          options: [
            { value: 'alphanumeric', label: 'Alphanumeric' },
            { value: 'letters', label: 'Letters' },
            { value: 'numbers', label: 'Numbers' },
            { value: 'email', label: 'Email' },
            { value: 'slug', label: 'Slug' },
            { value: 'command', label: 'Command' }
          ],
          default: 'alphanumeric' },
        { type: 'toggle', key: 'blockInvalid', label: 'Block Invalid', group: 'Validation', default: false },
        { type: 'toggle', key: 'smartSpaces', label: 'Smart Spaces', group: 'Validation', default: true },
        { type: 'slider', key: 'maxLength', label: 'Max Length', group: 'Validation',
          min: 20, max: 240, step: 10, default: 120 },
        { type: 'slider', key: 'minLength', label: 'Min Length', group: 'Validation',
          min: 0, max: 20, step: 1, default: 3 },
        { type: 'toggle', key: 'animateInvalidChar', label: 'Char Shake', group: 'Animation', default: true },
        { type: 'toggle', key: 'animateFieldReject', label: 'Field Shake', group: 'Animation', default: true },
        { type: 'toggle', key: 'liveSuggestions', label: 'Suggestions', group: 'Assist', default: true },
        { type: 'toggle', key: 'showMetrics', label: 'Metrics', group: 'Assist', default: true },
        { type: 'toggle', key: 'disabled', label: 'Disabled', group: 'Assist', default: false }
      ]
    },
    'origami-card': {
      id: '008',
      slug: 'origami-card',
      title: 'Origami Card',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/OrigamiCard.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  foldCount?: number
  foldDuration?: number
  staggerDelay?: number
  foldAngle?: number
  perspective?: number
  shadowIntensity?: number
}>(), {
  foldCount: 3,
  foldDuration: 0.6,
  staggerDelay: 0.15,
  foldAngle: 180,
  perspective: 1000,
  shadowIntensity: 0.3
})

const emit = defineEmits<{
  unfold: []
  fold: []
}>()

const cardRef = ref<HTMLElement | null>(null)
const isUnfolded = ref(false)

const foldSegments = computed(() => {
  return Array.from({ length: props.foldCount }, (_, i) => ({
    id: i,
    isEven: i % 2 === 0
  }))
})

const toggleFold = () => {
  if (!cardRef.value) return
  const segments = cardRef.value.querySelectorAll('.fold-segment')

  if (isUnfolded.value) {
    // Close animation
    const reversedSegments = Array.from(segments).reverse()
    reversedSegments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      if (inner) {
        const direction = (segments.length - 1 - i) % 2 === 0 ? -1 : 1
        gsap.to(inner, {
          rotateX: props.foldAngle * direction,
          opacity: 0,
          duration: props.foldDuration,
          delay: i * props.staggerDelay,
          ease: 'power3.inOut'
        })
      }
    })
    emit('fold')
  } else {
    // Open animation
    segments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      if (inner) {
        gsap.to(inner, {
          rotateX: 0,
          opacity: 1,
          duration: props.foldDuration,
          delay: i * props.staggerDelay,
          ease: 'power3.out'
        })
      }
    })
    emit('unfold')
  }

  isUnfolded.value = !isUnfolded.value
}

onMounted(() => {
  // Initialize folded state
  if (!cardRef.value) return
  const segments = cardRef.value.querySelectorAll('.fold-segment')
  segments.forEach((segment, i) => {
    const inner = segment.querySelector('.fold-inner') as HTMLElement
    if (inner) {
      const direction = i % 2 === 0 ? -1 : 1
      gsap.set(inner, {
        rotateX: props.foldAngle * direction,
        opacity: 0
      })
    }
  })
})
</script>

<template>
  <div ref="cardRef" class="origami-card mx-auto w-64 cursor-pointer" 
       :style="{ perspective: \`\${perspective}px\` }"
       @click="toggleFold">
    <div v-for="segment in foldSegments" :key="segment.id" 
         class="fold-segment relative"
         :style="{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }">
      <div class="fold-inner backface-hidden flex items-center justify-center 
                  border-b border-white/10 bg-dark-800/80 px-4 py-6"
           :style="{
             transformStyle: 'preserve-3d',
             boxShadow: \`0 \${shadowIntensity * 10}px \${shadowIntensity * 20}px rgba(0,0,0,\${shadowIntensity})\`
           }">
        <div class="text-center">
          <div class="mb-2 text-2xl">◈</div>
          <h3 class="font-mono text-sm font-medium text-white">Segment {{ segment.id + 1 }}</h3>
        </div>
      </div>
    </div>
    <div class="mt-4 text-center font-mono text-xs text-white/40">
      Click to {{ isUnfolded ? 'fold' : 'unfold' }}
    </div>
  </div>
</template>

<style scoped>
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>`,
      props: [
        { name: 'foldCount', type: 'number', default: '3', description: 'Number of fold segments in the card' },
        { name: 'foldDuration', type: 'number', default: '0.6', description: 'Duration of each fold animation in seconds' },
        { name: 'staggerDelay', type: 'number', default: '0.15', description: 'Delay between segment animations' },
        { name: 'foldAngle', type: 'number', default: '180', description: 'Angle of rotation when folded' },
        { name: 'perspective', type: 'number', default: '1000', description: '3D perspective depth' },
        { name: 'shadowIntensity', type: 'number', default: '0.3', description: 'Intensity of shadows (0-1)' }
      ],
      events: [
        { name: 'unfold', description: 'Emitted when the card unfolds', payload: 'void' },
        { name: 'fold', description: 'Emitted when the card folds', payload: 'void' }
      ],
      about: {
        description: 'A card component with stunning origami-like fold animations. Click to unfold and reveal content segments with smooth 3D transitions.',
        howItWorks: [
          'Card starts in a folded state with segments rotated 180°',
          'Clicking triggers staggered GSAP animations to unfold segments',
          'Each segment rotates around its top edge using CSS 3D transforms',
          'Alternating fold directions create realistic paper folding effect',
          'Shadow intensity adds depth perception during animations'
        ],
        builtWith: ['Vue 3', 'GSAP', 'CSS 3D Transforms', 'TypeScript']
      },
      controls: [
        { type: 'slider', key: 'foldCount', label: 'Fold Count', group: 'Animation', min: 2, max: 5, step: 1, default: 3 },
        { type: 'slider', key: 'foldDuration', label: 'Duration', group: 'Animation', min: 0.2, max: 1.5, step: 0.1, default: 0.6 },
        { type: 'slider', key: 'staggerDelay', label: 'Stagger', group: 'Animation', min: 0.05, max: 0.4, step: 0.05, default: 0.15 },
        { type: 'slider', key: 'foldAngle', label: 'Fold Angle', group: 'Animation', min: 90, max: 270, step: 10, default: 180 },
        { type: 'slider', key: 'perspective', label: 'Perspective', group: 'Visual', min: 400, max: 2000, step: 100, default: 1000 },
        { type: 'slider', key: 'shadowIntensity', label: 'Shadow', group: 'Visual', min: 0, max: 1, step: 0.1, default: 0.3 }
      ]
    },
    'gesture-ripple': {
      id: '009',
      slug: 'gesture-ripple',
      title: 'Gesture Ripple',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/GestureRipple.vue')),
      sourceCode: `<script setup lang="ts">
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
    const delay = i * 0.1
    const size = props.rippleSize * (1 - i * 0.15)
    ripple.style.cssText = \`
      position: absolute;
      left: \${x}px;
      top: \${y}px;
      width: 0;
      height: 0;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 10;
    \`
    if (props.rippleStyle === 'circle') {
      ripple.style.borderRadius = '50%'
      ripple.style.backgroundColor = props.rippleColor
      ripple.style.opacity = String(props.rippleOpacity)
    } else if (props.rippleStyle === 'ring') {
      ripple.style.borderRadius = '50%'
      ripple.style.border = \`2px solid \${props.rippleColor}\`
      ripple.style.opacity = String(props.rippleOpacity)
    } else if (props.rippleStyle === 'square') {
      ripple.style.backgroundColor = props.rippleColor
      ripple.style.opacity = String(props.rippleOpacity)
    }
    if (props.enableGlow) {
      ripple.style.boxShadow = \`0 0 \${20 * props.glowIntensity}px \${10 * props.glowIntensity}px \${props.rippleColor}\`
    }
    container.appendChild(ripple)
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
    trailPoints.value = trailPoints.value.map(p => ({ ...p, age: p.age + 1 }))
    if (!isDragging.value) {
      trailPoints.value = trailPoints.value.filter(p => p.age < 30)
    }
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
      if (props.trailFade) {
        ctx.lineWidth = props.trailWidth * progress
        ctx.strokeStyle = props.trailColor + Math.round(progress * (isDragging.value ? 255 : 255 - point.age * 8)).toString(16).padStart(2, '0')
      } else {
        ctx.lineWidth = props.trailWidth
        ctx.strokeStyle = props.trailColor
      }
    }
    ctx.stroke()
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

defineExpose({ createRipple, interactionCount })
<` + `/script>

<template>
  <div ref="containerRef" class="gesture-ripple-demo flex h-full w-full flex-col items-center justify-center p-6">
    <div ref="interactionAreaRef"
      class="relative min-h-[320px] flex-1 w-full cursor-crosshair overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent"
      @mousedown="handleInteractionStart" @mousemove="handleInteractionMove"
      @touchstart.prevent="handleInteractionStart" @touchmove.prevent="handleInteractionMove">
      <canvas ref="canvasRef" class="pointer-events-none absolute inset-0 h-full w-full" />
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div class="mb-4 flex items-center gap-4">
          <MousePointer class="h-5 w-5 text-white/20" />
          <Fingerprint class="h-5 w-5 text-white/20" />
          <Waves class="h-5 w-5 text-white/20" />
        </div>
        <p class="font-mono text-sm text-white/30">Click and drag anywhere</p>
        <p class="mt-1 font-mono text-[10px] text-white/20">Feel the feedback</p>
      </div>
      <div class="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-white/10" />
      <div class="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-white/10" />
      <div class="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/10" />
      <div class="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/10" />
    </div>
    <p class="mt-4 font-mono text-xs text-white/40">Interactions: {{ interactionCount }}</p>
  </div>
</template>`,
      props: [
        { name: 'rippleColor', type: 'string', default: "'#ffffff'", description: 'Color of the ripple effect (hex)' },
        { name: 'rippleOpacity', type: 'number', default: '0.4', description: 'Starting opacity of ripples (0-1)' },
        { name: 'rippleSize', type: 'number', default: '200', description: 'Maximum ripple size in pixels' },
        { name: 'rippleDuration', type: 'number', default: '0.8', description: 'Duration of ripple animation in seconds' },
        { name: 'rippleCount', type: 'number', default: '3', description: 'Number of concentric ripples per click' },
        { name: 'rippleStyle', type: "'circle' | 'square' | 'ring'", default: "'circle'", description: 'Shape style of the ripple' },
        { name: 'enableTrail', type: 'boolean', default: 'true', description: 'Enable drag trail effect' },
        { name: 'trailLength', type: 'number', default: '20', description: 'Maximum number of trail points' },
        { name: 'trailFade', type: 'boolean', default: 'true', description: 'Enable trail fade effect' },
        { name: 'trailColor', type: 'string', default: "'#8b5cf6'", description: 'Color of the trail effect (hex)' },
        { name: 'trailWidth', type: 'number', default: '4', description: 'Width of the trail line in pixels' },
        { name: 'enableGlow', type: 'boolean', default: 'true', description: 'Enable glow effect on ripples and trail' },
        { name: 'glowIntensity', type: 'number', default: '0.6', description: 'Intensity of the glow effect (0-1.5)' }
      ],
      events: [
        { name: 'ripple', payload: '{ x: number, y: number }', description: 'Emitted when a ripple is created' },
        { name: 'trailStart', payload: '{ x: number, y: number }', description: 'Emitted when drag trail starts' },
        { name: 'trailEnd', payload: 'void', description: 'Emitted when drag trail ends' }
      ],
      about: {
        description: 'Gesture Ripple provides immediate, satisfying visual feedback for user interactions. Based on Material Design\'s ripple effect but enhanced with customizable trails, glows, and multiple styles. Creates a tactile feel that makes interfaces feel responsive and alive.',
        howItWorks: [
          'Click events spawn DOM elements at the exact interaction point',
          'GSAP animates scale and opacity with easing for natural feel',
          'Drag trails use Canvas 2D API for smooth, performant rendering',
          'Point aging creates natural fade-out when interaction ends',
          'Glow effects use box-shadow (ripples) and radial gradients (trail)'
        ],
        builtWith: ['GSAP', 'Vue 3', 'Canvas 2D', 'requestAnimationFrame', 'Touch Events']
      },
      controls: [
        // Ripple group
        { type: 'select', key: 'rippleStyle', label: 'Style', group: 'Ripple',
          options: [
            { value: 'circle', label: 'Circle' },
            { value: 'ring', label: 'Ring' },
            { value: 'square', label: 'Square' }
          ],
          default: 'circle'
        },
        { type: 'color', key: 'rippleColor', label: 'Color', group: 'Ripple',
          options: [
            { value: '#ffffff', label: 'White' },
            { value: '#8b5cf6', label: 'Purple' },
            { value: '#06b6d4', label: 'Cyan' },
            { value: '#ec4899', label: 'Pink' },
            { value: '#10b981', label: 'Green' },
            { value: '#f97316', label: 'Orange' }
          ],
          default: '#ffffff'
        },
        { type: 'slider', key: 'rippleSize', label: 'Size', min: 50, max: 400, step: 10, default: 200, group: 'Ripple' },
        { type: 'slider', key: 'rippleDuration', label: 'Duration', min: 0.3, max: 2, step: 0.1, default: 0.8, group: 'Ripple' },
        { type: 'slider', key: 'rippleCount', label: 'Count', min: 1, max: 5, step: 1, default: 3, group: 'Ripple' },
        { type: 'slider', key: 'rippleOpacity', label: 'Opacity', min: 0.1, max: 1, step: 0.05, default: 0.4, group: 'Ripple' },
        // Trail group
        { type: 'toggle', key: 'enableTrail', label: 'Enable Trail', group: 'Trail', default: true },
        { type: 'color', key: 'trailColor', label: 'Trail Color', group: 'Trail',
          options: [
            { value: '#8b5cf6', label: 'Purple' },
            { value: '#06b6d4', label: 'Cyan' },
            { value: '#ec4899', label: 'Pink' },
            { value: '#10b981', label: 'Green' },
            { value: '#f97316', label: 'Orange' }
          ],
          default: '#8b5cf6'
        },
        { type: 'slider', key: 'trailLength', label: 'Length', min: 5, max: 50, step: 1, default: 20, group: 'Trail' },
        { type: 'slider', key: 'trailWidth', label: 'Width', min: 1, max: 12, step: 1, default: 4, group: 'Trail' },
        { type: 'toggle', key: 'trailFade', label: 'Fade Effect', group: 'Trail', default: true },
        // Glow group
        { type: 'toggle', key: 'enableGlow', label: 'Enable Glow', group: 'Glow', default: true },
        { type: 'slider', key: 'glowIntensity', label: 'Intensity', min: 0.2, max: 1.5, step: 0.1, default: 0.6, group: 'Glow' }
      ]
    },
    'toast-stack': {
      id: '010',
      slug: 'toast-stack',
      title: 'Toast Stack',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/ToastStack.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration: number
  createdAt: number
  progress: number
  dismissed: boolean
  swipeX: number
  paused: boolean
  pausedAt: number | null
  elapsed: number
}

type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
type Animation = 'slide' | 'scale' | 'fade'

const props = withDefaults(defineProps<{
  position?: Position
  maxVisible?: number
  defaultDuration?: number
  stackSpacing?: number
  stackScale?: number
  stackOpacity?: number
  swipeToDismiss?: boolean
  swipeThreshold?: number
  showProgress?: boolean
  pauseOnHover?: boolean
  animation?: Animation
}>(), {
  position: 'top-right',
  maxVisible: 4,
  defaultDuration: 5000,
  stackSpacing: 12,
  stackScale: 0.95,
  stackOpacity: 0.8,
  swipeToDismiss: true,
  swipeThreshold: 100,
  showProgress: true,
  pauseOnHover: true,
  animation: 'slide'
})

const emit = defineEmits<{
  create: [toast: { id: number; type: string; title: string }]
  dismiss: [id: number]
  clearAll: []
}>()

const toasts = ref<Toast[]>([])
let toastId = 0

// Create a new toast
const createToast = (type: Toast['type']) => {
  const toast: Toast = {
    id: toastId++,
    type,
    title: 'Toast Title',
    message: 'Toast message content.',
    duration: props.defaultDuration,
    createdAt: Date.now(),
    progress: 100,
    dismissed: false,
    swipeX: 0,
    paused: false,
    pausedAt: null,
    elapsed: 0
  }
  toasts.value.push(toast)
  startProgress(toast.id)
  emit('create', { id: toast.id, type: toast.type, title: toast.title })
}

// Progress countdown via requestAnimationFrame
const startProgress = (id: number) => {
  const update = () => {
    const t = toasts.value.find(x => x.id === id)
    if (!t || t.dismissed) return
    if (t.paused) { requestAnimationFrame(update); return }
    t.elapsed += 16.67
    t.progress = Math.max(0, 100 - (t.elapsed / t.duration) * 100)
    if (t.progress <= 0) dismissToast(id)
    else requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const dismissToast = (id: number) => {
  const t = toasts.value.find(x => x.id === id)
  if (t && !t.dismissed) {
    t.dismissed = true
    emit('dismiss', id)
    setTimeout(() => {
      const i = toasts.value.findIndex(x => x.id === id)
      if (i > -1) toasts.value.splice(i, 1)
    }, 300)
  }
}

const clearAllToasts = () => {
  toasts.value.forEach(t => { t.dismissed = true })
  emit('clearAll')
  setTimeout(() => { toasts.value = [] }, 300)
}

// Stack transform per toast index
const getStackStyle = (index: number, total: number) => {
  const isTop = props.position.includes('top')
  const si = isTop ? index : total - 1 - index
  return {
    transform: \`translateY(\${si * props.stackSpacing * (isTop ? 1 : -1)}px) scale(\${Math.pow(props.stackScale, si)})\`,
    opacity: si === 0 ? 1 : Math.pow(props.stackOpacity, si),
    zIndex: total - si
  }
}

defineExpose({ createToast, dismissToast, clearAllToasts })
<` + `/script>

<template>
  <div class="fixed z-[100] w-80 top-4 right-4">
    <TransitionGroup :name="animation" tag="div" class="relative">
      <div v-for="(toast, index) in visibleToasts" :key="toast.id"
        :style="getStackStyle(index, visibleToasts.length)"
        class="absolute w-full rounded-lg border shadow-2xl backdrop-blur-xl">
        <div class="p-4 flex items-start gap-3">
          <component :is="getToastIcon(toast.type)" class="h-4 w-4" />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm text-white">{{ toast.title }}</p>
            <p class="mt-1 text-xs text-white/60">{{ toast.message }}</p>
          </div>
          <button @click="dismissToast(toast.id)">
            <X class="h-4 w-4" />
          </button>
        </div>
        <div v-if="showProgress" class="h-1 w-full overflow-hidden rounded-b-lg bg-black/20">
          <div class="h-full" :style="{ width: toast.progress + '%' }" />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>`,
      props: [
        { name: 'position', type: "'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'", default: "'top-right'", description: 'Screen position for the toast container' },
        { name: 'maxVisible', type: 'number', default: '4', description: 'Maximum number of toasts visible at once' },
        { name: 'defaultDuration', type: 'number', default: '5000', description: 'Auto-dismiss duration in milliseconds' },
        { name: 'stackSpacing', type: 'number', default: '12', description: 'Vertical spacing between stacked toasts in pixels' },
        { name: 'stackScale', type: 'number', default: '0.95', description: 'Scale factor applied to each successive toast in the stack' },
        { name: 'stackOpacity', type: 'number', default: '0.8', description: 'Opacity factor applied to each successive toast in the stack' },
        { name: 'swipeToDismiss', type: 'boolean', default: 'true', description: 'Enable swipe gesture to dismiss toasts' },
        { name: 'swipeThreshold', type: 'number', default: '100', description: 'Minimum swipe distance in pixels to trigger dismiss' },
        { name: 'showProgress', type: 'boolean', default: 'true', description: 'Show countdown progress bar on each toast' },
        { name: 'pauseOnHover', type: 'boolean', default: 'true', description: 'Pause auto-dismiss countdown when hovering a toast' },
        { name: 'animation', type: "'slide' | 'scale' | 'fade'", default: "'slide'", description: 'Enter/leave animation style for toasts' }
      ],
      events: [
        { name: 'create', payload: '{ id: number, type: string, title: string }', description: 'Emitted when a new toast is created' },
        { name: 'dismiss', payload: 'number', description: 'Emitted when a toast is dismissed, with the toast ID' },
        { name: 'clearAll', payload: 'void', description: 'Emitted when all toasts are cleared' }
      ],
      about: {
        description: 'Toast Stack provides non-intrusive notifications that stack elegantly. Unlike modal dialogs, toasts don\'t interrupt the user\'s workflow while still providing important feedback. The stacking effect creates visual hierarchy showing notification history.',
        howItWorks: [
          'New toasts are added to a reactive array with unique IDs and timestamps',
          'Stack transforms (scale, translateY, opacity) are calculated based on index',
          'Progress bar uses requestAnimationFrame for smooth countdown animation',
          'Swipe detection tracks deltaX and dismisses when threshold is exceeded',
          'Pause-on-hover freezes the countdown timer while the user reads'
        ],
        builtWith: ['Vue TransitionGroup', 'CSS Transforms', 'requestAnimationFrame', 'Touch Events']
      },
      controls: [
        // Position & Layout
        { type: 'select', key: 'position', label: 'Position', group: 'Position & Layout',
          options: [
            { value: 'top-right', label: 'Top Right' },
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-center', label: 'Top Center' },
            { value: 'bottom-right', label: 'Bottom Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-center', label: 'Bottom Center' }
          ],
          default: 'top-right'
        },
        { type: 'slider', key: 'maxVisible', label: 'Max Visible', min: 1, max: 6, step: 1, default: 4, group: 'Position & Layout' },
        { type: 'slider', key: 'defaultDuration', label: 'Duration (ms)', min: 1000, max: 10000, step: 500, default: 5000, group: 'Position & Layout' },
        { type: 'select', key: 'animation', label: 'Animation', group: 'Position & Layout',
          options: [
            { value: 'slide', label: 'Slide' },
            { value: 'scale', label: 'Scale' },
            { value: 'fade', label: 'Fade' }
          ],
          default: 'slide'
        },
        // Stack & Behavior
        { type: 'slider', key: 'stackSpacing', label: 'Stack Spacing', min: 4, max: 24, step: 2, default: 12, group: 'Stack & Behavior' },
        { type: 'slider', key: 'stackScale', label: 'Stack Scale', min: 0.85, max: 1, step: 0.01, default: 0.95, group: 'Stack & Behavior' },
        { type: 'toggle', key: 'swipeToDismiss', label: 'Swipe to Dismiss', group: 'Stack & Behavior', default: true },
        { type: 'toggle', key: 'showProgress', label: 'Show Progress', group: 'Stack & Behavior', default: true },
        { type: 'toggle', key: 'pauseOnHover', label: 'Pause on Hover', group: 'Stack & Behavior', default: true },
        { type: 'slider', key: 'swipeThreshold', label: 'Swipe Threshold', min: 50, max: 200, step: 10, default: 100, group: 'Stack & Behavior' }
      ]
    },
    'radial-menu': {
      id: '011',
      slug: 'radial-menu',
      title: 'Radial Menu',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/RadialMenu.vue')),
      sourceCode: `<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { Home, Search, Heart, Star, Bell, Mail, User, Settings } from 'lucide-vue-next'
import { calculateAvailableArc, calculateButtonPositions } from '~/composables/useRadialMenu'

const props = withDefaults(defineProps<{
  radius?: number
  itemCount?: number
  itemSize?: number
  animationDuration?: number
  staggerDelay?: number
  openEase?: string
  closeEase?: string
}>(), {
  radius: 80,
  itemCount: 6,
  itemSize: 44,
  animationDuration: 0.4,
  staggerDelay: 0.03,
  openEase: 'back.out(1.7)',
  closeEase: 'power2.in'
})

const menuIcons = [Home, Search, Heart, Star, Bell, Mail, User, Settings]

const isOpen = ref(false)
const isAnimating = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const itemPositions = ref([])
const triggerElement = ref(null)
const openTimestamp = ref(0)

const menuRef = ref(null)
const containerRef = ref(null)

const openMenu = (x, y, trigger) => {
  if (!containerRef.value || isAnimating.value) return
  gsap.killTweensOf('.menu-item')
  triggerElement.value = trigger || null
  const containerRect = containerRef.value.getBoundingClientRect()
  const padding = props.radius + props.itemSize / 2 + 10
  const { startAngle, endAngle } = calculateAvailableArc(x, y, containerRect, padding)
  menuPosition.value = { x: x - containerRect.left, y: y - containerRect.top }
  itemPositions.value = calculateButtonPositions(startAngle, endAngle, props.radius, props.itemCount)
  isOpen.value = true
  isAnimating.value = true
  openTimestamp.value = Date.now()
  nextTick(() => {
    const items = menuRef.value?.querySelectorAll('.menu-item')
    if (!items) return
    gsap.fromTo(items,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        x: (i) => itemPositions.value[i]?.x || 0,
        y: (i) => itemPositions.value[i]?.y || 0,
        opacity: 1,
        duration: props.animationDuration,
        ease: props.openEase,
        stagger: props.staggerDelay,
        onComplete: () => { isAnimating.value = false }
      }
    )
  })
}

const closeMenu = () => {
  if (!isOpen.value || isAnimating.value) return
  const items = menuRef.value?.querySelectorAll('.menu-item')
  if (!items || items.length === 0) { isOpen.value = false; return }
  isAnimating.value = true
  gsap.to(items, {
    scale: 0, opacity: 0,
    duration: props.animationDuration * 0.5,
    ease: props.closeEase,
    stagger: { each: props.staggerDelay * 0.5, from: 'end' },
    onComplete: () => {
      isOpen.value = false
      isAnimating.value = false
      triggerElement.value = null
      openTimestamp.value = 0
    }
  })
}

const onContextMenu = (e) => {
  e.preventDefault()
  if (isOpen.value) {
    gsap.killTweensOf('.menu-item')
    isOpen.value = false
    isAnimating.value = false
    setTimeout(() => openMenu(e.clientX, e.clientY), 50)
  } else {
    openMenu(e.clientX, e.clientY)
  }
}

const onItemClick = (index, e) => {
  e.preventDefault()
  e.stopPropagation()
  if (isAnimating.value) return
  const items = menuRef.value?.querySelectorAll('.menu-item')
  if (items?.[index]) {
    gsap.to(items[index], { scale: 1.3, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.out', onComplete: closeMenu })
  } else {
    closeMenu()
  }
}

const onClickOutside = (e) => {
  if (!isOpen.value || isAnimating.value) return
  if (Date.now() - openTimestamp.value < 100) return
  if (menuRef.value?.contains(e.target)) return
  if (triggerElement.value?.contains(e.target)) return
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu() })
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
` + '<' + '/script>' + `

<template>
  <div ref="containerRef" class="relative h-full w-full" @contextmenu="onContextMenu">
    <slot :open-menu="openMenu" :close-menu="closeMenu" :is-open="isOpen">
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <p class="font-mono text-sm text-white/40">Right-click anywhere in this area</p>
        <span class="font-mono text-[10px] text-white/20">or</span>
        <button
          class="group relative overflow-hidden border border-white/20 bg-transparent px-8 py-3 transition-colors hover:border-white/40"
          @click="(e) => { const r = e.currentTarget.getBoundingClientRect(); isOpen ? closeMenu() : openMenu(r.left + r.width/2, r.top + r.height/2, e.currentTarget) }"
        >
          <span class="relative z-10 font-mono text-sm uppercase tracking-[0.15em]">Open Menu</span>
          <span class="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
          <span class="absolute inset-0 flex items-center justify-center font-mono text-sm uppercase tracking-[0.15em] text-dark-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100">Open Menu</span>
        </button>
      </div>
    </slot>
    <div v-show="isOpen" ref="menuRef" class="absolute z-50" :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }">
      <div class="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
      <button
        v-for="(pos, index) in itemPositions" :key="index"
        class="menu-item absolute flex items-center justify-center rounded-full border border-white/20 bg-dark-800/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-dark-700"
        :style="{ width: itemSize + 'px', height: itemSize + 'px', left: (-itemSize/2) + 'px', top: (-itemSize/2) + 'px' }"
        @click="onItemClick(index, $event)"
      >
        <component :is="menuIcons[index % menuIcons.length]" class="h-5 w-5 text-white/80" />
      </button>
    </div>
  </div>
</template>`,
      props: [
        { name: 'radius', type: 'number', default: '80', description: 'Distance from center to menu items in pixels' },
        { name: 'itemCount', type: 'number', default: '6', description: 'Number of items to display in the radial menu' },
        { name: 'itemSize', type: 'number', default: '44', description: 'Width and height of each menu item button in pixels' },
        { name: 'animationDuration', type: 'number', default: '0.4', description: 'Duration of open/close animation in seconds' },
        { name: 'staggerDelay', type: 'number', default: '0.03', description: 'Delay between each item animation in seconds' },
        { name: 'openEase', type: 'string', default: "'back.out(1.7)'", description: 'GSAP easing for the open animation' },
        { name: 'closeEase', type: 'string', default: "'power2.in'", description: 'GSAP easing for the close animation' }
      ],
      events: [
        { name: 'open', payload: '{ x: number; y: number }', description: 'Emitted when the menu opens, with position relative to container' },
        { name: 'close', payload: 'void', description: 'Emitted when the menu closes' },
        { name: 'itemClick', payload: 'number', description: 'Emitted when a menu item is clicked, with the item index' }
      ],
      about: {
        description: 'A radial menu arranges options in a circle around the cursor. This implementation features adaptive arc positioning — when opened near container edges, the menu automatically transforms into a semi-circle or quarter arc to keep all items visible.',
        howItWorks: [
          'On trigger (right-click or button), capture the cursor position relative to the container',
          'Calculate available space in each direction from the trigger position',
          'Determine safe angular range, excluding arcs that would overflow the container',
          'Distribute menu items evenly within the safe arc using trigonometry',
          'Animate items from center outward using GSAP stagger with configurable easing'
        ],
        builtWith: ['GSAP', 'Vue 3', 'Trigonometry', 'Lucide Icons']
      },
      controls: [
        // Layout group
        { type: 'slider', key: 'radius', label: 'Radius', min: 50, max: 150, step: 5, default: 80, group: 'Layout' },
        { type: 'slider', key: 'itemCount', label: 'Item Count', min: 3, max: 8, step: 1, default: 6, group: 'Layout' },
        { type: 'slider', key: 'itemSize', label: 'Item Size', min: 32, max: 64, step: 4, default: 44, group: 'Layout' },
        // Animation group
        { type: 'slider', key: 'animationDuration', label: 'Duration', min: 0.1, max: 0.8, step: 0.05, default: 0.4, group: 'Animation' },
        { type: 'slider', key: 'staggerDelay', label: 'Stagger Delay', min: 0, max: 0.1, step: 0.01, default: 0.03, group: 'Animation' },
        { type: 'select', key: 'openEase', label: 'Open Easing', group: 'Animation',
          options: [
            { value: 'none', label: 'None' },
            { value: 'power1.out', label: 'Power1' },
            { value: 'power2.out', label: 'Power2' },
            { value: 'power3.out', label: 'Power3' },
            { value: 'back.out(1.7)', label: 'Back (1.7)' },
            { value: 'back.out(2.5)', label: 'Back (2.5)' },
            { value: 'elastic.out(1, 0.3)', label: 'Elastic' },
            { value: 'bounce.out', label: 'Bounce' },
            { value: 'circ.out', label: 'Circ' }
          ],
          default: 'back.out(1.7)'
        },
        { type: 'select', key: 'closeEase', label: 'Close Easing', group: 'Animation',
          options: [
            { value: 'none', label: 'None' },
            { value: 'power1.in', label: 'Power1' },
            { value: 'power2.in', label: 'Power2' },
            { value: 'power3.in', label: 'Power3' },
            { value: 'power4.in', label: 'Power4' },
            { value: 'circ.in', label: 'Circ' },
            { value: 'expo.in', label: 'Expo' }
          ],
          default: 'power2.in'
        }
      ]
    },
    'pie-menu': {
      id: '012',
      slug: 'pie-menu',
      title: 'Pie Menu',
      status: 'soon',
      sourceCode: `<!-- PieMenu.vue - Coming soon -->`,
      props: [],
      events: [],
      about: {
        description: 'A pie-style context menu.',
        howItWorks: [],
        builtWith: ['GSAP', 'Vue 3']
      }
    },
    'ambient-progress': {
      id: '013',
      slug: 'ambient-progress',
      title: 'Ambient Progress',
      status: 'soon',
      sourceCode: `<!-- AmbientProgress.vue - Coming soon -->`,
      props: [],
      events: [],
      about: {
        description: 'An ambient progress indicator.',
        howItWorks: [],
        builtWith: ['GSAP', 'Vue 3']
      }
    },
    'table-of-contents': {
      id: '014',
      slug: 'table-of-contents',
      title: 'Table of Contents',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/TableOfContents.vue')),
      sourceCode: `<script setup lang="ts">
interface TocItem {
  id: string
  label: string
  disabled?: boolean
  badge?: string
}

const props = withDefaults(defineProps<{
  items?: TocItem[]
  activeId?: string
  itemHeight?: number
  topPadding?: number
  scrollCooldownMs?: number
}>(), {
  items: () => [
    { id: '001', label: 'Introduction' },
    { id: '002', label: 'Core Concepts' },
    { id: '003', label: 'Architecture' },
    { id: '004', label: 'System Internals' },
    { id: '005', label: 'Components' },
    { id: '006', label: 'Button UI' },
    { id: '007', label: 'Form Elements' },
    { id: '008', label: 'Navigation', disabled: true, badge: 'soon' },
    { id: '009', label: 'Data Display' },
    { id: '010', label: 'Feedback' },
  ],
  activeId: '005',
  itemHeight: 44,
  topPadding: 16,
  scrollCooldownMs: 400,
})

const emit = defineEmits<{ 'update:activeId': [id: string] }>()

const activeIndex = computed(() =>
  props.items.findIndex(item => item.id === props.activeId)
)

const dotY = computed(() => {
  if (activeIndex.value < 0) return -1
  return props.topPadding + activeIndex.value * props.itemHeight + props.itemHeight / 2
})

let scrollCooldown = false

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (scrollCooldown) return
  const direction = e.deltaY > 0 ? 1 : -1
  const enabledItems = props.items.filter(item => !item.disabled)
  const currentIndex = enabledItems.findIndex(item => item.id === props.activeId)
  const nextItem = enabledItems[currentIndex + direction]
  if (nextItem) {
    emit('update:activeId', nextItem.id)
    scrollCooldown = true
    setTimeout(() => { scrollCooldown = false }, props.scrollCooldownMs)
  }
}

const select = (item: TocItem) => {
  if (!item.disabled) emit('update:activeId', item.id)
}
<` + `/script>

<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r border-white/10 bg-dark-900" @wheel="onWheel">
    <div class="flex h-[53px] items-center gap-2 border-b border-white/10 px-5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">On This Page</span>
    </div>
    <nav class="relative min-h-0 flex-1 overflow-hidden py-4">
      <div class="px-3">
        <button v-for="item in items" :key="item.id" :disabled="item.disabled"
          class="group mb-1 flex w-full items-center justify-between py-2.5 pl-8 pr-3 text-left transition-colors duration-150"
          :class="[item.id === activeId ? 'text-white' : item.disabled ? 'cursor-not-allowed text-white/20' : 'text-white/40 hover:text-white/70']"
          @click="select(item)">
          <div class="flex items-center gap-3">
            <span :class="['font-mono text-[10px]', item.id === activeId ? 'text-white/50' : 'text-white/20']">{{ item.id }}</span>
            <span :class="['text-sm', item.id === activeId ? 'font-semibold' : 'font-normal']">{{ item.label }}</span>
          </div>
          <span v-if="item.badge" class="font-mono text-[8px] uppercase tracking-wider text-white/15">{{ item.badge }}</span>
        </button>
      </div>
      <div class="pointer-events-none absolute inset-y-0 left-5 w-px" style="background: rgba(255,255,255,0.12);" />
      <div v-if="dotY >= 0" class="pointer-events-none absolute left-5 top-0 w-px transition-[height] duration-500 ease-out" :style="{ height: dotY + 'px', background: 'rgba(255,255,255,0.55)' }" />
      <div v-if="dotY >= 0" class="pointer-events-none absolute left-5 transition-[top] duration-500 ease-out"
        :style="{ top: dotY + 'px', width: '7px', height: '7px', borderRadius: '50%', background: 'white', transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }" />
    </nav>
  </aside>
</template>`,
      props: [
        { name: 'items', type: 'TocItem[]', default: '(10 dummy items)', description: 'List of items to display in the table of contents' },
        { name: 'activeId', type: 'string', default: "'005'", description: 'ID of the currently active item' },
        { name: 'itemHeight', type: 'number', default: '44', description: 'Height of each item row in pixels' },
        { name: 'topPadding', type: 'number', default: '16', description: 'Top padding of the nav list in pixels' },
        { name: 'scrollCooldownMs', type: 'number', default: '400', description: 'Cooldown between scroll-wheel navigations in milliseconds' }
      ],
      events: [
        { name: 'update:activeId', payload: 'string', description: 'Emitted when an item is clicked or scroll-navigated to' },
        { name: 'wheel', payload: 'WheelEvent', description: 'Scroll up/down to navigate to prev/next enabled item' }
      ],
      about: {
        description: 'A sidebar table-of-contents component with a vertical progress line indicator. A white dot tracks the active item along the line, animating smoothly on navigation. Scroll wheel cycles through items.',
        howItWorks: [
          'Accepts a list of items with id, label, optional disabled flag and badge',
          'Computes activeIndex from the activeId prop',
          'Calculates dot Y position: topPadding + activeIndex × itemHeight + itemHeight/2',
          'Renders a dim track line and bright filled segment absolutely positioned after the items (so they paint on top)',
          'Wheel events navigate to prev/next enabled item with a configurable cooldown'
        ],
        builtWith: ['Vue 3', 'Tailwind CSS']
      },
      controls: [
        { type: 'slider', key: 'itemHeight', label: 'Item Height', min: 36, max: 56, step: 2, default: 44, group: 'Layout' },
        { type: 'slider', key: 'topPadding', label: 'Top Padding', min: 8, max: 32, step: 4, default: 16, group: 'Layout' },
        { type: 'slider', key: 'scrollCooldownMs', label: 'Scroll Cooldown (ms)', min: 100, max: 800, step: 50, default: 400, group: 'Behavior' }
      ]
    },
    'blossom-color-picker': {
      id: '015',
      slug: 'blossom-color-picker',
      title: 'Blossom Color Picker',
      status: 'ready',
      component: defineAsyncComponent(() => import('~/components/BlossomColorPicker.vue')),
      sourceCode: `<script setup lang="ts">
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

const palette = computed(() => {
  const colors: { hue: number; hex: string; label: string }[] = []
  const count = props.petalCount
  for (let i = 0; i < count; i++) {
    const hue = Math.round((i / count) * 360)
    colors.push({ hue, hex: hslToHex(hue, 80, 58), label: hueLabel(hue) })
  }
  return colors
})

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return \`#\${f(0)}\${f(8)}\${f(4)}\`
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

const svgSize = computed(() => (props.outerRadius + 20) * 2)
const cx = computed(() => svgSize.value / 2)
const cy = computed(() => svgSize.value / 2)

function petalPath(index: number): string {
  const count = props.petalCount
  const angleStep = (2 * Math.PI) / count
  const angle = angleStep * index - Math.PI / 2
  const halfArc = (angleStep / 2) - (props.petalGap * Math.PI) / 180
  const r1 = props.innerRadius
  const r2 = props.outerRadius
  const midR = (r1 + r2) / 2
  const tipX = cx.value + r2 * Math.cos(angle)
  const tipY = cy.value + r2 * Math.sin(angle)
  const leftAngle = angle - halfArc
  const rightAngle = angle + halfArc
  const baseLeftX = cx.value + r1 * Math.cos(leftAngle)
  const baseLeftY = cy.value + r1 * Math.sin(leftAngle)
  const baseRightX = cx.value + r1 * Math.cos(rightAngle)
  const baseRightY = cy.value + r1 * Math.sin(rightAngle)
  const ctrlR = midR * 1.05
  const ctrlLeftX = cx.value + ctrlR * Math.cos(leftAngle)
  const ctrlLeftY = cy.value + ctrlR * Math.sin(leftAngle)
  const ctrlRightX = cx.value + ctrlR * Math.cos(rightAngle)
  const ctrlRightY = cy.value + ctrlR * Math.sin(rightAngle)
  return [
    \`M \${baseLeftX} \${baseLeftY}\`,
    \`Q \${ctrlLeftX} \${ctrlLeftY} \${tipX} \${tipY}\`,
    \`Q \${ctrlRightX} \${ctrlRightY} \${baseRightX} \${baseRightY}\`,
    \`A \${r1} \${r1} 0 0 0 \${baseLeftX} \${baseLeftY}\`,
    'Z'
  ].join(' ')
}

const isOpen = ref(false)
const isAnimating = ref(false)
const hoveredIndex = ref<number | null>(null)
const selectedColor = ref(props.modelValue)
const previewColor = ref<string | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const petalRefs = ref<SVGPathElement[]>([])
const centerRef = ref<SVGCircleElement | null>(null)
const displayColor = computed(() => previewColor.value ?? selectedColor.value)

function openBlossom() {
  if (isAnimating.value) return
  isOpen.value = true
  isAnimating.value = true
  const petals = petalRefs.value
  if (!petals.length) return
  gsap.set(petals, { scale: 0, transformOrigin: \`\${cx.value}px \${cy.value}px\`, opacity: 0 })
  gsap.to(petals, {
    scale: 1, opacity: 1, duration: props.bloomDuration, ease: props.bloomEase,
    stagger: { each: props.staggerDelay, from: 'start' },
    onComplete: () => { isAnimating.value = false }
  })
  if (centerRef.value) {
    gsap.to(centerRef.value, { scale: 0.85, duration: 0.15, ease: 'power2.out', transformOrigin: \`\${cx.value}px \${cy.value}px\`, yoyo: true, repeat: 1 })
  }
}

function closeBlossom() {
  if (isAnimating.value) return
  isAnimating.value = true
  const petals = petalRefs.value
  if (!petals.length) return
  gsap.to(petals, {
    scale: 0, opacity: 0, duration: props.closeDuration, ease: props.closeEase,
    stagger: { each: props.staggerDelay * 0.5, from: 'end' },
    onComplete: () => { isOpen.value = false; isAnimating.value = false; hoveredIndex.value = null; previewColor.value = null }
  })
}

function toggleBlossom() {
  if (isOpen.value) closeBlossom()
  else openBlossom()
}

function onPetalHover(index: number) {
  if (!isOpen.value || isAnimating.value) return
  hoveredIndex.value = index
  previewColor.value = palette.value[index]?.hex ?? null
  emit('preview', previewColor.value)
  const petal = petalRefs.value[index]
  if (petal) gsap.to(petal, { scale: 1.12, duration: 0.2, ease: 'power2.out', transformOrigin: \`\${cx.value}px \${cy.value}px\` })
}

function onPetalLeave(index: number) {
  if (!isOpen.value) return
  if (hoveredIndex.value === index) { hoveredIndex.value = null; previewColor.value = null; emit('preview', null) }
  const petal = petalRefs.value[index]
  if (petal) gsap.to(petal, { scale: 1, duration: 0.25, ease: 'elastic.out(1, 0.5)', transformOrigin: \`\${cx.value}px \${cy.value}px\` })
}

function onPetalClick(index: number) {
  if (!isOpen.value) return
  const color = palette.value[index]?.hex
  if (!color) return
  selectedColor.value = color
  emit('update:modelValue', color)
  emit('change', color)
  const petal = petalRefs.value[index]
  if (petal) {
    gsap.timeline()
      .to(petal, { scale: 1.2, duration: 0.12, ease: 'power2.out', transformOrigin: \`\${cx.value}px \${cy.value}px\` })
      .to(petal, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)', transformOrigin: \`\${cx.value}px \${cy.value}px\` })
  }
  setTimeout(() => closeBlossom(), 200)
}

function onDocumentClick(e: MouseEvent) {
  if (!isOpen.value) return
  const target = e.target as Node
  if (svgRef.value && !svgRef.value.contains(target)) closeBlossom()
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
` + '<' + `/script>

<template>
  <div class="blossom-picker inline-flex flex-col items-center gap-4">
    <div class="relative select-none">
      <svg ref="svgRef" :width="svgSize" :height="svgSize" :viewBox="\`0 0 \${svgSize} \${svgSize}\`"
        class="overflow-visible" style="filter: drop-shadow(0 8px 32px rgba(0,0,0,0.35))">
        <circle v-if="isOpen" :cx="cx" :cy="cy" :r="outerRadius + 10" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="18" />
        <path v-for="(color, i) in palette" :key="i" :ref="(el) => { if (el) petalRefs[i] = el as SVGPathElement }"
          :d="petalPath(i)" :fill="color.hex" :style="{
            cursor: isOpen ? 'pointer' : 'default',
            filter: hoveredIndex === i ? \`drop-shadow(0 0 8px \${color.hex}cc) brightness(1.15)\`
              : selectedColor === color.hex && isOpen ? \`drop-shadow(0 0 6px \${color.hex}99) brightness(1.08)\` : 'none',
            opacity: 0, scale: 0
          }" @mouseenter="onPetalHover(i)" @mouseleave="onPetalLeave(i)" @click.stop="onPetalClick(i)" />
        <circle :cx="cx" :cy="cy" :r="innerRadius - 1" fill="rgba(15,15,20,0.92)" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
        <circle ref="centerRef" :cx="cx" :cy="cy" :r="innerRadius - 6" :fill="displayColor"
          class="cursor-pointer" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4))" @click.stop="toggleBlossom" />
        <g :transform="\`translate(\${cx}, \${cy})\`" class="pointer-events-none">
          <line x1="-7" y1="0" x2="7" y2="0" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round"
            :transform="isOpen ? 'rotate(45)' : 'rotate(0)'" style="transition: transform 0.3s ease" />
          <line x1="0" y1="-7" x2="0" y2="7" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round"
            :transform="isOpen ? 'rotate(45)' : 'rotate(0)'" style="transition: transform 0.3s ease" />
        </g>
      </svg>
    </div>
    <div v-if="showPreview" class="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
      <span class="h-3 w-3 rounded-full border border-white/20 transition-colors duration-200" :style="{ background: displayColor }" />
      <span class="font-mono text-[10px] uppercase tracking-widest text-white/60">{{ displayColor }}</span>
    </div>
  </div>
</template>`,
      props: [
        { name: 'modelValue', type: 'string', default: "'#ff6b6b'", description: 'Currently selected color (hex)' },
        { name: 'petalCount', type: 'number', default: '12', description: 'Number of color petals in the blossom' },
        { name: 'petalRadius', type: 'number', default: '36', description: 'Radius of each circular petal' },
        { name: 'orbitRadius', type: 'number', default: '52', description: 'Distance from center to each petal center' },
        { name: 'outerRingRadius', type: 'number', default: '100', description: 'Radius of the outer decorative ring' },
        { name: 'outerRingWidth', type: 'number', default: '14', description: 'Stroke width of the outer ring' },
        { name: 'centerRadius', type: 'number', default: '22', description: 'Radius of the center color swatch button' },
        { name: 'bloomDuration', type: 'number', default: '0.55', description: 'Duration of the bloom open animation in seconds' },
        { name: 'bloomEase', type: 'string', default: "'back.out(1.6)'", description: 'GSAP ease for the bloom open animation' },
        { name: 'closeDuration', type: 'number', default: '0.35', description: 'Duration of the close animation in seconds' },
        { name: 'closeEase', type: 'string', default: "'power2.in'", description: 'GSAP ease for the close animation' },
        { name: 'staggerDelay', type: 'number', default: '0.035', description: 'Stagger delay between each petal animation in seconds' },
        { name: 'showPreview', type: 'boolean', default: 'true', description: 'Show the hex color preview label below the picker' }
      ],
      events: [
        { name: 'update:modelValue', payload: 'string', description: 'Emitted when a petal is clicked with the selected hex color' },
        { name: 'change', payload: 'string', description: 'Emitted when the selected color changes' },
        { name: 'preview', payload: 'string | null', description: 'Emitted on petal hover with the hovered color, or null on leave' }
      ],
      about: {
        description: 'A flower-inspired color picker where circular color petals bloom outward from a center button. Each petal is a circle placed at orbit distance from center, creating a natural overlapping blossom pattern. Hover to preview, click to select.',
        howItWorks: [
          'Generates evenly-spaced hues (0°–360°) at 85% saturation and 65% lightness using HSL→hex conversion',
          'Each petal is an SVG circle whose center is placed at orbitRadius distance from the picker center',
          'Petals overlap naturally since petalRadius > half the arc spacing, creating a true blossom shape',
          'On open, GSAP animates petals from scale 0 to 1 with a staggered back.out ease for a natural bloom effect',
          'On close, petals collapse in reverse stagger order back to center',
          'Hover triggers a scale-up (1.18×) with drop-shadow glow; click triggers a ripple then closes',
          'The center circle displays the current/preview color and acts as the toggle trigger',
          'Outside clicks close the picker via a document-level click listener'
        ],
        builtWith: ['Vue 3', 'GSAP', 'SVG', 'Tailwind CSS']
      },
      controls: [
        { type: 'slider', key: 'petalCount', label: 'Petal Count', min: 6, max: 24, step: 1, default: 12, group: 'Layout' },
        { type: 'slider', key: 'petalRadius', label: 'Petal Radius', min: 20, max: 60, step: 2, default: 36, group: 'Layout' },
        { type: 'slider', key: 'orbitRadius', label: 'Orbit Radius', min: 30, max: 90, step: 2, default: 52, group: 'Layout' },
        { type: 'slider', key: 'outerRingRadius', label: 'Outer Ring Radius', min: 70, max: 150, step: 4, default: 100, group: 'Layout' },
        { type: 'slider', key: 'outerRingWidth', label: 'Outer Ring Width', min: 4, max: 28, step: 2, default: 14, group: 'Layout' },
        { type: 'slider', key: 'bloomDuration', label: 'Bloom Duration (s)', min: 0.2, max: 1.2, step: 0.05, default: 0.55, group: 'Animation' },
        { type: 'slider', key: 'closeDuration', label: 'Close Duration (s)', min: 0.1, max: 0.8, step: 0.05, default: 0.35, group: 'Animation' },
        { type: 'slider', key: 'staggerDelay', label: 'Stagger Delay (s)', min: 0, max: 0.12, step: 0.005, default: 0.035, group: 'Animation' },
        { type: 'select', key: 'bloomEase', label: 'Bloom Ease', group: 'Animation',
          options: [
            { value: 'back.out(1.6)', label: 'Back Out' },
            { value: 'elastic.out(1, 0.5)', label: 'Elastic' },
            { value: 'bounce.out', label: 'Bounce' },
            { value: 'power3.out', label: 'Power3' },
            { value: 'circ.out', label: 'Circ' }
          ],
          default: 'back.out(1.6)'
        },
        { type: 'toggle', key: 'showPreview', label: 'Show Preview', group: 'Display', default: true }
      ]
    }
  }

  const componentList = Object.values(registry)

  const getComponent = (slug: string) => registry[slug]

  const getComponentSlugs = () => Object.keys(registry)

  return {
    registry,
    componentList,
    getComponent,
    getComponentSlugs
  }
}
