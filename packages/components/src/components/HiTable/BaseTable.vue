<script lang="ts" setup>
import {computed, defineOptions, inject, nextTick, onMounted, PropType, reactive, ref, toRef, useAttrs, watch} from '@vue/runtime-core'
defineOptions({
  inheritAttrs: false
})
const props = defineProps({
  tableHeight: {
    type: Number
  },
  actions: {
    type: Array as PropType<HiTableAction[]>
  },
  data_config: {
    type: Object as PropType<HiTableDataConfig<any>>,
    default: {}
  },
  pagination_config: {
    type: Object as PropType<HiPaginationConfig>,
    default: {
      page_current: 1,
      page_size: 25,
      page_sizes: [10, 25, 50, 100],
      current_name: 'page',
      size_name: 'pageSize',
      pagination_hidden: false,
      hidden: false
    }
  },
  hide_selection_col: {
    type: Boolean,
    default: false
  },
  hide_index_col: {
    type: Boolean,
    default: false
  },
  selections: {
    type: Array,
    default: []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  selected_data_model: {
    type: String,
    default: 'multiple'
  },
  table_width: {
    type: Number
  },
  sider_config: Object,
  overview_config: Object,
  overview_group_config: Array,
  chart_config: Object,
  index: {
    type: Number,
    default: 0
  },
  columns_config: Object,
  current_tab_name: String
})
const currentRow = ref<number>(-1)
const page_state: any = inject('page_state', reactive({}))
watch(page_state, () => {
  onReload?.()
})
const tableDataParam = computed({
  get() {
    return props.data_config.args?.[1]
  },
  set(value: any) {
    Object.assign(props.data_config.args?.[1], value)
  }
})
const $tableWrapper = ref<HTMLDivElement | null>(null)
const $table = ref<any>(null)
const loading = useState(
  `${(props.data_config.args?.[0] || props.data_config.from || 'default').replaceAll('/', '_')}_table_data_loading`
)
const selectedTableData = computed<any>({
  get() {
    return props.selections
  },
  set(data: any) {
    emit('update:selections', data)
  }
})
/**
 * 当父级页面清空 selectedTableData 时，El-table 组件清除表格选中效果
 */
watch(
  selectedTableData,
  (selectedTableData) => {
    if ($table.value) {
      if (!selectedTableData.length) {
        onClearSelection()
      }
    }
  },
  { deep: true, immediate: true }
)

const handleChange = (data: any) => {
  selectedTableData.value = data
}
const table_height = ref<number>(0)
const observer = new MutationObserver((mutationList: MutationRecord[]) => {
  calcTableHight()
})

onMounted(() => {
  observer.observe(document.body, {
    attributes: true
  })
})
const attrs = useAttrs()
const { title, actions_container_id, actions_items_space, name } = attrs

// Teleport 相关逻辑
const isTableActionsAreaMounted = actions_container_id
  ? useElementMounted(`#${actions_container_id}`)
  : useElementMounted(`#tableActionsArea-${props.index}`)
const isTableChartAreaMounted = useElementMounted('#tableChartArea')
const isPaginationWrapperMounted = useElementMounted(`#paginationWrapper-${props.index}`)
const isTableSiderMounted = useElementMounted('#tableSiderArea')
const isTitleWrapperMounted = useElementMounted('#tableTitleArea')
const isTableOverviewMounted = useElementMounted('#tableOverviewArea')

const $columns = ref<any>(null)
const onClearSelection = () => {
  $table.value!.clearSelection()
}
const emit = defineEmits(['scroll', 'update:selections'])
onMounted(() => {
  nextTick(() => {
    $table.value?.scrollBarRef.wrapRef.addEventListener('scroll', (e: MouseEvent) => {
      const tableBodyRef = e.target as HTMLDivElement
      emit('scroll', { top: tableBodyRef.scrollTop, left: tableBodyRef.scrollLeft })
    })
  })
})
// 翻页相关逻辑
const page_current = toRef(props.pagination_config, 'page_current', 1)
const page_size = toRef(props.pagination_config, 'page_size', 25)
const page_sizes = toRef(props.pagination_config, 'page_sizes', [10, 25, 50, 100])
const current_name = toRef(props.pagination_config, 'current_name', 'page')
const size_name = toRef(props.pagination_config, 'size_name', 'pageSize')
const pagination_hidden = toRef(props.pagination_config, 'pagination_hidden', false)
const n_page_size = ref<number>(page_size.value)
const n_page_current = ref<number>(page_current.value)
const pagination_param = computed<HiPaginationParam>(() => [
  n_page_current.value,
  n_page_size.value,
  current_name.value,
  size_name.value
])
const handleSizeChange = (val: number) => {}
const handleCurrentChange = (val: number) => {}
// 列表数据相关逻辑
const tableData = ref<any>([])
const total = ref<number>(0)
const search_result = ref<any>(null)

const calcTableHight = () => {
  if ($tableWrapper.value && attrs.minHeight === undefined) {
    nextTick(() => {
      table_height.value =
        props.tableHeight || ($tableWrapper.value as HTMLDivElement).offsetHeight - 1
      if (title) {
        table_height.value = table_height.value - 28
      }
    })
  }
}
const onReload = useTableData(props.data_config, pagination_param, (res: any) => {
  // 默认勾选
  nextTick(() => {
    tableData.value = res.data
    total.value = res.total
    search_result.value = res.response_data || []
    loading.value = false
    if (res.column_data) {
      props!.columns_config!.default = res.column_data
    }
    calcTableHight()
  })
  setTimeout(() => {
    if (selectedTableData.value.length) {
      selectedTableData.value.map((row: any) => {
        const selected_row = tableData.value.find(
          (item: any) => row[props.rowKey] === item[props.rowKey]
        )
        if (selected_row) {
          if (props.selected_data_model === 'radio') {
            currentRow.value = selected_row
          }
          $table.value.toggleRowSelection(selected_row, true)
        }
      })
    }
  }, 2000)
})
/** 左侧树相关逻辑 */
const tree_node = ref<any>()
const overviewData = ref<any>([])
const searchFormData = computed({
  set(value) {
    if (props.data_config.args) {
      Object.assign({}, props.data_config.args[1], value)
    }
  },
  get() {
    return props.data_config?.args?.[1]
  }
})
defineExpose({ calcTableHight, tableMainRef: $table, onReload })
/** 图表数据 */
const chartData = ref<any>(null)
const user = useUserStore()
const state = usePageStore()

watch($tableWrapper, ($tableWrapper) => {
  const height = ($tableWrapper as HTMLDivElement)?.offsetHeight
  if (height) {
    calcTableHight()
  }
})
const handleSelectionChange = (row: any) => {
  selectedTableData.value = [row]
}
// console.log('attrs:', useAttrs())
</script>
<template>
  <Teleport v-if="isTableChartAreaMounted && props.chart_config" to="#tableChartArea">
    <div class="chart-group-wrap">
      <base-table-chart
        v-bind="item"
        v-for="(item, index) in props.chart_config.items"
        v-model:chart-data="chartData"
        v-model:search-result="search_result"
        :page_state="page_state"
        :key="index"
        :index="index"
        :table-data="tableData"
        :table-data-param="tableDataParam"
      />
    </div>
  </Teleport>
  <Teleport
    v-if="isTableActionsAreaMounted"
    :to="actions_container_id ? `#${actions_container_id}` : `#tableActionsArea-${index}`"
  >
    <div v-if="actions_items_space"></div>
    <base-action-item
      v-for="action in actions"
      :icon="action.icon"
      :label="action.label"
      :tree-node="tree_node"
      :table-data="tableData"
      :command="action.command"
      :columns="$columns?.columns"
      :overview-data="overviewData"
      :search-result="search_result"
      :key="`table-action-${action.command}`"
      :selected-table-data="selectedTableData"
      v-bind="action.config"
      v-model:items="action.config.items"
      v-model:params="action.config.params"
      v-model:content="action.config.content"
      v-model:search-form-data="searchFormData"
      v-model:form-data="action.config.formData"
      v-model:user="user"
      @reload="onReload"
      @clearSelection="onClearSelection"
    />
  </Teleport>
  <Teleport v-if="isTableSiderMounted" to="#tableSiderArea">
    <hi-tree
      v-if="sider_config"
      v-model:tableDataParam="tableDataParam"
      v-model:node="tree_node"
      v-bind="sider_config"
    />
  </Teleport>
  <Teleport v-if="isTableOverviewMounted && props.overview_config" to="#tableOverviewArea">
    <base-overview
      :page_state="page_state"
      v-model:overviewData="overviewData"
      v-model:tableDataParam="tableDataParam"
      v-model:chart-data="chartData"
      v-model:search-result="search_result"
      v-bind="overview_config"
    />
  </Teleport>
  <Teleport v-if="isTableOverviewMounted && props.overview_group_config" to="#tableOverviewArea">
    <template :key="`ov-${index}`" v-for="(item, index) in props.overview_group_config">
      <base-overview
        :page_state="page_state"
        v-model:overviewData="overviewData"
        v-model:tableDataParam="tableDataParam"
        v-model:chart-data="chartData"
        v-model:search-result="search_result"
        v-bind="item"
      />
      <span v-if="index % 2 === 0" class="span-line"></span>
    </template>
  </Teleport>
  <div class="base-table-wrapper" :key="current_tab_name" ref="$tableWrapper">
    <h1 class="table_title" v-if="title">{{ title }}</h1>
    <!-- 
      v-if="table_height"
      会造成 scroll 布局的 Table 无法展示 powerGridSalePriceHZ
     -->
    <el-table
      :border="true"
      :flexible="true"
      :data="tableData"
      :height="table_height"
      :width="table_width"
      :show-overflow-tooltip="true"
      ref="$table"
      v-loading="loading"
      tooltip-effect="light"
      v-bind="$attrs"
      :row-key="rowKey"
      @selection-change="handleChange"
    >
      <el-table-column
        v-if="!hide_selection_col && selected_data_model === 'multiple'"
        width="49"
        align="center"
        type="selection"
        class-name="table-selection"
      />
      <el-table-column
        v-if="!hide_selection_col && selected_data_model === 'radio'"
        width="49"
        align="center"
        class-name="table-selection"
      >
        <template #header>-</template>
        <template #default="{ row }">
          <el-radio
            class="table-row-radio"
            :value="row"
            @change="handleSelectionChange"
            v-model="currentRow"
          >
          </el-radio>
        </template>
      </el-table-column>
      <!-- fixed="left" -->
      <el-table-column
        v-if="!hide_index_col"
        type="index"
        class-name="table-index"
        width="65"
        label="序号"
        align="center"
      />
      <!-- :columns="columns_config?.default" -->
      <!-- v-bind="$attrs" -->
      <base-table-columns
        ref="$columns"
        :state="state"
        :search-form-data="searchFormData"
        :columns_config="columns_config"
        :moduleId="$attrs.moduleId"
      />
    </el-table>
  </div>
  <Teleport
    v-if="isPaginationWrapperMounted && !pagination_hidden"
    :to="`#paginationWrapper-${index}`"
  >
    <span class="table-data-total">共 {{ total }} 项数据</span>
    <el-pagination
      v-model:current-page="n_page_current"
      v-model:page-size="n_page_size"
      :page-sizes="page_sizes"
      layout="sizes,prev,pager,next"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </Teleport>
</template>
<style lang="scss" scoped>
@use '~/styles/mixins' as *;

.base-table-wrapper {
  /** 2024-11-29 md-multi-dimension-presentation 煤电联动 */
  height: 100%;
  @include use-flex-layout();

  .table_title {
    text-align: left;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 10px;
    position: relative;
  }

  .table_title::beore {
    position: absolfute;
    left: 0;
    top: 2px;
    content: ' ';
    display: block;
    width: 3px;
    height: 14px;
    background: linear-gradient(142deg, #55cdf3 4.5%, #1380ce 91.34%);
  }
}

// .hi-transfer-panel__body
.base-table-wrapper:deep(.hi-table) {
  --hi-table-header-bg-color: #507ecd4d;
  --hi-table-bg-color: #00000000;
  --hi-table-tr-bg-color: #00000000;
  // --hi-table-border: 1px solid #1f9acf;
  // --hi-table-border-color: #1f9acf;
  --hi-table-header-text-color: #ffffffcc;
  --hi-table-row-hover-bg-color: #507ecd4d;
  --hi-table-text-color: #ffffffff;
  --hi-table-current-row-bg-color: #507ecd4d;
  flex: 1;
}

.base-table-wrapper:deep(th.hi-table__cell) {
  padding: 15px 0;
}

.base-table-wrapper:deep(.hi-table .hi-table__cell:not(.table-selection, .table-index) .cell) {
  padding: 0 24px;

  .file-name-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;

    .file-icon {
      margin-right: 4px;
    }
  }
}

.base-table-wrapper:deep(th.hi-table__cell .cell) {
  line-height: 22px;
}

.base-table-wrapper:deep(th.hi-table__cell.is-center .cell) {
  line-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.base-table-wrapper:deep(td.hi-table__cell .cell) {
  line-height: 20px;
}
.base-table-wrapper:deep(td.hi-table__cell .cell) {
  .hi-date-editor {
    --hi-date-editor-width: auto
  }
}
.base-table-wrapper:deep(.hi-table thead th) {
  font-weight: 100;
}

.base-table-wrapper:deep(.hi-table .hi-scrollbar__view) {
  height: 100%;
}

.base-table-wrapper:deep(.hi-table .hi-table__body .hi-table__cell) {
  padding: 6px 0;
}
.base-table-wrapper:deep(.hi-table .hi-table__body .cell .table-row-radio .hi-radio__label) {
  display: none;
}
.base-table-wrapper:deep(.hi-table__header-wrapper .hi-table-column--selection > .cell),
.base-table-wrapper:deep(.hi-table__body-wrapper .hi-table-column--selection > .cell) {
  height: 18px; // 解决滚动联动table 高度部统一
  justify-content: center;
}
</style>
