<script setup lang="ts">
import type { ConfiguratorState } from "../types/configurator";
import {
  estimateItems,
  estimateTotal,
  fixtureModels,
  usePanelMocks,
} from "../composables/usePanelMocks";

import ShapeSection from "./panel/ShapeSection.vue";
import LengthSection from "./panel/LengthSection.vue";
import FinishSection from "./panel/FinishSection.vue";
import FixturesSection from "./panel/FixturesSection.vue";
import TemperatureSection from "./panel/TemperatureSection.vue";
import Details from "./panel/Details.vue";

const props = defineProps<{
  state: ConfiguratorState;
  price: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [patch: Partial<ConfiguratorState>];
  add: [];
}>();

const { selectedFixture, sideA, sideB } = usePanelMocks();
</script>

<template>
  <aside
    class="flex h-full w-full max-w-100 flex-col overflow-y-auto bg-[#f6f5f1] p-8 text-[13px] leading-[1.4] text-[#111111] antialiased [font-features-['ss01','cv11','tnum']] max-[480px]:max-w-full max-[480px]:p-5"
  >
    <header class="mb-9 flex items-start justify-between">
      <div>
        <h2
          class="text-[25px] font-medium leading-none tracking-[-0.055em] text-[#111111] max-[480px]:text-[22px]"
        >
          Конфигурация
        </h2>
      </div>

      <span
        class="rounded border border-[#dcdad3] px-2 py-1 text-[10px] tracking-[0.08em] text-[#8a8a82]"
      >
        48 V
      </span>
    </header>

    <fieldset
      :disabled="disabled"
      class="m-0 flex flex-col gap-7 border-0 p-0 disabled:opacity-50"
    >
      <legend class="sr-only">Настройки трековой системы</legend>

      <ShapeSection
        :model-value="state.trackType"
        @change="emit('change', { trackType: $event })"
      />

      <LengthSection
        :model-value="state.length"
        :a="sideA"
        :b="sideB"
        @update:model-value="emit('change', { length: $event })"
        @update:a="sideA = $event"
        @update:b="sideB = $event"
      />

      <FinishSection
        :model-value="state.color"
        @change="emit('change', { color: $event })"
      />

      <FixturesSection
        :model-id="selectedFixture"
        :count="state.fixtures"
        :models="fixtureModels"
        @update:model-id="selectedFixture = $event"
        @update:count="emit('change', { fixtures: $event })"
      />

      <TemperatureSection
        :model-value="state.temperature"
        @update:model-value="emit('change', { temperature: $event })"
      />
    </fieldset>

    <Details
      :state="state"
      :price="price"
      :disabled="disabled"
      :estimate="estimateItems"
      :estimate-total="estimateTotal"
      @add="emit('add')"
    />
  </aside>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.config-panel :focus-visible,
:deep(.range):focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #f6f5f1,
    0 0 0 4px #111111;
  border-radius: 6px;
}
</style>
