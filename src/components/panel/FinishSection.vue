<script setup lang="ts">
import { computed } from 'vue';
import { finishes, type Finish } from '../../types/configurator'

const props = defineProps<{ modelValue: Finish }>()
const emit = defineEmits<{ change: [value: Finish] }>()

const colorKeys: Finish[] = ['black', 'white', 'graphite']

const ruLabels: Record<Finish, string> = {
  black: 'Чёрный',
  white: 'Белый',
  graphite: 'Графит',
}
const currentLabel = computed(() => ruLabels[props.modelValue] ?? finishes[props.modelValue].label)

</script>

<template>
  <section class="flex flex-col">
    <div
      class="mb-3 flex items-baseline justify-between text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]"
    >
      <span>Цвет трека</span>
      <span class="text-[11px] normal-case tracking-normal text-[#111111]">
        {{ currentLabel }}
      </span>
    </div>

    <div class="flex gap-4">
      <button
        v-for="key in colorKeys"
        :key="key"
        type="button"
        class="relative h-10 w-10 rounded-full border border-transparent bg-transparent p-0 transition-[transform,border-color] duration-180 ease-out hover:scale-105"
        :class="modelValue === key ? 'border-[#111111]' : ''"
        :aria-label="finishes[key].label"
        :aria-pressed="modelValue === key"
        @click="emit('change', key)"
      >
        <span
          class="flex h-full w-full items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"
          :class="
            modelValue === key
              ? 'shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1),0_0_0_2px_#f6f5f1,0_0_0_3px_#111111]'
              : ''
          "
          :style="{ backgroundColor: finishes[key].swatch }"
        >
          <svg
            v-if="modelValue === key"
            viewBox="0 0 20 20"
            class="h-4 w-4"
            :class="key === 'white' ? 'text-[#111111]' : 'text-white'"
            aria-hidden="true"
          >
            <path
              d="m5 10 3 3 7-7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  </section>
</template>