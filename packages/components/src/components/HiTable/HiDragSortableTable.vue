<script lang="ts" setup>
import { ElTable } from 'element-plus'
const props = defineProps({
  tableData: {
    type: Array,
    default: []
  },
  tableColumns: {
    type: Array,
    default: []
  }
})
const emits = defineEmits(['update:current_row_data'])
const onDragStart = (e: any) => {
  e.stopPropagation()
  tbody.value.ondragover = (ev: any) => {
    ev.preventDefault()
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = 'move'
    }
  }
  tbody.value.ondragenter = (ev: any) => {
    ev.preventDefault()
    if (ev.dataTransfer) {
      ev.dataTransfer.effectAllowed = 'move'
    }
  }
  const table_rows = tbody.value.querySelectorAll('tr')
  table_rows.forEach((tr_el: HTMLTableRowElement, n: number) => {
    tr_el.ondragover = () => {
      const item = props.tableData[current_index.value]
      if (n > current_index.value) {
        props.tableData.splice(n + 1, 0, item)
        props.tableData.splice(current_index.value, 1)
      } else if (n < current_index.value) {
        const start = n - 1 < 0 ? 0 : n
        props.tableData.splice(start, 0, item)
        props.tableData.splice(current_index.value + 1, 1)
      }
      current_index.value = n
    }
  })
}

const tbody = ref<any>(null)
const current_row = ref<any>(null)
const current_index = ref<number>(0)
const $table = ref<InstanceType<typeof ElTable>>()
const onRowClick = (...args: any) => {
  $table.value!.setCurrentRow(args[0])
}
const handleCurrentChange = (val: any) => {
  // current_row_data.value = val
  emits('update:current_row_data', val)
}
const onMouseEnter = (e: MouseEvent, i: number) => {
  current_index.value = i
  e.stopPropagation()
  if (!current_row.value) {
  }
  if (!tbody.value) {
  }
  current_row.value = e.currentTarget
  tbody.value = e.currentTarget
  while (!current_row.value.matches('tr.hi-table__row')) {
    if (current_row.value.matches('tr.hi-table__row')) {
      break
    }
    current_row.value = current_row.value!.parentNode
  }
  while (!tbody.value?.matches('tbody')) {
    if (tbody.value?.matches('tbody')) {
      break
    }
    tbody.value = tbody.value!.parentNode
  }
  current_row.value!.draggable = true
  current_row.value!.style.cursor = 'move'
  current_row.value!.ondragstart = onDragStart
}
</script>
<template>
  <el-table
    border
    size="small"
    ref="$table"
    class="data_table"
    :data="tableData"
    @row-click="onRowClick"
    :highlight-current-row="true"
    @current-change="handleCurrentChange"
  >
    <el-table-column v-bind="item" :key="item.prop" v-for="item in tableColumns">
      <template #default="scope">
        <div class="cell-padding" @mouseenter="onMouseEnter($event, scope.$index)">
          <component v-if="item?.default" v-bind="scope" :is="item.default"></component>
          <span v-else>
            {{ scope.row[scope.column.property] }}
          </span>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>
<style lang="scss" scoped>
.data_table:deep(th.hi-table__cell) {
  background-color: #0089b3;
  color: #fff;
}
.data_table:deep(.hi-table__body-wrapper .hi-table__cell),
.data_table:deep(.hi-table__body-wrapper .cell) {
  padding: 0 !important;
}
.cell-padding {
  padding: 0;
  min-height: 30px;
  line-height: 30px;
}
// .cell-padding span {
//   display: inline-block;
//   overflow: hidden;
//   padding: 0 5px;
//   width: 100%;
// }
.data_table:deep(.hi-table__row.current-row > td.hi-table__cell) {
  background-color: #0089b359;
}
.data_table:deep(.hi-switch) {
  height: 20px;
}
.data_table:deep(thead .cell) {
  padding: 2px 0;
  font-family: '微软雅黑';
  font-size: 14px;
}
.data_table:deep(td.hi-table__cell .hi-select__wrapper),
.data_table:deep(td.hi-table__cell .hi-input__wrapper) {
  box-shadow: none !important;
}
.data_table:deep(.hi-table__body tr:hover > td.hi-table__cell) {
  background-color: #0089b359;
}
</style>
