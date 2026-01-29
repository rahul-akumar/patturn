<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const cursorRef = ref<HTMLElement | null>(null)
const cursorDotRef = ref<HTMLElement | null>(null)

const onMouseMove = (e: MouseEvent) => {
  if (cursorRef.value) {
    gsap.to(cursorRef.value, {
      x: e.clientX - 20,
      y: e.clientY - 20,
      duration: 0.5,
      ease: 'power3.out'
    })
  }
  if (cursorDotRef.value) {
    gsap.to(cursorDotRef.value, {
      x: e.clientX - 4,
      y: e.clientY - 4,
      duration: 0.1
    })
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div>
    <div
      ref="cursorRef"
      class="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-10 w-10 rounded-full border border-white/30 mix-blend-difference md:block"
    />
    <div
      ref="cursorDotRef"
      class="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-2 w-2 rounded-full bg-white md:block"
    />
  </div>
</template>
