<script lang="ts" setup>
const props = defineProps({
  targetdata: {
    type: Array as PropType<RemoteColumnOption[]>,
    default: []
  },
  sourcedata: {
    type: Array as PropType<RemoteColumnOption[]>,
    default: []
  }
})
</script>
<template>
  <hi-transfer :sourcedata="sourcedata" :targetdata="targetdata" />
</template>

<style lang="scss" scoped></style>
