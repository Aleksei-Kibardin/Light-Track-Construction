<script setup lang="ts">
import RangeSlider from "./RangeSlider.vue";

const props = defineProps<{ a: number; b: number; modelValue: number }>()

const emit = defineEmits<{
  'update:a': [value: number]
  'update:b': [value: number]
  "update:modelValue": [value: number]
}>()
</script>

<template>
  <section class="flex flex-col gap-2">
    <div
      class="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]"
    >
      <span>Длина сторон (М)</span>
      <span
        class="text-[11px] normal-case tracking-normal text-[#111111] tabular-nums"
      >
        A {{ props.a.toFixed(1) }} · B {{ props.b.toFixed(1) }}
      </span>
    </div>

    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <span class="w-4 text-[10px] text-[#8a8a82]">A</span>
        <RangeSlider
          :model-value="props.a"
          :min="0.5"
          :max="3"
          :step="0.1"
          aria-label="Длина стороны A"
          @update:model-value="emit('update:a', $event)"
        />
        <span class="w-10 text-right text-[10px] text-[#111111] tabular-nums">
          {{ props.a.toFixed(1) }} м
        </span>
      </div>

      <div class="flex items-center gap-3">
        <span class="w-4 text-[10px] text-[#8a8a82]">B</span>
        <RangeSlider
          :model-value="props.b"
          :min="0.5"
          :max="3"
          :step="0.1"
          aria-label="Длина стороны B"
          @update:model-value="emit('update:b', $event)"
        />
        <span class="w-10 text-right text-[10px] text-[#111111] tabular-nums">
          {{ props.b.toFixed(1) }} м
        </span>
      </div>
    </div>
    <label
      for="length"
      class="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]"
    >
      <span>Общая длина трека (м)</span>
      <span
        class="text-[11px] normal-case tracking-normal text-[#111111] tabular-nums"
      >
        {{ modelValue.toFixed(1) }} м
      </span>
    </label>

    <RangeSlider
      id="length"
      :model-value="modelValue"
      :min="1"
      :max="5"
      :step="0.1"
      :aria-value-text="`${modelValue.toFixed(1)} метра`"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <div
      class="mt-2.5 flex justify-between text-[10px] text-[#8a8a82] tabular-nums"
    >
      <span>1.0 м</span>
      <span>5.0 м</span>
    </div>
  </section>
</template>
