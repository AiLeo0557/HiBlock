<script setup lang="ts">
import { ref } from '@vue/runtime-core';

const baseTableRef = ref<any>(null)
defineExpose({
  baseTableRef
})
</script>
<template>
  <div class="table-with-map-wrapper">
    <slot></slot>
    <base-table ref="baseTableRef" v-bind="$attrs" />
  </div>
  <base-table-pagination :index="$attrs.index" v-if="!$attrs?.pagination_config?.hidden" />
</template>
<style lang="scss" scoped>
@use '~/styles/mixins' as *;
.table-with-map-wrapper {
  flex: 1;
  /** 2024-11-29 md-multi-dimension-presentation 煤电联动 */
  height: 100%;
  display: flex;
}
.table-with-map-wrapper:deep(.map-wrapper) {
  width: 568px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 568px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  border: 1px solid #1f9acf;
  overflow: hidden;
}
.hi-table-wrapper {
  @include use-flex-layout();
}
.hi-table-wrapper:deep(.hi-tabs) {
  --hi-tabs-header-height: 32px;
  @include use-flex-layout();
}
.hi-table-wrapper:deep(.hi-tabs__content) {
  @include use-flex-layout();
}
.hi-table-wrapper:deep(.hi-tab-pane) {
  @include use-flex-layout();
}
.hi-table-wrapper:deep(.hi-tabs__header) {
  margin: 0;
}
.hi-table-wrapper:deep(.hi-tabs__nav-scroll) {
  padding: 0 20px;
}
.hi-table-wrapper:deep(.hi-tabs__header) {
  margin-bottom: 16px;
}
.hi-table-wrapper:deep(.hi-tabs__item:hover),
.hi-table-wrapper:deep(.hi-tabs__item.is-active) {
  color: #00c2fe;
}
.hi-table-wrapper:deep(.hi-tabs__active-bar) {
  background: #00c2fe;
}
.hi-table-wrapper:deep(.hi-tabs__nav-wrap::after) {
  background: #185387;
}
.hi-table-wrapper:deep(.hi-tabs__item) {
  color: #ffffff99;
}

// 翻页相关样式
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
