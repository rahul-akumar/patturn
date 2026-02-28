<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, CheckCircle, ArrowLeft } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  flipDirection?: 'horizontal' | 'vertical'
  flipDuration?: number
  perspective?: number
  frontBg?: 'glass' | 'solid' | 'gradient'
  backBg?: 'success' | 'info' | 'glass'
  autoReset?: boolean
  autoResetDelay?: number
}>(), {
  flipDirection: 'horizontal',
  flipDuration: 0.6,
  perspective: 1000,
  frontBg: 'glass',
  backBg: 'success',
  autoReset: true,
  autoResetDelay: 3
})

const emit = defineEmits<{
  flip: []
  reset: []
}>()

const isFlipped = ref(false)
let autoResetTimer: ReturnType<typeof setTimeout> | null = null

const containerStyle = computed(() => ({
  perspective: `${props.perspective}px`
}))

const cardStyle = computed(() => ({
  transform: isFlipped.value
    ? props.flipDirection === 'horizontal'
      ? 'rotateY(180deg)'
      : 'rotateX(180deg)'
    : 'none',
  transition: `transform ${props.flipDuration}s ease-in-out`
}))

const backFaceStyle = computed(() => ({
  transform: props.flipDirection === 'horizontal'
    ? 'rotateY(180deg)'
    : 'rotateX(180deg)'
}))

const flip = () => {
  isFlipped.value = true
  emit('flip')

  // Clear any existing timer
  if (autoResetTimer) {
    clearTimeout(autoResetTimer)
  }

  // Auto reset after delay if enabled
  if (props.autoReset) {
    autoResetTimer = setTimeout(() => {
      isFlipped.value = false
      emit('reset')
    }, props.autoResetDelay * 1000)
  }
}

const reset = () => {
  if (autoResetTimer) {
    clearTimeout(autoResetTimer)
  }
  isFlipped.value = false
  emit('reset')
}

// Expose methods for parent components
defineExpose({ flip, reset, isFlipped })
</script>

<template>
  <div class="flip-container h-72 w-80" :style="containerStyle">
    <div class="flip-card relative h-full w-full" :style="cardStyle" style="transform-style: preserve-3d;">
      <!-- Front Face -->
      <div
class="flip-face absolute inset-0 rounded-2xl p-6 flex flex-col backface-hidden" :class="{
        'bg-white/10 backdrop-blur-xl border border-white/20': frontBg === 'glass',
        'bg-dark-800 border border-white/10': frontBg === 'solid',
        'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20': frontBg === 'gradient'
      }">
        <slot name="front">
          <div class="flex-1">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Send class="h-5 w-5 text-white/80" />
            </div>
            <h3 class="text-lg font-semibold text-white">Submit Form</h3>
            <p class="mt-2 text-sm text-white/60">
              Click the button below to submit your request and see the flip animation.
            </p>
          </div>

          <button
            class="group relative mt-4 w-full overflow-hidden rounded-lg border border-white/20 bg-white/5 py-3 font-mono text-xs uppercase tracking-widest text-white transition-all hover:border-white/40 hover:bg-white/10"
            @click="flip">
            <span class="relative z-10 flex items-center justify-center gap-2">
              <Send class="h-4 w-4" />
              Submit
            </span>
          </button>
        </slot>
      </div>

      <!-- Back Face -->
      <div
class="flip-face absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden"
        :class="{
          'bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30': backBg === 'success',
          'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-500/30': backBg === 'info',
          'bg-white/10 backdrop-blur-xl border border-white/20': backBg === 'glass'
        }" :style="backFaceStyle">
        <slot name="back">
          <div
class="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            :class="backBg === 'success' ? 'bg-green-500/20' : backBg === 'info' ? 'bg-blue-500/20' : 'bg-white/10'">
            <CheckCircle
class="h-8 w-8"
              :class="backBg === 'success' ? 'text-green-400' : backBg === 'info' ? 'text-blue-400' : 'text-white'" />
          </div>
          <h3
class="text-xl font-semibold"
            :class="backBg === 'success' ? 'text-green-400' : backBg === 'info' ? 'text-blue-400' : 'text-white'">
            Success!
          </h3>
          <p class="mt-2 text-center text-sm text-white/60">
            Your request has been submitted successfully.
          </p>

          <button
v-if="!autoReset"
            class="group mt-6 flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="reset">
            <ArrowLeft class="h-4 w-4" />
            Go Back
          </button>
          <p v-else class="mt-6 font-mono text-[10px] text-white/30">
            Auto-resetting in {{ autoResetDelay }}s
          </p>
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
