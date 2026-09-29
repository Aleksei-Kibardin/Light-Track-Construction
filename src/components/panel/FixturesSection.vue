<script setup lang="ts">
import {
  FIXTURE_TYPES,
  MAX_FIXTURES,
  type FixtureType,
} from "../../types/configurator"

const props = defineProps<{
  fixtures: FixtureType[]
}>()

const emit = defineEmits<{
  add: [type: FixtureType]
  remove: [index: number]
}>()

const types = Object.keys(FIXTURE_TYPES) as FixtureType[]

function add(type: FixtureType) {
  if (props.fixtures.length >= MAX_FIXTURES) return
  emit("add", type)
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between">
      <span class="text-[11px] uppercase tracking-[0.14em] text-[#4b4b45]">
        Светильники
      </span>
      <span class="text-[11px] text-[#111111] tabular-nums">
        {{ fixtures.length }} / {{ MAX_FIXTURES }}
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="type in types"
        :key="type"
        type="button"
        :disabled="fixtures.length >= MAX_FIXTURES"
        class="flex flex-col items-start gap-0.5 rounded-md border border-[#dcdad3] bg-white px-3 py-2.5 text-left transition-colors duration-150 hover:border-[#b9b7ae] disabled:cursor-not-allowed disabled:opacity-40"
        @click="add(type)"
      >
        <span class="text-[10px] uppercase tracking-[0.14em] text-[#8a8a82]">
          Добавить
        </span>
        <span class="text-[12px] text-[#111111]">
          {{ FIXTURE_TYPES[type].label }}
        </span>
      </button>
    </div>

    <ul v-if="fixtures.length" class="flex flex-col gap-1">
      <li
        v-for="(type, i) in fixtures"
        :key="i"
        class="flex items-center justify-between gap-3 rounded-md border border-[#f0efe9] bg-[#faf9f5] px-3 py-2 text-[12px]"
      >
        <span class="flex items-center gap-2 text-[#111111]">
          <span class="h-1.5 w-1.5 rounded-full bg-[#111111]"></span>
          {{ FIXTURE_TYPES[type].label }}
        </span>

        <button
          type="button"
          :disabled="fixtures.length <= 1"
          aria-label="Удалить светильник"
          class="flex h-6 w-6 items-center justify-center rounded-full border-0 bg-transparent text-[14px] leading-none text-[#8a8a82] transition-colors duration-150 hover:bg-[#f0efe9] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#8a8a82]"
          @click="emit('remove', i)"
        >
          ×
        </button>
      </li>
    </ul>
  </section>
</template>