<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min: number
  max: number
  step?: number
  id?: string
  ariaLabel?: string
  ariaValueText?: string
  variant?: 'default' | 'temperature'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(event: Event) {
  emit('update:modelValue', Number((event.target as HTMLInputElement).value))
}

function style() {
  const { modelValue, min, max } = props
  const progress = ((modelValue - min) / (max - min)) * 100
  return { '--progress': `${progress}%` }
}
</script>

<template>
  <input
    :id="id"
    class="range"
    :class="variant === 'temperature' ? 'range-temperature' : ''"
    type="range"
    :min="min"
    :max="max"
    :step="step ?? 1"
    :value="modelValue"
    :style="style()"
    :aria-label="ariaLabel"
    :aria-valuetext="ariaValueText"
    @input="onInput"
  />
</template>