<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Home, Settings, User, Search, Star, Bell, Mail, Folder, FileText, Image, Video, Music, Archive } from 'lucide-vue-next'
import {
  useRadialMenu,
  calculateAvailableArc,
  calculateWedgePositions,
  generateWedgePath,
  getAngleFromPoint
} from '~/composables/useRadialMenu'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const demoAreaRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const triggerButtonRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Use the composable
const {
  isOpen,
  isAnimating,
  menuPosition,
  currentArc,
  openTimestamp,
  triggerElement,
  hoveredIndex
} = useRadialMenu()

// Menu items (some with children for submenus)
const menuItems = ref([
  { icon: Home, label: 'Home' },
  { icon: Search, label: 'Search' },
  { 
    icon: Folder, 
    label: 'Files',
    children: [
      { icon: FileText, label: 'Documents' },
      { icon: Image, label: 'Images' },
      { icon: Video, label: 'Videos' },
      { icon: Music, label: 'Audio' },
    ]
  },
  { icon: Star, label: 'Starred' },
  { 
    icon: Settings, 
    label: 'Settings',
    children: [
      { icon: User, label: 'Account' },
      { icon: Bell, label: 'Notifications' },
      { icon: Archive, label: 'Storage' },
    ]
  },
  { icon: Mail, label: 'Messages' },
])

// Submenu state
const activeSubmenuIndex = ref(-1)
const submenuHoveredIndex = ref(-1)

// Center icon
const centerIcon = { icon: Home, label: 'Home' }

// Configuration
const config = ref({
  innerRadius: 45,
  outerRadius: 110,
  itemCount: 6,
  wedgeGap: 3,
  animationDuration: 0.4,
  staggerDelay: 0.04,
  openEase: 'back.out(1.4)',
  closeEase: 'power2.in',
  showLabels: true,
  showCenter: true,
  highlightColor: '#8b5cf6',
})

const defaults = {
  innerRadius: 45,
  outerRadius: 110,
  itemCount: 6,
  wedgeGap: 3,
  animationDuration: 0.4,
  staggerDelay: 0.04,
  openEase: 'back.out(1.4)',
  closeEase: 'power2.in',
  showLabels: true,
  showCenter: true,
  highlightColor: '#8b5cf6',
}

// Computed sizes that scale proportionally
const submenuOuterRadius = computed(() => config.value.outerRadius + 55)
const centerRadius = computed(() => config.value.innerRadius - 6)
const centerIconSize = computed(() => Math.max(16, Math.min(24, config.value.innerRadius * 0.45)))
const wedgeIconSize = computed(() => {
  const wedgeWidth = config.value.outerRadius - config.value.innerRadius
  return Math.max(18, Math.min(28, wedgeWidth * 0.4))
})
const submenuIconSize = computed(() => Math.max(14, Math.min(22, wedgeIconSize.value * 0.8)))

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.4)',
  'back.out(1.7)',
  'elastic.out(1, 0.5)',
  'circ.out',
  'expo.out'
]

const resetConfig = () => {
  config.value = { ...defaults }
}

// Compute wedge positions
const wedgePositions = computed(() => {
  return calculateWedgePositions(
    currentArc.value.startAngle,
    currentArc.value.endAngle,
    config.value.innerRadius,
    config.value.outerRadius,
    config.value.itemCount,
    config.value.wedgeGap
  )
})

// Generate wedge paths
const wedgePaths = computed(() => {
  return wedgePositions.value.map((pos) => 
    generateWedgePath(
      pos.startAngle!,
      pos.endAngle!,
      config.value.innerRadius,
      config.value.outerRadius
    )
  )
})

// Calculate icon positions (center of each wedge)
const iconPositions = computed(() => {
  const midRadius = (config.value.innerRadius + config.value.outerRadius) / 2
  return wedgePositions.value.map((pos) => {
    const radian = (pos.angle - 90) * (Math.PI / 180)
    return {
      x: Math.cos(radian) * midRadius,
      y: Math.sin(radian) * midRadius
    }
  })
})

// Check if item has children
const hasChildren = (index: number) => {
  const item = menuItems.value[index]
  return item && 'children' in item && item.children && item.children.length > 0
}

// Get children for an item
const getChildren = (index: number) => {
  const item = menuItems.value[index]
  if (item && 'children' in item && item.children) {
    return item.children
  }
  return []
}

// Calculate submenu wedge positions
const submenuPositions = computed(() => {
  if (activeSubmenuIndex.value < 0) return []
  
  const parentPos = wedgePositions.value[activeSubmenuIndex.value]
  if (!parentPos) return []
  
  const children = getChildren(activeSubmenuIndex.value)
  if (children.length === 0) return []
  
  // Submenu spans the same angular range as parent wedge
  const parentStart = parentPos.startAngle!
  const parentEnd = parentPos.endAngle!
  
  return calculateWedgePositions(
    parentStart,
    parentEnd,
    config.value.outerRadius + 5, // Small gap from parent
    submenuOuterRadius.value,
    children.length,
    2
  )
})

// Generate submenu wedge paths
const submenuPaths = computed(() => {
  return submenuPositions.value.map((pos) =>
    generateWedgePath(
      pos.startAngle!,
      pos.endAngle!,
      config.value.outerRadius + 5,
      submenuOuterRadius.value
    )
  )
})

// Calculate submenu icon positions
const submenuIconPositions = computed(() => {
  const midRadius = (config.value.outerRadius + 5 + submenuOuterRadius.value) / 2
  return submenuPositions.value.map((pos) => {
    const radian = (pos.angle - 90) * (Math.PI / 180)
    return {
      x: Math.cos(radian) * midRadius,
      y: Math.sin(radian) * midRadius
    }
  })
})

// SVG viewBox size (larger to accommodate submenus)
const svgSize = computed(() => {
  const size = (submenuOuterRadius.value + 60) * 2
  return { size, half: size / 2 }
})

// Generate submenu indicator arc path (small arc on outer edge)
const getSubmenuIndicatorPath = (startAngle: number, endAngle: number) => {
  // Create a small arc in the middle portion of the wedge's outer edge
  const midAngle = (startAngle + endAngle) / 2
  const arcSpan = 12 // degrees for the indicator arc
  const indicatorStart = midAngle - arcSpan / 2
  const indicatorEnd = midAngle + arcSpan / 2
  
  const radius = config.value.outerRadius - 8 // Slightly inside the outer edge
  
  const toRad = (angle: number) => ((angle - 90) * Math.PI) / 180
  
  const x1 = radius * Math.cos(toRad(indicatorStart))
  const y1 = radius * Math.sin(toRad(indicatorStart))
  const x2 = radius * Math.cos(toRad(indicatorEnd))
  const y2 = radius * Math.sin(toRad(indicatorEnd))
  
  return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`
}

// Open menu at position
const openMenu = (x: number, y: number, trigger?: HTMLElement) => {
  if (!demoAreaRef.value || isAnimating.value) return

  gsap.killTweensOf('.wedge-path, .wedge-icon, .wedge-label, .center-item')

  const containerRect = demoAreaRef.value.getBoundingClientRect()
  const padding = config.value.outerRadius + 40

  // Calculate position and arc
  menuPosition.value = {
    x: x - containerRect.left,
    y: y - containerRect.top
  }
  
  currentArc.value = calculateAvailableArc(x, y, containerRect, padding)
  triggerElement.value = trigger || null
  openTimestamp.value = Date.now()
  isOpen.value = true
  isAnimating.value = true
  hoveredIndex.value = -1

  nextTick(() => {
    // Animate the entire menu container
    const menuContainer = menuRef.value
    const wedges = menuRef.value?.querySelectorAll('.wedge-path')
    const icons = menuRef.value?.querySelectorAll('.wedge-icon')
    const labels = menuRef.value?.querySelectorAll('.wedge-label')
    const centerEl = menuRef.value?.querySelector('.center-item')

    // Hide icons and labels initially
    if (icons) gsap.set(icons, { opacity: 0 })
    if (labels) gsap.set(labels, { opacity: 0 })
    if (centerEl) gsap.set(centerEl, { opacity: 0 })

    // Animate container scale
    if (menuContainer) {
      gsap.fromTo(menuContainer, 
        { scale: 0.7, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: config.value.animationDuration * 0.4,
          ease: 'back.out(1.4)'
        }
      )
    }

    // Wedges fade in with the container
    if (wedges) {
      gsap.fromTo(wedges,
        { opacity: 0 },
        {
          opacity: 1,
          duration: config.value.animationDuration * 0.3,
          ease: 'power2.out',
          stagger: config.value.staggerDelay * 0.5
        }
      )
    }

    // Center appears early
    if (centerEl && config.value.showCenter) {
      gsap.to(centerEl, {
        opacity: 1,
        duration: config.value.animationDuration * 0.3,
        ease: 'power2.out',
        delay: config.value.animationDuration * 0.15
      })
    }

    // Icons appear after wedges are visible
    if (icons) {
      gsap.to(icons, {
        opacity: 1,
        duration: config.value.animationDuration * 0.3,
        ease: 'power2.out',
        stagger: config.value.staggerDelay,
        delay: config.value.animationDuration * 0.25
      })
    }

    // Labels appear last
    if (labels && config.value.showLabels) {
      gsap.to(labels, {
        opacity: 1,
        duration: config.value.animationDuration * 0.3,
        ease: 'power2.out',
        stagger: config.value.staggerDelay,
        delay: config.value.animationDuration * 0.35,
        onComplete: () => {
          isAnimating.value = false
        }
      })
    } else {
      setTimeout(() => {
        isAnimating.value = false
      }, config.value.animationDuration * 600)
    }
  })
}

// Close menu
const closeMenu = () => {
  if (!isOpen.value || isAnimating.value) return

  isAnimating.value = true

  const menuContainer = menuRef.value

  // Simple scale down and fade out the entire menu
  if (menuContainer) {
    gsap.to(menuContainer, {
      scale: 0.8,
      opacity: 0,
      duration: config.value.animationDuration * 0.35,
      ease: 'power2.in',
      onComplete: () => {
        isOpen.value = false
        isAnimating.value = false
        triggerElement.value = null
        openTimestamp.value = 0
        hoveredIndex.value = -1
        activeSubmenuIndex.value = -1
        submenuHoveredIndex.value = -1
        // Reset scale for next open
        gsap.set(menuContainer, { scale: 1, opacity: 1 })
      }
    })
  } else {
    isOpen.value = false
    isAnimating.value = false
  }
}

// Helper to check if angle is in range
const isInAngleRange = (angle: number, start: number, end: number) => {
  // Normalize
  while (start >= 360) start -= 360
  while (end >= 360) end -= 360
  
  if (start > end) {
    return angle >= start || angle <= end
  }
  return angle >= start && angle <= end
}

// Handle mouse move for hover detection
const onMouseMove = (e: MouseEvent) => {
  if (!isOpen.value || !menuRef.value) return

  const rect = menuRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  const dx = e.clientX - centerX
  const dy = e.clientY - centerY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = getAngleFromPoint(e.clientX, e.clientY, centerX, centerY)

  // Check if within submenu area (when submenu is open)
  if (activeSubmenuIndex.value >= 0 && distance > config.value.outerRadius && distance <= submenuOuterRadius.value + 20) {
    // Find which submenu wedge
    for (let i = 0; i < submenuPositions.value.length; i++) {
      const pos = submenuPositions.value[i]
      if (isInAngleRange(angle, pos.startAngle!, pos.endAngle!)) {
        submenuHoveredIndex.value = i
        // Keep parent highlighted
        hoveredIndex.value = activeSubmenuIndex.value
        return
      }
    }
    submenuHoveredIndex.value = -1
    return
  }

  // Check if within main wedge area
  if (distance >= config.value.innerRadius && distance <= config.value.outerRadius + 20) {
    submenuHoveredIndex.value = -1
    
    // Find which wedge
    for (let i = 0; i < wedgePositions.value.length; i++) {
      const pos = wedgePositions.value[i]
      if (isInAngleRange(angle, pos.startAngle!, pos.endAngle!)) {
        hoveredIndex.value = i
        
        // Show submenu if this item has children
        if (hasChildren(i) && activeSubmenuIndex.value !== i) {
          showSubmenu(i)
        } else if (!hasChildren(i) && activeSubmenuIndex.value >= 0) {
          hideSubmenu()
        }
        return
      }
    }
  } else if (distance < config.value.innerRadius) {
    hoveredIndex.value = -1
    submenuHoveredIndex.value = -1
    if (activeSubmenuIndex.value >= 0) {
      hideSubmenu()
    }
  } else if (distance > submenuOuterRadius.value + 30) {
    // Outside all menus
    submenuHoveredIndex.value = -1
    if (activeSubmenuIndex.value >= 0) {
      hideSubmenu()
    }
  }
}

// Show submenu for an item
const showSubmenu = (index: number) => {
  if (activeSubmenuIndex.value === index) return
  
  activeSubmenuIndex.value = index
  
  nextTick(() => {
    const subWedges = menuRef.value?.querySelectorAll('.submenu-wedge')
    const subIcons = menuRef.value?.querySelectorAll('.submenu-icon')
    const subLabels = menuRef.value?.querySelectorAll('.submenu-label')
    
    if (subWedges) {
      gsap.fromTo(subWedges,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
          stagger: 0.02
        }
      )
    }
    
    if (subIcons) {
      gsap.fromTo(subIcons,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out',
          stagger: 0.02,
          delay: 0.08
        }
      )
    }
    
    if (subLabels && config.value.showLabels) {
      gsap.fromTo(subLabels,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          stagger: 0.02,
          delay: 0.1
        }
      )
    }
  })
}

// Hide submenu
const hideSubmenu = () => {
  if (activeSubmenuIndex.value < 0) return
  
  const subWedges = menuRef.value?.querySelectorAll('.submenu-wedge')
  const subIcons = menuRef.value?.querySelectorAll('.submenu-icon')
  const subLabels = menuRef.value?.querySelectorAll('.submenu-label')
  
  gsap.to([subWedges, subIcons, subLabels], {
    opacity: 0,
    duration: 0.12,
    ease: 'power2.in',
    onComplete: () => {
      activeSubmenuIndex.value = -1
      submenuHoveredIndex.value = -1
    }
  })
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

// Handle wedge click
const onWedgeClick = (index: number, e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (isAnimating.value) return

  // If has children, show submenu instead of closing
  if (hasChildren(index)) {
    showSubmenu(index)
    return
  }

  // Flash effect
  const wedge = menuRef.value?.querySelectorAll('.wedge-path')[index]
  if (wedge) {
    gsap.to(wedge, {
      fill: config.value.highlightColor,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: closeMenu
    })
  }
}

// Handle submenu wedge click
const onSubmenuClick = (index: number, e: MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()

  if (isAnimating.value) return

  const wedge = menuRef.value?.querySelectorAll('.submenu-wedge')[index]
  if (wedge) {
    gsap.to(wedge, {
      fill: config.value.highlightColor,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: closeMenu
    })
  }
}

// Click outside handler
const onClickOutside = (e: MouseEvent) => {
  if (!isOpen.value || isAnimating.value) return
  if (Date.now() - openTimestamp.value < 100) return

  const target = e.target as Node
  if (menuRef.value?.contains(target)) return
  if (triggerElement.value?.contains(target)) return
  if (triggerButtonRef.value?.contains(target)) return

  closeMenu()
}

// Escape key handler
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
import { ref, computed } from 'vue'
import gsap from 'gsap'

const isOpen = ref(false)
const menuPosition = ref({ x: 0, y: 0 })
const hoveredIndex = ref(-1)

const config = {
  innerRadius: ${config.value.innerRadius},
  outerRadius: ${config.value.outerRadius},
  itemCount: ${config.value.itemCount},
  wedgeGap: ${config.value.wedgeGap},
}

// Generate SVG path for wedge
function generateWedgePath(startAngle, endAngle) {
  const toRad = (a) => ((a - 90) * Math.PI) / 180
  const inner = config.innerRadius
  const outer = config.outerRadius
  
  const x1 = inner * Math.cos(toRad(startAngle))
  const y1 = inner * Math.sin(toRad(startAngle))
  const x2 = outer * Math.cos(toRad(startAngle))
  const y2 = outer * Math.sin(toRad(startAngle))
  const x3 = outer * Math.cos(toRad(endAngle))
  const y3 = outer * Math.sin(toRad(endAngle))
  const x4 = inner * Math.cos(toRad(endAngle))
  const y4 = inner * Math.sin(toRad(endAngle))
  
  const large = endAngle - startAngle > 180 ? 1 : 0
  return \`M \${x1} \${y1} L \${x2} \${y2} A \${outer} \${outer} 0 \${large} 1 \${x3} \${y3} L \${x4} \${y4} A \${inner} \${inner} 0 \${large} 0 \${x1} \${y1} Z\`
}
${scriptClose}`
})

const copyCode = async () => {
  await navigator.clipboard.writeText(generatedCode.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Pie Menu</span>
      <span class="font-mono text-[10px] uppercase tracking-widest text-green-500">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef" class="flex min-h-[55vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-6 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>

      <!-- Demo Area -->
      <div
        ref="demoAreaRef"
        class="relative h-[450px] w-full max-w-3xl rounded-lg border border-white/10 bg-dark-950"
        @mousemove="onMouseMove"
      >
        <!-- Grid background -->
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 24px 24px;" />

        <!-- Instructions -->
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            ref="triggerButtonRef"
            class="group relative overflow-hidden border border-white/20 bg-transparent px-8 py-3 transition-colors hover:border-white/40"
            @click="onButtonClick"
          >
            <span class="relative z-10 font-mono text-sm uppercase tracking-[0.15em]">Open Pie Menu</span>
            <span class="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
            <span class="absolute inset-0 flex items-center justify-center font-mono text-sm uppercase tracking-[0.15em] text-dark-900 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Open Pie Menu
            </span>
          </button>
        </div>

        <!-- Pie Menu -->
        <div
          v-show="isOpen"
          ref="menuRef"
          class="absolute z-50 pointer-events-auto"
          :style="{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }"
        >
          <svg
            :width="svgSize.size"
            :height="svgSize.size"
            :viewBox="`${-svgSize.half} ${-svgSize.half} ${svgSize.size} ${svgSize.size}`"
            class="overflow-visible"
          >
            <!-- Glow filter definition -->
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <!-- Wedges -->
            <g>
              <path
                v-for="(path, index) in wedgePaths"
                :key="`wedge-${index}`"
                :d="path"
                class="wedge-path cursor-pointer transition-all duration-200"
                :fill="hoveredIndex === index ? config.highlightColor : 'rgba(30, 30, 35, 0.95)'"
                :stroke="hoveredIndex === index ? config.highlightColor : 'rgba(255, 255, 255, 0.15)'"
                :stroke-width="hoveredIndex === index ? 1.5 : 1"
                :filter="hoveredIndex === index ? 'url(#glow)' : 'none'"
                :style="hoveredIndex === index ? { filter: `drop-shadow(0 0 12px ${config.highlightColor})` } : {}"
                @click="onWedgeClick(index, $event)"
              />
            </g>

            <!-- Icons in wedges -->
            <g>
              <foreignObject
                v-for="(pos, index) in iconPositions"
                :key="`icon-${index}`"
                :x="pos.x - wedgeIconSize / 2"
                :y="pos.y - wedgeIconSize / 2"
                :width="wedgeIconSize"
                :height="wedgeIconSize"
                class="wedge-icon pointer-events-none"
              >
                <component
                  :is="menuItems[index % menuItems.length].icon"
                  :class="hoveredIndex === index ? 'text-white' : 'text-white/70'"
                  :style="{ width: `${wedgeIconSize}px`, height: `${wedgeIconSize}px` }"
                />
              </foreignObject>
            </g>

            <!-- Submenu indicator arc for items with children -->
            <g>
              <path
                v-for="(pos, index) in wedgePositions"
                v-show="hasChildren(index)"
                :key="`indicator-${index}`"
                :d="getSubmenuIndicatorPath(pos.startAngle!, pos.endAngle!)"
                fill="none"
                :stroke="hoveredIndex === index ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)'"
                stroke-width="2"
                stroke-linecap="round"
                class="pointer-events-none transition-all duration-200"
              />
            </g>

            <!-- Labels outside wedges -->
            <g v-if="config.showLabels">
              <text
                v-for="(pos, index) in wedgePositions"
                :key="`label-${index}`"
                :x="pos.x"
                :y="pos.y"
                class="wedge-label pointer-events-none select-none fill-white/60 text-[11px] font-medium"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {{ menuItems[index % menuItems.length].label }}
              </text>
            </g>

            <!-- Submenu wedges -->
            <g v-if="activeSubmenuIndex >= 0">
              <!-- Submenu wedge paths -->
              <path
                v-for="(path, index) in submenuPaths"
                :key="`submenu-wedge-${index}`"
                :d="path"
                class="submenu-wedge cursor-pointer transition-all duration-200"
                :fill="submenuHoveredIndex === index ? config.highlightColor : 'rgba(40, 40, 48, 0.95)'"
                :stroke="submenuHoveredIndex === index ? config.highlightColor : 'rgba(255, 255, 255, 0.2)'"
                :stroke-width="submenuHoveredIndex === index ? 1.5 : 1"
                :style="submenuHoveredIndex === index ? { filter: `drop-shadow(0 0 10px ${config.highlightColor})` } : {}"
                @click="onSubmenuClick(index, $event)"
              />

              <!-- Submenu icons -->
              <foreignObject
                v-for="(pos, index) in submenuIconPositions"
                :key="`submenu-icon-${index}`"
                :x="pos.x - submenuIconSize / 2"
                :y="pos.y - submenuIconSize / 2"
                :width="submenuIconSize"
                :height="submenuIconSize"
                class="submenu-icon pointer-events-none"
              >
                <component
                  :is="getChildren(activeSubmenuIndex)[index]?.icon"
                  :class="submenuHoveredIndex === index ? 'text-white' : 'text-white/70'"
                  :style="{ width: `${submenuIconSize}px`, height: `${submenuIconSize}px` }"
                />
              </foreignObject>

              <!-- Submenu labels -->
              <g v-if="config.showLabels">
                <text
                  v-for="(pos, index) in submenuPositions"
                  :key="`submenu-label-${index}`"
                  :x="pos.x * 1.15"
                  :y="pos.y * 1.15"
                  class="submenu-label pointer-events-none select-none fill-white/50 text-[10px] font-medium"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ getChildren(activeSubmenuIndex)[index]?.label }}
                </text>
              </g>
            </g>

            <!-- Center hub (decorative) -->
            <g v-if="config.showCenter" class="center-item">
              <circle
                cx="0"
                cy="0"
                :r="centerRadius"
                fill="rgba(15, 15, 18, 0.98)"
                stroke="rgba(255, 255, 255, 0.08)"
                stroke-width="1"
              />

              <!-- Center icon -->
              <foreignObject
                :x="-centerIconSize / 2"
                :y="-centerIconSize / 2"
                :width="centerIconSize"
                :height="centerIconSize"
                class="pointer-events-none"
              >
                <component 
                  :is="centerIcon.icon" 
                  class="text-white/40"
                  :style="{ width: `${centerIconSize}px`, height: `${centerIconSize}px` }"
                />
              </foreignObject>
            </g>
          </svg>
        </div>
      </div>

      <p class="mt-8 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Pie menu with wedge-based selection and nested submenus.<br>
        Hover over "Files" or "Settings" to see the submenu expand.
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
          <!-- Geometry Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Geometry</h3>

            <!-- Inner Radius -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Inner Radius</label>
                <span class="font-mono text-xs text-white/40">{{ config.innerRadius }}px</span>
              </div>
              <input v-model.number="config.innerRadius" type="range" min="30" max="70" step="5" class="w-full">
            </div>

            <!-- Outer Radius -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Outer Radius</label>
                <span class="font-mono text-xs text-white/40">{{ config.outerRadius }}px</span>
              </div>
              <input v-model.number="config.outerRadius" type="range" min="80" max="150" step="5" class="w-full">
            </div>

            <!-- Item Count -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Item Count</label>
                <span class="font-mono text-xs text-white/40">{{ config.itemCount }}</span>
              </div>
              <input v-model.number="config.itemCount" type="range" min="3" max="8" step="1" class="w-full">
            </div>

            <!-- Wedge Gap -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Wedge Gap</label>
                <span class="font-mono text-xs text-white/40">{{ config.wedgeGap }}°</span>
              </div>
              <input v-model.number="config.wedgeGap" type="range" min="0" max="10" step="1" class="w-full">
            </div>
          </div>

          <!-- Animation & Display Controls -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Animation & Display</h3>

            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Duration</label>
                <span class="font-mono text-xs text-white/40">{{ config.animationDuration }}s</span>
              </div>
              <input v-model.number="config.animationDuration" type="range" min="0.2" max="0.8" step="0.05" class="w-full">
            </div>

            <!-- Easing -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Open Easing</label>
              <select v-model="config.openEase" class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none">
                <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">{{ ease }}</option>
              </select>
            </div>

            <!-- Show Labels -->
            <div class="flex items-center justify-between pt-2">
              <label class="font-mono text-xs text-white/60">Show Labels</label>
              <button
                :class="['h-5 w-10 rounded-full transition-colors', config.showLabels ? 'bg-white' : 'bg-white/20']"
                @click="config.showLabels = !config.showLabels"
              >
                <div :class="['h-4 w-4 rounded-full bg-dark-900 transition-transform', config.showLabels ? 'translate-x-5' : 'translate-x-0.5']" />
              </button>
            </div>

            <!-- Show Center -->
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">Show Center Hub</label>
              <button
                :class="['h-5 w-10 rounded-full transition-colors', config.showCenter ? 'bg-white' : 'bg-white/20']"
                @click="config.showCenter = !config.showCenter"
              >
                <div :class="['h-4 w-4 rounded-full bg-dark-900 transition-transform', config.showCenter ? 'translate-x-5' : 'translate-x-0.5']" />
              </button>
            </div>

            <!-- Highlight Color -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Highlight Color</label>
              <div class="flex gap-2">
                <button
                  v-for="color in ['#8b5cf6', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#ec4899']"
                  :key="color"
                  class="h-8 w-8 rounded border-2 transition-all"
                  :class="config.highlightColor === color ? 'border-white scale-110' : 'border-transparent'"
                  :style="{ backgroundColor: color }"
                  @click="config.highlightColor = color"
                />
              </div>
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
          <button class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white" @click="copyCode">
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
          A pie menu (or radial menu with wedges) divides the circular area into segments.
          Each wedge acts as a selectable region, with hover detection based on the angle
          from the center. This variant includes nested submenus that expand as an outer
          ring when hovering over items with children, plus a center hub for quick actions.
        </p>

        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Calculate wedge angles by dividing available arc by item count</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Generate SVG paths using arc commands for each wedge</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Detect hover by calculating mouse angle with atan2()</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Position icons at the midpoint of each wedge</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">5</span>
              <p class="font-mono text-sm text-white/60">Animate wedges with scale transform from center</p>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Comparison</h3>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="rounded border border-white/10 p-4">
              <h4 class="font-mono text-sm font-medium">Radial Menu</h4>
              <ul class="mt-2 space-y-1 font-mono text-xs text-white/50">
                <li>• Circular buttons</li>
                <li>• Click on button to select</li>
                <li>• Labels inside buttons</li>
                <li>• Staggered appear animation</li>
              </ul>
            </div>
            <div class="rounded border border-white/10 bg-white/5 p-4">
              <h4 class="font-mono text-sm font-medium">Pie Menu</h4>
              <ul class="mt-2 space-y-1 font-mono text-xs text-white/50">
                <li>• Wedge segments</li>
                <li>• Angle-based hover detection</li>
                <li>• Nested submenus on hover</li>
                <li>• Center hub for quick actions</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">SVG Paths</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">atan2()</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Lucide Icons</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
