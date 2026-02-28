<script setup lang="ts">
interface TocItem {
  id: string
  label: string
  disabled?: boolean
  badge?: string
}

const props = withDefaults(defineProps<{
  items?: TocItem[]
  activeId?: string
  itemHeight?: number
  topPadding?: number
  scrollCooldownMs?: number
}>(), {
  items: () => [
    { id: '001', label: 'Introduction' },
    { id: '002', label: 'Core Concepts' },
    { id: '003', label: 'Architecture' },
    { id: '004', label: 'System Internals' },
    { id: '005', label: 'Components' },
    { id: '006', label: 'Button UI' },
    { id: '007', label: 'Form Elements' },
    { id: '008', label: 'Navigation', disabled: true, badge: 'soon' },
    { id: '009', label: 'Data Display' },
    { id: '010', label: 'Feedback' },
  ],
  activeId: '005',
  itemHeight: 44,
  topPadding: 16,
  scrollCooldownMs: 400,
})

const emit = defineEmits<{
  'update:activeId': [id: string]
}>()

const activeIndex = computed(() =>
  props.items.findIndex(item => item.id === props.activeId)
)

const dotY = computed(() => {
  if (activeIndex.value < 0) return -1
  return props.topPadding + activeIndex.value * props.itemHeight + props.itemHeight / 2
})

let scrollCooldown = false

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  if (scrollCooldown) return

  const direction = e.deltaY > 0 ? 1 : -1
  const enabledItems = props.items.filter(item => !item.disabled)
  const currentIndex = enabledItems.findIndex(item => item.id === props.activeId)
  const nextItem = enabledItems[currentIndex + direction]

  if (nextItem) {
    emit('update:activeId', nextItem.id)
    scrollCooldown = true
    setTimeout(() => { scrollCooldown = false }, props.scrollCooldownMs)
  }
}

const select = (item: TocItem) => {
  if (!item.disabled) emit('update:activeId', item.id)
}
</script>

<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r border-white/10 bg-dark-900" @wheel="onWheel">
    <!-- Header -->
    <div class="flex h-[53px] items-center gap-2 border-b border-white/10 px-5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">On This Page</span>
    </div>

    <!-- List -->
    <nav class="relative min-h-0 flex-1 overflow-hidden py-4">
      <!-- Items -->
      <div class="px-3">
        <button v-for="item in items" :key="item.id" :disabled="item.disabled"
          class="group mb-1 flex w-full items-center justify-between py-2.5 pl-8 pr-3 text-left transition-colors duration-150"
          :class="[
            item.id === activeId
              ? 'text-white'
              : item.disabled
                ? 'cursor-not-allowed text-white/20'
                : 'text-white/40 hover:text-white/70'
          ]" @click="select(item)">
          <div class="flex items-center gap-3">
            <span :class="[
              'font-mono text-[10px] transition-colors duration-150',
              item.id === activeId ? 'text-white/50' : 'text-white/20'
            ]">
              {{ item.id }}
            </span>
            <span :class="[
              'text-sm transition-colors duration-150',
              item.id === activeId ? 'font-semibold' : 'font-normal'
            ]">{{ item.label }}</span>
          </div>
          <span v-if="item.badge" class="font-mono text-[8px] uppercase tracking-wider text-white/15">
            {{ item.badge }}
          </span>
        </button>
      </div>

      <!-- Progress track — rendered after items to paint on top -->

      <!-- Full-height dim track line -->
      <div class="pointer-events-none absolute inset-y-0 left-5 w-px" style="background: rgba(255,255,255,0.12);" />

      <!-- Filled segment from top to active dot -->
      <div v-if="dotY >= 0"
        class="pointer-events-none absolute left-5 top-0 w-px transition-[height] duration-500 ease-out"
        :style="{ height: dotY + 'px', background: 'rgba(255,255,255,0.55)' }" />

      <!-- Active dot -->
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
  </aside>
</template>
