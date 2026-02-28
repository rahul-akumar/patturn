<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { componentList } = useComponentRegistry()

const isActive = (slug: string) => route.path === `/lab/${slug}`

const activeIndex = computed(() =>
  componentList.findIndex(c => isActive(c.slug))
)

// Layout constants:
// nav py-4 = 16px top padding
// each item: py-2.5 (10+10px) + text-sm (~20px line-height) + mb-1 (4px) = 44px
const ITEM_HEIGHT = 44
const TOP_PADDING = 16

const dotY = computed(() => {
  if (activeIndex.value < 0) return -1
  return TOP_PADDING + activeIndex.value * ITEM_HEIGHT + ITEM_HEIGHT / 2
})

// Scroll wheel navigation — navigate to prev/next ready component
let scrollCooldown = false

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (scrollCooldown) return

  const direction = e.deltaY > 0 ? 1 : -1
  const readyItems = componentList.filter(c => c.status === 'ready')

  const currentReadyIndex = readyItems.findIndex(c => isActive(c.slug))
  const nextReadyIndex = currentReadyIndex + direction
  const nextItem = readyItems[nextReadyIndex]

  if (nextItem) {
    router.push(`/lab/${nextItem.slug}`)
    scrollCooldown = true
    setTimeout(() => { scrollCooldown = false }, 400)
  }
}
</script>

<template>
  <aside class="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-dark-900" @wheel="onWheel">
    <!-- Title -->
    <div class="flex h-[53px] items-center border-b border-white/10 px-5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Components</span>
    </div>

    <!-- Component List -->
    <nav class="relative min-h-0 flex-1 overflow-hidden py-4">
      <!-- Items -->
      <div class="px-3">
        <NuxtLink v-for="component in componentList" :key="component.id"
          :to="component.status === 'ready' ? `/lab/${component.slug}` : '/lab'" :class="[
            'group mb-1 flex items-center justify-between py-2.5 pl-8 pr-3 transition-colors duration-150',
            isActive(component.slug)
              ? 'text-white'
              : component.status === 'ready'
                ? 'text-white/40 hover:text-white/70'
                : 'cursor-not-allowed text-white/20'
          ]">
          <div class="flex items-center gap-3">
            <span :class="[
              'font-mono text-[10px] transition-colors duration-150',
              isActive(component.slug) ? 'text-white/50' : 'text-white/20'
            ]">
              {{ component.id }}
            </span>
            <span :class="[
              'text-sm transition-colors duration-150',
              isActive(component.slug) ? 'font-semibold' : 'font-normal'
            ]">{{ component.title }}</span>
          </div>
          <span v-if="component.status !== 'ready'" :class="[
            'font-mono text-[8px] uppercase tracking-wider',
            component.status === 'progress' ? 'text-yellow-500/70' : 'text-white/15'
          ]">
            {{ component.status }}
          </span>
        </NuxtLink>
      </div>

      <!-- Progress track — rendered after items to paint on top -->

      <!-- Full-height dim track line -->
      <div class="pointer-events-none absolute inset-y-0 left-5 w-px" style="background: rgba(255,255,255,0.12);" />

      <!-- Filled segment from top to active dot -->
      <div v-if="dotY >= 0"
        class="pointer-events-none absolute left-5 top-0 w-px transition-[height] duration-500 ease-out"
        :style="{ height: dotY + 'px', background: 'rgba(255,255,255,0.55)' }" />

      <!-- Active dot: white fill -->
      <div v-if="dotY >= 0" class="pointer-events-none absolute left-5 transition-[top] duration-500 ease-out" :style="{
        top: dotY + 'px',
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        background: 'white',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
      }" />
    </nav>

    <!-- Footer -->
    <div class="border-t border-white/10 px-5 py-4">
      <span class="font-mono text-[10px] text-white/30">Patturn v0.0.1</span>
    </div>
  </aside>
</template>
