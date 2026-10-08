<script setup lang="ts">
defineProps<{ current: number; total: number }>()
</script>

<template>
  <div class="mb-5 flex items-center gap-1.5">
    <span
      v-for="i in total"
      :key="i"
      class="h-[3px] flex-1 rounded-full transition-colors duration-300"
      :class="i - 1 <= current ? 'bg-[#111111]' : 'bg-[#dcdad3]'"
    />
  </div>
</template>