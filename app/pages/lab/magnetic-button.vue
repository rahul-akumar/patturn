<script setup lang="ts">
import { onMounted, ref, computed, type Component } from 'vue'
import gsap from 'gsap'
import { Copy, Check, RotateCcw, Star, ArrowRight, Heart, Zap } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Configuration state
const config = ref({
  // Style props
  strength: 0.4,
  size: 'md' as 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  corners: 'sharp' as 'sharp' | 'rounded' | 'squarcle' | 'pill' | 'message',
  color: 'white' as 'white' | 'dark',
  icon: undefined as Component | undefined,
  iconPosition: 'left' as 'left' | 'right',
  showFill: true,
  // Animation props
  textParallax: 0.5,
  moveDuration: 0.4,
  moveEase: 'power3.out',
  returnDuration: 0.7,
  returnEase: 'elastic.out(1, 0.3)'
})

const sizeOptions: { value: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; label: string }[] = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' }
]

const cornerOptions: { value: 'sharp' | 'rounded' | 'squarcle' | 'pill' | 'message'; label: string }[] = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'squarcle', label: 'Squarcle' },
  { value: 'pill', label: 'Pill' },
  { value: 'message', label: 'Message' }
]

const colorOptions: { value: 'white' | 'dark'; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'dark', label: 'Dark' }
]

const iconOptions: { value: Component | undefined; label: string; icon: Component | undefined }[] = [
  { value: undefined, label: 'None', icon: undefined },
  { value: Star, label: 'Star', icon: Star },
  { value: ArrowRight, label: 'Arrow', icon: ArrowRight },
  { value: Heart, label: 'Heart', icon: Heart },
  { value: Zap, label: 'Zap', icon: Zap }
]

const positionOptions: { value: 'left' | 'right'; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' }
]

const easingOptions = [
  'none',
  'power1.out',
  'power2.out',
  'power3.out',
  'power4.out',
  'back.out(1.7)',
  'elastic.out(1, 0.3)',
  'elastic.out(1, 0.5)',
  'bounce.out',
  'circ.out',
  'expo.out'
]

const defaults = {
  strength: 0.4,
  size: 'md' as const,
  corners: 'sharp' as const,
  color: 'white' as const,
  icon: undefined,
  iconPosition: 'left' as const,
  showFill: true,
  textParallax: 0.5,
  moveDuration: 0.4,
  moveEase: 'power3.out',
  returnDuration: 0.7,
  returnEase: 'elastic.out(1, 0.3)'
}

const resetConfig = () => {
  config.value = { ...defaults }
}

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

const generatedCode = computed(() => {
  const iconImport = config.value.icon ? `import { ${config.value.icon.name} } from 'lucide-vue-next'\n` : ''
  const iconProp = config.value.icon ? `\n    :icon="${config.value.icon.name}"` : ''
  const iconPositionProp = config.value.iconPosition !== 'left' ? `\n    icon-position="${config.value.iconPosition}"` : ''
  const showFillProp = !config.value.showFill ? '\n    :show-fill="false"' : ''
  const textParallaxProp = config.value.textParallax !== 0.5 ? `\n    :text-parallax="${config.value.textParallax}"` : ''
  const moveDurationProp = config.value.moveDuration !== 0.4 ? `\n    :move-duration="${config.value.moveDuration}"` : ''
  const moveEaseProp = config.value.moveEase !== 'power3.out' ? `\n    move-ease="${config.value.moveEase}"` : ''
  const returnDurationProp = config.value.returnDuration !== 0.7 ? `\n    :return-duration="${config.value.returnDuration}"` : ''
  const returnEaseProp = config.value.returnEase !== 'elastic.out(1, 0.3)' ? `\n    return-ease="${config.value.returnEase}"` : ''

  return `<script setup>
${iconImport}import MagneticButton from '@/components/MagneticButton.vue'
${'<' + '/script>'}

<template>
  <MagneticButton
    strength="${config.value.strength}"
    size="${config.value.size}"
    corners="${config.value.corners}"
    color="${config.value.color}"${iconProp}${iconPositionProp}${showFillProp}${textParallaxProp}${moveDurationProp}${moveEaseProp}${returnDurationProp}${returnEaseProp}
  >
    Button Text
  </MagneticButton>
</template>`
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
    <header
      class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Magnetic Button</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef"
      class="flex min-h-[50vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>

      <!-- Using the actual MagneticButton component -->
      <MagneticButton :strength="config.strength" :size="config.size" :corners="config.corners" :color="config.color"
        :icon="config.icon" :icon-position="config.iconPosition" :show-fill="config.showFill"
        :text-parallax="config.textParallax" :move-duration="config.moveDuration" :move-ease="config.moveEase"
        :return-duration="config.returnDuration" :return-ease="config.returnEase">
        Hover Me
      </MagneticButton>

      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        The button follows your cursor with configurable physics.<br>
        Adjust the controls below to experiment.
      </p>
    </section>

    <!-- Controls Section -->
    <section class="border-b border-white/10 px-8 py-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-6 flex items-center justify-between">
          <span class="font-mono text-[10px] uppercase tracking-widest text-white/40">Controls</span>
          <button class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="resetConfig">
            <RotateCcw class="h-3 w-3" />
            Reset
          </button>
        </div>

        <!-- Size & Color Section -->
        <div class="mb-8">
          <h3 class="mb-4 font-mono text-sm font-medium text-white/60">Size & Color</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Size Control -->
            <div class="space-y-3">
              <label class="font-mono text-xs text-white/60">Size</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="opt in sizeOptions" :key="opt.value" :class="[
                  'border px-3 py-2 font-mono text-xs transition-colors',
                  config.size === opt.value
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.size = opt.value">
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Color Control -->
            <div class="space-y-3">
              <label class="font-mono text-xs text-white/60">Color</label>
              <div class="flex gap-2">
                <button v-for="opt in colorOptions" :key="opt.value" :class="[
                  'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                  config.color === opt.value
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.color = opt.value">
                  {{ opt.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Corners Section -->
        <div class="mb-8">
          <h3 class="mb-4 font-mono text-sm font-medium text-white/60">Corners</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="opt in cornerOptions" :key="opt.value" :class="[
              'border px-4 py-2 font-mono text-xs transition-colors',
              config.corners === opt.value
                ? 'border-white bg-white/10 text-white'
                : 'border-white/20 text-white/40 hover:border-white/40'
            ]" @click="config.corners = opt.value">
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- Content Section -->
        <div class="mb-8">
          <h3 class="mb-4 font-mono text-sm font-medium text-white/60">Content</h3>
          <div class="grid gap-6 md:grid-cols-3">
            <!-- Icon Control -->
            <div class="space-y-3">
              <label class="font-mono text-xs text-white/60">Icon</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="opt in iconOptions" :key="opt.label" :class="[
                  'border px-3 py-2 font-mono text-xs transition-colors',
                  config.icon === opt.value
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.icon = opt.value">
                  <component :is="opt.icon" v-if="opt.icon" :size="14" />
                  <span v-else>{{ opt.label }}</span>
                </button>
              </div>
            </div>

            <!-- Icon Position Control -->
            <div class="space-y-3">
              <label class="font-mono text-xs text-white/60">Icon Position</label>
              <div class="flex gap-2">
                <button v-for="opt in positionOptions" :key="opt.value" :class="[
                  'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                  config.iconPosition === opt.value
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.iconPosition = opt.value">
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Show Fill Control -->
            <div class="space-y-3">
              <label class="font-mono text-xs text-white/60">Show Fill Animation</label>
              <div class="flex gap-2">
                <button :class="[
                  'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                  config.showFill
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.showFill = true">
                  Yes
                </button>
                <button :class="[
                  'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                  !config.showFill
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/40 hover:border-white/40'
                ]" @click="config.showFill = false">
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Animation Controls -->
        <div>
          <h3 class="mb-4 font-mono text-sm font-medium text-white/60">Animation</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Movement Controls -->
            <div class="space-y-5">
              <h4 class="font-mono text-xs uppercase tracking-widest text-white/40">Movement</h4>

              <!-- Strength -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-mono text-xs text-white/60">Strength</label>
                  <span class="font-mono text-xs text-white/40">{{ config.strength }}</span>
                </div>
                <input v-model.number="config.strength" type="range" min="0.1" max="1" step="0.05" class="w-full">
              </div>

              <!-- Text Parallax -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-mono text-xs text-white/60">Text Parallax</label>
                  <span class="font-mono text-xs text-white/40">{{ config.textParallax }}</span>
                </div>
                <input v-model.number="config.textParallax" type="range" min="0" max="1" step="0.1" class="w-full">
              </div>

              <!-- Move Duration -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-mono text-xs text-white/60">Move Duration</label>
                  <span class="font-mono text-xs text-white/40">{{ config.moveDuration }}s</span>
                </div>
                <input v-model.number="config.moveDuration" type="range" min="0.1" max="1" step="0.05" class="w-full">
              </div>

              <!-- Move Easing -->
              <div class="space-y-2">
                <label class="font-mono text-xs text-white/60">Move Easing</label>
                <select v-model="config.moveEase"
                  class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none">
                  <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                    {{ ease }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Return Controls -->
            <div class="space-y-5">
              <h4 class="font-mono text-xs uppercase tracking-widest text-white/40">Return</h4>

              <!-- Return Duration -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="font-mono text-xs text-white/60">Return Duration</label>
                  <span class="font-mono text-xs text-white/40">{{ config.returnDuration }}s</span>
                </div>
                <input v-model.number="config.returnDuration" type="range" min="0.2" max="1.5" step="0.05"
                  class="w-full">
              </div>

              <!-- Return Easing -->
              <div class="space-y-2">
                <label class="font-mono text-xs text-white/60">Return Easing</label>
                <select v-model="config.returnEase"
                  class="w-full border border-white/20 bg-transparent px-3 py-2 font-mono text-xs text-white focus:border-white/40 focus:outline-none">
                  <option v-for="ease in easingOptions" :key="ease" :value="ease" class="bg-dark-900">
                    {{ ease }}
                  </option>
                </select>
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
          <button class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
            @click="copyCode">
            <component :is="copied ? Check : Copy" class="h-3 w-3" />
            {{ copied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <pre
          class="mt-4 overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80"><code>{{ generatedCode }}</code></pre>
      </div>
    </section>

    <!-- Props Reference Section -->
    <section class="border-t border-white/10 px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">Props Reference</h2>

        <div class="mt-8 space-y-6">
          <!-- Strength -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">strength</code>
              <span class="font-mono text-xs text-white/40">number</span>
              <span class="font-mono text-xs text-white/30">default: 0.5</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Magnetic pull strength (0.1 - 1)</p>
          </div>

          <!-- Size -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">size</code>
              <span class="font-mono text-xs text-white/40">'xs' | 'sm' | 'md' | 'lg' | 'xl'</span>
              <span class="font-mono text-xs text-white/30">default: 'md'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">T-shirt sizing for button dimensions</p>
          </div>

          <!-- Corners -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">corners</code>
              <span class="font-mono text-xs text-white/40">'sharp' | 'rounded' | 'squarcle' | 'pill' | 'message'</span>
              <span class="font-mono text-xs text-white/30">default: 'sharp'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Border radius style</p>
          </div>

          <!-- Color -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">color</code>
              <span class="font-mono text-xs text-white/40">'white' | 'dark'</span>
              <span class="font-mono text-xs text-white/30">default: 'white'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Color theme for border, text, and fill</p>
          </div>

          <!-- Icon -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">icon</code>
              <span class="font-mono text-xs text-white/40">Component</span>
              <span class="font-mono text-xs text-white/30">default: undefined</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Lucide icon component to display</p>
          </div>

          <!-- Icon Position -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">iconPosition</code>
              <span class="font-mono text-xs text-white/40">'left' | 'right'</span>
              <span class="font-mono text-xs text-white/30">default: 'left'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Position of the icon relative to text</p>
          </div>

          <!-- Show Fill -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">showFill</code>
              <span class="font-mono text-xs text-white/40">boolean</span>
              <span class="font-mono text-xs text-white/30">default: true</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Toggle the fill animation on hover</p>
          </div>

          <!-- Text Parallax -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">textParallax</code>
              <span class="font-mono text-xs text-white/40">number</span>
              <span class="font-mono text-xs text-white/30">default: 0.5</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Text movement multiplier relative to button (0 - 1)</p>
          </div>

          <!-- Move Duration -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">moveDuration</code>
              <span class="font-mono text-xs text-white/40">number</span>
              <span class="font-mono text-xs text-white/30">default: 0.4</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Duration of magnetic movement animation (seconds)</p>
          </div>

          <!-- Move Ease -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">moveEase</code>
              <span class="font-mono text-xs text-white/40">string</span>
              <span class="font-mono text-xs text-white/30">default: 'power3.out'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">GSAP easing for magnetic movement</p>
          </div>

          <!-- Return Duration -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">returnDuration</code>
              <span class="font-mono text-xs text-white/40">number</span>
              <span class="font-mono text-xs text-white/30">default: 0.7</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">Duration of return animation (seconds)</p>
          </div>

          <!-- Return Ease -->
          <div class="border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <code class="font-mono text-sm text-white">returnEase</code>
              <span class="font-mono text-xs text-white/40">string</span>
              <span class="font-mono text-xs text-white/30">default: 'elastic.out(1, 0.3)'</span>
            </div>
            <p class="mt-2 font-mono text-sm text-white/60">GSAP easing for return animation</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Info Section -->
    <section class="border-t border-white/10 px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">About</h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
          Magnetic buttons create a subtle interaction that makes UI elements feel alive.
          The button follows the cursor within its bounds using GSAP,
          then snaps back when the cursor leaves with elastic easing.
        </p>

        <!-- How it Works -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
          <div class="mt-4 space-y-4">
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">1</span>
              <p class="font-mono text-sm text-white/60">Calculate cursor offset from button center</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">2</span>
              <p class="font-mono text-sm text-white/60">Multiply offset by strength to get displacement</p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">3</span>
              <p class="font-mono text-sm text-white/60">Animate button and text with GSAP (text at reduced parallax)
              </p>
            </div>
            <div class="flex gap-4">
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">4</span>
              <p class="font-mono text-sm text-white/60">On mouse leave, animate back with elastic easing</p>
            </div>
          </div>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
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
