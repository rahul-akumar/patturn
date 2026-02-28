<script setup lang="ts">
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

const emit = defineEmits<{
  open: [{ x: number; y: number }]
  close: []
  itemClick: [index: number]
}>()

// Available icons for menu items
const menuIcons = [Home, Search, Heart, Star, Bell, Mail, User, Settings]

// State
const isOpen = ref(false)
const isAnimating = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const itemPositions = ref<Array<{ x: number; y: number; angle: number }>>([])
const triggerElement = ref<HTMLElement | null>(null)
const openTimestamp = ref(0)

// Refs
const menuRef = ref<HTMLElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)
const triggerButtonRef = ref<HTMLElement | null>(null)

// Open menu at position
const openMenu = (x: number, y: number, trigger?: HTMLElement) => {
  if (!containerRef.value || isAnimating.value) return

  // Kill any ongoing animations
  gsap.killTweensOf('.menu-item')

  triggerElement.value = trigger || null

  const containerRect = containerRef.value.getBoundingClientRect()
  const padding = props.radius + props.itemSize / 2 + 10

  // Calculate available arc based on position
  const { startAngle, endAngle } = calculateAvailableArc(x, y, containerRect, padding)

  // Set menu position relative to container
  menuPosition.value = {
    x: x - containerRect.left,
    y: y - containerRect.top
  }

  // Calculate item positions
  itemPositions.value = calculateButtonPositions(startAngle, endAngle, props.radius, props.itemCount)

  isOpen.value = true
  isAnimating.value = true
  openTimestamp.value = Date.now()

  emit('open', { x: menuPosition.value.x, y: menuPosition.value.y })

  // Animate items
  nextTick(() => {
    const items = menuRef.value?.querySelectorAll('.menu-item')
    if (!items) return

    gsap.fromTo(items,
      {
        scale: 0,
        opacity: 0
      },
      {
        scale: 1,
        x: (i: number) => itemPositions.value[i]?.x || 0,
        y: (i: number) => itemPositions.value[i]?.y || 0,
        opacity: 1,
        duration: props.animationDuration,
        ease: props.openEase,
        stagger: props.staggerDelay,
        onComplete: () => {
          isAnimating.value = false
        }
      }
    )
  })
}

// Close menu
const closeMenu = () => {
  if (!isOpen.value || isAnimating.value) return

  const items = menuRef.value?.querySelectorAll('.menu-item')
  if (!items || items.length === 0) {
    isOpen.value = false
    triggerElement.value = null
    return
  }

  isAnimating.value = true

  gsap.to(items, {
    scale: 0,
    opacity: 0,
    duration: props.animationDuration * 0.5,
    ease: props.closeEase,
    stagger: {
      each: props.staggerDelay * 0.5,
      from: 'end'
    },
    onComplete: () => {
      isOpen.value = false
      isAnimating.value = false
      triggerElement.value = null
      openTimestamp.value = 0
      emit('close')
    }
  })
}

// Handle right-click on container
const onContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (isOpen.value) {
    gsap.killTweensOf('.menu-item')
    isOpen.value = false
    isAnimating.value = false
    setTimeout(() => openMenu(e.clientX, e.clientY), 50)
  } else {
    openMenu(e.clientX, e.clientY)
  }
}

// Handle trigger button click
const onButtonClick = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const button = e.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const y = rect.top + rect.height / 2

  if (isOpen.value) {
    closeMenu()
  } else {
    openMenu(x, y, button)
  }
}

// Handle menu item click
const onItemClick = (index: number, e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (isAnimating.value) return

  emit('itemClick', index)

  const items = menuRef.value?.querySelectorAll('.menu-item')
  if (items?.[index]) {
    gsap.to(items[index], {
      scale: 1.3,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      onComplete: closeMenu
    })
  } else {
    closeMenu()
  }
}

// Close on click outside
const onClickOutside = (e: MouseEvent) => {
  if (!isOpen.value || isAnimating.value) return
  if (Date.now() - openTimestamp.value < 100) return

  const target = e.target as Node
  if (menuRef.value?.contains(target)) return
  if (triggerElement.value?.contains(target)) return
  if (triggerButtonRef.value?.contains(target)) return

  closeMenu()
}

// Close on escape
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeyDown)
})

defineExpose({ openMenu, closeMenu, isOpen, isAnimating })
</script>

<template>
  <div ref="containerRef" class="relative h-full w-full" @contextmenu="onContextMenu">
    <!-- Grid background -->
    <div class="pointer-events-none absolute inset-0 opacity-30"
      style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px;" />

    <!-- Slot for custom content inside the container -->
    <slot :open-menu="openMenu" :close-menu="closeMenu" :is-open="isOpen">
      <!-- Default content: instructions + trigger button -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <span class="mb-2 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
        <p class="font-mono text-sm text-white/40">Right-click anywhere in this area</p>
        <span class="font-mono text-[10px] text-white/20">or</span>
        <button ref="triggerButtonRef"
          class="group relative overflow-hidden border border-white/20 bg-transparent px-8 py-3 transition-colors hover:border-white/40"
          @click="onButtonClick">
          <span class="relative z-10 font-mono text-sm uppercase tracking-[0.15em]">
            Open Menu
          </span>
          <span
            class="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
          <span
            class="absolute inset-0 flex items-center justify-center font-mono text-sm uppercase tracking-[0.15em] text-dark-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            Open Menu
          </span>
        </button>
        <p class="absolute bottom-4 max-w-md text-center font-mono text-[10px] leading-relaxed text-white/30">
          Try right-clicking near the edges to see arc adaptation
        </p>
      </div>
    </slot>

    <!-- Radial Menu Overlay -->
    <div v-show="isOpen" ref="menuRef" class="absolute z-50" :style="{
      left: `${menuPosition.x}px`,
      top: `${menuPosition.y}px`,
    }">
      <!-- Center dot -->
      <div class="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />

      <!-- Menu Items -->
      <button v-for="(pos, index) in itemPositions" :key="index"
        class="menu-item absolute flex items-center justify-center rounded-full border border-white/20 bg-dark-800/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-dark-700"
        :style="{
          width: `${itemSize}px`,
          height: `${itemSize}px`,
          left: `${-itemSize / 2}px`,
          top: `${-itemSize / 2}px`,
        }" @click="onItemClick(index, $event)">
        <component :is="menuIcons[index % menuIcons.length]" class="h-5 w-5 text-white/80" />
      </button>
    </div>
  </div>
</template>
