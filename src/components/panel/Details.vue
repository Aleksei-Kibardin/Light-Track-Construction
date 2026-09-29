<script setup lang="ts">
import { finishes, type ConfiguratorState } from "../../types/configurator";

defineProps<{
  state: ConfiguratorState;
  price: string;
  disabled?: boolean;
  estimate: { label: string; qty: string; sum: string }[];
  estimateTotal: string;
}>();

const emit = defineEmits<{ add: [] }>();
</script>

<template>
  <footer class="mt-auto pt-8">
    <div
      class="flex items-center justify-between border-t border-[#dcdad3] pt-5 text-[10px] uppercase tracking-[0.14em] text-[#8a8a82]"
    >
      <span>Ваша конфигурация световой системы:</span>
      <span>
        {{ state.trackType.toUpperCase() }} / {{ finishes[state.color].label }}
      </span>
    </div>

    <div class="mt-6 rounded-md border border-[#dcdad3] bg-white/60">
      <div
        class="flex items-center justify-between border-b border-[#e6e4dc] px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#8a8a82]"
      >
        <span>Смета</span>
      </div>
      <ul class="flex flex-col">
        <li
          v-for="(item, i) in estimate"
          :key="i"
          class="flex items-center justify-between gap-3 border-b border-[#f0efe9] px-4 py-2.5 text-[12px] last:border-b-0"
        >
          <span class="flex min-w-0 flex-col">
            <span class="truncate text-[#111111]">{{ item.label }}</span>
            <span class="mt-0.5 text-[10px] text-[#8a8a82]">{{
              item.qty
            }}</span>
          </span>
          <span class="shrink-0 text-[#111111] tabular-nums">{{
            item.sum
          }}</span>
        </li>
      </ul>
    </div>

    <div class="mt-6 mb-5 flex items-center justify-center gap-[30%]">
      <span>ИТОГО с НДС 22%:</span>
      <p
        class="text-[31px] leading-none tracking-[-0.06em] text-[#111111] tabular-nums max-[480px]:text-[26px]"
      >
        {{ price }}
      </p>
    </div>

    <button
      type="button"
      class="group flex w-full items-center justify-between rounded-md border-0 bg-[#111111] px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-white transition-[background-color,transform] duration-180 ease-out hover:-translate-y-px hover:bg-black active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#c9c7bf] disabled:text-white/85 disabled:hover:translate-y-0 disabled:hover:bg-[#c9c7bf]"
      :disabled="disabled"
      @click="emit('add')"
    >
      <span>Добавить в проект</span>
      <span
        class="text-base transition-transform duration-180 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        aria-hidden="true"
        >↗</span
      >
    </button>

    <p class="mt-3 text-center text-[9px] leading-relaxed text-[#8a8a82]">
      Демо-конфигурация · сохраняется только на этом устройстве
    </p>
  </footer>
</template>
