import { defineComponent, toRefs, useAttrs, watch } from "@vue/runtime-core"

export default defineComponent({
  props: {
    formData: Object
  },
  setup(props, ctx) {
    const { formData } = toRefs(props)
    const pageStore = usePageStore()
    const { hidden_sub_table_index } = storeToRefs(pageStore)
    const {
      useHiddenSubTable,
      list,
      layout,
      page_state = {},
      siderConfig,
      chartConfig,
      overviewConfig,
      overviewGroupConfig
    }: any = useAttrs()
    if (formData.value) {
      watch(formData, (formData) => Object.assign(page_state, formData), { immediate: true })
    }
    const current_tab_name = ref<string>()
    if (layout === 'tabs') {
      current_tab_name.value = list[0].name
    }
    return () => (
      <div class={['table-group', layout]}>
        {layout === 'tabs' ? (
          <el-tabs class="tab-table-group" v-model={current_tab_name.value}>
            {list.map((tableConfig: any, index: number) => {
              if (index === 0 && !tableConfig.chart_config && chartConfig) {
                tableConfig.chart_config = chartConfig
              }
              if (index === 0 && !tableConfig.overview_config && overviewConfig) {
                tableConfig.overview_config = overviewConfig
              }
              if (index === 0 && !tableConfig.overview_group_config && overviewGroupConfig) {
                tableConfig.overview_group_config = overviewGroupConfig
              }
              return (
                <el-tab-pane label={tableConfig.label} name={tableConfig.name}>
                  <hi-table-item
                    {...tableConfig}
                    hide-label={true}
                    siderConfig={siderConfig}
                    page_state={page_state}
                    index={index}
                    formData={formData.value}
                    current_tab_name={current_tab_name.value}
                  />
                </el-tab-pane>
              )
            })}
          </el-tabs>
        ) : null}
        {layout === 'row' || layout === 'column'
          ? list.map((tableConfig: any, index: number) => {
            if (hidden_sub_table_index.value === index && useHiddenSubTable) {
              return null
            }
            if (index === 0 && !tableConfig.chart_config && chartConfig) {
              tableConfig.chart_config = chartConfig
            }
            if (
              index === 0 &&
              !tableConfig.overview_config &&
              overviewConfig &&
              tableConfig.name !== 'sub_group'
            ) {
              tableConfig.overview_config = overviewConfig
            }
            if (
              index === 0 &&
              !tableConfig.overview_group_config &&
              overviewGroupConfig &&
              tableConfig.name !== 'sub_group'
            ) {
              tableConfig.overview_group_config = overviewGroupConfig
            }
            if (tableConfig.name === 'sub_group') {
              return (
                <div
                  class={{
                    'table-item': true,
                    'flex-1': !tableConfig.tableHeight,
                    'sub-group-wraper': true,
                    'sub-group-layout-row': tableConfig.layout === 'row',
                    'sub-group-layout-column': tableConfig.layout === 'column'
                  }}
                >
                  {tableConfig.label ? (
                    <h1 class="sub-group-title">{tableConfig.label}</h1>
                  ) : null}
                  {tableConfig.items.map((s_config: any, s_index: number) => {
                    if (
                      index === 0 &&
                      s_index === 0 &&
                      !s_config.overview_config &&
                      overviewConfig
                    ) {
                      s_config.overview_config = overviewConfig
                    }
                    if (
                      index === 0 &&
                      s_index === 0 &&
                      !s_config.overview_group_config &&
                      overviewGroupConfig
                    ) {
                      s_config.overview_group_config = overviewGroupConfig
                    }
                    return (
                      <hi-table-item
                        {...s_config}
                        is-sub={true}
                        siderConfig={siderConfig}
                        page_state={page_state}
                        index={`${index}${s_index}`}
                      />
                    )
                  })}
                </div>
              )
            }
            return (
              <hi-table-item
                {...tableConfig}
                siderConfig={siderConfig}
                page_state={page_state}
                index={index}
              />
            )
          })
          : null}
        {layout === 'scroll' ? (
          <el-scrollbar class="table-group-scroll-layout">
            {list.map((tableConfig: any, index: number) => (
              <hi-table-item
                {...tableConfig}
                siderConfig={siderConfig}
                page_state={page_state}
                index={index}
              />
            ))}
          </el-scrollbar>
        ) : null}
      </div>
    )
  }
})
