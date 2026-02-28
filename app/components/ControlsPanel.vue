<script setup lang="ts">
import type { Component } from 'vue'
import { CircleOff, Star, Sparkles, ArrowRight, MessageCircle } from 'lucide-vue-next'
import type { ControlConfig } from '~/composables/useComponentRegistry'
import PointerEyeIcon from '~/components/icons/PointerEyeIcon.vue'

const props = defineProps<{
  controls: ControlConfig[]
  modelValue: Record<string, unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
}>()

const updateValue = (key: string, value: unknown) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

// Group controls by their group property
const groupedControls = computed(() => {
  const groups: Record<string, ControlConfig[]> = {}
  props.controls.forEach(control => {
    const group = control.group || 'General'
    if (!groups[group]) groups[group] = []
    groups[group].push(control)
  })
  return groups
})

const iconOptionMap: Record<string, Component> = {
  none: CircleOff,
  star: Star,
  sparkles: Sparkles,
  'arrow-right': ArrowRight,
  'message-circle': MessageCircle,
  eye: PointerEyeIcon
}
</script>

<template>
  <div class="space-y-6">
    <!-- Control Groups -->
    <div v-for="(groupControls, groupName) in groupedControls" :key="groupName" class="space-y-4">
      <h3 class="font-mono text-sm font-medium text-white/60">{{ groupName }}</h3>

      <div class="grid gap-4 md:grid-cols-2">
        <template v-for="control in groupControls" :key="control.key">
          <!-- Slider Control -->
          <div v-if="control.type === 'slider'" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="font-mono text-xs text-white/60">{{ control.label }}</label>
              <span class="font-mono text-xs text-white/40">{{ modelValue[control.key] }}</span>
            </div>
            <input type="range" :min="control.min" :max="control.max" :step="control.step"
              :value="modelValue[control.key] ?? control.default" class="w-full"
              @input="updateValue(control.key, parseFloat(($event.target as HTMLInputElement).value))">
          </div>

          <!-- Select Control -->
          <div v-else-if="control.type === 'select'" class="space-y-2">
            <label class="font-mono text-xs text-white/60">{{ control.label }}</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="opt in control.options" :key="String(opt.value)" :class="[
                'border transition-colors',
                control.key === 'icon'
                  ? 'flex h-9 w-9 items-center justify-center p-0'
                  : 'px-3 py-2 font-mono text-xs',
                modelValue[control.key] === opt.value
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/20 text-white/40 hover:border-white/40'
              ]" :title="control.key === 'icon' ? String(opt.label) : undefined"
                @click="updateValue(control.key, opt.value)">
                <component :is="iconOptionMap[String(opt.value)]"
                  v-if="control.key === 'icon' && iconOptionMap[String(opt.value)]" class="h-3.5 w-3.5" />
                <template v-else>
                  {{ opt.label }}
                </template>
              </button>
            </div>
          </div>

          <!-- Toggle Control -->
          <div v-else-if="control.type === 'toggle'" class="space-y-2">
            <label class="font-mono text-xs text-white/60">{{ control.label }}</label>
            <div class="flex gap-2">
              <button :class="[
                'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                modelValue[control.key]
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/20 text-white/40 hover:border-white/40'
              ]" @click="updateValue(control.key, true)">
                Yes
              </button>
              <button :class="[
                'flex-1 border px-3 py-2 font-mono text-xs transition-colors',
                !modelValue[control.key]
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/20 text-white/40 hover:border-white/40'
              ]" @click="updateValue(control.key, false)">
                No
              </button>
            </div>
          </div>

          <!-- Color Control -->
          <div v-else-if="control.type === 'color'" class="space-y-2">
            <label class="font-mono text-xs text-white/60">{{ control.label }}</label>
            <div class="flex gap-2">
              <button v-for="opt in control.options" :key="String(opt.value)" :class="[
                'flex h-9 w-9 items-center justify-center border transition-all',
                modelValue[control.key] === opt.value
                  ? 'border-white ring-2 ring-white/50'
                  : 'border-white/20 hover:border-white/40'
              ]" :title="String(opt.label)" @click="updateValue(control.key, opt.value)">
                <span class="h-5 w-5 rounded-full" :style="{ backgroundColor: String(opt.value) }" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
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
