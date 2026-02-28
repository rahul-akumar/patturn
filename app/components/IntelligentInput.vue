<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  mode?: 'alphanumeric' | 'letters' | 'numbers' | 'email' | 'custom'
  customPattern?: string
  maxLength?: number
  blockInput?: boolean
  showCount?: boolean
  placeholder?: string
  autoResize?: boolean
  minRows?: number
  maxRows?: number
  disabled?: boolean
}>(), {
  mode: 'alphanumeric',
  customPattern: '[^a-zA-Z0-9]',
  maxLength: undefined,
  blockInput: false,
  showCount: true,
  placeholder: 'Type something...',
  autoResize: true,
  minRows: 1,
  maxRows: 6,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [value: string]
  'invalidChar': [char: string, index: number]
  'maxLengthReached': [currentLength: number]
}>()

// Refs
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const modelValue = defineModel<string>({ default: '' })

// Track previous value for detecting new invalid chars
const previousValue = ref('')

// Mode patterns - these define what characters are INVALID
const modePatterns: Record<string, string> = {
  alphanumeric: '[^a-zA-Z0-9\\s]',
  letters: '[^a-zA-Z\\s]',
  numbers: '[^0-9.]',
  email: '[^a-zA-Z0-9@._\\-+]',
  custom: props.customPattern
}

// Get the active regex pattern
const activePattern = computed(() => {
  if (props.mode === 'custom') {
    try {
      new RegExp(props.customPattern)
      return props.customPattern
    } catch {
      return '[^a-zA-Z0-9]'
    }
  }
  return modePatterns[props.mode] || '[^a-zA-Z0-9]'
})

// Check if a character is invalid
const isInvalidChar = (char: string): boolean => {
  if (!char) return false
  try {
    const regex = new RegExp(activePattern.value)
    return regex.test(char)
  } catch {
    return false
  }
}

// Count invalid characters
const invalidCount = computed(() => {
  let count = 0
  for (const char of modelValue.value) {
    if (isInvalidChar(char)) count++
  }
  return count
})

// Render text with character data
const renderedChars = computed(() => {
  if (!modelValue.value) return []
  return modelValue.value.split('').map((char, index) => ({
    char,
    index,
    isInvalid: isInvalidChar(char)
  }))
})

// Character count display
const currentLength = computed(() => modelValue.value.length)
const remainingChars = computed(() =>
  props.maxLength && props.maxLength > 0 ? props.maxLength - currentLength.value : null
)

// Effective max length (0 means no limit)
const effectiveMaxLength = computed(() =>
  props.maxLength && props.maxLength > 0 ? props.maxLength : null
)

// Count color class based on usage
const countColorClass = computed(() => {
  if (!effectiveMaxLength.value) return 'text-white/40'
  const percentage = (currentLength.value / effectiveMaxLength.value) * 100
  if (percentage >= 95) return 'text-red-400'
  if (percentage >= 80) return 'text-yellow-400'
  return 'text-white/40'
})

// Progress bar percentage
const progressPercentage = computed(() =>
  effectiveMaxLength.value ? (currentLength.value / effectiveMaxLength.value) * 100 : 0
)

// Progress bar color
const progressColorClass = computed(() => {
  if (!effectiveMaxLength.value) return 'bg-white/20'
  const percentage = progressPercentage.value
  if (percentage >= 95) return 'bg-red-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
})

// Handle input event
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  let text = target.value

  // Store previous value for animation detection
  previousValue.value = modelValue.value

  if (props.blockInput) {
    // Filter out invalid characters
    let filteredText = ''
    for (let i = 0; i < text.length; i++) {
      const char = text[i]!
      if (!isInvalidChar(char)) {
        filteredText += char
      } else {
        emit('invalidChar', char, i)
        // Animate rejection
        animateRejection()
      }
    }
    if (filteredText !== text) {
      text = filteredText
      target.value = filteredText
    }
  }

  // Check max length
  if (effectiveMaxLength.value && text.length > effectiveMaxLength.value) {
    text = text.slice(0, effectiveMaxLength.value)
    target.value = text
    emit('maxLengthReached', effectiveMaxLength.value)
  }

  modelValue.value = text
  emit('update:modelValue', text)
  emit('input', text)

  // Adjust height after input
  nextTick(() => adjustHeight())
}

// Handle paste
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''

  let processedText = text

  if (props.blockInput) {
    processedText = ''
    for (const char of text) {
      if (!isInvalidChar(char)) {
        processedText += char
      }
    }
  }

  if (effectiveMaxLength.value) {
    const availableSpace = effectiveMaxLength.value - currentLength.value
    processedText = processedText.slice(0, availableSpace)
  }

  // Insert at cursor position
  const textarea = textareaRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = modelValue.value.slice(0, start)
    const after = modelValue.value.slice(end)

    const newValue = before + processedText + after
    modelValue.value = newValue
    emit('update:modelValue', newValue)
    emit('input', newValue)

    // Set cursor position after pasted text
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + processedText.length
      adjustHeight()
    })
  }
}

// Animate invalid character
const animateInvalidChar = (index: number) => {
  if (!overlayRef.value) return

  const span = overlayRef.value.querySelector(`[data-index="${index}"]`) as HTMLElement
  if (!span) return

  // Kill any existing animations on this element
  gsap.killTweensOf(span)

  // Shake animation
  gsap.timeline()
    .to(span, {
      x: -4,
      duration: 0.04,
      ease: 'power2.inOut'
    })
    .to(span, {
      x: 4,
      duration: 0.04,
      ease: 'power2.inOut',
      repeat: 4,
      yoyo: true
    })
    .to(span, {
      x: 0,
      duration: 0.04,
      ease: 'power2.inOut'
    })

  // Scale pop
  gsap.fromTo(span,
    { scale: 1.3 },
    { scale: 1, duration: 0.3, ease: 'back.out(2)' }
  )
}

// Animate rejection (when blockInput is true)
const animateRejection = () => {
  if (!containerRef.value) return

  gsap.to(containerRef.value, {
    borderColor: 'rgba(239, 68, 68, 0.8)',
    duration: 0.1,
    yoyo: true,
    repeat: 1
  })
}

// Watch for new invalid characters
watch(() => modelValue.value, (newVal, oldVal) => {
  if (props.blockInput) return // No animation when blocking

  // Find newly added invalid characters
  const oldLen = oldVal?.length || 0
  if (newVal.length > oldLen) {
    // Check each new character
    for (let i = oldLen; i < newVal.length; i++) {
      const char = newVal[i]!
      if (isInvalidChar(char)) {
        emit('invalidChar', char, i)
        nextTick(() => animateInvalidChar(i))
      }
    }
  }

  // Always adjust height on value change
  nextTick(() => adjustHeight())
})

// Auto-resize functionality
const adjustHeight = () => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value

  // Get line height from computed style
  const computedStyle = getComputedStyle(textarea)
  const lineHeight = parseFloat(computedStyle.lineHeight) || 24

  // Calculate min and max heights
  const minHeight = (lineHeight * props.minRows)
  const maxHeight = props.autoResize
    ? (lineHeight * props.maxRows)
    : Infinity

  // Temporarily set height to auto to measure scrollHeight
  textarea.style.height = 'auto'

  // Get the actual scroll height needed
  const scrollHeight = textarea.scrollHeight

  // Set new height within bounds
  const newHeight = props.autoResize
    ? Math.min(Math.max(scrollHeight, minHeight), maxHeight)
    : Math.max(scrollHeight, minHeight)

  textarea.style.height = `${newHeight}px`

  // Also adjust overlay height
  if (overlayRef.value) {
    overlayRef.value.style.height = `${newHeight}px`
  }

  // Adjust container to fit content
  if (containerRef.value && props.autoResize) {
    const extraSpace = props.showCount ? 60 : 40 // Extra space for badge
    containerRef.value.style.minHeight = `${newHeight + extraSpace}px`
  }
}

// Sync scroll between textarea and overlay
const handleScroll = () => {
  if (!textareaRef.value || !overlayRef.value) return
  overlayRef.value.scrollTop = textareaRef.value.scrollTop
}

// Exposed methods
const focus = () => textareaRef.value?.focus()
const blur = () => textareaRef.value?.blur()
const clear = () => {
  modelValue.value = ''
  emit('update:modelValue', '')
  emit('input', '')
  nextTick(() => adjustHeight())
}
const selectAll = () => {
  if (textareaRef.value) {
    textareaRef.value.select()
  }
}

// Initial height adjustment
onMounted(() => {
  // Set initial height based on minRows
  nextTick(() => {
    if (textareaRef.value) {
      const lineHeight = parseFloat(getComputedStyle(textareaRef.value).lineHeight) || 24
      const initialHeight = lineHeight * props.minRows
      textareaRef.value.style.height = `${initialHeight}px`
      if (overlayRef.value) {
        overlayRef.value.style.height = `${initialHeight}px`
      }
    }
    adjustHeight()
  })
})

defineExpose({
  focus,
  blur,
  clear,
  selectAll,
  modelValue
})
</script>

<template>
  <div class="intelligent-input-wrapper w-full font-mono">
    <!-- Main container -->
    <div
ref="containerRef" :class="[
      'relative rounded-lg border bg-dark-950 transition-colors duration-200 overflow-visible',
      invalidCount > 0
        ? 'border-red-500/50 focus-within:border-red-500'
        : 'border-white/20 focus-within:border-white/40',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]" :style="autoResize ? {} : { minHeight: `${(minRows * 24) + 40}px` }">
      <!-- Character count badge -->
      <div v-if="showCount" class="absolute -top-3 right-3 flex items-center gap-2">
        <!-- Character count with remaining -->
        <span
v-if="effectiveMaxLength"
          class="flex items-center gap-1 rounded bg-dark-800 px-2 py-0.5 font-mono text-[10px]">
          <span :class="countColorClass">{{ currentLength }}</span>
          <span class="text-white/30">/</span>
          <span class="text-white/30">{{ effectiveMaxLength }}</span>
        </span>
        <!-- Simple count -->
        <span v-else class="rounded bg-dark-800 px-2 py-0.5 font-mono text-[10px] text-white/40">
          {{ currentLength }} chars
        </span>

        <!-- Invalid count badge -->
        <span
v-if="invalidCount > 0"
          class="flex items-center gap-1 rounded bg-red-950 px-2 py-0.5 font-mono text-[10px] text-red-400">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ invalidCount }} invalid
        </span>
      </div>

      <!-- Progress bar -->
      <div
v-if="effectiveMaxLength && showCount"
        class="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
        <div
class="h-full transition-all duration-300" :class="progressColorClass"
          :style="{ width: `${Math.min(progressPercentage, 100)}%` }" />
      </div>

      <!-- Input wrapper -->
      <div class="relative overflow-visible p-4 pb-5">
        <!-- Character overlay for highlighting -->
        <div
ref="overlayRef"
          class="pointer-events-none absolute inset-0 p-4 pb-5 font-mono text-base leading-6 whitespace-pre-wrap break-word overflow-visible"
          aria-hidden="true">
          <span
v-for="item in renderedChars" :key="item.index" :data-index="item.index" :class="[
            'inline-block',
            item.isInvalid ? 'text-red-500' : 'text-white'
          ]">{{ item.char === ' ' ? '\u00A0' : item.char }}</span>
          <span v-if="!modelValue" class="text-white/30">{{ placeholder }}</span>
        </div>

        <!-- Actual textarea -->
        <textarea
ref="textareaRef" :value="modelValue" :placeholder="modelValue ? '' : placeholder"
          :disabled="disabled" :rows="minRows" spellcheck="false" autocomplete="off" autocorrect="off"
          autocapitalize="off" data-gramm="false" data-gramm_editor="false" data-enable-grammarly="false"
          class="relative w-full bg-transparent font-mono text-base leading-6 text-transparent caret-white outline-none resize-none placeholder:text-white/30 scrollbar-hide"
          :class="autoResize ? 'overflow-hidden' : 'overflow-y-auto'" @input="handleInput" @paste="handlePaste"
          @scroll="handleScroll" />

        <!-- Resize handle indicator (when not auto-resize) -->
        <div
v-if="!autoResize"
          class="pointer-events-none absolute bottom-2 right-2 flex items-center justify-center opacity-40">
          <svg class="h-3 w-3 text-white" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11 11v-1h1v1h-1zm-4 0v-1h1v1H7zm-4 0v-1h1v1H3zm8-4v-1h1v1h-1zm-4 0v-1h1v1H7zm4-4v-1h1v1h-1z" />
          </svg>
        </div>

        <!-- Auto-resize indicator -->
        <div
v-if="autoResize && modelValue"
          class="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 opacity-30">
          <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <p v-if="invalidCount > 0 && !blockInput" class="mt-3 flex items-center gap-2 font-mono text-xs text-red-400">
      <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {{ invalidCount }} invalid character{{ invalidCount > 1 ? 's' : '' }} detected
    </p>

    <!-- Remaining characters hint -->
    <p
v-if="effectiveMaxLength && remainingChars !== null && remainingChars <= 20 && remainingChars > 0"
      class="mt-2 font-mono text-xs text-yellow-400">
      {{ remainingChars }} character{{ remainingChars !== 1 ? 's' : '' }} remaining
    </p>
  </div>
</template>

<style scoped>
.intelligent-input-wrapper {
  --line-height: 24px;
}

textarea {
  caret-color: white;
}

textarea::placeholder {
  color: transparent;
}

textarea:focus {
  outline: none;
}

/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.scrollbar-hide::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-hide::-webkit-scrollbar-thumb {
  background: transparent;
}
</style>
