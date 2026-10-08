<script setup lang="ts">
import {
  finishes,
  type Finish,
  type TrackMount,
} from "../../../types/configurator"
import { getTrackPhoto } from "../../../composables/useTrackPhotos"

const props = defineProps<{ value: Finish; mount: TrackMount }>()
const emit = defineEmits<{ change: [value: Finish] }>()

const items: Finish[] = ["black", "white"]

function photoFor(finish: Finish) {
  return getTrackPhoto(props.mount, finish)
}
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <button
      v-for="key in items"
      :key="key"
      type="button"
      class="flex flex-col gap-2 rounded-md border p-2 text-left transition-colors duration-150"
      :class="
        value === key
          ? 'border-[#111111] bg-white'
          : 'border-[#dcdad3] bg-white hover:border-[#b9b7ae]'
      "
      @click="emit('change', key)"
    >
      <span class="aspect-square w-full overflow-hidden rounded bg-[#eeede7]">
        <img
          :src="photoFor(key)"
          :alt="finishes[key].label"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </span>

      <span class="text-[10px] text-[#111111]">
        {{ finishes[key].label }}
      </span>
    </button>
  </div>
</template>