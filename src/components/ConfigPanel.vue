<script setup lang="ts">
import { computed, ref } from "vue";
import { finishes, type ConfiguratorState } from "../types/configurator";
import {
  useWizard,
  WIZARD_STEPS,
  type WizardStep,
} from "../composables/useWizard";

import WizardProgress from "./panel/options/WizardProgress.vue";
import StepMount from "./panel/steps/StepMount.vue";
import StepColor from "./panel/steps/StepColor.vue";
import StepShape from "./panel/steps/StepShape.vue";
import StepOptions from "./panel/steps/StepOptions.vue";

const props = defineProps<{
  state: ConfiguratorState;
  price: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [patch: Partial<ConfiguratorState>];
  add: [];
}>();

const { step, index, isFirst, isLast, next, prev } = useWizard();

const direction = ref<"forward" | "back">("forward");

const stepTransition = computed(() =>
  direction.value === "forward" ? "step-forward" : "step-back",
);

function goNext() {
  direction.value = "forward";
  next();
}

function goPrev() {
  direction.value = "back";
  prev();
}

const stepTitle = computed(() => {
  const titles: Record<WizardStep, string> = {
    mount: "Тип монтажа",
    color: "Цвет",
    shape: "Форма трека",
    options: "Настройки",
  };
  return titles[step.value];
});
</script>

<template>
  <aside
    class="flex h-full w-full max-w-[400px] flex-col overflow-hidden bg-[#fff] p-8 text-[13px] leading-[1.4] text-[#111111] antialiased [font-feature-settings:'ss01','cv11','tnum'] max-[480px]:max-w-full max-[480px]:p-5"
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

    <WizardProgress :current="index" :total="WIZARD_STEPS.length" />

    <Transition :name="stepTransition" mode="out-in">
      <h3
        :key="step"
        class="mb-5 text-[18px] font-medium leading-none tracking-[-0.045em]"
      >
        {{ stepTitle }}
      </h3>
    </Transition>

    <div class="relative min-h-0 flex-1 overflow-hidden">
      <Transition :name="stepTransition" mode="out-in">
        <div :key="step" class="h-full overflow-y-auto pr-1">
          <StepMount
            v-if="step === 'mount'"
            :value="state.mount"
            @change="emit('change', { mount: $event })"
          />

          <StepColor
            v-else-if="step === 'color'"
            :value="state.color"
            :mount="state.mount"
            @change="emit('change', { color: $event })"
          />

          <StepShape
            v-else-if="step === 'shape'"
            :value="state.trackType"
            @change="emit('change', { trackType: $event })"
          />

          <StepOptions
            v-else-if="step === 'options'"
            :state="state"
            :price="price"
            :disabled="disabled"
            @change="emit('change', $event)"
          />
        </div>
      </Transition>
    </div>

    <div class="mt-auto flex flex-col gap-3 pt-6">
      <div class="flex items-center gap-2">
        <button
          v-if="!isFirst"
          type="button"
          class="flex h-11 flex-1 items-center justify-center rounded-md border border-[#dcdad3] bg-transparent text-[11px] uppercase tracking-[0.14em] text-[#4b4b45] transition-colors duration-150 hover:border-[#b9b7ae] hover:text-[#111111]"
          @click="goPrev"
        >
          Назад
        </button>

        <button
          v-if="!isLast"
          type="button"
          class="group flex h-11 flex-[2] items-center justify-between rounded-md border-0 bg-[#111111] px-5 text-[11px] uppercase tracking-[0.14em] text-white transition-colors duration-150 hover:bg-black disabled:cursor-not-allowed disabled:bg-[#c9c7bf]"
          :disabled="disabled"
          @click="goNext"
        >
          <span>Далее</span>
          <span
            class="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  will-change: transform, opacity, filter;
}

.step-forward-enter-active,
.step-back-enter-active {
  transition:
    opacity 340ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 340ms ease;
}

.step-forward-leave-active,
.step-back-leave-active {
  transition:
    opacity 220ms cubic-bezier(0.4, 0, 1, 1),
    transform 280ms cubic-bezier(0.4, 0, 1, 1),
    filter 220ms ease;
}

.step-forward-enter-from {
  opacity: 0;
  transform: translateX(32px);
  filter: blur(6px);
}

.step-forward-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.96);
  filter: blur(8px);
}

.step-forward-enter-from {
  opacity: 0;
  transform: translateY(32px);
  filter: blur(8px);
}

.step-back-leave-to {
  opacity: 0;
  transform: translateX(36px);
  filter: blur(6px);
}
</style>
