<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  foldCount?: number
  foldDuration?: number
  staggerDelay?: number
  foldAngle?: number
  perspective?: number
  shadowIntensity?: number
}>(), {
  foldCount: 3,
  foldDuration: 0.6,
  staggerDelay: 0.15,
  foldAngle: 180,
  perspective: 1000,
  shadowIntensity: 0.3
})

const emit = defineEmits<{
  unfold: []
  fold: []
}>()

const cardRef = ref<HTMLElement | null>(null)
const isUnfolded = ref(false)

const foldSegments = computed(() => {
  return Array.from({ length: props.foldCount }, (_, i) => ({
    id: i,
    isEven: i % 2 === 0
  }))
})

const segmentContent = [
  { icon: '◈', title: 'Design', desc: 'Crafted with precision' },
  { icon: '◇', title: 'Animate', desc: 'Fluid transitions' },
  { icon: '○', title: 'Interact', desc: 'Touch and respond' },
  { icon: '△', title: 'Create', desc: 'Build experiences' },
  { icon: '□', title: 'Explore', desc: 'Discover patterns' }
]

const getSegmentContent = (index: number) => {
  return segmentContent[index % segmentContent.length]!
}

const resetFolds = () => {
  if (!cardRef.value) return
  const segments = cardRef.value.querySelectorAll('.fold-segment')
  segments.forEach((segment, i) => {
    const inner = segment.querySelector('.fold-inner') as HTMLElement
    if (inner) {
      const direction = i % 2 === 0 ? -1 : 1
      gsap.set(inner, {
        rotateX: props.foldAngle * direction,
        opacity: 0
      })
    }
  })
}

const toggleFold = () => {
  if (!cardRef.value) return
  const segments = cardRef.value.querySelectorAll('.fold-segment')

  if (isUnfolded.value) {
    // Close
    const reversedSegments = Array.from(segments).reverse()
    reversedSegments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      if (inner) {
        const direction = (segments.length - 1 - i) % 2 === 0 ? -1 : 1
        gsap.to(inner, {
          rotateX: props.foldAngle * direction,
          opacity: 0,
          duration: props.foldDuration,
          delay: i * props.staggerDelay,
          ease: 'power3.inOut'
        })
      }
    })
    emit('fold')
  } else {
    // Open
    segments.forEach((segment, i) => {
      const inner = segment.querySelector('.fold-inner') as HTMLElement
      if (inner) {
        gsap.to(inner, {
          rotateX: 0,
          opacity: 1,
          duration: props.foldDuration,
          delay: i * props.staggerDelay,
          ease: 'power3.out'
        })
      }
    })
    emit('unfold')
  }

  isUnfolded.value = !isUnfolded.value
}

onMounted(() => {
  resetFolds()
})

watch(() => props.foldCount, () => {
  isUnfolded.value = false
  setTimeout(resetFolds, 0)
})

defineExpose({ toggleFold, isUnfolded, resetFolds })
</script>

<template>
  <div
ref="cardRef" class="origami-card mx-auto w-64 cursor-pointer" :style="{ perspective: `${perspective}px` }"
    @click="toggleFold">
    <div
v-for="segment in foldSegments" :key="segment.id" class="fold-segment relative"
      :style="{ transformStyle: 'preserve-3d', transformOrigin: 'top center' }">
      <div
        class="fold-inner backface-hidden flex items-center justify-center border-b border-white/10 bg-dark-800/80 px-4 py-6"
        :style="{
          transformStyle: 'preserve-3d',
          boxShadow: `0 ${shadowIntensity * 10}px ${shadowIntensity * 20}px rgba(0,0,0,${shadowIntensity})`
        }">
        <div class="text-center">
          <div class="mb-2 text-2xl">{{ getSegmentContent(segment.id).icon }}</div>
          <h3 class="font-mono text-sm font-medium text-white">{{ getSegmentContent(segment.id).title }}</h3>
          <p class="mt-1 font-mono text-xs text-white/40">{{ getSegmentContent(segment.id).desc }}</p>
        </div>
      </div>
    </div>

    <!-- Click hint -->
    <div class="mt-4 text-center font-mono text-xs text-white/40">
      Click to {{ isUnfolded ? 'fold' : 'unfold' }}
    </div>
  </div>
</template>

<style scoped>
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>
