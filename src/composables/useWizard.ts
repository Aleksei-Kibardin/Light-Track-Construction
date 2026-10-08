import { computed, ref } from "vue"

export const WIZARD_STEPS = ["mount", "color", "shape", "options"] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

const step = ref<WizardStep>("mount")

export function useWizard() {
  const index = computed(() => WIZARD_STEPS.indexOf(step.value))
  const isFirst = computed(() => index.value === 0)
  const isLast = computed(() => index.value === WIZARD_STEPS.length - 1)

  function next() {
    if (!isLast.value) step.value = WIZARD_STEPS[index.value + 1]
  }

  function prev() {
    if (!isFirst.value) step.value = WIZARD_STEPS[index.value - 1]
  }

  function goTo(target: WizardStep) {
    step.value = target
  }

  function reset() {
    step.value = "mount"
  }

  return { step, index, isFirst, isLast, next, prev, goTo, reset }
}