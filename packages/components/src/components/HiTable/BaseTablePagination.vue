<script lang="ts" setup>
defineProps({
  index: {
    type: Number,
    default: 0
  }
})
</script>
<template>
  <div class="pagination-wrapper" :id="`paginationWrapper-${index}`"></div>
</template>
<style scoped>
.pagination-wrapper {
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-basis: 48px;
}
.pagination-wrapper:deep(.hi-pagination) {
  --hi-pagination-bg-color: #00000000;
}
.table-data-total {
  color: #ffffffcc;
  font-size: 14px;
  opacity: 0.8;
}
.pagination-wrapper:deep(.hi-pagination .btn-next),
.pagination-wrapper:deep(.hi-pagination .btn-prev) {
  background: none;
}
.pagination-wrapper:deep(.hi-pagination .hi-pager) {
  gap: 8px;
}
.pagination-wrapper:deep(.hi-pager li:not(.more)) {
  border: 1px solid #507ecd33;
}
.pagination-wrapper:deep(.hi-pager li:not(.more):hover) {
  border-color: var(--hi-border-color);
}
.pagination-wrapper:deep(.hi-pager li.is-active) {
  background: var(--hi-primary-gradient);
  color: #fffffff2;
  border: none;
  font-weight: 100;
}
.pagination-wrapper:deep(.hi-pagination .hi-select .hi-input) {
  width: 96px;
  --hi-input-border-color: #507ecd33;
}
.pagination-wrapper:deep(.hi-pagination .hi-select) {
  --hi-select-border-color-hover: var(--hi-border-color);
}
</style>
