<script setup lang="ts">
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
  width: `${props.ringSize}px`,
  height: `${props.ringSize}px`,
  borderWidth: `${props.ringBorderWidth}px`,
  opacity: isHovering.value ? props.ringOpacity : 0,
  mixBlendMode: (props.ringMixBlend ? 'difference' : 'normal') as 'difference' | 'normal'
}))

const dotStyle = computed(() => ({
  width: `${props.dotSize}px`,
  height: `${props.dotSize}px`,
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

const onMouseEnter = () => {
  isHovering.value = true
}

const onMouseLeave = () => {
  isHovering.value = false
}
</script>

<template>
  <div
ref="containerRef" class="relative h-full w-full" style="cursor: none;" @mousemove="onMouseMove"
    @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div
ref="cursorRef"
      class="pointer-events-none absolute top-0 left-0 rounded-full border border-white transition-opacity duration-300"
      :style="ringStyle" />
    <div
ref="cursorDotRef"
      class="pointer-events-none absolute top-0 left-0 rounded-full bg-white transition-opacity duration-300"
      :style="dotStyle" />
    <slot />
  </div>
</template>
