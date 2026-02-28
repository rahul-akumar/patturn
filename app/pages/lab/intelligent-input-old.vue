<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Check, RotateCcw, AlertCircle } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const copied = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLDivElement | null>(null)

// Configuration state
const config = ref({
  mode: 'alphanumeric' as 'alphanumeric' | 'letters' | 'numbers' | 'email' | 'custom',
  customPattern: '[^a-zA-Z0-9]',
  blockInput: false,
  animateInvalid: true,
  showCount: true,
  placeholder: 'Type something...'
})

const defaults = {
  mode: 'alphanumeric' as const,
  customPattern: '[^a-zA-Z0-9]',
  blockInput: false,
  animateInvalid: true,
  showCount: true,
  placeholder: 'Type something...'
}

const modeOptions = [
  { id: 'alphanumeric', label: 'Alphanumeric', description: 'Letters and numbers only', pattern: '[^a-zA-Z0-9\\s]' },
  { id: 'letters', label: 'Letters Only', description: 'A-Z, a-z, spaces', pattern: '[^a-zA-Z\\s]' },
  { id: 'numbers', label: 'Numbers Only', description: '0-9 and decimals', pattern: '[^0-9.]' },
  { id: 'email', label: 'Email Safe', description: 'Valid email characters', pattern: '[^a-zA-Z0-9@._\\-+]' },
  { id: 'custom', label: 'Custom', description: 'Define your own regex', pattern: '' }
]

const resetConfig = () => {
  config.value = { ...defaults }
  inputValue.value = ''
}

// Get the active pattern based on mode
const activePattern = computed(() => {
  if (config.value.mode === 'custom') {
    try {
      new RegExp(config.value.customPattern)
      return config.value.customPattern
    } catch {
      return '[^a-zA-Z0-9]'
    }
  }
  return modeOptions.find(m => m.id === config.value.mode)?.pattern || '[^a-zA-Z0-9]'
})

// Check if a character is invalid
const isInvalidChar = (char: string): boolean => {
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
  for (const char of inputValue.value) {
    if (isInvalidChar(char)) count++
  }
  return count
})

// Render text with highlighted invalid characters
const renderedText = computed(() => {
  if (!inputValue.value) return []
  
  return inputValue.value.split('').map((char, index) => ({
    char,
    index,
    isInvalid: isInvalidChar(char)
  }))
})

// Handle input
const handleInput = (e: Event) => {
  const target = e.target as HTMLDivElement
  const text = target.innerText || ''
  
  if (config.value.blockInput) {
    // Filter out invalid characters
    let filteredText = ''
    for (const char of text) {
      if (!isInvalidChar(char)) {
        filteredText += char
      }
    }
    if (filteredText !== text) {
      inputValue.value = filteredText
      // Update the contenteditable
      if (inputRef.value) {
        inputRef.value.innerText = filteredText
        // Move cursor to end
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(inputRef.value)
        range.collapse(false)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      return
    }
  }
  
  inputValue.value = text
}

// Handle paste
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  
  if (config.value.blockInput) {
    let filteredText = ''
    for (const char of text) {
      if (!isInvalidChar(char)) {
        filteredText += char
      }
    }
    document.execCommand('insertText', false, filteredText)
  } else {
    document.execCommand('insertText', false, text)
  }
}

// Sync rendered overlay with actual input position
const syncScroll = () => {
  // The overlay follows the input scroll
}

// Clear input
const clearInput = () => {
  inputValue.value = ''
  if (inputRef.value) {
    inputRef.value.innerText = ''
    inputRef.value.focus()
  }
}

const generatedCode = computed(() => {
  const scriptClose = '<' + '/script>'
  const styleClose = '<' + '/style>'
  
  return `<template>
  <div class="intelligent-input-wrapper">
    <!-- Rendered overlay with colored characters -->
    <div class="input-overlay" aria-hidden="true">
      <span
        v-for="(item, i) in renderedText"
        :key="i"
        :class="{ 'invalid-char': item.isInvalid }"
      >{{ item.char }}</span>
      <span v-if="!inputValue" class="placeholder">{{ placeholder }}</span>
    </div>
    
    <!-- Invisible editable input -->
    <div
      ref="inputRef"
      contenteditable="true"
      class="input-editable"
      @input="handleInput"
    />
  </div>
</template>

<style>
.intelligent-input-wrapper {
  position: relative;
  font-family: monospace;
}

.input-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-all;
}

.input-editable {
  color: transparent;
  caret-color: white;
  outline: none;
}

.invalid-char {
  color: #ef4444;
  ${config.value.animateInvalid ? 'animation: shake 0.3s ease;' : ''}
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
${styleClose}

<script setup>
const pattern = /${activePattern.value}/

const isInvalidChar = (char) => pattern.test(char)

const renderedText = computed(() => {
  return inputValue.value.split('').map((char, i) => ({
    char,
    index: i,
    isInvalid: isInvalidChar(char)
  }))
})
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
      <span class="text-lg font-medium tracking-tight">Intelligent Input</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section class="relative flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <!-- Input Container -->
      <div class="w-full max-w-lg">
        <div 
          :class="[
            'relative rounded-lg border bg-dark-950 transition-colors',
            invalidCount > 0 
              ? 'border-red-500/50 focus-within:border-red-500' 
              : 'border-white/20 focus-within:border-white/40'
          ]"
        >
          <!-- Character count badge -->
          <div v-if="config.showCount" class="absolute -top-3 right-3 flex items-center gap-2">
            <span class="rounded bg-dark-800 px-2 py-0.5 font-mono text-[10px] text-white/40">
              {{ inputValue.length }} chars
            </span>
            <span 
              v-if="invalidCount > 0"
              class="flex items-center gap-1 rounded bg-red-950 px-2 py-0.5 font-mono text-[10px] text-red-400"
            >
              <AlertCircle class="h-3 w-3" />
              {{ invalidCount }} invalid
            </span>
          </div>

          <!-- Input wrapper -->
          <div class="relative min-h-[120px] p-4">
            <!-- Rendered overlay -->
            <div 
              class="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-base leading-relaxed"
              aria-hidden="true"
            >
              <span
                v-for="item in renderedText"
                :key="item.index"
                :class="[
                  'inline',
                  item.isInvalid ? 'text-red-500' : 'text-white',
                  item.isInvalid && config.animateInvalid ? 'animate-invalid' : ''
                ]"
              >{{ item.char === ' ' ? '\u00A0' : item.char }}</span>
              <span 
                v-if="!inputValue" 
                class="text-white/30"
              >{{ config.placeholder }}</span>
            </div>

            <!-- Actual editable div -->
            <div
              ref="inputRef"
              contenteditable="plaintext-only"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
              class="editable-input relative min-h-[88px] font-mono text-base leading-relaxed caret-white outline-none whitespace-pre-wrap break-all"
              @input="handleInput"
              @paste="handlePaste"
              @scroll="syncScroll"
            />
          </div>

          <!-- Bottom bar -->
          <div class="flex items-center justify-between border-t border-white/10 px-4 py-2">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] text-white/40">Mode:</span>
              <span class="font-mono text-[10px] text-white/60">{{ modeOptions.find(m => m.id === config.mode)?.label }}</span>
            </div>
            <button
              v-if="inputValue"
              class="font-mono text-[10px] text-white/40 transition-colors hover:text-white"
              @click="clearInput"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Error message -->
        <p 
          v-if="invalidCount > 0" 
          class="mt-3 flex items-center gap-2 font-mono text-xs text-red-400"
        >
          <AlertCircle class="h-3 w-3" />
          {{ invalidCount }} invalid character{{ invalidCount > 1 ? 's' : '' }} detected
        </p>

        <!-- Mode description -->
        <p v-else class="mt-4 text-center font-mono text-xs text-white/40">
          {{ modeOptions.find(m => m.id === config.mode)?.description }}
          <span v-if="config.blockInput" class="text-yellow-500"> • Blocking invalid input</span>
        </p>
      </div>

      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Try typing special characters like @, #, $, !, or emojis to see them highlighted.
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
          <!-- Validation Mode -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Validation Mode</h3>
            
            <!-- Mode Selection -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Character Filter</label>
              <div class="grid grid-cols-1 gap-2">
                <button
                  v-for="mode in modeOptions"
                  :key="mode.id"
                  :class="[
                    'flex items-center justify-between border px-4 py-3 text-left transition-colors',
                    config.mode === mode.id 
                      ? 'border-white/40 bg-white/10' 
                      : 'border-white/10 hover:border-white/20'
                  ]"
                  @click="config.mode = mode.id as typeof config.mode"
                >
                  <div>
                    <span class="font-mono text-sm text-white">{{ mode.label }}</span>
                    <p class="mt-0.5 font-mono text-[10px] text-white/40">{{ mode.description }}</p>
                  </div>
                  <div 
                    :class="[
                      'h-3 w-3 rounded-full border',
                      config.mode === mode.id 
                        ? 'border-white bg-white' 
                        : 'border-white/30'
                    ]"
                  />
                </button>
              </div>
            </div>

            <!-- Custom Pattern -->
            <div v-if="config.mode === 'custom'" class="space-y-2">
              <label class="font-mono text-xs text-white/60">Custom Regex Pattern</label>
              <input
                v-model="config.customPattern"
                type="text"
                class="w-full border border-white/20 bg-dark-900 px-3 py-2 font-mono text-sm text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
                placeholder="[^a-zA-Z0-9]"
              >
              <p class="font-mono text-[10px] text-white/40">
                Characters matching this pattern will be marked as invalid
              </p>
            </div>
          </div>

          <!-- Behavior -->
          <div class="space-y-6">
            <h3 class="font-mono text-sm font-medium">Behavior & Display</h3>
            
            <!-- Block Input -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Block Invalid Input</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Prevent invalid characters entirely</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.blockInput ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.blockInput = !config.blockInput"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.blockInput ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Animate Invalid -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Shake Animation</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Animate invalid characters</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.animateInvalid ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.animateInvalid = !config.animateInvalid"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.animateInvalid ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Show Count -->
            <div class="flex items-center justify-between">
              <div>
                <label class="font-mono text-xs text-white/60">Show Character Count</label>
                <p class="mt-0.5 font-mono text-[10px] text-white/30">Display count badges</p>
              </div>
              <button
                :class="[
                  'h-5 w-10 rounded-full transition-colors',
                  config.showCount ? 'bg-white' : 'bg-white/20'
                ]"
                @click="config.showCount = !config.showCount"
              >
                <div
                  :class="[
                    'h-4 w-4 rounded-full bg-dark-900 transition-transform',
                    config.showCount ? 'translate-x-5' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>

            <!-- Placeholder -->
            <div class="space-y-2">
              <label class="font-mono text-xs text-white/60">Placeholder Text</label>
              <input
                v-model="config.placeholder"
                type="text"
                class="w-full border border-white/20 bg-dark-900 px-3 py-2 font-mono text-sm text-white placeholder-white/30 focus:border-white/40 focus:outline-none"
                placeholder="Enter placeholder..."
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
          Intelligent Input provides real-time character validation with visual feedback.
          Instead of blocking input or showing errors after submission, users see
          exactly which characters are problematic as they type.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">A transparent <code class="text-white/80">contenteditable</code> div captures user input</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Each character is tested against the validation regex pattern</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">An overlay renders the same text with colored spans for visual feedback</p>
            </div>
            <div class="flex gap-4">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">Invalid characters turn red with optional shake animation</p>
            </div>
          </div>
        </div>

        <!-- Use Cases -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Best Used For</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Username fields</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Code editors</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Search filters</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Form validation</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Data entry</span>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">contenteditable</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">RegExp</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">CSS animations</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3 Computed</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.editable-input {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-decoration: none !important;
  -webkit-text-decoration: none !important;
}

.editable-input * {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-decoration: none !important;
}

.animate-invalid {
  animation: shake 0.3s ease;
  display: inline-block;
}

@keyframes shake {
  0%, 100% { 
    transform: translateX(0); 
  }
  20% { 
    transform: translateX(-2px) rotate(-1deg); 
  }
  40% { 
    transform: translateX(2px) rotate(1deg); 
  }
  60% { 
    transform: translateX(-2px) rotate(-1deg); 
  }
  80% { 
    transform: translateX(2px) rotate(1deg); 
  }
}

[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: rgba(255, 255, 255, 0.3);
}

[contenteditable] {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
