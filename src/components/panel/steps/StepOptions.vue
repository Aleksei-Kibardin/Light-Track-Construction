<script setup lang="ts">
import { type ConfiguratorState } from "../../../types/configurator";
import {
  estimateItems,
  estimateTotal,
  usePanelMocks,
} from "../../../composables/usePanelMocks";

import LengthSection from "../options/LengthSection.vue";
import FixturesSection from "../options/FixturesSection.vue";
import TemperatureSection from "../options/TemperatureSection.vue";

const props = defineProps<{
  state: ConfiguratorState;
  price: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{ change: [patch: Partial<ConfiguratorState>] }>();

const { sideA, sideB } = usePanelMocks();
</script>

<template>
  <div class="flex flex-col gap-7 p-3">
    <LengthSection
      :model-value="state.length"
      :a="sideA"
      :b="sideB"
      @update:model-value="emit('change', { length: $event })"
      @update:a="sideA = $event"
      @update:b="sideB = $event"
    />

    <FixturesSection
      :fixtures="props.state.fixtures"
      @add="
        emit('change', {
          fixtures: [...props.state.fixtures, $event],
        })
      "
      @remove="
        emit('change', {
          fixtures: props.state.fixtures.filter((_, i) => i !== $event),
        })
      "
    />

    <TemperatureSection
      :model-value="props.state.temperature"
      @update:model-value="emit('change', { temperature: $event })"
    />
  </div>
</template>
