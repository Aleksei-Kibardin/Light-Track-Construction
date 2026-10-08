<script setup lang="ts">
import {
  TRACK_MOUNTS,
  type TrackMount,
} from "../../../types/configurator";
import { getTrackPhoto } from "../../../composables/useTrackPhotos";

const props = defineProps<{ value: TrackMount }>()
const emit = defineEmits<{ change: [value: TrackMount] }>();

const items = Object.keys(TRACK_MOUNTS) as TrackMount[];
function photoFor(trackType: TrackMount) {
  return getTrackPhoto(trackType, 'black');
}
</script>

<template>
  <div class="grid grid-cols-1 gap-3">
    <button
      v-for="key in items"
      :key="key"
      type="button"
      class="flex flex-col gap-3 rounded-md border bg-white p-3 text-left transition-colors duration-150"
      :class="
        value === key
          ? 'border-[#111111]'
          : 'border-[#dcdad3] hover:border-[#b9b7ae]'
      "
      @click="emit('change', key)"
    >
      <span
        class="flex h-22 w-full items-center justify-center overflow-hidden rounded bg-[#eeede7]"
      >
        <img
          :src="photoFor(key)"
          alt="световой трек"
          class="h-full w-full object-cover"
          loading="lazy"
        />
      </span>

      <span class="flex flex-col">
        <span class="text-[13px] text-[#111111]">
          {{ TRACK_MOUNTS[key].label }}
        </span>
        <span class="mt-0.5 text-[10px] text-[#8a8a82]">
          {{ TRACK_MOUNTS[key].hint }}
        </span>
      </span>
    </button>
  </div>
</template>
