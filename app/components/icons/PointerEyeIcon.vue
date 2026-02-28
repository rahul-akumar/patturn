<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  size?: number | string
  color?: string
  strokeWidth?: number
  trackingRadius?: number
  pupilRadius?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  trackingRadius: 1.3,
  pupilRadius: 2.2
})

const svgRef = ref<SVGSVGElement | null>(null)
const pupilOffsetX = ref(0)
const pupilOffsetY = ref(0)

const pupilX = computed(() => 12 + pupilOffsetX.value)
const pupilY = computed(() => 12 + pupilOffsetY.value)

const resetPupil = () => {
  pupilOffsetX.value = 0
  pupilOffsetY.value = 0
}

const updatePupil = (event: MouseEvent) => {
  if (!svgRef.value) return

  const rect = svgRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = event.clientX - centerX
  const dy = event.clientY - centerY
  const distance = Math.hypot(dx, dy)

  if (distance === 0) {
    resetPupil()
    return
  }

  const intensity = Math.min(1, distance / 120)
  const maxOffset = props.trackingRadius * intensity
  pupilOffsetX.value = (dx / distance) * maxOffset
  pupilOffsetY.value = (dy / distance) * maxOffset
}

onMounted(() => {
  window.addEventListener('mousemove', updatePupil, { passive: true })
  window.addEventListener('mouseleave', resetPupil)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', updatePupil)
  window.removeEventListener('mouseleave', resetPupil)
})
</script>

<template>
  <svg
    ref="svgRef"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle :cx="pupilX" :cy="pupilY" :r="pupilRadius" :fill="color" stroke="none" />
  </svg>
</template>
