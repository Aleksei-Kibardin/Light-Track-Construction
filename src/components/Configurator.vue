<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ConfigPanel from './ConfigPanel.vue'
import { useConfigurator } from '../composables/useConfigurator'
import { TrackScene } from '../three/TrackScene'

const { state, formattedPrice, notice, update, addToProject } =
  useConfigurator()

const host = ref<HTMLDivElement>()
const ready = ref(false)
const error = ref(false)
let scene: TrackScene | undefined

onMounted(() => {
  if (!host.value) return

  try {
    scene = new TrackScene(host.value, { ...state })
    ready.value = true
  } catch (cause) {
    console.error('Не удалось запустить 3D-сцену', cause)
    error.value = true
    host.value.replaceChildren()
  }
})

watch(state, (value) => scene?.update({ ...value }), {
  deep: true,
  flush: 'sync',
})

function rotate() {
  update({ rotation: state.rotation + 90 })
}

function reset() {
  update({ rotation: 0 })
  scene?.reset()
}

onBeforeUnmount(() => scene?.dispose())
</script>

<template>
  <div class="flex h-screen flex-col bg-[#f6f5f1] text-[#111111] antialiased">
    <header
      class="relative z-30 flex items-center gap-5 border-b border-[#e6e4dc] bg-[#f6f5f1]/85 px-8 py-5.5 backdrop-blur-md"
    >
      <a
        href="./"
        class="flex items-center gap-3 text-inherit no-underline"
        aria-label="FORMA — главная"
      >
        <span
          class="text-[20px] font-semibold tracking-[0.19em] text-[#111111]"
        >
          Конфигуратор
        </span>
      </a>

      <div class="flex items-center gap-4 text-[11px] text-[#8a8a82]">
        <span class="block h-3 w-px bg-[#d6d9d0]"></span>
        <span>Алексей</span>
      </div>
    </header>

    <main class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section
        class="relative min-h-[60vh] overflow-hidden bg-[#eeede7] lg:min-h-0"
        aria-label="Предпросмотр трекового освещения"
      >
        <div ref="host" class="absolute inset-0 h-screen"></div>

        <div
          class="pointer-events-none absolute left-7 top-8 z-10 max-w-[320px] md:left-10 md:top-10"
        >
          <p
            class="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#8a8a82]"
          >
            Конфигуратор трекового освещения
          </p>
          <p class="mt-3 max-w-57.5 text-[11px] leading-relaxed text-[#8a8a82]">
            Введите параметры — список комплектующих обновится автоматически
          </p>
        </div>

        <div
          class="pointer-events-none absolute right-7 top-10 z-10 hidden items-center gap-2 md:flex"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-[#ff3300]"></span>
          <span class="text-[9px] tracking-[0.12em] text-[#8a8a82]">LIVE 3D</span>
        </div>

        <Transition name="fade">
          <div
            v-if="!ready"
            class="absolute inset-0 z-20 flex items-center justify-center bg-[#eeede7]/95 px-8 text-center"
            role="status"
          >
            <div v-if="error">
              <p class="text-[18px] tracking-tight text-[#111111]">
                3D-предпросмотр недоступен
              </p>
              <p class="mt-3 max-w-[320px] text-[12px] leading-relaxed text-[#8a8a82]">
                Откройте страницу в браузере с поддержкой WebGL
                и включённым аппаратным ускорением.
              </p>
            </div>

            <div v-else class="flex flex-col items-center gap-4">
              <div class="loader"></div>
              <p class="text-[10px] uppercase tracking-[0.22em] text-[#8a8a82]">
                Подготавливаем свет
              </p>
            </div>
          </div>
        </Transition>

        <div
          class="pointer-events-none absolute bottom-8 left-7 z-10 md:left-10"
        >
          <div class="mb-2 flex items-center gap-2">
            <span class="text-[12px] font-medium tracking-tight text-[#111111]">
              Track 48
            </span>
            <span
              class="rounded border border-[#d3d8cd] px-1.5 py-0.5 text-[8px] tracking-[0.08em] text-[#8a8a82]"
            >
              {{ state.trackType.toUpperCase() }}
            </span>
          </div>

          <p class="text-[10px] text-[#8a8a82]">Алюминий · 48 V</p>
        </div>

        <div
          class="absolute bottom-23 left-1/2 z-10 -translate-x-1/2 sm:bottom-8"
        >
          <div
            class="flex items-center gap-1 rounded-full border border-[#dcdad3] bg-white/92 p-1.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] backdrop-blur-[10px]"
          >
            <button
              type="button"
              aria-label="Повернуть трек на 90 градусов"
              title="Повернуть трек на 90°"
              :disabled="!ready"
              class="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[#4b4b45] transition-colors duration-150 hover:not-disabled:bg-[#f0efe9] hover:not-disabled:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c9c7bf]"
              @click="rotate"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-4.5 w-4.5 fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
                aria-hidden="true"
              >
                <path d="M19 8a8 8 0 1 0 1 7M19 3v5h-5" />
              </svg>
            </button>

            <span class="block h-4 w-px bg-[#dcdad3]"></span>

            <button
              type="button"
              aria-label="Сбросить ракурс и положение"
              title="Сбросить ракурс и положение"
              :disabled="!ready"
              class="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[#4b4b45] transition-colors duration-150 hover:not-disabled:bg-[#f0efe9] hover:not-disabled:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c9c7bf]"
              @click="reset"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-4.5 w-4.5 fill-none stroke-current stroke-[1.6] [stroke-linecap:round] [stroke-linejoin:round]"
                aria-hidden="true"
              >
                <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 12h8m-4-4v8" />
              </svg>
            </button>
          </div>
        </div>

        <div
          class="pointer-events-none absolute bottom-8 right-7 z-10 hidden text-right text-[9px] leading-[1.8] text-[#8a8a82] xl:block"
        >
          <p>Удерживать за изделие — перемещение модели</p>
          <p>Удерживать за фон — смена ракурса</p>
          <p>Scroll — смена масштаба</p>
        </div>
      </section>

      <ConfigPanel
        :state="state"
        :price="formattedPrice"
        :disabled="!ready"
        @change="update"
        @add="addToProject"
      />
    </main>

    <Transition name="toast">
      <div
        v-if="notice"
        class="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center rounded-md border border-[#2a2a26] bg-[#111111] px-5.5 py-3.5 text-[13px] tracking-[-0.01em] text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]"
        role="status"
        aria-live="polite"
      >
        <span class="mr-3 text-[14px] text-[#aabc97]" aria-hidden="true">✓</span>
        {{ notice }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.loader {
  width: 28px;
  height: 28px;
  border: 2px solid #dcdad3;
  border-top-color: #111111;
  border-radius: 50%;
  animation: spin 900ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 320ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 280ms ease,
    transform 280ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>