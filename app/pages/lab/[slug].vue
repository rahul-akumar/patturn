<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import gsap from 'gsap'
import type { Component } from 'vue'
import { Copy, Check, RotateCcw, Download, Share2, Star, Sparkles, ArrowRight, MessageCircle, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2 } from 'lucide-vue-next'
import PointerEyeIcon from '~/components/icons/PointerEyeIcon.vue'

definePageMeta({
  layout: 'lab'
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

// Get component data from registry
const { getComponent } = useComponentRegistry()
const componentData = computed(() => getComponent(slug.value))

// Redirect if component not found
if (!componentData.value) {
  throw createError({ statusCode: 404, message: 'Component not found' })
}

// Demo ref for animation
const demoRef = ref<HTMLElement | null>(null)
const bottomPanelRef = ref<HTMLElement | null>(null)
const copied = ref(false)

// Bottom panel tabs
const bottomTabs = ['Controls', 'Code', 'About', 'Props', 'Events'] as const
type BottomTab = typeof bottomTabs[number]
const activeBottomTab = ref<BottomTab>('Controls')

// Initialize config from controls defaults
const initConfig = () => {
  const defaults: Record<string, unknown> = {}
  if (componentData.value?.controls) {
    for (const control of componentData.value.controls) {
      defaults[control.key] = control.default
    }
  }
  return defaults
}

const config = ref<Record<string, unknown>>(initConfig())

const magneticButtonIconMap: Record<string, Component> = {
  star: Star,
  sparkles: Sparkles,
  'arrow-right': ArrowRight,
  'message-circle': MessageCircle,
  eye: PointerEyeIcon
}

const resolvedConfig = computed(() => {
  const nextConfig = { ...config.value }

  if (slug.value === 'magnetic-button') {
    const iconKey = String(nextConfig.icon ?? 'none')
    nextConfig.icon = iconKey === 'none' ? undefined : magneticButtonIconMap[iconKey]
  }

  return nextConfig
})

const showEyeNotice = computed(() => (
  slug.value === 'magnetic-button' && config.value.icon === 'eye'
))

// Toast Stack ref and helpers
const toastStackRef = ref<{ createToast: (type: string) => void; clearAllToasts: () => void; activeCount: { value: number } } | null>(null)

const toastTypes = [
  { id: 'success', label: 'Success', icon: CheckCircle, color: 'emerald' },
  { id: 'error', label: 'Error', icon: AlertCircle, color: 'red' },
  { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'amber' },
  { id: 'info', label: 'Info', icon: Info, color: 'blue' }
]

// Reset config to defaults
const resetConfig = () => {
  config.value = initConfig()
}

// Re-initialize config when component changes
watch(slug, () => {
  config.value = initConfig()
})

// Animation on mount
onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
  gsap.from(bottomPanelRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    delay: 0.1,
    ease: 'power4.out'
  })
})

// Copy code to clipboard
const copyCode = async () => {
  await navigator.clipboard.writeText(componentData.value?.sourceCode || '')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

// Download component
const downloadComponent = () => {
  const blob = new Blob([componentData.value?.sourceCode || ''], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${componentData.value?.title.replace(/\s+/g, '')}.vue`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <header
      class="sticky top-0 z-30 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <span class="text-lg font-medium tracking-tight">{{ componentData?.title }}</span>
        <!-- Status indicator circle -->
        <div class="group relative flex items-center">
          <div :class="[
            'h-2 w-2 rounded-full transition-transform duration-200 group-hover:scale-110',
            componentData?.status === 'ready'
              ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
              : 'bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.6)]'
          ]" />
          <span :class="[
            'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest opacity-0 transition-opacity duration-150 group-hover:opacity-100',
            componentData?.status === 'ready' ? 'text-green-400' : 'text-yellow-400'
          ]">
            {{ componentData?.status === 'ready' ? 'Ready' : 'In Progress' }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
          @click="downloadComponent">
          <Download class="h-3.5 w-3.5" />
          Download
        </button>
        <button
          class="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-white/60 transition-colors hover:border-white/30 hover:text-white"
          @click="() => { }">
          <Share2 class="h-3.5 w-3.5" />
          Share
        </button>
      </div>
    </header>

    <!-- Main Content: Split vertically using CSS Grid for flexible sizing -->
    <!-- For fluid-cursor, give more space to showcase -->
    <div :class="[
      'grid min-h-0 flex-1 overflow-hidden',
      slug === 'fluid-cursor' || slug === 'gesture-ripple' || slug === 'radial-menu' ? 'grid-rows-[2fr_1fr]' : 'grid-rows-[minmax(50%,auto)_1fr]'
    ]">
      <!-- Showcase Section (Top Half - min 50%, can grow based on content) -->
      <!-- For fluid-cursor, the component wraps the entire showcase area -->
      <section v-if="slug === 'fluid-cursor'" ref="demoRef" class="relative overflow-hidden border-b border-white/10"
        style="cursor: none;">
        <component :is="componentData?.component" v-if="componentData?.component" v-bind="resolvedConfig"
          class="h-full w-full">
          <div class="flex h-full w-full flex-col items-center justify-center p-8">
            <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
            <p class="mb-8 font-mono text-sm text-white/60">Move your cursor in this area</p>
            <div class="flex flex-wrap items-center justify-center gap-8">
              <div
                class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
                <span class="font-mono text-xs text-white/50 group-hover:text-white">Hover</span>
              </div>
              <div
                class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
                <span class="font-mono text-xs text-white/50 group-hover:text-white">Me</span>
              </div>
              <div
                class="group flex h-32 w-32 items-center justify-center border border-white/20 transition-colors hover:border-white/40 hover:bg-white/5">
                <span class="font-mono text-xs text-white/50 group-hover:text-white">Too</span>
              </div>
            </div>
          </div>
        </component>
      </section>

      <!-- For gesture-ripple, the component fills the entire showcase area -->
      <section v-else-if="slug === 'gesture-ripple'" ref="demoRef"
        class="relative overflow-hidden border-b border-white/10">
        <component :is="componentData?.component" v-if="componentData?.component" v-bind="resolvedConfig"
          class="h-full w-full" />
      </section>

      <!-- For radial-menu, render the component as the interactive demo area -->
      <section v-else-if="slug === 'radial-menu'" ref="demoRef"
        class="relative overflow-hidden border-b border-white/10">
        <component :is="componentData?.component" v-if="componentData?.component" v-bind="resolvedConfig"
          class="h-full w-full" />
      </section>

      <!-- For toast-stack, render the fixed overlay + trigger buttons in the demo area -->
      <section v-else-if="slug === 'toast-stack'" ref="demoRef"
        class="relative flex flex-col items-center justify-center overflow-hidden border-b border-white/10 px-6 py-16">
        <!-- The ToastStack component renders a fixed overlay -->
        <component :is="componentData?.component" v-if="componentData?.component" ref="toastStackRef"
          v-bind="resolvedConfig" />

        <span class="mb-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
        <p class="mb-8 font-mono text-xs text-white/40">
          Active toasts: {{ toastStackRef?.activeCount?.value ?? 0 }}
        </p>

        <!-- Toast Trigger Buttons -->
        <div class="flex flex-wrap justify-center gap-3">
          <button v-for="type in toastTypes" :key="type.id" :class="[
            'group flex items-center gap-2 rounded-lg border px-4 py-3 transition-all',
            type.id === 'success' ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10' : '',
            type.id === 'error' ? 'border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10' : '',
            type.id === 'warning' ? 'border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/10' : '',
            type.id === 'info' ? 'border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-500/10' : ''
          ]" @click="toastStackRef?.createToast(type.id)">
            <component :is="type.icon" :class="[
              'h-4 w-4',
              type.id === 'success' ? 'text-emerald-400' : '',
              type.id === 'error' ? 'text-red-400' : '',
              type.id === 'warning' ? 'text-amber-400' : '',
              type.id === 'info' ? 'text-blue-400' : ''
            ]" />
            <span class="font-mono text-xs text-white/80">{{ type.label }}</span>
          </button>
        </div>

        <!-- Clear All -->
        <button v-if="(toastStackRef?.activeCount?.value ?? 0) > 0"
          class="mt-4 flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
          @click="toastStackRef?.clearAllToasts()">
          <Trash2 class="h-3 w-3" />
          Clear all
        </button>

        <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
          Click the buttons to spawn toasts. Swipe to dismiss, or wait for auto-dismiss.
          Toasts stack with a 3D effect.
        </p>
      </section>

      <!-- Default showcase for other components -->
      <section v-else ref="demoRef"
        class="flex flex-col items-center justify-center overflow-auto border-b border-white/10 px-6 py-8">
        <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>

        <!-- Liquid Glass special background -->
        <div v-if="slug === 'liquid-glass'" class="absolute inset-0 overflow-hidden">
          <!-- Grid pattern -->
          <div class="absolute inset-0 opacity-20"
            style="background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 40px 40px;" />

          <!-- Sharp colored shapes -->
          <div class="absolute left-[10%] top-[15%] h-32 w-32 rotate-12 bg-purple-500" />
          <div class="absolute right-[15%] top-[20%] h-24 w-24 rotate-45 bg-blue-500" />
          <div class="absolute left-[20%] bottom-[20%] h-40 w-20 -rotate-12 bg-pink-500" />
          <div class="absolute right-[25%] bottom-[15%] h-28 w-28 rounded-full bg-cyan-500" />
          <div class="absolute left-[45%] top-[10%] h-16 w-40 bg-yellow-500" />
          <div class="absolute right-[10%] top-[50%] h-36 w-12 rotate-45 bg-green-500" />

          <!-- Text elements -->
          <div class="absolute left-[5%] top-[40%] font-bold text-8xl text-white/30">GLASS</div>
          <div class="absolute right-[8%] bottom-[35%] font-bold text-6xl text-white/20">BLUR</div>

          <!-- Lines -->
          <div
            class="absolute left-0 top-[30%] h-1 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div
            class="absolute left-0 bottom-[40%] h-1 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <!-- Dynamic Component -->
        <div class="relative inline-flex flex-col items-center">
          <!-- Liquid Glass with variant-aware content -->
          <component :is="componentData?.component" v-if="componentData?.component && slug === 'liquid-glass'"
            v-bind="resolvedConfig">
            <template v-if="resolvedConfig.variant === 'card'">
              <div class="flex h-full flex-col justify-between">
                <div>
                  <div class="mb-2 h-8 w-8 rounded-full bg-white/20" />
                  <h3 class="text-xl font-semibold text-white">Glass Card</h3>
                  <p class="mt-2 text-sm text-white/60">Drag to move. Hover to tilt.</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-green-400" />
                  <span class="text-xs text-white/50">{{ resolvedConfig.preset }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="resolvedConfig.variant === 'button'">
              <span class="font-mono text-sm uppercase tracking-widest text-white">Glass Button</span>
            </template>
            <template v-else-if="resolvedConfig.variant === 'nav'">
              <div class="h-8 w-8 rounded-full bg-white/20" />
              <span class="font-mono text-sm text-white">Glass Nav</span>
              <div class="flex gap-4">
                <span class="text-xs text-white/60">Item 1</span>
                <span class="text-xs text-white/60">Item 2</span>
                <span class="text-xs text-white/60">Item 3</span>
              </div>
            </template>
          </component>

          <!-- Default for other components -->
          <component :is="componentData?.component" v-else-if="componentData?.component" v-bind="resolvedConfig">
            <slot>Interactive Component</slot>
          </component>

          <p v-if="showEyeNotice"
            class="pointer-events-none absolute left-1/2 top-full mt-4 w-max -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
            Notice: the eye follows your pointer
          </p>
        </div>

        <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
          Interact with the component above. Adjust controls below to experiment.
        </p>
      </section>

      <!-- Bottom Panel with Tabs -->
      <section ref="bottomPanelRef" class="min-h-0 flex flex-col overflow-hidden border-b border-white/10">
        <!-- Tab Bar -->
        <div class="border-b border-white/10 px-6">
          <div class="mx-auto flex h-11 max-w-4xl items-center justify-between">
            <div class="flex h-full items-end gap-6">
              <button v-for="tab in bottomTabs" :key="tab" :class="[
                'relative h-8 font-mono text-xs transition-colors',
                activeBottomTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              ]" @click="activeBottomTab = tab">
                {{ tab }}
                <span v-if="activeBottomTab === tab" class="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              </button>
            </div>
            <div class="h-8 flex items-center">
              <button v-if="activeBottomTab === 'Controls'"
                class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
                @click="resetConfig">
                <RotateCcw class="h-3 w-3" />
                Reset
              </button>
              <button v-else-if="activeBottomTab === 'Code'"
                class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
                @click="copyCode">
                <component :is="copied ? Check : Copy" class="h-3 w-3" />
                {{ copied ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <div class="mx-auto max-w-4xl">
            <Transition name="tab-fade" mode="out-in">
              <!-- Controls Tab -->
              <div v-if="activeBottomTab === 'Controls'" key="controls">
                <ControlsPanel v-if="componentData?.controls?.length" v-model="config"
                  :controls="componentData.controls" />
                <div v-else class="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                  <p class="font-mono text-sm text-white/40">
                    No controls configured for this component.
                  </p>
                </div>
              </div>

              <!-- Code Tab -->
              <div v-else-if="activeBottomTab === 'Code'" key="code" class="space-y-4">
                <pre
                  class="overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80">
            <code>{{ componentData?.sourceCode }}</code>
          </pre>
              </div>

              <!-- About Tab -->
              <div v-else-if="activeBottomTab === 'About'" key="about" class="space-y-6">
                <div>
                  <h2 class="text-xl font-bold tracking-tight">About</h2>
                  <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
                    {{ componentData?.about.description }}
                  </p>
                </div>

                <!-- How it Works -->
                <div v-if="componentData?.about.howItWorks?.length">
                  <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">How It Works</h3>
                  <div class="mt-4 space-y-4">
                    <div v-for="(step, index) in componentData.about.howItWorks" :key="index" class="flex gap-4">
                      <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 font-mono text-[10px]">
                        {{ index + 1 }}
                      </span>
                      <p class="font-mono text-sm text-white/60">{{ step }}</p>
                    </div>
                  </div>
                </div>

                <!-- Tech -->
                <div v-if="componentData?.about.builtWith?.length">
                  <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span v-for="tech in componentData.about.builtWith" :key="tech"
                      class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Props Tab -->
              <div v-else-if="activeBottomTab === 'Props'" key="props" class="space-y-4">
                <h2 class="text-xl font-bold tracking-tight">Props Reference</h2>
                <div class="space-y-4">
                  <div v-for="prop in componentData?.props" :key="prop.name" class="border-b border-white/10 pb-4">
                    <div class="flex flex-wrap items-center gap-3">
                      <code class="font-mono text-sm text-white">{{ prop.name }}</code>
                      <span class="font-mono text-xs text-white/40">{{ prop.type }}</span>
                      <span class="font-mono text-xs text-white/30">default: {{ prop.default }}</span>
                    </div>
                    <p class="mt-2 font-mono text-sm text-white/60">{{ prop.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Events Tab -->
              <div v-else-if="activeBottomTab === 'Events'" key="events" class="space-y-4">
                <h2 class="text-xl font-bold tracking-tight">Events Reference</h2>
                <div class="space-y-4">
                  <div v-for="event in componentData?.events" :key="event.name" class="border-b border-white/10 pb-4">
                    <div class="flex flex-wrap items-center gap-3">
                      <code class="font-mono text-sm text-white">@{{ event.name }}</code>
                      <span class="font-mono text-xs text-white/40">{{ event.payload }}</span>
                    </div>
                    <p class="mt-2 font-mono text-sm text-white/60">{{ event.description }}</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
