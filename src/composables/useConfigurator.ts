import { computed, onScopeDispose, reactive, ref } from 'vue'
import type { ConfiguratorState } from '../types/configurator'

export function useConfigurator() {
  const state = reactive<ConfiguratorState>({
    trackType: 'line',
    length: 3.2,
    color: 'black',
    fixtures: 4,
    temperature: 3000,
    rotation: 0,
    fractions: false
  })

  const price = computed(() =>
    Math.round(14900 + state.length * 6500 + state.fixtures * 12300),
  )

  const formattedPrice = computed(() =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price.value),
  )

  const notice = ref('')
  let noticeTimer: ReturnType<typeof setTimeout> | undefined

  function update(patch: Partial<ConfiguratorState>) {
    Object.assign(state, patch)
  }

  function addToProject() {
    try {
      localStorage.setItem(
        'forma-project',
        JSON.stringify({
          configuration: { ...state },
          price: price.value,
          createdAt: new Date().toISOString(),
        }),
      )

      notice.value = 'Конфигурация сохранена на этом устройстве'
    } catch {
      notice.value = 'Браузер не разрешил локальное сохранение'
    }

    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      notice.value = ''
    }, 4000)
  }

  onScopeDispose(() => clearTimeout(noticeTimer))

  return { state, formattedPrice, notice, update, addToProject }
}