import { ref } from 'vue'

export const fixtureModels = [
  { id: 'spot-07', label: 'Spot 07 · 7 W' },
  { id: 'spot-12', label: 'Spot 12 · 12 W' },
  { id: 'wash-20', label: 'Wash 20 · 20 W' },
  { id: 'grill-08', label: 'Grill 08 · 8 W' },
]

export const estimateItems = [
  { label: 'Трек 48 V', qty: '3.0 м', sum: '18 400 ₽' },
  { label: 'Светильник Spot 07', qty: '4 шт', sum: '12 800 ₽' },
  { label: 'Блок питания 48 V, 100 W', qty: '1 шт', sum: '4 200 ₽' },
  { label: 'Коннектор угловой', qty: '2 шт', sum: '1 600 ₽' },
  { label: 'Заглушка торцевая', qty: '2 шт', sum: '400 ₽' },
  { label: 'Монтажный комплект', qty: '1 компл', sum: '1 800 ₽' },
]

export const estimateTotal = '39 200 ₽'

export function usePanelMocks() {
  const selectedFixture = ref(fixtureModels[0].id)
  const sideA = ref(1.5)
  const sideB = ref(1.0)

  return { selectedFixture, sideA, sideB }
}