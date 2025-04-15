import { getFieldValueByPath } from "@hi-block/utils"
import { computed, defineComponent, inject, reactive, ref, toRefs, useAttrs } from "@vue/runtime-core"

export default defineComponent({
  props: {
    page_state: {
      type: Object,
      default: {}
    },
    formData: {
      type: Object,
      default: {}
    },
    sub_label: String,
    hideLabel: {
      type: Boolean,
      default: false
    },
    isSub: {
      type: Boolean,
      default: false
    },
    current_tab_name: String
  },
  setup(props) {
    const { current_tab_name } = toRefs(props)
    const tableConfig = useAttrs()
    const page_state: any = inject('page_state', reactive({}))
    const isSearchFormAreaMounted = useElementMounted('#searchFormArea')
    let {
      tableHeight,
      searchFormConfig,
      tableWidth,
      label,
      name,
      sorte_config,
      index,
      actions,
      siderConfig,
      actions_items_space
    }: any = tableConfig
    const sub_label_str = computed(() => {
      console.log('props:', props)
      if (props.sub_label?.includes('{{')) {
        return props.sub_label.replace(/{{(.*?)}}/g, (_: any, title_key: string) => {
          title_key = getFieldValueByPath(title_key, props)
          return title_key
        })
      }
      return ''
    })
    const pageStore = usePageStore()
    const { hidden_sub_table_index } = storeToRefs(pageStore)
    const selectedTableData = ref<any>([])
    return () => (
      <div
        class={{
          'table-item': !props.isSub,
          'sub-talbe-item': props.isSub,
          'flex-1': !tableWidth
        }}
        style={`flex-basis: ${tableWidth}px`}
      >
        {label && !props.hideLabel ? (
          <p class="table-title">
            <span>{label}</span>
            {sorte_config ? (
              <el-radio-group
                class="table-sort-radio-group"
                v-model={props.page_state[sorte_config.model_key]}
              >
                {sorte_config.radios.map((radio: any, index: number) => (
                  <el-radio-button key={index} {...radio} />
                ))}
              </el-radio-group>
            ) : null}
          </p>
        ) : null}
        {sub_label_str.value ? (
          <p class="table-sub-title">
            <span>{sub_label_str.value}</span>
          </p>
        ) : null}
        {actions || actions_items_space ? (
          <div id={`tableActionsArea-${index}`} class="actions_wrapper" />
        ) : null}
        {/* 搜索栏 */}
        {isSearchFormAreaMounted.value && searchFormConfig?.items?.length ? (
          <Teleport to="#searchFormArea">
            <hi-form v-show={name === current_tab_name.value} {...searchFormConfig} />
          </Teleport>
        ) : null}
        <hi-table
          index={index}
          sider_config={siderConfig}
          key={hidden_sub_table_index.value}
          {...tableConfig}
          current_tab_name={current_tab_name.value}
          v-model:selections={selectedTableData.value}
        />
      </div>
    )
  }
})
