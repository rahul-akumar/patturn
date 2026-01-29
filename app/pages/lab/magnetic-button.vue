<script setup lang="ts">
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { Copy, Check } from 'lucide-vue-next'

definePageMeta({
  layout: 'lab'
})

const demoRef = ref<HTMLElement | null>(null)
const copied = ref(false)

onMounted(() => {
  gsap.from(demoRef.value, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power4.out'
  })
})

const copyCode = async () => {
  const code = `<MagneticButton :strength="0.4">
  Button Text
</MagneticButton>`
  await navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex h-[53px] items-center justify-between border-b border-white/10 bg-dark-900/80 px-6 backdrop-blur-md">
      <span class="text-lg font-medium tracking-tight">Magnetic Button</span>
      <span class="font-mono text-[10px] text-green-500 uppercase tracking-widest">Ready</span>
    </header>

    <!-- Demo Section -->
    <section ref="demoRef" class="flex min-h-[60vh] flex-col items-center justify-center border-b border-white/10 px-6 py-16">
      <span class="mb-8 font-mono text-[10px] uppercase tracking-widest text-white/40">Interactive Demo</span>
      
      <div class="flex flex-wrap items-center justify-center gap-6">
        <MagneticButton :strength="0.3">
          Default
        </MagneticButton>
        
        <MagneticButton :strength="0.5">
          Strong Pull
        </MagneticButton>
        
        <MagneticButton :strength="0.2">
          Subtle
        </MagneticButton>
      </div>
      
      <p class="mt-12 max-w-md text-center font-mono text-xs leading-relaxed text-white/40">
        Hover over the buttons to see the magnetic effect.<br />
        The button follows your cursor with elastic physics.
      </p>
    </section>

    <!-- Info Section -->
    <section class="px-8 py-16">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-2xl font-bold tracking-tight">About</h2>
        <p class="mt-4 font-mono text-sm leading-relaxed text-white/60">
          Magnetic buttons create a subtle interaction that makes UI elements feel alive. 
          The button follows the cursor within its bounds using GSAP's elastic easing, 
          then snaps back when the cursor leaves.
        </p>

        <!-- Props -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Props</h3>
          <div class="mt-4 border border-white/10">
            <div class="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <span class="font-mono text-sm text-white">strength</span>
                <span class="ml-2 font-mono text-xs text-white/40">number</span>
              </div>
              <span class="font-mono text-xs text-white/60">default: 0.5</span>
            </div>
            <div class="p-4">
              <p class="font-mono text-xs text-white/50">
                Controls how strongly the button follows the cursor. Range: 0.1 - 1.0
              </p>
            </div>
          </div>
        </div>

        <!-- Code -->
        <div class="mt-12">
          <div class="flex items-center justify-between">
            <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Usage</h3>
            <button
              class="flex items-center gap-2 font-mono text-xs text-white/40 transition-colors hover:text-white"
              @click="copyCode"
            >
              <component :is="copied ? Check : Copy" class="h-3 w-3" />
              {{ copied ? 'Copied' : 'Copy' }}
            </button>
          </div>
          <pre class="mt-4 overflow-x-auto border border-white/10 bg-dark-950 p-4 font-mono text-xs leading-relaxed text-white/80"><code>&lt;MagneticButton :strength="0.4"&gt;
  Button Text
&lt;/MagneticButton&gt;</code></pre>
        </div>

        <!-- Tech -->
        <div class="mt-12">
          <h3 class="font-mono text-xs uppercase tracking-widest text-white/40">Built With</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">GSAP</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Vue 3</span>
            <span class="border border-white/10 px-3 py-1 font-mono text-xs text-white/60">Composables</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
