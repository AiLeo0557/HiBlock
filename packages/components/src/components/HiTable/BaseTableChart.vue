<script lang="ts" setup>
import {
  Root,
  Legend,
  percent,
  Scrollbar,
  Tooltip,
  p50,
  Circle,
  color,
  Bullet,
  Theme,
  DataProcessor
} from '@amcharts/amcharts5'
import {
  XYChart,
  AxisRendererX,
  AxisRendererY,
  CategoryAxis,
  ValueAxis,
  ColumnSeries,
  LineSeries,
  XYCursor,
  DateAxis,
  StepLineSeries
} from '@amcharts/amcharts5/xy'
import { PieChart, PieSeries } from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark'
import { cloneDeep } from 'lodash'

const props = defineProps({
  searchResult: Array,
  tableData: {
    type: Array,
    default: []
  },
  tableDataParam: {
    type: Object,
    default: {}
  },
  searchFormData: {
    type: Object,
    default: {}
  },
  page_state: {
    type: Object,
    default: {}
  },
  index: {
    type: Number,
    default: 0
  },
  chartData: Object
})
const emits = defineEmits([
  'update:tableDataParam',
  'update:overviewData',
  'update:chartData',
  'update:searchResult'
])
const chartwrap = ref<HTMLDivElement>()
const attrs = useAttrs()
const dataChartTopList = ref<any>([])
const tableData = ref<any>([])

const {
  type,
  title,
  data_config,
  columns_config,
  layout_config,
  categoryField,
  valueField,
  opposite_config,
  axis_type = 'category',
  pre_hidden = false,
  date_axies_config
}: any = attrs
const loading = ref<boolean>(true)
let root: any
let prev_params = {}
const sorted_type = ref<string>('desc')
let p_sellnodes_str: string = ''
let legend: any

onMounted(() => {
  nextTick(() => {
    const ele = document.getElementById(`chart-wrap-${props.index}`)
    if (ele?.offsetWidth && type !== 'table') {
      setTimeout(drawChartView, 1000)
    }
    if (type === 'table') {
      watch(
        [props, sorted_type],
        async ([props, sorted_type]) => {
          if (data_config?.args) {
            let [url, params, options] = data_config.args
            params = getRequestParams(params, options, props)
            if (type === 'dataChartTop') {
              params.sort = sorted_type
            }
            loading.value = true
            if (!hasChanged(toRaw(params), prev_params)) {
              loading.value = false
              return
            }
            prev_params = cloneDeep(toRaw(params))
            const res = await useBusPost(url, params, options)
            loading.value = false
            tableData.value = res
          }
        },
        {
          deep: true,
          immediate: true
        }
      )
    }
  })
})
const drawChartView = () => {
  if (type === 'dataChartFlow') {
    loading.value = false
    return
  }
  // fix Uncaught Error: You cannot have multiple Roots on the same DOM node
  if (!root) {
    root = Root.new(`chart-wrap-${props.index}`)
    const theme = Theme.new(root)
    theme.rule('AxisLabel', ['minor']).setAll({ dy: 1 })
    theme.rule('Grid', ['minor']).setAll({ strokeOpacity: 0.08 })
    root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root), theme])
  }
  
  let column_data: any = null
  let old_column_old: any = null
  if (columns_config) {
    const { from, prop_key_name, label_key_name, items, stacked } = columns_config
    if (from) {
      old_column_old = getValueByKey(from, props)
      column_data = getValueByKey(from, props) || []
      if (props?.tableDataParam?.sellnodes) {
        p_sellnodes_str = column_data.join(',')
      }
      column_data = column_data.map((item: any, index: number) => {
        if (prop_key_name && label_key_name) {
          return {
            label: Reflect.get(item, label_key_name),
            prop: Reflect.get(item, prop_key_name)
          }
        }
        if (typeof item === 'string') {
          return {
            label: item,
            prop: `value${index}`
          }
        }
      })
    }
    if (items) {
      column_data = items
    }
  }
  let chartInstanceUp: any = createChart(
    root,
    column_data,
    categoryField,
    valueField,
    columns_config ? columns_config.stacked : false,
    layout_config
  )

  watch(
    [props, sorted_type],
    async ([props, sorted_type]) => {
      let chart_data
      if (data_config?.args) {
        let [url, params, options] = data_config.args
        params = getRequestParams(params, options, props)
        if (type === 'dataChartTop') {
          params.sort = sorted_type
        }
        loading.value = true
        if (!hasChanged(toRaw(params), prev_params)) {
          loading.value = false
          return
        }
        prev_params = cloneDeep(toRaw(params))
        const res = await useBusPost(url, params, options)
        if (options.update_search_result) {}

        loading.value = false
        chart_data = res
        if (options.format_res_value_to_num) {
          chart_data = chart_data.map((item: any) => {
            Object.keys(item).forEach((key: string) => {
              if (key !== categoryField) {
                const value = Reflect.get(item, key)
                Reflect.set(item, key, Number(value))
              }
            })
            return item
          })
        }
        dataChartTopList.value = res
        if (Reflect.has(options, 'res_key_name')) {
          const key_name = Reflect.get(options, 'res_key_name')
          chart_data = getValueByKey(key_name, chart_data)
        }
      }
      if (data_config?.from) {
        loading.value = true
        chart_data = getValueByKey(data_config.from, props)
        loading.value = false
      }
      if (chart_data && chart_data.length) {
        chartInstanceUp && chartInstanceUp(chart_data)
      }
    },
    {
      deep: true,
      immediate: true
    }
  )
}
const createChart = (
  root: any,
  column_data: any,
  categoryField: string,
  valueField: string,
  stacked?: boolean,
  layout_config?: any,
  threshold_config?: any
) => {
  root.container.children.clear()
  if (axis_type === 'date') {
  }
  let chart: any
  if (type === 'pie') {
    chart = root.container.children.push(
      PieChart.new(root, {
        endAngle: 270,
        layout: layout_config.main ? root.verticalLayout : root.horizontalLayout,
        innerRadius: percent(70)
      })
    )
    let series = chart.series.push(
      PieSeries.new(root, {
        categoryField,
        valueField,
        alignLabels: false
      })
    )
    series.slices.template.setAll({
      tooltipText: `{category}: {value} ({valuePercentTotal.formatNumber('0.00')}%)`,
      fontSize: 12
    })
    series.labels.template.setAll({
      fontSize: 12
    })
    let legend: any
    if (layout_config.legend) {
      legend = chart.children.push(
        Legend.new(root, {
          centerY: p50,
          y: p50,
          x: percent(60),
          layout: root.verticalLayout
        })
      )
      legend.valueLabels.template.setAll({
        textAlign: 'right'
      })
      legend.labels.template.setAll({
        maxWidth: 140,
        width: 140,
        oversizedBehavior: 'wrap'
      })
    } else {
      legend = chart.children.push(
        Legend.new(root, {
          centerX: percent(50),
          x: percent(50),
          y: percent(86),
          height: percent(25),
          verticalScrollbar: Scrollbar.new(root, {
            orientation: 'vertical'
          })
        })
      )
    }
    legend.valueLabels.template.set('forceHidden', true)
    legend.valueLabels.template.setAll({
      fontSize: 10
    })
    legend.labels.template.setAll({
      fontSize: 12
    })
    legend.markers.template.setAll({
      height: 10,
      width: 10
    })
    return (data: any) => {
      series.data.setAll(data)
      legend.data.setAll(series.dataItems)
      chart?.appear(1000, 100)
    }
  }
  if (type === 'columns' || type === 'lines' || type === 'steplines') {
    chart = root.container.children.push(
      XYChart.new(root, {
        panX: true, // 鼠标点击拖动 x 轴
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        paddingLeft: 0,
        paddingBottom: -48,
        paddingRight: 10,
        focusable: true,
        maxTooltipDistance: -1,
        layout: layout_config.main ? root.verticalLayout : root.horizontalLayout
      })
    )
    let cursor = chart.set('cursor', XYCursor.new(root, {}))
    if (type === 'lines') {
      cursor.lineY.set('visible', false)
    }
    let xAxis = {}
    let xRenderer = AxisRendererX.new(root, {
      minorGridEnabled: true
    })
    if (axis_type === 'category') {
      xAxis = chart.xAxes.push(
        CategoryAxis.new(root, {
          categoryField,
          renderer: xRenderer,
          tooltip: Tooltip.new(root, {})
        })
      )
    }
    if (axis_type === 'date') {
      const { timeUnit = 'minute', count = 5 } = date_axies_config
      xAxis = chart.xAxes.push(
        DateAxis.new(root, {
          maxDecation: 0.5,
          groupData: true,
          baseInterval: {
            timeUnit,
            count
          },
          renderer: xRenderer,
          tooltip: Tooltip.new(root, {})
        })
      )
      xAxis.get('periodChangeDateFormats')['day'] = 'M月d日'
      xAxis.get('periodChangeDateFormats')['hour'] = 'd日'
      xAxis.get('tooltipDateFormats')['minute'] = 'yyyy年M月d日 HH:mm'
      xAxis.get('tooltipDateFormats')['hour'] = 'yyyy年M月d日 HH:mm'
      xAxis.get('dateFormats')['day'] = 'M月d日'
    }
    xRenderer.grid.template.setAll({
      location: 1
    })

    const makeSeries = createSeries(root, chart, xAxis, categoryField, stacked, layout_config)

    if (valueField && type === 'columns') {
      const yAxis = chart.yAxes.push(
        ValueAxis.new(root, {
          renderer: AxisRendererY.new(root, {})
        })
      )
      const series = chart.series.push(
        ColumnSeries.new(root, {
          name: 'Series',
          xAxis,
          yAxis,
          categoryXField: categoryField,
          valueYField: valueField,
          sequencedInterpolation: true,
          tooltip: Tooltip.new(root, { labelText: '{valueY}' })
        })
      )
      series.columns.template.setAll({ strokeOpacity: 0, maxWidth: 30 })
    }
    if (column_data) {
      column_data.forEach((item: any) => {
        makeSeries(item)
      })
    }
    if (opposite_config?.items) {
      opposite_config.items.forEach((item: any) => {
        if (!chart.cursor && item.type === 'lines' && type === 'columns') {
          let cursor = chart.set('cursor', XYCursor.new(root, {}))
          cursor.lineY.set('visible', false)
        }
        makeSeries(item)
      })
    }
    return (data: any) => {
      const c_sellnodes_str = props?.tableDataParam?.sellnodes?.join(',')
      if (p_sellnodes_str !== c_sellnodes_str && Reflect.has(props?.tableDataParam, 'sellnodes')) {
        p_sellnodes_str = c_sellnodes_str
        while (chart.series.length) {
          chart.series.removeIndex(0).dispose()
        }
        legend?.dataItems?.forEach((data_item: any) => {
          data_item.dispose()
        })
        props?.tableDataParam?.sellnodes?.forEach((item: string, index: number) => {
          makeSeries({
            label: item,
            prop: `value${index}`
          })
        })
      }
      xAxis!.data.setAll(data)
      chart.series.each((series: any, index: number) => {
        series.data.setAll(data)
        if (pre_hidden) {
          series.hide()
        } else {
          series.appear()
        }
      })
      chart?.appear(1000, 100)
    }
  }
}
const createSeries = (
  root: any,
  chart: any,
  xAxis: any,
  categoryXField: string,
  stacked: boolean,
  layout_config: any
) => {
  let yRenderer = AxisRendererY.new(root, {
    strokeOpacity: 0.1
  })
  let yAxis = chart.yAxes.push(
    ValueAxis.new(root, {
      renderer: yRenderer,
      ...columns_config?.threshold_config
    })
  )
  let oppositeAxis: any
  if (opposite_config) {
    oppositeAxis = chart.yAxes.push(
      ValueAxis.new(root, {
        renderer: AxisRendererY.new(root, {
          opposite: true
        }),
        // numberFormat: '#a',
        ...opposite_config?.threshold_config
      })
    )
  }

  /**
   * verticalLayout: 垂直 1
   * horizontalLayout: 水平 0
   */
  if (layout_config.legend) {
    legend = chart.children.push(
      Legend.new(root, {
        centerY: p50,
        y: p50,
        layout: root.verticalLayout,
        height: percent(85),
        verticalScrollbar: Scrollbar.new(root, {
          orientation: 'vertical'
        })
      })
    )
  } else {
    legend = chart.children.push(
      Legend.new(root, {
        centerX: percent(50),
        x: percent(50),
        height: percent(25),
        verticalScrollbar: Scrollbar.new(root, {
          orientation: 'vertical'
        })
      })
    )
  }
  legend.valueLabels.template.set('forceHidden', true)
  legend.valueLabels.template.setAll({
    fontSize: 10
  })
  legend.labels.template.setAll({
    fontSize: 12
  })
  legend.markers.template.setAll({
    height: 10,
    width: 10
  })
  return (col_config: any) => {
    const { chart_type, prop, icolor, opposite = false, hidden_bullet = false } = col_config
    let { label } = col_config
    if (label.includes('{{')) {
      let label_key = getStringBetween(label, '\\{{', '\\}}')
      label = getValueByKey(label_key, props)
    }
    let series: any
    const _type = chart_type || type
    const base_config = {
      xAxis,
      yAxis: opposite ? oppositeAxis : yAxis,
      valueYField: prop
    }
    if (icolor) {
      Object.assign(base_config, {
        fill: color(icolor)
      })
      if (_type === 'lines') {
        Object.assign(base_config, {
          stroke: color(icolor)
        })
      }
    }
    const s_config = {
      name: label,
      stacked,
      categoryXField,
      ...base_config
    }
    const l_config = {
      name: label,
      minBulletDistance: 10,
      valueXField: categoryXField,
      tooltip: Tooltip.new(root, { labelText: '{valueY}' }),
      ...base_config
    }
    const s_l_config = {
      name: label,
      categoryXField,
      noRisers: true,
      tooltip: Tooltip.new(root, { labelText: '{name}时段：{categoryX}' }),
      ...base_config
    }
    const c_config = {
      name: label,
      minBulletDistance: 10,
      categoryXField,
      tooltip: Tooltip.new(root, { labelText: '{categoryX}, {name}:{valueY}' }),
      ...base_config
    }
    if (_type === 'columns') {
      series = chart.series.push(ColumnSeries.new(root, s_config))
      console.log('series:', series)
      // if (stacked) {
      //   const tooltip = Tooltip.new(root, {})

      //   chart.plotContainer.set('tooltipPosition', 'pointer')
      //   chart.plotContainer.set('tooltipText', 'a')
      //   chart.plotContainer.set('tooltip', tooltip)

      //   tooltip.label.adapters.add('text', (text, target) => {
      //     text = ''
      //     let i = 0
      //     chart.series.each((series) => {
      //       let tooltipDataItem = series.get('tooltipDataItem')
      //       if (tooltipDataItem) {
      //         if (i === 0) {
      //           text += `[bold]${tooltipDataItem.get('categoryX')}[/]`
      //         }
      //         if (i !== 0) {
      //           text += '\n'
      //         }
      //         text += `[bold width:240px] ${series.get('name')}:[/] ${tooltipDataItem.get('valueY')}`
      //       }
      //       i++
      //     })
      //     return text
      //   })
      // }
      series.columns.template.setAll({
        tooltipText: '{categoryX}, {name}:{valueY}',
        tooltipY: percent(10)
      })
      series.columns.template.set('width', 20)
    } else if (_type === 'lines') {
      if (axis_type === 'date') {
        series = chart.series.push(LineSeries.new(root, l_config))
        series.data.processor = DataProcessor.new(root, {
          dateFormat: 'yyyy-MM-dd HH:mm:ss',
          dateFields: [categoryXField]
        })
      }
      if (axis_type === 'category') {
        series = chart.series.push(
          LineSeries.new(root, { ...c_config, tooltip: Tooltip.new(root, {}) })
        )
      }
      series.get('tooltip').label.adapters.add('text', (text: any, target: any) => {
        text = ''
        let i = 0
        chart.series.each((s: any) => {
          const tooltipDataItem = s.get('tooltipDataItem')
          if (tooltipDataItem) {
            if (i != 0) {
              text += '\n'
            }
            text += `[${s.get('stroke').toString()}]●[/] [bold width:auto]${s.get('name')}:[/]  ${tooltipDataItem.get('valueY')}`
          }
          i++
        })
        return text
      })
      if (!hidden_bullet) {
        series.bullets.push(function () {
          let graphics = Circle.new(root, {
            radius: 4,
            interactive: true,
            fill: series.get('fill')
          })
          return Bullet.new(root, {
            sprite: graphics
          })
        })
      }
    } else if (_type === 'steplines') {
      series = chart.series.push(StepLineSeries.new(root, s_l_config))
      series.strokes.template.setAll({
        strokeWidth: 3
      })
      series.fills.template.setAll({
        fillOpacity: 0.5,
        visible: true
      })
    }
    legend.data.push(series)
  }
}
const style_obj = useCssVars(() => ({
  'main-basis': `${layout_config.width}%`
}))
const tableDataConfig = reactive({
  default() {
    return tableData
  }
})
const table_columns_config = computed(() => {
  return columns_config.items.map(([prop, label, width, align]: any) => ({
    prop,
    label,
    width,
    align
  }))
})
</script>
<template>
  <div
    v-loading="loading"
    ref="chartwrap"
    :id="`chart-wrap-${index}`"
    class="chart-item"
    :style="style_obj"
  >
    <data-chart-top
      :title="title"
      v-model="sorted_type"
      :dataChartTopList="dataChartTopList"
      v-if="type === 'dataChartTop'"
    />
    <data-chart-flow v-if="type === 'dataChartFlow'" />
    <div class="base-table-wrapper">
      <el-table
        :border="true"
        :data="tableData"
        :height="326"
        tooltip-effect="light"
        v-if="type === 'table'"
      >
        <el-table-column
          :key="index"
          v-for="([prop, label, width, align], index) in columns_config.items"
          :align="align"
          :prop="prop"
          :label="label"
          :width="width"
        />
      </el-table>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@use '~/styles/mixins' as *;
.chart-item {
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: var(--main-basis);
}
.base-table-wrapper {
  padding-right: 16px;
  @include use-flex-layout();
  .table_title {
    text-align: left;
    font-size: 14px;
    margin-bottom: 10px;
    padding-left: 10px;
    position: relative;
  }
  .table_title::before {
    position: absolute;
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
.base-table-wrapper:deep(.hi-table thead th) {
  font-weight: 100;
}
.base-table-wrapper:deep(.hi-table .hi-scrollbar__view) {
  height: 100%;
}
.base-table-wrapper:deep(.hi-table .hi-table__body .hi-table__cell) {
  padding: 6px 0;
}
.base-table-wrapper:deep(.hi-table__header-wrapper .hi-table-column--selection > .cell),
.base-table-wrapper:deep(.hi-table__body-wrapper .hi-table-column--selection > .cell) {
  height: 18px; // 解决滚动联动table 高度部统一
}
</style>
