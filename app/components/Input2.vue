<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import gsap from 'gsap'

type InputMode = 'alphanumeric' | 'letters' | 'numbers' | 'email' | 'slug' | 'command'

const props = withDefaults(defineProps<{
  mode?: InputMode
  placeholder?: string
  maxLength?: number
  minLength?: number
  blockInvalid?: boolean
  smartSpaces?: boolean
  liveSuggestions?: boolean
  showMetrics?: boolean
  animateInvalidChar?: boolean
  animateFieldReject?: boolean
  disabled?: boolean
}>(), {
  mode: 'alphanumeric',
  placeholder: 'Type here...',
  maxLength: 120,
  minLength: 3,
  blockInvalid: false,
  smartSpaces: true,
  liveSuggestions: true,
  showMetrics: true,
  animateInvalidChar: true,
  animateFieldReject: true,
  disabled: false
})

const emit = defineEmits<{
  input: [value: string]
  invalid: [payload: { removed: string, count: number }]
  suggestionApply: [value: string]
  submit: [value: string]
}>()

const modelValue = defineModel<string>({ default: '' })
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const overlayRef = ref<HTMLDivElement | null>(null)
const fieldRef = ref<HTMLDivElement | null>(null)

const modeHelp: Record<InputMode, string> = {
  alphanumeric: 'Letters, numbers, spaces, "_" "." "-"',
  letters: 'Letters and spaces only',
  numbers: 'Numbers only',
  email: 'Email-safe characters',
  slug: 'URL-friendly text',
  command: 'Starts with "/" to trigger commands'
}

const commandPalette = [
  '/search', '/invite', '/publish', '/archive', '/deploy', '/profile', '/settings', '/help'
]

const invalidPattern = computed(() => {
  const patterns: Record<InputMode, RegExp> = {
    alphanumeric: /[^a-zA-Z0-9 _.-]/,
    letters: /[^a-zA-Z ]/,
    numbers: /[^0-9]/,
    email: /[^a-zA-Z0-9@._+-]/,
    slug: /[^a-zA-Z0-9 -]/,
    command: /[^a-zA-Z0-9/_\- ]/
  }
  return patterns[props.mode]
})

const isInvalidChar = (char: string) => invalidPattern.value.test(char)

const renderedChars = computed(() => {
  if (!modelValue.value) return []
  return modelValue.value.split('').map((char, index) => ({
    char,
    index,
    invalid: isInvalidChar(char)
  }))
})

const invalidCount = computed(() => {
  let count = 0
  for (const ch of modelValue.value) if (isInvalidChar(ch)) count++
  return count
})

const isEmailValid = computed(() => {
  if (props.mode !== 'email') return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modelValue.value)
})

const minLengthReached = computed(() => modelValue.value.length >= props.minLength)
const lengthProgress = computed(() => {
  if (!props.maxLength || props.maxLength <= 0) return 0
  return Math.min((modelValue.value.length / props.maxLength) * 100, 100)
})

const qualityScore = computed(() => {
  const lengthWeight = Math.min(modelValue.value.length / Math.max(props.minLength, 1), 1) * 60
  const validBonus = Math.max(0, 40 - (invalidCount.value * 8))
  return Math.min(100, Math.round(lengthWeight + validBonus))
})

const qualityLabel = computed(() => {
  if (qualityScore.value >= 85) return 'Strong'
  if (qualityScore.value >= 60) return 'Good'
  return 'Weak'
})

const intentLabel = computed(() => {
  if (!modelValue.value) return 'Waiting for input'
  if (props.mode === 'email') return isEmailValid.value ? 'Valid email' : 'Incomplete email'
  if (props.mode === 'slug') return slugify(modelValue.value) === modelValue.value ? 'Slug ready' : 'Slug can be normalized'
  if (props.mode === 'command') return modelValue.value.startsWith('/') ? 'Command mode' : 'Type "/" to run commands'
  return minLengthReached.value ? 'Ready to submit' : `Need ${Math.max(props.minLength - modelValue.value.length, 0)} more chars`
})

const suggestions = computed(() => {
  if (!props.liveSuggestions) return []
  const value = modelValue.value.trim()
  if (!value) return []

  if (props.mode === 'email') {
    const domains = ['gmail.com', 'outlook.com', 'icloud.com', 'proton.me']
    if (!value.includes('@')) return domains.slice(0, 3).map(domain => `${value}@${domain}`)
    const [local, domainPart = ''] = value.split('@')
    if (!local || domainPart.includes('.')) return []
    return domains
      .filter(domain => domain.startsWith(domainPart.toLowerCase()))
      .slice(0, 3)
      .map(domain => `${local}@${domain}`)
  }

  if (props.mode === 'slug') {
    const normalized = slugify(value)
    return normalized && normalized !== value ? [normalized] : []
  }

  if (props.mode === 'command' && value.startsWith('/')) {
    return commandPalette.filter(command => command.startsWith(value.toLowerCase())).slice(0, 4)
  }

  return []
})

const normalizeSpaces = (value: string) => {
  if (!props.smartSpaces) return value
  return value.replace(/\t/g, ' ').replace(/ {2,}/g, ' ')
}

const countInvalidChars = (value: string) => {
  let count = 0
  for (const char of value) {
    if (isInvalidChar(char)) count++
  }
  return count
}

const findLastInvalidIndex = (value: string) => {
  for (let i = value.length - 1; i >= 0; i--) {
    if (isInvalidChar(value[i]!)) return i
  }
  return -1
}

const triggerFieldShake = () => {
  if (!props.animateFieldReject || !fieldRef.value) return
  gsap.killTweensOf(fieldRef.value)
  gsap.timeline()
    .to(fieldRef.value, { x: -5, duration: 0.04, ease: 'power2.inOut' })
    .to(fieldRef.value, { x: 5, duration: 0.04, ease: 'power2.inOut', repeat: 2, yoyo: true })
    .to(fieldRef.value, { x: 0, duration: 0.04, ease: 'power2.inOut' })
}

const triggerCharShake = (index: number) => {
  if (!props.animateInvalidChar || !overlayRef.value || index < 0) return
  const el = overlayRef.value.querySelector(`[data-char-index="${index}"]`) as HTMLElement | null
  if (!el) return
  gsap.killTweensOf(el)
  gsap.timeline()
    .to(el, { x: -3, duration: 0.03, ease: 'power2.inOut' })
    .to(el, { x: 3, duration: 0.03, ease: 'power2.inOut', repeat: 2, yoyo: true })
    .to(el, { x: 0, duration: 0.03, ease: 'power2.inOut' })
    .fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0)
}

const sanitize = (value: string) => {
  let next = normalizeSpaces(value)
  const invalidGlobal = new RegExp(invalidPattern.value.source, 'g')
  const hasInvalid = invalidGlobal.test(next)

  if (props.blockInvalid && hasInvalid) {
    next = next.replace(invalidGlobal, '')
  }

  if (props.maxLength > 0 && next.length > props.maxLength) {
    next = next.slice(0, props.maxLength)
  }

  return next
}

const syncScroll = () => {
  if (!textareaRef.value || !overlayRef.value) return
  overlayRef.value.scrollTop = textareaRef.value.scrollTop
  overlayRef.value.scrollLeft = textareaRef.value.scrollLeft
}

const updateValue = (value: string) => {
  modelValue.value = value
  emit('input', value)
}

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const previousValue = modelValue.value
  const previousInvalidCount = countInvalidChars(previousValue)
  const rawValue = target.value
  const invalidGlobal = new RegExp(invalidPattern.value.source, 'g')
  const invalidMatches = rawValue.match(invalidGlobal) || []
  const nextValue = sanitize(rawValue)
  const nextInvalidCount = countInvalidChars(nextValue)
  const cursorIndex = Math.max((target.selectionStart ?? nextValue.length) - 1, 0)

  if (nextValue !== target.value) target.value = nextValue
  updateValue(nextValue)

  if (invalidMatches.length > 0) {
    emit('invalid', { removed: invalidMatches.join(''), count: invalidMatches.length })
  }

  const blockedInvalid = props.blockInvalid && invalidMatches.length > 0
  const newInvalidCountAdded = nextInvalidCount > previousInvalidCount
  const cursorOnInvalid = !props.blockInvalid
    && nextValue.length > 0
    && cursorIndex < nextValue.length
    && isInvalidChar(nextValue[cursorIndex]!)
    && nextValue !== previousValue

  if (blockedInvalid || newInvalidCountAdded || cursorOnInvalid) {
    triggerFieldShake()
  }

  if (!props.blockInvalid && (newInvalidCountAdded || cursorOnInvalid)) {
    const indexToAnimate = cursorOnInvalid ? cursorIndex : findLastInvalidIndex(nextValue)
    nextTick(() => triggerCharShake(indexToAnimate))
  }
}

const onBlur = () => {
  const trimmed = modelValue.value.trim()
  if (trimmed !== modelValue.value) updateValue(trimmed)
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    emit('submit', modelValue.value)
  }
}

const applySuggestion = async (value: string) => {
  updateValue(value)
  emit('suggestionApply', value)
  await nextTick()
  textareaRef.value?.focus()
}

const clear = () => updateValue('')

const slugify = (value: string) => value
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')

defineExpose({
  clear,
  focus: () => textareaRef.value?.focus(),
  modelValue
})
</script>

<template>
  <section class="w-full max-w-2xl">
    <div class="rounded-2xl border border-white/15 bg-dark-950/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/60">
          {{ mode }}
        </span>
        <span
          class="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest"
          :class="qualityScore >= 60 ? 'border-emerald-500/40 text-emerald-400' : 'border-yellow-500/40 text-yellow-400'">
          {{ qualityLabel }} {{ qualityScore }}
        </span>
        <span
          v-if="invalidCount > 0"
          class="rounded-full border border-red-500/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-red-400">
          {{ invalidCount }} invalid
        </span>
        <span class="font-mono text-[10px] uppercase tracking-widest text-white/35">{{ intentLabel }}</span>
      </div>

      <div ref="fieldRef" class="relative">
        <div
          ref="overlayRef"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-all rounded-xl px-4 py-3 font-mono text-sm leading-6">
          <template v-if="modelValue">
            <span
              v-for="item in renderedChars"
              :key="item.index"
              :data-char-index="item.index"
              class="inline-block"
              :class="item.invalid ? 'text-red-400' : 'text-white'">{{ item.char === ' ' ? '\u00A0' : item.char }}</span>
          </template>
          <span v-else class="text-white/30">{{ placeholder }}</span>
        </div>

        <textarea
          ref="textareaRef"
          :value="modelValue"
          :disabled="disabled"
          :maxlength="maxLength > 0 ? maxLength : undefined"
          spellcheck="false"
          autocomplete="off"
          rows="2"
          class="relative z-20 w-full resize-none rounded-xl border border-white/15 bg-transparent px-4 py-3 font-mono text-sm leading-6 text-transparent caret-white outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          @input="onInput"
          @blur="onBlur"
          @scroll="syncScroll"
          @keydown="onKeydown" />

        <button
          v-if="modelValue"
          type="button"
          class="absolute right-2 top-2 z-30 rounded-md border border-white/10 px-2 py-1 font-mono text-[10px] text-white/45 transition hover:border-white/30 hover:text-white"
          @click="clear">
          Clear
        </button>
      </div>

      <div v-if="showMetrics" class="mt-3 space-y-2">
        <div class="flex items-center justify-between font-mono text-[11px]">
          <span class="text-white/45">{{ modeHelp[mode] }}</span>
          <span class="text-white/45">{{ modelValue.length }} / {{ maxLength }}</span>
        </div>
        <div class="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="lengthProgress >= 95 ? 'bg-red-400' : lengthProgress >= 75 ? 'bg-yellow-400' : 'bg-emerald-400'"
            :style="{ width: `${lengthProgress}%` }" />
        </div>
      </div>

      <div v-if="suggestions.length" class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          class="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-white/70 transition hover:border-white/30 hover:text-white"
          @click="applySuggestion(suggestion)">
          {{ suggestion }}
        </button>
      </div>
    </div>
  </section>
</template>
