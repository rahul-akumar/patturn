<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Home, Settings, User, Search, Heart, Star, Bell, Mail } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const demoAreaRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const triggerButtonRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Menu state
const isOpen = ref(false)
const isAnimating = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const itemPositions = ref<Array<{ x: number; y: number; angle: number }>>([])
const triggerElement = ref<HTMLElement | null>(null)
const openTimestamp = ref(0)

// Available icons for menu items
const menuIcons = [Home, Search, Heart, Star, Bell, Mail, User, Settings]

// Configuration
const config = ref({
  radius: 80,
  itemCount: 6,
  itemSize: 44,
  animationDuration: 0.4,
  staggerDelay: 0.03,
  openEase: 'back.out(1.7)',
  closeEase: 'power2.in',
  startAngle: 0, // degrees
  endAngle: 360, // degrees - will be auto-adjusted for edges
})

const defaults = {
  radius: 80,
  itemCount: 6,
  itemSize: 44,
  animationDuration: 0.4,
  staggerDelay: 0.03,
  openEase: 'back.out(1.7)',
  closeEase: 'power2.in',
  startAngle: 0,
  endAngle: 360,
}

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'back.out(2.5)',
  'elastic.out(1, 0.3)',
  'elastic.out(1, 0.5)',
  'bounce.out',
  'circ.out',
  'expo.out'
]

const resetConfig = () => {
  config.value = { ...defaults }
}

// Calculate available arc based on position and viewport
// Angles: 0° = top, 90° = right, 180° = bottom, 270° = left
const calculateAvailableArc = (x: number, y: number, containerRect: DOMRect) => {
  const padding = config.value.radius + config.value.itemSize / 2 + 10
  
  const spaceTop = y - containerRect.top
  const spaceBottom = containerRect.bottom - y
  const spaceLeft = x - containerRect.left
  const spaceRight = containerRect.right - x
  
  // Determine which directions are available
  const hasTop = spaceTop >= padding
  const hasBottom = spaceBottom >= padding
  const hasLeft = spaceLeft >= padding
  const hasRight = spaceRight >= padding
  
  // If all directions available, full circle
  if (hasTop && hasBottom && hasLeft && hasRight) {
    return { startAngle: 0, endAngle: 360 }
  }
  
  // Build available arc based on which directions are open
  // We'll find the center of available space and spread from there
  
  let centerAngle = 0
  let spread = 180 // default half circle
  
  // Corner cases (90° arc)
  if (!hasTop && !hasLeft) {
    // Top-left corner: open towards bottom-right
    centerAngle = 135 // between right (90) and bottom (180)
    spread = 90
  } else if (!hasTop && !hasRight) {
    // Top-right corner: open towards bottom-left
    centerAngle = 225 // between bottom (180) and left (270)
    spread = 90
  } else if (!hasBottom && !hasLeft) {
    // Bottom-left corner: open towards top-right
    centerAngle = 45 // between top (0) and right (90)
    spread = 90
  } else if (!hasBottom && !hasRight) {
    // Bottom-right corner: open towards top-left
    centerAngle = 315 // between left (270) and top (360/0)
    spread = 90
  }
  // Edge cases (180° arc)
  else if (!hasTop) {
    // Near top edge: open downward
    centerAngle = 180
    spread = 180
  } else if (!hasBottom) {
    // Near bottom edge: open upward
    centerAngle = 0
    spread = 180
  } else if (!hasLeft) {
    // Near left edge: open rightward
    centerAngle = 90
    spread = 180
  } else if (!hasRight) {
    // Near right edge: open leftward
    centerAngle = 270
    spread = 180
  }
  
  let startAngle = centerAngle - spread / 2
  let endAngle = centerAngle + spread / 2
  
  // Normalize angles to 0-360 range
  if (startAngle < 0) startAngle += 360
  if (endAngle > 360) endAngle -= 360
  
  // Handle wrap-around (when start > end, we need continuous arc)
  if (startAngle > endAngle) {
    // For simplicity, adjust to make it continuous
    // e.g., 315 to 45 becomes 315 to 405 (treated as 315 to 45 going through 0)
    endAngle += 360
  }
  
  return { startAngle, endAngle }
}

// Calculate item positions in a circle/arc
// Angles: 0° = top, 90° = right, 180° = bottom, 270° = left
const calculateItemPositions = (centerX: number, centerY: number, startAngle: number, endAngle: number) => {
  const positions: Array<{ x: number; y: number; angle: number }> = []
  const count = config.value.itemCount
  const radius = config.value.radius
  
  // Calculate the arc span (handles wrap-around where endAngle > 360)
  const arcSpan = endAngle - startAngle
  const isFullCircle = arcSpan >= 360
  
  // For full circle, distribute evenly without overlapping start/end
  // For partial arc, distribute including both endpoints
  const angleStep = isFullCircle 
    ? 360 / count 
    : arcSpan / Math.max(count - 1, 1)
  
  for (let i = 0; i < count; i++) {
    let angle = startAngle + (i * angleStep)
    
    // Normalize angle to 0-360 for display purposes
    while (angle >= 360) angle -= 360
    while (angle < 0) angle += 360
    
    // Convert to radians: 0° = top means we need -90° offset in standard math
    // Standard math: 0° = right, 90° = up
    // Our system: 0° = top, 90° = right
    // So we subtract 90° to convert
    const radian = (angle - 90) * (Math.PI / 180)
    
    positions.push({
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
      angle
    })
  }
  
  return positions
}

// Open menu at position
const openMenu = (x: number, y: number, trigger?: HTMLElement) => {
  if (!demoAreaRef.value || isAnimating.value) return
  
  // Kill any ongoing animations
  gsap.killTweensOf('.menu-item')
  
  triggerElement.value = trigger || null
  
  const containerRect = demoAreaRef.value.getBoundingClientRect()
  
  // Calculate available arc based on position
  const { startAngle, endAngle } = calculateAvailableArc(x, y, containerRect)
  
  // Set menu position relative to demo area
  menuPosition.value = {
    x: x - containerRect.left,
    y: y - containerRect.top
  }
  
  // Calculate item positions
  itemPositions.value = calculateItemPositions(0, 0, startAngle, endAngle)
  
  isOpen.value = true
  isAnimating.value = true
  openTimestamp.value = Date.now()
  
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
        duration: config.value.animationDuration,
        ease: config.value.openEase,
        stagger: config.value.staggerDelay,
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
  
  // Scale down in place (don't animate x/y back to center)
  gsap.to(items, {
    scale: 0,
    opacity: 0,
    duration: config.value.animationDuration * 0.5,
    ease: config.value.closeEase,
    stagger: {
      each: config.value.staggerDelay * 0.5,
      from: 'end' // Close in reverse order
    },
    onComplete: () => {
      isOpen.value = false
      isAnimating.value = false
      triggerElement.value = null
      openTimestamp.value = 0
    }
  })
}

// Handle right-click
const onContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  
  if (isOpen.value) {
    // Close and reopen at new position
    gsap.killTweensOf('.menu-item')
    isOpen.value = false
    isAnimating.value = false
    
    // Small delay to reset state then open
    setTimeout(() => openMenu(e.clientX, e.clientY), 50)
  } else {
    openMenu(e.clientX, e.clientY)
  }
}

// Handle button click
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
  
  // Visual feedback - quick pulse
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
  
  // Ignore clicks that happen within 100ms of opening (same event)
  if (Date.now() - openTimestamp.value < 100) return
  
  const target = e.target as Node
  
  // Don't close if clicking on the menu itself
  if (menuRef.value?.contains(target)) return
  
  // Don't close if clicking on the trigger button
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
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onKeyDown)
})

const generatedCode = computed(() => {
  const scriptClose = '<' + '/script>'
  return `<script setup>
import { ref, nextTick } from 'vue'
import gsap from 'gsap'

const isOpen = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const itemPositions = ref([])
const menuRef = ref(null)

const config = {
  radius: ${config.value.radius},
  itemCount: ${config.value.itemCount},
  itemSize: ${config.value.itemSize},
  animationDuration: ${config.value.animationDuration},
  staggerDelay: ${config.value.staggerDelay},
}

const calculateItemPositions = (startAngle, endAngle) => {
  const positions = []
  const isFullCircle = endAngle - startAngle >= 360
  const angleStep = isFullCircle 
    ? 360 / config.itemCount 
    : (endAngle - startAngle) / (config.itemCount - 1)
  
  for (let i = 0; i < config.itemCount; i++) {
    const angle = startAngle + (i * angleStep)
    const radian = (angle - 90) * (Math.PI / 180)
    positions.push({
      x: Math.cos(radian) * config.radius,
      y: Math.sin(radian) * config.radius,
    })
  }
  return positions
}

const openMenu = (x, y, containerRect) => {
  menuPosition.value = { 
    x: x - containerRect.left, 
    y: y - containerRect.top 
  }
  itemPositions.value = calculateItemPositions(0, 360)
  isOpen.value = true
  
  nextTick(() => {
    gsap.fromTo('.menu-item', 
      { scale: 0, x: 0, y: 0, opacity: 0 },
      {
        scale: 1,
        x: (i) => itemPositions.value[i]?.x || 0,
        y: (i) => itemPositions.value[i]?.y || 0,
        opacity: 1,
        duration: ${config.value.animationDuration},
        ease: '${config.value.openEase}',
        stagger: ${config.value.staggerDelay}
      }
    )
  })
}

const closeMenu = () => {
  gsap.to('.menu-item', {
    scale: 0, x: 0, y: 0, opacity: 0,
    duration: ${(config.value.animationDuration * 0.6).toFixed(2)},
    ease: '${config.value.closeEase}',
    onComplete: () => isOpen.value = false
  })
}
${scriptClose}`
})

const copyCode = async () => {
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Radial Menu</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef" class="flex min-h-[55vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-6 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <!-- Demo Area -->
      <div 
        ref="demoAreaRef"
        class="relative h-[400px] w-full max-w-3xl rounded-lg border border-white/10 bg-dark-950"
        @contextmenu="onContextMenu"
      >
        <!-- Grid background -->
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px;" />
        
        <!-- Instructions -->
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-6">
          <p class="font-mono text-sm text-white/40">Right-click anywhere in this area</p>
          <span class="font-mono text-[10px] text-white/20">or</span>
          <button
            ref="triggerButtonRef"
            class="group relative overflow-hidden border border-white/20 bg-transparent px-8 py-3 transition-colors hover:border-white/40"
            @click="onButtonClick"
          >
            <span class="relative z-10 font-mono text-sm uppercase tracking-[0.15em]">
              Open Menu
            </span>
            <span class="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
            <span class="absolute inset-0 flex items-center justify-center font-mono text-sm uppercase tracking-[0.15em] text-dark-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Open Menu
            </span>
          </button>
        </div>
        
        <!-- Radial Menu -->
        <div
          v-show="isOpen"
          ref="menuRef"
          class="absolute z-50"
          :style="{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }"
        >
          <!-- Center dot -->
          <div class="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30" />
          
          <!-- Menu Items -->
          <button
            v-for="(pos, index) in itemPositions"
            :key="index"
            class="menu-item absolute flex items-center justify-center rounded-full border border-white/20 bg-dark-800/90 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-dark-700"
            :style="{
              width: `${config.itemSize}px`,
              height: `${config.itemSize}px`,
              left: `${-config.itemSize / 2}px`,
              top: `${-config.itemSize / 2}px`,
            }"
            @click="onItemClick(index, $event)"
          >
            <component 
              :is="menuIcons[index % menuIcons.length]" 
              class="h-5 w-5 text-white/80"
            />
          </button>
        </div>
      </div>
      
      <p class="mt-8 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Try right-clicking near the edges to see the arc adaptation.<br>
        The menu adjusts its shape to stay within bounds.
      </p>
    </section>

    <!-- Controls Section -->
    <section class="border-b border-white/10 px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-6 flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Controls</span>
          <button
            class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="resetConfig"
          >
            <RotateCcw class="h-3 w-3" />
            Reset
          </button>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <!-- Layout Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Layout</h3>
            
            <!-- Radius -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Radius</label>
                <span class="font-mono text-xs text-white/40">{{ config.radius }}px</span>
              </div>
              <input
                v-model.number="config.radius"
                type="range"
                min="50"
                max="150"
                step="5"
                class="w-full"
              >
            </div>

            <!-- Item Count -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Item Count</label>
                <span class="font-mono text-xs text-white/40">{{ config.itemCount }}</span>
              </div>
              <input
                v-model.number="config.itemCount"
                type="range"
                min="3"
                max="8"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Item Size -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Item Size</label>
                <span class="font-mono text-xs text-white/40">{{ config.itemSize }}px</span>
              </div>
              <input
                v-model.number="config.itemSize"
                type="range"
                min="32"
                max="64"
                step="4"
                class="w-full"
              >
            </div>
          </div>

          <!-- Animation Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation</h3>
            
            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.animationDuration }}s</span>
              </div>
              <input
                v-model.number="config.animationDuration"
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                class="w-full"
              >
            </div>

            <!-- Stagger -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Stagger Delay</label>
                <span class="font-mono text-xs text-white/40">{{ config.staggerDelay }}s</span>
              </div>
              <input
                v-model.number="config.staggerDelay"
                type="range"
                min="0"
                max="0.1"
                step="0.01"
                class="w-full"
              >
            </div>

            <!-- Open Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Open Easing</label>
              <select
                v-model="config.openEase"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>

            <!-- Close Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Close Easing</label>
              <select
                v-model="config.closeEase"
                class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none"
              >
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                  {{ ease }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Code Section -->
    <section class="px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Code</span>
          <button
            class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="copyCode"
          >
            <component :is="copied ? Check : Copy" class="h-3 w-3" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre class="mt-4 overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80"><code>{{ generatedCode }}</code></pre>
      </div>
    </section>

    <!-- Info Section -->
    <section class="border-t border-white/10 px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">About</h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
          A radial menu (or pie menu) arranges options in a circle around the cursor. 
          This implementation features adaptive arc positioning — when opened near screen edges, 
          the menu automatically transforms into a semi-circle or quarter arc to keep all items visible.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">On trigger (right-click or button), capture the cursor position</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Calculate available space in each direction from the position</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Determine safe angular range, excluding arcs that would overflow</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Distribute menu items evenly within the safe arc</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">5</span>
              <p class="font-mono text-sm text-white/60">Animate items from center outward using GSAP stagger</p>
            </div>
          </div>
        </div>

        <!-- Edge Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Edge Adaptation</h3>
          <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div class="flex flex-col items-center gap-2 rounded border border-white/10 p-4">
              <div class="flex h-12 w-12 items-center justify-center">
                <div class="h-8 w-8 rounded-full border-2 border-white/40" />
              </div>
              <span class="font-mono text-[10px] text-white/40">Center</span>
              <span class="font-mono text-[10px] text-white/20">360°</span>
            </div>
            <div class="flex flex-col items-center gap-2 rounded border border-white/10 p-4">
              <div class="flex h-12 w-12 items-center justify-center">
                <div class="h-8 w-8 rounded-r-full border-2 border-l-0 border-white/40" />
              </div>
              <span class="font-mono text-[10px] text-white/40">Left Edge</span>
              <span class="font-mono text-[10px] text-white/20">180°</span>
            </div>
            <div class="flex flex-col items-center gap-2 rounded border border-white/10 p-4">
              <div class="flex h-12 w-12 items-center justify-center">
                <div class="h-8 w-8 rounded-b-full border-2 border-t-0 border-white/40" />
              </div>
              <span class="font-mono text-[10px] text-white/40">Top Edge</span>
              <span class="font-mono text-[10px] text-white/20">180°</span>
            </div>
            <div class="flex flex-col items-center gap-2 rounded border border-white/10 p-4">
              <div class="flex h-12 w-12 items-center justify-center">
                <div class="h-4 w-4 rounded-br-full border-2 border-l-0 border-t-0 border-white/40" />
              </div>
              <span class="font-mono text-[10px] text-white/40">Corner</span>
              <span class="font-mono text-[10px] text-white/20">90°</span>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Trigonometry</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Lucide Icons</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
