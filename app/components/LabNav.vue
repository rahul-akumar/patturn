<script setup lang="ts">
const route = useRoute()

const components = [
  {
    id: '001',
    slug: 'magnetic-button',
    title: 'Magnetic Button',
    status: 'ready'
  },
  {
    id: '002',
    slug: 'fluid-cursor',
    title: 'Fluid Cursor',
    status: 'ready'
  },
  {
    id: '003',
    slug: 'liquid-glass',
    title: 'Liquid Glass',
    status: 'ready'
  },
  {
    id: '004',
    slug: 'liquid-metal',
    title: 'Liquid Metal',
    status: 'ready'
  },
  {
    id: '005',
    slug: 'flip-card',
    title: 'Flip Card',
    status: 'ready'
  },
  {
    id: '006',
    slug: 'explosive-button',
    title: 'Explosive Button',
    status: 'ready'
  },
  {
    id: '007',
    slug: 'intelligent-input',
    title: 'Intelligent Input',
    status: 'ready'
  },
  {
    id: '008',
    slug: 'origami-card',
    title: 'Origami Card',
    status: 'ready'
  },
  {
    id: '009',
    slug: 'gesture-ripple',
    title: 'Gesture Ripple',
    status: 'ready'
  },
  {
    id: '010',
    slug: 'toast-stack',
    title: 'Toast Stack',
    status: 'ready'
  },
  {
    id: '011',
    slug: 'radial-menu',
    title: 'Radial Menu',
    status: 'ready'
  },
  {
    id: '012',
    slug: 'pie-menu',
    title: 'Pie Menu',
    status: 'ready'
  },
  {
    id: '013',
    slug: 'ambient-progress',
    title: 'Ambient Progress',
    status: 'ready'
  },
  {
    id: '014',
    slug: 'morphing-shapes',
    title: 'Morphing Shapes',
    status: 'soon'
  },
  {
    id: '015',
    slug: 'scroll-velocity',
    title: 'Scroll Velocity',
    status: 'soon'
  },
  {
    id: '016',
    slug: '3d-card',
    title: '3D Card Tilt',
    status: 'soon'
  }
]

const isActive = (slug: string) => {
  return route.path === `/lab/${slug}`
}
</script>

<template>
  <aside class="flex h-full w-64 shrink-0 flex-col border-r border-white/10 bg-dark-900">
    <!-- Title -->
    <div class="flex h-[53px] items-center border-b border-white/10 px-5">
      <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Components</span>
    </div>

    <!-- Component List -->
    <nav class="flex-1 overflow-y-auto py-4">
      <div class="px-3">
        <NuxtLink
          v-for="component in components"
          :key="component.id"
          :to="component.status === 'ready' ? `/lab/${component.slug}` : '/lab'"
          :class="[
            'group mb-1 flex items-center justify-between rounded px-3 py-2.5 transition-all',
            isActive(component.slug) 
              ? 'bg-white text-dark-900' 
              : component.status === 'ready'
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'cursor-not-allowed text-white/30'
          ]"
        >
          <div class="flex items-center gap-3">
            <span :class="['font-mono text-[10px]', isActive(component.slug) ? 'text-dark-900/50' : 'text-white/30']">
              {{ component.id }}
            </span>
            <span class="text-sm font-medium">{{ component.title }}</span>
          </div>
          <span
            v-if="!isActive(component.slug) && component.status !== 'ready'"
            :class="[
              'font-mono text-[8px] uppercase tracking-wider',
              component.status === 'active' ? 'text-yellow-500' : 'text-white/20'
            ]"
          >
            {{ component.status }}
          </span>
        </NuxtLink>
      </div>
    </nav>

    <!-- Footer -->
    <div class="border-t border-white/10 px-5 py-4">
      <span class="font-mono text-[10px] text-white/30">Patturn v0.0.1</span>
    </div>
  </aside>
</template>
