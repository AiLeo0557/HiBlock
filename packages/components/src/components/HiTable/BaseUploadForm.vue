<script lang="ts" setup>
const { configs }: any = useAttrs()
const [formData, formItems] = useHiFormItems(configs.items)
defineExpose({ formData })
</script>
<template>
  <hi-form
    :inline="false"
    :items="formItems"
    :label-width="80"
    :defaultSpan="24"
    v-model:formData="formData"
    ref="$form"
  />
</template>
