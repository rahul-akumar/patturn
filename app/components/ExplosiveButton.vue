<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'

const props = withDefaults(defineProps<{
  particleCount?: number
  particleSize?: number
  explosionRadius?: number
  duration?: number
  gravity?: number
  spread?: number
  particleShape?: 'circle' | 'star' | 'heart' | 'spark' | 'square'
  colorScheme?: 'rainbow' | 'fire' | 'ocean' | 'nature' | 'sunset' | 'monochrome' | 'neon'
  buttonScale?: boolean
  trailEffect?: boolean
}>(), {
  particleCount: 20,
  particleSize: 8,
  explosionRadius: 120,
  duration: 0.8,
  gravity: 0.5,
  spread: 360,
  particleShape: 'circle',
  colorScheme: 'rainbow',
  buttonScale: true,
  trailEffect: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  explode: []
}>()

const buttonRef = ref<HTMLElement | null>(null)
const particleContainerRef = ref<HTMLElement | null>(null)

const colorSchemes: Record<string, string[]> = {
  rainbow: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff6b6b'],
  fire: ['#ff4757', '#ff6348', '#ff7f50', '#ffa502', '#ffb142', '#ffdd59'],
  ocean: ['#0abde3', '#48dbfb', '#00d2d3', '#01a3a4', '#74b9ff', '#a29bfe'],
  nature: ['#26de81', '#20bf6b', '#2bcbba', '#0fb9b1', '#fed330', '#f7b731'],
  sunset: ['#fc5c65', '#fd9644', '#fed330', '#f7b731', '#fa8231', '#eb3b5a'],
  monochrome: ['#ffffff', '#f1f2f6', '#dfe4ea', '#ced6e0', '#a4b0be', '#747d8c'],
  neon: ['#ff00ff', '#00ffff', '#ff00aa', '#00ff00', '#ffff00', '#ff3366']
}

const createParticle = (x: number, y: number, color: string): HTMLElement => {
  const particle = document.createElement('div')
  particle.className = 'particle'

  const size = props.particleSize + Math.random() * 4 - 2

  particle.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 100;
  `

  switch (props.particleShape) {
    case 'circle':
      particle.style.borderRadius = '50%'
      particle.style.backgroundColor = color
      break
    case 'square':
      particle.style.backgroundColor = color
      break
    case 'star':
      particle.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="${size * 2}" height="${size * 2}"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`
      particle.style.width = 'auto'
      particle.style.height = 'auto'
      break
    case 'heart':
      particle.innerHTML = `<svg viewBox="0 0 24 24" fill="${color}" width="${size * 2}" height="${size * 2}"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
      particle.style.width = 'auto'
      particle.style.height = 'auto'
      break
    case 'spark':
      particle.style.width = `${size / 2}px`
      particle.style.height = `${size * 2}px`
      particle.style.backgroundColor = color
      particle.style.borderRadius = '2px'
      break
  }

  return particle
}

const explode = (event: MouseEvent) => {
  emit('click', event)

  if (!buttonRef.value || !particleContainerRef.value) return

  const rect = buttonRef.value.getBoundingClientRect()
  const containerRect = particleContainerRef.value.getBoundingClientRect()

  const centerX = rect.left + rect.width / 2 - containerRect.left
  const centerY = rect.top + rect.height / 2 - containerRect.top

  const colors = colorSchemes[props.colorScheme] || colorSchemes.rainbow

  // Button squash animation - smoother and more elegant
  if (props.buttonScale) {
    gsap.timeline()
      .to(buttonRef.value, {
        scale: 0.95,
        duration: 0.08,
        ease: 'power2.in'
      })
      .to(buttonRef.value, {
        scale: 1.02,
        duration: 0.15,
        ease: 'power2.out'
      })
      .to(buttonRef.value, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      })
  }

  // Create particles
  for (let i = 0; i < props.particleCount; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)] as string
    const particle = createParticle(centerX, centerY, color)
    particleContainerRef.value.appendChild(particle)

    const spreadRad = (props.spread / 360) * Math.PI * 2
    const startAngle = -spreadRad / 2 - Math.PI / 2
    const angle = startAngle + Math.random() * spreadRad

    const velocity = props.explosionRadius * (0.5 + Math.random() * 0.5)
    const destX = Math.cos(angle) * velocity
    const destY = Math.sin(angle) * velocity + (props.gravity * velocity * 0.5)

    const rotation = Math.random() * 720 - 360
    const scale = Math.random() * 0.5 + 0.5

    gsap.to(particle, {
      x: destX,
      y: destY,
      rotation: rotation,
      scale: scale,
      duration: props.duration * 0.3,
      ease: 'power2.out'
    })

    gsap.to(particle, {
      y: `+=${props.gravity * 50}`,
      opacity: 0,
      scale: 0,
      duration: props.duration * 0.7,
      delay: props.duration * 0.3,
      ease: 'power2.in',
      onComplete: () => particle.remove()
    })
  }

  emit('explode')
}
</script>

<template>
  <div ref="particleContainerRef" class="relative inline-block">
    <button
ref="buttonRef"
      class="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-mono text-sm uppercase tracking-widest text-white transition-colors hover:border-white/40 hover:bg-white/10"
      @click="explode">
      <slot>
        Click Me
      </slot>
    </button>
  </div>
</template>
