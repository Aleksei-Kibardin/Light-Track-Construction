<script setup lang="ts">
const props = defineProps<{
  modelId: string
  count: number
  models: { id: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelId': [value: string]
  'update:count': [value: number]
}>()

function onSelect(event: Event) {
  emit('update:modelId', (event.target as HTMLSelectElement).value)
}

function dec() {
  if (props.count > 1) emit('update:count', props.count - 1)
}

function inc() {
  if (props.count < 8) emit('update:count', props.count + 1)
}

const currentLabel = () =>
  props.models.find((m) => m.id === props.modelId)?.label ?? ''
</script>

<template>
  <section class="flex flex-col gap-3">
    <label class="flex flex-col gap-2">
      <span class="text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]">
        Модель светильника
      </span>

      <div class="relative">
        <select
          :value="modelId"
          class="w-full appearance-none rounded-md border border-[#dcdad3] bg-white px-3 py-2.5 pr-9 text-[13px] text-[#111111] transition-colors duration-150 hover:border-[#b9b7ae] focus:border-[#111111] focus:outline-none"
          @change="onSelect"
        >
          <option v-for="m in models" :key="m.id" :value="m.id">
            {{ m.label }}
          </option>
        </select>

        <svg
          viewBox="0 0 20 20"
          class="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a8a82]"
          aria-hidden="true"
        >
          <path
            d="m6 8 4 4 4-4"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </label>

    <div class="flex flex-row items-center justify-between">
      <div>
        <p class="text-[13px] text-[#111111]">Светильники</p>
        <p class="mt-1.5 text-[10px] text-[#8a8a82]">{{ currentLabel() }}</p>
      </div>

      <div class="flex items-center overflow-hidden rounded-md border border-[#dcdad3] bg-white">
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center border-0 bg-transparent text-base leading-none text-[#4b4b45] transition-colors duration-150 hover:bg-[#f0efe9] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c9c7bf] disabled:hover:bg-transparent disabled:hover:text-[#c9c7bf]"
          aria-label="Убрать светильник"
          :disabled="count <= 1"
          @click="dec"
        >
          −
        </button>

        <output
          class="w-9 border-x border-[#dcdad3] text-center text-[13px] leading-9 text-[#111111] tabular-nums"
        >
          {{ count }}
        </output>

        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center border-0 bg-transparent text-base leading-none text-[#4b4b45] transition-colors duration-150 hover:bg-[#f0efe9] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c9c7bf] disabled:hover:bg-transparent disabled:hover:text-[#c9c7bf]"
          aria-label="Добавить светильник"
          :disabled="count >= 8"
          @click="inc"
        >
          +
        </button>
      </div>
    </div>
  </section>
</template>