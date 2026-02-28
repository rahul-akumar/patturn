<script setup lang="ts">
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

const toastIdCounter = ref(0)
const toasts = ref<Toast[]>([])

const toastTypeConfig = [
  { id: 'success' as const, label: 'Success', icon: CheckCircle, color: 'emerald' },
  { id: 'error' as const, label: 'Error', icon: AlertCircle, color: 'red' },
  { id: 'warning' as const, label: 'Warning', icon: AlertTriangle, color: 'amber' },
  { id: 'info' as const, label: 'Info', icon: Info, color: 'blue' }
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

// Get visible toasts based on position
const visibleToasts = computed(() => {
  const active = toasts.value.filter(t => !t.dismissed)
  const isTop = props.position.includes('top')

  const sorted = isTop
    ? [...active].reverse().slice(0, props.maxVisible)
    : [...active].slice(-props.maxVisible)

  return sorted
})

// Active toast count
const activeCount = computed(() => toasts.value.filter(t => !t.dismissed).length)

// Create a new toast
const createToast = (type: Toast['type']) => {
  const messages = sampleMessages[type]
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]!

  const toast: Toast = {
    id: toastIdCounter.value++,
    type,
    title: randomMessage.title,
    message: randomMessage.message,
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

// Start progress timer
const startProgress = (toastId: number) => {
  const updateProgress = () => {
    const currentToast = toasts.value.find(t => t.id === toastId)
    if (!currentToast || currentToast.dismissed) return

    if (currentToast.paused) {
      requestAnimationFrame(updateProgress)
      return
    }

    currentToast.elapsed += 16.67
    const newProgress = Math.max(0, 100 - (currentToast.elapsed / currentToast.duration) * 100)
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
    emit('dismiss', id)

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
  emit('clearAll')
  setTimeout(() => {
    toasts.value = []
  }, 300)
}

// Swipe handling
const swipeStart = ref<{ id: number; startX: number } | null>(null)

const handleSwipeStart = (e: MouseEvent | TouchEvent, id: number) => {
  if (!props.swipeToDismiss) return
  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  swipeStart.value = { id, startX: clientX }
}

const handleSwipeMove = (e: MouseEvent | TouchEvent) => {
  if (!swipeStart.value || !props.swipeToDismiss) return

  const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX
  const toast = toasts.value.find(t => t.id === swipeStart.value!.id)

  if (toast) {
    const deltaX = clientX - swipeStart.value.startX
    const isRight = props.position.includes('right')
    const isLeft = props.position.includes('left')
    const isCenter = props.position.includes('center')

    if (isCenter || (isRight && deltaX > 0) || (isLeft && deltaX < 0)) {
      toast.swipeX = deltaX
    }
  }
}

const handleSwipeEnd = () => {
  if (!swipeStart.value) return

  const toast = toasts.value.find(t => t.id === swipeStart.value!.id)

  if (toast) {
    if (Math.abs(toast.swipeX) > props.swipeThreshold) {
      dismissToast(toast.id)
    } else {
      const startX = toast.swipeX
      const startTime = Date.now()
      const duration = 300

      const animateBack = () => {
        const currentToast = toasts.value.find(t => t.id === toast.id)
        if (!currentToast) return

        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
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
  return toastTypeConfig.find(t => t.id === type)?.icon || Info
}

// Get stack transform for each toast
const getStackStyle = (index: number, total: number) => {
  const isTop = props.position.includes('top')
  const stackIndex = isTop ? index : total - 1 - index

  const translateY = stackIndex * props.stackSpacing * (isTop ? 1 : -1)
  const scale = Math.pow(props.stackScale, stackIndex)
  const opacity = Math.pow(props.stackOpacity, stackIndex)

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
  return positions[props.position]
})

onMounted(() => {
  window.addEventListener('mousemove', handleSwipeMove)
  window.addEventListener('mouseup', handleSwipeEnd)
  window.addEventListener('touchmove', handleSwipeMove)
  window.addEventListener('touchend', handleSwipeEnd)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleSwipeMove)
  window.removeEventListener('mouseup', handleSwipeEnd)
  window.removeEventListener('touchmove', handleSwipeMove)
  window.removeEventListener('touchend', handleSwipeEnd)
})

// Expose methods for parent components
defineExpose({
  createToast,
  dismissToast,
  clearAllToasts,
  activeCount,
  toastTypeConfig
})
</script>

<template>
  <!-- Toast Container -->
  <div :class="['fixed z-[100] w-80', positionClasses]">
    <TransitionGroup :name="animation" tag="div" class="relative">
      <div v-for="(toast, index) in visibleToasts" :key="toast.id" :style="{
        ...getStackStyle(index, visibleToasts.length),
        transform: `${getStackStyle(index, visibleToasts.length).transform} translateX(${toast.swipeX}px)`
      }" :class="[
        'absolute w-full rounded-lg border shadow-2xl backdrop-blur-xl transition-all duration-300',
        toast.dismissed ? 'pointer-events-none' : '',
        toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-950/90' : '',
        toast.type === 'error' ? 'border-red-500/30 bg-red-950/90' : '',
        toast.type === 'warning' ? 'border-amber-500/30 bg-amber-950/90' : '',
        toast.type === 'info' ? 'border-blue-500/30 bg-blue-950/90' : ''
      ]" @mousedown="(e) => handleSwipeStart(e, toast.id)" @touchstart="(e) => handleSwipeStart(e, toast.id)"
        @mouseenter="pauseOnHover && pauseToast(toast.id)" @mouseleave="pauseOnHover && resumeToast(toast.id)">
        <div class="p-4">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : '',
              toast.type === 'error' ? 'bg-red-500/20 text-red-400' : '',
              toast.type === 'warning' ? 'bg-amber-500/20 text-amber-400' : '',
              toast.type === 'info' ? 'bg-blue-500/20 text-blue-400' : ''
            ]">
              <component :is="getToastIcon(toast.type)" class="h-4 w-4" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-white">{{ toast.title }}</p>
              <p class="mt-1 text-xs text-white/60 line-clamp-2">{{ toast.message }}</p>
            </div>

            <!-- Close button -->
            <button class="shrink-0 rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              @click="dismissToast(toast.id)">
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Progress bar -->
        <div v-if="showProgress" class="h-1 w-full overflow-hidden rounded-b-lg bg-black/20">
          <div :class="[
            'h-full transition-all duration-100',
            toast.type === 'success' ? 'bg-emerald-500' : '',
            toast.type === 'error' ? 'bg-red-500' : '',
            toast.type === 'warning' ? 'bg-amber-500' : '',
            toast.type === 'info' ? 'bg-blue-500' : ''
          ]" :style="{ width: `${toast.progress}%` }" />
        </div>
      </div>
    </TransitionGroup>
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
</style>
