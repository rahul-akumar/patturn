<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, X, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

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

const demoRef = ref<HTMLElement | null>(null)
const copied = ref(false)
const toastIdCounter = ref(0)
const toasts = ref<Toast[]>([])

// Configuration state
const config = ref({
  position: 'top-right' as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center',
  maxVisible: 4,
  defaultDuration: 5000,
  stackSpacing: 12,
  stackScale: 0.95,
  stackOpacity: 0.8,
  swipeToDismiss: true,
  swipeThreshold: 100,
  showProgress: true,
  pauseOnHover: true,
  animation: 'slide' as 'slide' | 'scale' | 'fade'
})

const defaults = {
  position: 'top-right' as const,
  maxVisible: 4,
  defaultDuration: 5000,
  stackSpacing: 12,
  stackScale: 0.95,
  stackOpacity: 0.8,
  swipeToDismiss: true,
  swipeThreshold: 100,
  showProgress: true,
  pauseOnHover: true,
  animation: 'slide' as const
}

const toastTypes = [
  { id: 'success', label: 'Success', icon: CheckCircle, color: 'emerald' },
  { id: 'error', label: 'Error', icon: AlertCircle, color: 'red' },
  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'amber' },
  { id: 'info', label: 'Info', icon: Info, color: 'blue' }
]

const sampleMessages = {
  success: [
    { title: 'Changes saved', message: 'Your preferences have been updated successfully.' },
    { title: 'File uploaded', message: 'document.pdf has been uploaded.' },
    { title: 'Payment complete', message: 'Your order has been confirmed.' }
  ],
  error: [
    { title: 'Upload failed', message: 'The file size exceeds the 10MB limit.' },
    { title: 'Connection lost', message: 'Please check your internet connection.' },
    { title: 'Access denied', message: 'You don\'t have permission to perform this action.' }
  ],
  warning: [
    { title: 'Storage almost full', message: 'You\'ve used 90% of your storage quota.' },
    { title: 'Session expiring', message: 'Your session will expire in 5 minutes.' },
    { title: 'Unsaved changes', message: 'You have unsaved changes that will be lost.' }
  ],
  info: [
    { title: 'New feature', message: 'Dark mode is now available in settings.' },
    { title: 'Scheduled maintenance', message: 'System will be down on Sunday 2-4 AM.' },
    { title: 'Tip', message: 'Press ⌘K to open the command palette.' }
  ]
}

const resetConfig = () => {
  config.value = { ...defaults }
}

// Get visible toasts based on position
const visibleToasts = computed(() => {
  const active = toasts.value.filter(t => !t.dismissed)
  const isTop = config.value.position.includes('top')
  
  // For top positions, newest first (reversed for stacking)
  // For bottom positions, oldest first
  const sorted = isTop 
    ? [...active].reverse().slice(0, config.value.maxVisible)
    : [...active].slice(-config.value.maxVisible)
  
  return sorted
})

// Create a new toast
const createToast = (type: Toast['type']) => {
  const messages = sampleMessages[type]
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
  
  const toast: Toast = {
    id: toastIdCounter.value++,
    type,
    title: randomMessage.title,
    message: randomMessage.message,
    duration: config.value.defaultDuration,
    createdAt: Date.now(),
    progress: 100,
    dismissed: false,
    swipeX: 0,
    paused: false,
    pausedAt: null,
    elapsed: 0
  }
  
  toasts.value.push(toast)
  
  // Start progress countdown
  startProgress(toast.id)
}

// Start progress timer
const startProgress = (toastId: number) => {
  const updateProgress = () => {
    // Find toast in the reactive array to ensure reactivity
    const currentToast = toasts.value.find(t => t.id === toastId)
    if (!currentToast || currentToast.dismissed) return
    
    // Skip updating if paused
    if (currentToast.paused) {
      requestAnimationFrame(updateProgress)
      return
    }
    
    currentToast.elapsed += 16.67 // Approximate frame time
    const newProgress = Math.max(0, 100 - (currentToast.elapsed / currentToast.duration) * 100)
    
    // Update the toast in the array directly for reactivity
    currentToast.progress = newProgress
    
    if (newProgress <= 0) {
      dismissToast(toastId)
    } else {
      requestAnimationFrame(updateProgress)
    }
  }
  
  requestAnimationFrame(updateProgress)
}

// Pause a toast's progress
const pauseToast = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && !toast.dismissed) {
    toast.paused = true
    toast.pausedAt = Date.now()
  }
}

// Resume a toast's progress
const resumeToast = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && !toast.dismissed && toast.paused) {
    toast.paused = false
    toast.pausedAt = null
  }
}

// Dismiss a toast
const dismissToast = (id: number) => {
  const toast = toasts.value.find(t => t.id === id)
  if (toast && !toast.dismissed) {
    toast.dismissed = true
    
    // Remove from array after animation
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.value.splice(index, 1)
      }
    }, 300)
  }
}

// Clear all toasts
const clearAllToasts = () => {
  toasts.value.forEach(t => {
    t.dismissed = true
  })
  setTimeout(() => {
    toasts.value = []
  }, 300)
}

// Swipe handling
const swipeStart = ref<{ id: number; startX: number } | null>(null)

const handleSwipeStart = (e: MouseEvent | TouchEvent, id: number) => {
  if (!config.value.swipeToDismiss) return
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  swipeStart.value = { id, startX: clientX }
}

const handleSwipeMove = (e: MouseEvent | TouchEvent) => {
  if (!swipeStart.value || !config.value.swipeToDismiss) return
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const toast = toasts.value.find(t => t.id === swipeStart.value!.id)
  
  if (toast) {
    const deltaX = clientX - swipeStart.value.startX
    const isRight = config.value.position.includes('right')
    const isLeft = config.value.position.includes('left')
    const isCenter = config.value.position.includes('center')
    
    // Allow swiping away from edge, or both directions for center
    if (isCenter || (isRight && deltaX > 0) || (isLeft && deltaX < 0)) {
      toast.swipeX = deltaX
    }
  }
}

const handleSwipeEnd = () => {
  if (!swipeStart.value) return
  
  const toast = toasts.value.find(t => t.id === swipeStart.value!.id)
  
  if (toast) {
    if (Math.abs(toast.swipeX) > config.value.swipeThreshold) {
      dismissToast(toast.id)
    } else {
      // Snap back - animate via interval for reactivity
      const startX = toast.swipeX
      const startTime = Date.now()
      const duration = 300
      
      const animateBack = () => {
        const currentToast = toasts.value.find(t => t.id === toast.id)
        if (!currentToast) return
        
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3)
        currentToast.swipeX = startX * (1 - eased)
        
        if (progress < 1) {
          requestAnimationFrame(animateBack)
        } else {
          currentToast.swipeX = 0
        }
      }
      requestAnimationFrame(animateBack)
    }
  }
  
  swipeStart.value = null
}

// Get toast icon
const getToastIcon = (type: Toast['type']) => {
  return toastTypes.find(t => t.id === type)?.icon || Info
}

// Get stack transform for each toast
const getStackStyle = (index: number, total: number) => {
  const isTop = config.value.position.includes('top')
  const stackIndex = isTop ? index : total - 1 - index
  
  const translateY = stackIndex * config.value.stackSpacing * (isTop ? 1 : -1)
  const scale = Math.pow(config.value.stackScale, stackIndex)
  const opacity = Math.pow(config.value.stackOpacity, stackIndex)
  
  return {
    transform: `translateY(${translateY}px) scale(${scale})`,
    opacity: stackIndex === 0 ? 1 : opacity,
    zIndex: total - stackIndex,
    top: isTop ? '0' : 'auto',
    bottom: isTop ? 'auto' : '0'
  }
}

// Position classes
const positionClasses = computed(() => {
  const positions: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }
  return positions[config.value.position]
})

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  
  // Add global mouse/touch handlers for swipe
  window.addEventListener('mousemove', handleSwipeMove)
  window.addEventListener('mouseup', handleSwipeEnd)
  window.addEventListener('touchmove', handleSwipeMove)
  window.addEventListener('touchend', handleSwipeEnd)
})

onUnmounted(() => {
  // Clean up event listeners to prevent memory leaks
  window.removeEventListener('mousemove', handleSwipeMove)
  window.removeEventListener('mouseup', handleSwipeEnd)
  window.removeEventListener('touchmove', handleSwipeMove)
  window.removeEventListener('touchend', handleSwipeEnd)
})

const generatedCode = computed(() => {
  return `// Toast Stack - Notification system with stacking
interface Toast {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

// Create toast
const toast = (type, title, message, duration = ${config.value.defaultDuration}) => {
  const newToast = {
    id: toastId++,
    type,
    title,
    message,
    duration,
    progress: 100
  }
  
  toasts.value.push(newToast)
  
  // Auto dismiss
  setTimeout(() => dismiss(newToast.id), duration)
}

// Dismiss toast
const dismiss = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) toasts.value.splice(index, 1)
}

// Usage
toast('success', 'Saved!', 'Your changes have been saved.')
toast('error', 'Error', 'Something went wrong.')

// Stack styling (for each toast at index i)
const getStackStyle = (i, total) => ({
  transform: \`translateY(\${i * ${config.value.stackSpacing}}px) scale(\${Math.pow(${config.value.stackScale}, i)})\`,
  opacity: i === 0 ? 1 : Math.pow(${config.value.stackOpacity}, i),
  zIndex: total - i
})`
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
      <span class="text-lg font-medium tracking-tight">Toast Stack</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section
      ref="demoRef"
      class="relative flex min-h-[55vh] flex-col items-center justify-center border-b border-white/10 overflow-hidden px-6 py-16"
    >
      <!-- Toast Container -->
      <div 
        :class="['fixed z-[100] w-80', positionClasses]"
      >
        <TransitionGroup
          :name="config.animation"
          tag="div"
          class="relative"
        >
          <div
            v-for="(toast, index) in visibleToasts"
            :key="toast.id"
            :style="{
              ...getStackStyle(index, visibleToasts.length),
              transform: `${getStackStyle(index, visibleToasts.length).transform} translateX(${toast.swipeX}px)`
            }"
            :class="[
              'absolute w-full rounded-lg border shadow-2xl backdrop-blur-xl transition-all duration-300',
              toast.dismissed ? 'pointer-events-none' : '',
              toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-950/90' : '',
              toast.type === 'error' ? 'border-red-500/30 bg-red-950/90' : '',
              toast.type === 'warning' ? 'border-amber-500/30 bg-amber-950/90' : '',
              toast.type === 'info' ? 'border-blue-500/30 bg-blue-950/90' : ''
            ]"
            @mousedown="(e) => handleSwipeStart(e, toast.id)"
            @touchstart="(e) => handleSwipeStart(e, toast.id)"
            @mouseenter="config.pauseOnHover && pauseToast(toast.id)"
            @mouseleave="config.pauseOnHover && resumeToast(toast.id)"
          >
            <div class="p-4">
              <div class="flex items-start gap-3">
                <!-- Icon -->
                <div 
                  :class="[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : '',
                    toast.type === 'error' ? 'bg-red-500/20 text-red-400' : '',
                    toast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : '',
                    toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''
                  ]"
                >
                  <component :is="getToastIcon(toast.type)" class="h-4 w-4" />
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm text-white">{{ toast.title }}</p>
                  <p class="mt-1 text-xs text-white/60 line-clamp-2">{{ toast.message }}</p>
                </div>
                
                <!-- Close button -->
                <button
                  class="shrink-0 rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  @click="dismissToast(toast.id)"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <!-- Progress bar -->
            <div 
              v-if="config.showProgress"
              class="h-1 w-full overflow-hidden rounded-b-lg bg-black/20"
            >
              <div
                :class="[
                  'h-full transition-all duration-100',
                  toast.type === 'success' ? 'bg-emerald-500' : '',
                  toast.type === 'error' ? 'bg-red-500' : '',
                  toast.type === 'warning' ? 'bg-amber-500' : '',
                  toast.type === 'info' ? 'bg-blue-500' : ''
                ]"
                :style="{ width: `${toast.progress}%` }"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>

      <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      <p class="mb-8 font-mono text-xs text-white/40">Active toasts: {{ toasts.filter(t => !t.dismissed).length }}</p>
      
      <!-- Toast Trigger Buttons -->
      <div class="flex flex-wrap justify-center gap-3">
        <button
          v-for="type in toastTypes"
          :key="type.id"
          :class="[
            'group flex items-center gap-2 rounded-lg border px-4 py-3 transition-all',
            type.id === 'success' ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10' : '',
            type.id === 'error' ? 'border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10' : '',
            type.id === 'warning' ? 'border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10' : '',
            type.id === 'info' ? 'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10' : ''
          ]"
          @click="createToast(type.id as Toast['type'])"
        >
          <component 
            :is="type.icon" 
            :class="[
              'h-4 w-4',
              type.id === 'success' ? 'text-emerald-400' : '',
              type.id === 'error' ? 'text-red-400' : '',
              type.id === 'warning' ? 'text-amber-400' : '',
              type.id === 'info' ? 'text-blue-400' : ''
            ]"
          />
          <span class="font-mono text-xs text-white/80">{{ type.label }}</span>
        </button>
      </div>
      
      <!-- Clear All -->
      <button
        v-if="toasts.length > 0"
        class="mt-4 flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
        @click="clearAllToasts"
      >
        <Trash2 class="h-3 w-3" />
        Clear all
      </button>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Click the buttons to spawn toasts. Swipe to dismiss, or wait for auto-dismiss.
        Toasts stack with a 3D effect.
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
          <!-- Position & Layout -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Position & Layout</h3>
            
            <!-- Position -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Position</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="pos in ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']"
                  :key="pos"
                  :class="[
                    'border py-2 font-mono text-[10px] transition-colors',
                    config.position === pos 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.position = pos as typeof config.position"
                >
                  {{ pos }}
                </button>
              </div>
            </div>

            <!-- Max Visible -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Max Visible</label>
                <span class="font-mono text-xs text-white/40">{{ config.maxVisible }}</span>
              </div>
              <input
                v-model.number="config.maxVisible"
                type="range"
                min="1"
                max="6"
                step="1"
                class="w-full"
              >
            </div>

            <!-- Duration -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Auto-dismiss Duration</label>
                <span class="font-mono text-xs text-white/40">{{ (config.defaultDuration / 1000).toFixed(1) }}s</span>
              </div>
              <input
                v-model.number="config.defaultDuration"
                type="range"
                min="1000"
                max="10000"
                step="500"
                class="w-full"
              >
            </div>

            <!-- Animation Style -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Animation Style</label>
              <div class="flex gap-2">
                <button
                  v-for="anim in ['slide', 'scale', 'fade']"
                  :key="anim"
                  :class="[
                    'flex-1 border py-2 font-mono text-xs capitalize transition-colors',
                    config.animation === anim 
                      ? 'border-white/40 bg-white/10 text-white' 
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  ]"
                  @click="config.animation = anim as typeof config.animation"
                >
                  {{ anim }}
                </button>
              </div>
            </div>
          </div>

          <!-- Stack & Behavior -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Stack & Behavior</h3>
            
            <!-- Stack Spacing -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Stack Spacing</label>
                <span class="font-mono text-xs text-white/40">{{ config.stackSpacing }}px</span>
              </div>
              <input
                v-model.number="config.stackSpacing"
                type="range"
                min="4"
                max="24"
                step="2"
                class="w-full"
              >
            </div>

            <!-- Stack Scale -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Stack Scale</label>
                <span class="font-mono text-xs text-white/40">{{ (config.stackScale * 100).toFixed(0) }}%</span>
              </div>
              <input
                v-model.number="config.stackScale"
                type="range"
                min="0.85"
                max="1"
                step="0.01"
                class="w-full"
              >
            </div>

            <!-- Swipe to Dismiss -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Swipe to Dismiss</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Drag toasts to dismiss</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.swipeToDismiss ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.swipeToDismiss = !config.swipeToDismiss"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.swipeToDismiss ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Show Progress -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Show Progress Bar</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Visual countdown indicator</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.showProgress ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.showProgress = !config.showProgress"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.showProgress ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Pause on Hover -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Pause on Hover</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Stop countdown while hovering</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.pauseOnHover ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.pauseOnHover = !config.pauseOnHover"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.pauseOnHover ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Swipe Threshold -->
            <div v-if="config.swipeToDismiss" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-mono text-xs text-white/60">Swipe Threshold</label>
                <span class="font-mono text-xs text-white/40">{{ config.swipeThreshold }}px</span>
              </div>
              <input
                v-model.number="config.swipeThreshold"
                type="range"
                min="50"
                max="200"
                step="10"
                class="w-full"
              >
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
          Toast Stack provides non-intrusive notifications that stack elegantly.
          Unlike modal dialogs, toasts don't interrupt the user's workflow while
          still providing important feedback. The stacking effect creates visual
          hierarchy showing notification history.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">New toasts are added to a reactive array with unique IDs and timestamps</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Stack transforms (scale, translateY, opacity) are calculated based on index</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Progress bar uses requestAnimationFrame for smooth countdown animation</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Swipe detection tracks deltaX and dismisses when threshold is exceeded</p>
            </div>
          </div>
        </div>

        <!-- UX Best Practices -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">UX Best Practices</h3>
          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Be concise</span> — Keep messages short and actionable</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Use appropriate types</span> — Success, error, warning, info have distinct meanings</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Allow dismissal</span> — Users should always be able to dismiss toasts</p>
            </div>
            <div class="flex items-start gap-3">
              <div class="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
              <p class="font-mono text-sm text-white/60"><span class="text-white/80">Don't overuse</span> — Reserve toasts for meaningful events</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Form submissions</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Save confirmations</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Error messages</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Background tasks</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Real-time updates</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Undo actions</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue TransitionGroup</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS Transforms</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">requestAnimationFrame</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Touch Events</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Slide animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(100%) !important;
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(100%) !important;
}

/* Scale animation */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8) !important;
}

.scale-leave-to {
  opacity: 0;
  transform: scale(0.8) !important;
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
