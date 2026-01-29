<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

interface Props {
  strength?: number
}

const props = withDefaults(defineProps<Props>(), {
  strength: 0.5
})

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
    duration: 0.4,
    ease: 'power3.out'
  })
  
  if (textRef.value) {
    gsap.to(textRef.value, {
      x: x * props.strength * 0.5,
      y: y * props.strength * 0.5,
      duration: 0.4,
      ease: 'power3.out'
    })
  }
}

const onMouseLeave = () => {
  gsap.to(buttonRef.value, {
    x: 0,
    y: 0,
    duration: 0.7,
    ease: 'elastic.out(1, 0.3)'
  })
  
  if (textRef.value) {
    gsap.to(textRef.value, {
      x: 0,
      y: 0,
      duration: 0.7,
      ease: 'elastic.out(1, 0.3)'
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
  <button
    ref="buttonRef"
    class="group relative overflow-hidden border border-white/20 bg-transparent px-8 py-4 transition-colors hover:border-white/40"
    @mouseenter="onMouseEnter"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <span
      ref="textRef"
      class="relative z-10 block font-mono text-xs uppercase tracking-[0.2em]"
    >
      <slot />
    </span>
    <span class="absolute inset-0 -z-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
    <span
      ref="textRef"
      class="absolute inset-0 z-10 flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em] text-dark-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    >
      <slot />
    </span>
  </button>
</template>
