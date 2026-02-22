<script setup lang="ts">
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
  showFill: true
})

// Size classes mapping
const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-[8px]',
  sm: 'px-3 py-1.5 text-[10px]',
  md: 'px-8 py-4 text-xs',
  lg: 'px-10 py-5 text-sm',
  xl: 'px-12 py-6 text-base'
}

// Corner classes mapping
const cornerClasses: Record<ButtonCorners, string> = {
  sharp: '',
  rounded: 'rounded-lg',
  squarcle: 'rounded-2xl',
  pill: 'rounded-full',
  message: 'rounded-tl-lg rounded-tr-lg rounded-br-lg rounded-bl-none'
}

// Icon sizes based on button size
const iconSizes: Record<ButtonSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 20
}

// Color classes mapping
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
  'group relative overflow-hidden border bg-transparent transition-colors hover:border-white/40',
  sizeClasses[props.size],
  cornerClasses[props.corners],
  colorClasses[props.color].border
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
  gsap.to(buttonRef.value, {
    x: 0,
    y: 0,
    duration: props.returnDuration,
    ease: props.returnEase
  })

  if (textRef.value) {
    gsap.to(textRef.value, {
      x: 0,
      y: 0,
      duration: props.returnDuration,
      ease: props.returnEase
    })
  }
}

const onMouseEnter = () => {
  if (buttonRef.value) {
    bounds = buttonRef.value.getBoundingClientRect()
  }
}

onMounted(() => {
  if (buttonRef.value) {
    bounds = buttonRef.value.getBoundingClientRect()
  }
})
</script>

<template>
  <button ref="buttonRef" :class="buttonClasses" @mouseenter="onMouseEnter" @mousemove="onMouseMove"
    @mouseleave="onMouseLeave">
    <!-- Fill background on hover -->
    <span v-if="showFill" :class="[
      'absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100',
      fillColor
    ]" />

    <!-- Main text content -->
    <span ref="textRef" :class="[
      'relative z-10 flex items-center gap-2 font-mono uppercase tracking-[0.2em]',
      textColor
    ]">
      <component v-if="icon && iconPosition === 'left'" :is="icon" :size="iconSize" />
      <slot />
      <component v-if="icon && iconPosition === 'right'" :is="icon" :size="iconSize" />
    </span>

    <!-- Hover text content (appears on fill) -->
    <span v-if="showFill" :class="[
      'absolute inset-0 z-10 flex items-center justify-center gap-2 font-mono uppercase tracking-[0.2em] opacity-0 transition-opacity duration-300 group-hover:opacity-100',
      hoverTextColor
    ]">
      <component v-if="icon && iconPosition === 'left'" :is="icon" :size="iconSize" />
      <slot />
      <component v-if="icon && iconPosition === 'right'" :is="icon" :size="iconSize" />
    </span>
  </button>
</template>
