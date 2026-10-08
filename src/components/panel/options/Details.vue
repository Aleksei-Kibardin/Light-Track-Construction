<script setup lang="ts">
import { ref } from "vue";
import { finishes, type ConfiguratorState } from "../../../types/configurator";

defineProps<{
  state: ConfiguratorState;
  price: string;
  disabled?: boolean;
  estimate: { label: string; qty: string; sum: string }[];
  estimateTotal: string;
}>();

const emit = defineEmits<{ add: [] }>();

const open = ref(false);
</script>

<template>
  <footer class="mt-auto">
    <div
      class="flex items-center justify-between pt-5 text-[10px] uppercase tracking-[0.14em] text-[#8a8a82]"
    >
      <span>Ваша конфигурация световой системы:</span>
      <span>
        {{ state.trackType.toUpperCase() }} / {{ finishes[state.color].label }}
      </span>
    </div>

    <details
      :open="open"
      class="group mt-6 rounded-md border border-[#dcdad3] bg-white/60"
      @toggle="open = ($event.target as HTMLDetailsElement).open"
    >
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#8a8a82] transition-colors duration-150 hover:text-[#4b4b45] [&::-webkit-details-marker]:hidden"
      >
        <span class="flex items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            class="h-3 w-3 transition-transform duration-300 group-open:rotate-90"
            aria-hidden="true"
          >
            <path
              d="m4 2 4 4-4 4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>Смета</span>
        </span>

        <span class="text-[11px] normal-case tracking-normal text-[#111111] tabular-nums">
          {{ price }}
        </span>
      </summary>

      <div class="details-body">
        <div class="border-t border-[#e6e4dc]">
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

          <div
            class="flex items-center justify-between border-t border-[#e6e4dc] px-4 py-3"
          >
            <span
              class="text-[10px] uppercase tracking-[0.14em] text-[#8a8a82]"
            >
              Подытог
            </span>
            <span class="text-[13px] text-[#111111] tabular-nums">
              {{ estimateTotal }}
            </span>
          </div>
        </div>
      </div>
    </details>

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
      class="group/btn flex w-full items-center justify-between rounded-md border-0 bg-[#111111] px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-white transition-[background-color,transform] duration-180 ease-out hover:-translate-y-px hover:bg-black active:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#c9c7bf] disabled:text-white/85 disabled:hover:translate-y-0 disabled:hover:bg-[#c9c7bf]"
      :disabled="disabled"
      @click="emit('add')"
    >
      <span>Добавить в проект</span>
      <span
        class="text-base transition-transform duration-180 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
        aria-hidden="true"
        >↗</span
      >
    </button>
  </footer>
</template>

<style scoped>
summary {
  outline: none;
}

summary:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px #111111;
  border-radius: 6px;
}

.details-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 320ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.details-body > * {
  overflow: hidden;
  min-height: 0;
}

details[open] .details-body {
  grid-template-rows: 1fr;
}

.details-body > * > * {
  opacity: 0;
  transform: translateY(-6px);
  transition:
    opacity 240ms ease 60ms,
    transform 280ms cubic-bezier(0.25, 0.1, 0.25, 1) 60ms;
}

details[open] .details-body > * > * {
  opacity: 1;
  transform: translateY(0);
}
</style>