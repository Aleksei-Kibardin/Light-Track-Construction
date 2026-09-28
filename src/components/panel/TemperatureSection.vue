<script setup lang="ts">
import { computed } from 'vue'
import RangeSlider from './RangeSlider.vue'

const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const label = computed(() => {
  if (props.modelValue < 3000) return 'Тёплый'
  if (props.modelValue < 3700) return 'Мягкий тёплый'
  if (props.modelValue < 4500) return 'Нейтральный'
  return 'Прохладный'
})
</script>

<template>
  <section class="flex flex-col">
    <label
      for="temperature"
      class="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]"
    >
      <span>Температура света</span>
      <span class="text-[11px] normal-case tracking-normal text-[#111111] tabular-nums">
        {{ modelValue }} K
      </span>
    </label>

    <RangeSlider
      id="temperature"
      variant="temperature"
      :model-value="modelValue"
      :min="2700"
      :max="5000"
      :step="100"
      :aria-value-text="`${modelValue} кельвинов`"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <div class="mt-2.5 flex justify-between text-[10px] text-[#8a8a82] tabular-nums">
      <span>2700 K</span>
      <span class="text-[#4b4b45]">{{ label }}</span>
      <span>5000 K</span>
    </div>
  </section>
</template>