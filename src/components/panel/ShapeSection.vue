<script setup lang="ts">
import type { TrackType } from '../../types/configurator'

defineProps<{ modelValue: TrackType }>()

const emit = defineEmits<{
  change: [type: TrackType]
}>()

const shapes: { type: TrackType; name: string; path: string }[] = [
  { type: 'line', name: 'Линия', path: 'M5 15H27' },
  { type: 'l', name: 'Угол', path: 'M6 7H25V24' },
  { type: 'u', name: 'U-тип', path: 'M6 24V7H26V24' },
  { type: 'p', name: 'Прямоугольник', path: 'M8 8H24V24H8Z' },
]
</script>

<template>
  <section class="flex flex-col">
    <div
      class="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]"
    >
      <span>Форма трека</span>
    </div>

    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="shape in shapes"
        :key="shape.type"
        type="button"
                    class="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-[#dcdad3] bg-transparent text-[#8a8a82] transition-[border-color,color,background-color,transform] duration-180 ease-out hover:border-[#b9b7ae] hover:text-black"
        :class="
          modelValue === shape.type ? 'border-black bg-black text-black' : ''
        "
        :aria-pressed="modelValue === shape.type"
        :aria-label="`Форма ${shape.name}`"
        @click="emit('change', shape.type)"
      >
        <svg
          viewBox="0 0 32 32"
          class="h-7 w-7 transition-colors duration-180"
          :class="modelValue === shape.type ? 'text-black' : ''"
          aria-hidden="true"
        >
          <path
            :d="shape.path"
            fill="none"
            stroke="currentColor"
            stroke-width="2.3"
            stroke-linecap="square"
            stroke-linejoin="miter"
          />
        </svg>
        <span class="text-[9px] tracking-[0.12em]">{{ shape.name }}</span>
      </button>
    </div>
  </section>
</template>