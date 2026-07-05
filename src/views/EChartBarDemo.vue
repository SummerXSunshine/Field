<template>
  <main class="echart-page">
    <aside class="config-panel" aria-label="ECharts 图表配置">
      <header class="config-panel__header">
        <h1>ECharts 图表</h1>
        <p>修改左侧配置，右侧图表实时更新。</p>
      </header>

      <section class="config-panel__section">
        <h2>基础配置</h2>

        <label class="field">
          <span>标题</span>
          <input v-model.trim="chartConfig.title" type="text" />
        </label>

        <label class="field">
          <span>副标题</span>
          <input v-model.trim="chartConfig.subtitle" type="text" />
        </label>

        <label class="field">
          <span>图表类型</span>
          <select v-model="chartConfig.chartType">
            <option value="bar">柱状图</option>
            <option value="line">折线图</option>
          </select>
        </label>

        <label class="field">
          <span>系列名称</span>
          <input v-model.trim="chartConfig.seriesName" type="text" />
        </label>

        <label class="field field--inline">
          <input v-model="chartConfig.enableSecondSeries" type="checkbox" />
          <span>启用双系列</span>
        </label>

        <label v-if="chartConfig.enableSecondSeries" class="field">
          <span>第二系列名称</span>
          <input v-model.trim="chartConfig.secondSeriesName" type="text" />
        </label>

        <label v-if="!isLineChart" class="field">
          <span>图表布局</span>
          <select v-model="chartConfig.orientation">
            <option value="vertical">纵向柱状图</option>
            <option value="horizontal">横向柱状图</option>
          </select>
        </label>
      </section>

      <section class="config-panel__section">
        <h2>坐标轴配置</h2>

        <label class="field">
          <span>分类轴名称</span>
          <input v-model.trim="chartConfig.categoryAxisName" type="text" />
        </label>

        <label class="field">
          <span>数值轴名称</span>
          <input v-model.trim="chartConfig.valueAxisName" type="text" />
        </label>

        <div class="field-row">
          <label class="field field--compact">
            <span>底部标签旋转</span>
            <input v-model.number="chartConfig.categoryLabelRotate" type="number" min="0" max="90" />
          </label>

          <label class="field field--compact">
            <span>标签间距</span>
            <input v-model.number="chartConfig.categoryLabelMargin" type="number" min="0" max="40" />
          </label>
        </div>

        <div class="field-row">
          <label class="field field--compact">
            <span>X 偏移</span>
            <input v-model.number="chartConfig.categoryLabelOffsetX" type="number" min="-80" max="80" />
          </label>

          <label class="field field--compact">
            <span>Y 偏移</span>
            <input v-model.number="chartConfig.categoryLabelOffsetY" type="number" min="-80" max="80" />
          </label>
        </div>

        <label class="field field--inline">
          <input v-model="chartConfig.showAllCategoryLabels" type="checkbox" />
          <span>强制显示全部分类标签</span>
        </label>

        <label class="field field--inline">
          <input v-model="chartConfig.showGridLine" type="checkbox" />
          <span>显示网格线</span>
        </label>
      </section>

      <section class="config-panel__section">
        <h2>样式配置</h2>

        <div class="style-color-row">
          <label class="field field--color-inline">
            <span>{{ isLineChart ? '折线颜色' : '柱体颜色' }}</span>
            <input v-model="chartConfig.barColor" type="color" />
          </label>

          <label class="field field--color-inline">
            <span>{{ isLineChart ? '第二折线颜色' : '第二柱颜色' }}</span>
            <input v-model="chartConfig.secondBarColor" type="color" :disabled="!chartConfig.enableSecondSeries" />
          </label>

          <label class="field field--color-inline">
            <span>背景颜色</span>
            <input v-model="chartConfig.backgroundColor" type="color" />
          </label>
        </div>

        <label v-if="!isLineChart" class="field">
          <span>柱宽</span>
          <input v-model.number="chartConfig.barWidth" type="range" min="12" max="56" />
          <em>{{ chartConfig.barWidth }}px</em>
        </label>

        <label v-if="!isLineChart" class="field">
          <span>圆角</span>
          <input v-model.number="chartConfig.barRadius" type="range" min="0" max="18" />
          <em>{{ chartConfig.barRadius }}px</em>
        </label>

        <label v-if="isLineChart" class="field">
          <span>线宽</span>
          <input v-model.number="chartConfig.lineWidth" type="range" min="1" max="8" />
          <em>{{ chartConfig.lineWidth }}px</em>
        </label>

        <label v-if="isLineChart" class="field">
          <span>节点大小</span>
          <input v-model.number="chartConfig.symbolSize" type="range" min="4" max="18" />
          <em>{{ chartConfig.symbolSize }}px</em>
        </label>

        <label class="field">
          <span>标签位置</span>
          <select v-model="chartConfig.labelPosition">
            <option value="top">顶部</option>
            <option value="inside">内部</option>
            <option value="right">右侧</option>
          </select>
        </label>

        <label class="field field--inline">
          <input v-model="chartConfig.showLabel" type="checkbox" />
          <span>显示数值标签</span>
        </label>

        <label v-if="isLineChart" class="field field--inline">
          <input v-model="chartConfig.smoothLine" type="checkbox" />
          <span>平滑折线</span>
        </label>

        <label v-if="isLineChart" class="field field--inline">
          <input v-model="chartConfig.showArea" type="checkbox" />
          <span>显示面积填充</span>
        </label>

        <label class="field field--inline">
          <input v-model="chartConfig.showLegend" type="checkbox" />
          <span>显示图例</span>
        </label>

        <label class="field field--inline">
          <input v-model="chartConfig.showTooltip" type="checkbox" />
          <span>显示 tooltip</span>
        </label>
      </section>

      <section class="config-panel__section">
        <h2>生成 Option</h2>
        <textarea class="options-editor options-editor--readonly" :value="generatedOptionText" readonly spellcheck="false"></textarea>
        <div class="config-actions">
          <button type="button" @click="copyGeneratedOption">复制生成 Option</button>
          <button type="button" @click="loadCurrentOptionText">填入 Options JSON</button>
        </div>
        <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
      </section>

      <section class="config-panel__section">
        <h2>图表 Data</h2>
        <textarea class="options-editor options-editor--readonly options-editor--data" :value="generatedDataText" readonly spellcheck="false"></textarea>
        <div class="config-actions">
          <button type="button" @click="copyGeneratedData">复制 Data</button>
        </div>
      </section>

      <section class="config-panel__section">
        <h2>Options JSON</h2>
        <label class="field">
          <span>直接粘贴 ECharts option</span>
          <textarea
            v-model="rawOptionsText"
            class="options-editor"
            spellcheck="false"
            placeholder="请输入合法 JSON，例如 { &quot;xAxis&quot;: ..., &quot;series&quot;: ... }"
          ></textarea>
        </label>
        <p v-if="rawOptionsError" class="options-error">{{ rawOptionsError }}</p>
        <div class="config-actions">
          <button type="button" @click="applyRawOptions">应用 Options</button>
          <button type="button" @click="clearRawOptions">清空 Options</button>
        </div>
      </section>

      <section class="config-panel__section">
        <h2>{{ dataConfigTitle }}</h2>

        <div
          v-for="(item, index) in chartConfig.items"
          :key="item.id"
          class="data-row"
          :class="{ 'data-row--double': chartConfig.enableSecondSeries }"
        >
          <input v-model.trim="item.name" type="text" :aria-label="'分类 ' + (index + 1)" />
          <input v-model.number="item.value" type="number" min="0" :aria-label="chartConfig.seriesName + ' 数值 ' + (index + 1)" />
          <input
            v-if="chartConfig.enableSecondSeries"
            v-model.number="item.compareValue"
            type="number"
            min="0"
            :aria-label="chartConfig.secondSeriesName + ' 数值 ' + (index + 1)"
          />
        </div>

        <div class="config-actions">
          <button type="button" @click="addItem">新增分类</button>
          <button type="button" :disabled="chartConfig.items.length <= 1" @click="removeItem">删除末项</button>
          <button type="button" @click="resetConfig">重置</button>
        </div>
      </section>
    </aside>

    <section class="chart-panel">
      <div ref="chart" class="chart-panel__canvas" role="img" :aria-label="chartPreviewLabel"></div>
    </section>
  </main>
</template>

<script>
import * as echarts from 'echarts'

const defaultItems = () => [
  { id: 'q1', name: '一季度', value: 128, compareValue: 96 },
  { id: 'q2', name: '二季度', value: 186, compareValue: 142 },
  { id: 'q3', name: '三季度', value: 156, compareValue: 168 },
  { id: 'q4', name: '四季度', value: 218, compareValue: 176 }
]

const defaultConfig = () => ({
  title: '机构业务量统计',
  subtitle: '实时配置预览',
  chartType: 'bar',
  seriesName: '业务量',
  enableSecondSeries: false,
  secondSeriesName: '对比业务量',
  orientation: 'vertical',
  categoryAxisName: '季度',
  valueAxisName: '业务量',
  categoryLabelRotate: 0,
  categoryLabelMargin: 12,
  categoryLabelOffsetX: 0,
  categoryLabelOffsetY: 0,
  showAllCategoryLabels: false,
  barColor: '#2563eb',
  secondBarColor: '#f97316',
  backgroundColor: '#ffffff',
  barWidth: 32,
  barRadius: 6,
  lineWidth: 3,
  symbolSize: 8,
  smoothLine: true,
  showArea: false,
  labelPosition: 'top',
  showLabel: true,
  showLegend: true,
  showTooltip: true,
  showGridLine: true,
  items: defaultItems()
})

const cloneOption = option => JSON.parse(JSON.stringify(option))

export default {
  name: 'EChartBarDemo',
  data() {
    return {
      chart: null,
      chartConfig: defaultConfig(),
      rawOptionsText: '',
      rawOptionsError: '',
      copyStatus: '',
      customChartOption: null
    }
  },
  computed: {
    isLineChart() {
      return this.chartConfig.chartType === 'line'
    },
    dataConfigTitle() {
      if (!this.chartConfig.enableSecondSeries) {
        return '数据配置'
      }

      return this.isLineChart ? '双折线数据配置' : '双柱数据配置'
    },
    chartPreviewLabel() {
      return this.isLineChart ? '折线图预览' : '柱状图预览'
    },
    chartOption() {
      const names = this.chartConfig.items.map(item => item.name || '未命名')
      const values = this.chartConfig.items.map(item => Number(item.value) || 0)
      const compareValues = this.chartConfig.items.map(item => Number(item.compareValue) || 0)
      const isHorizontal = !this.isLineChart && this.chartConfig.orientation === 'horizontal'
      const categoryAxis = {
        type: 'category',
        name: this.chartConfig.categoryAxisName,
        data: names,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          color: '#475569',
          interval: this.chartConfig.showAllCategoryLabels ? 0 : 'auto',
          rotate: this.chartConfig.categoryLabelRotate,
          margin: this.chartConfig.categoryLabelMargin,
          align: this.chartConfig.categoryLabelRotate > 0 ? 'right' : 'center',
          verticalAlign: this.chartConfig.categoryLabelRotate > 0 ? 'middle' : 'top',
          formatter: value => value
        },
        axisLine: {
          lineStyle: {
            color: '#cbd5e1'
          }
        }
      }
      const valueAxis = {
        type: 'value',
        name: this.chartConfig.valueAxisName,
        axisLabel: {
          color: '#475569'
        },
        splitLine: {
          show: this.chartConfig.showGridLine,
          lineStyle: {
            color: '#e2e8f0',
            type: 'dashed'
          }
        }
      }
      const createBarSeries = (name, data, color) => ({
        name,
        type: 'bar',
        data,
        barWidth: this.chartConfig.barWidth,
        itemStyle: {
          color,
          borderRadius: isHorizontal
            ? [0, this.chartConfig.barRadius, this.chartConfig.barRadius, 0]
            : [this.chartConfig.barRadius, this.chartConfig.barRadius, 0, 0]
        },
        label: {
          show: this.chartConfig.showLabel,
          position: isHorizontal && this.chartConfig.labelPosition === 'top' ? 'right' : this.chartConfig.labelPosition,
          color: '#334155',
          fontWeight: 600
        }
      })
      const createLineSeries = (name, data, color) => ({
        name,
        type: 'line',
        data,
        smooth: this.chartConfig.smoothLine,
        symbol: 'circle',
        symbolSize: this.chartConfig.symbolSize,
        lineStyle: {
          width: this.chartConfig.lineWidth,
          color
        },
        itemStyle: {
          color
        },
        areaStyle: this.chartConfig.showArea
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color },
                  { offset: 1, color: 'rgba(255, 255, 255, 0)' }
                ]
              },
              opacity: 0.16
            }
          : undefined,
        label: {
          show: this.chartConfig.showLabel,
          position: this.chartConfig.labelPosition === 'inside' ? 'top' : this.chartConfig.labelPosition,
          color: '#334155',
          fontWeight: 600
        }
      })
      const createSeries = this.isLineChart ? createLineSeries : createBarSeries
      const series = [createSeries(this.chartConfig.seriesName, values, this.chartConfig.barColor)]

      if (this.chartConfig.enableSecondSeries) {
        series.push(createSeries(this.chartConfig.secondSeriesName, compareValues, this.chartConfig.secondBarColor))
      }

      const option = {
        backgroundColor: this.chartConfig.backgroundColor,
        title: {
          text: this.chartConfig.title,
          subtext: this.chartConfig.subtitle,
          left: 24,
          top: 18,
          textStyle: {
            color: '#0f172a',
            fontSize: 18,
            fontWeight: 700
          },
          subtextStyle: {
            color: '#64748b'
          }
        },
        legend: {
          show: this.chartConfig.showLegend,
          top: 28,
          right: 28
        },
        tooltip: {
          show: this.chartConfig.showTooltip,
          trigger: 'axis',
          axisPointer: {
            type: this.isLineChart ? 'line' : 'shadow'
          }
        },
        grid: {
          left: isHorizontal ? 92 : 56,
          right: 36,
          top: 104,
          bottom: isHorizontal ? 56 : 56 + Math.max(0, this.chartConfig.categoryLabelOffsetY),
          containLabel: true
        },
        xAxis: isHorizontal ? valueAxis : categoryAxis,
        yAxis: isHorizontal ? categoryAxis : valueAxis,
        series
      }

      if (!isHorizontal) {
        option.xAxis.axisLabel.padding = [
          this.chartConfig.categoryLabelOffsetY,
          0,
          0,
          this.chartConfig.categoryLabelOffsetX,
        ]
      }

      return option
    },
    chartOptionWithoutData() {
      const option = cloneOption(this.chartOption)
      const xAxes = Array.isArray(option.xAxis) ? option.xAxis : [option.xAxis]
      const yAxes = Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis]

      xAxes.forEach(axis => {
        if (axis && Object.prototype.hasOwnProperty.call(axis, 'data')) {
          axis.data = []
        }
      })

      yAxes.forEach(axis => {
        if (axis && Object.prototype.hasOwnProperty.call(axis, 'data')) {
          axis.data = []
        }
      })

      if (Array.isArray(option.series)) {
        option.series = option.series.map(seriesItem => ({
          ...seriesItem,
          data: []
        }))
      }

      return option
    },
    chartData() {
      const names = this.chartConfig.items.map(item => item.name || '未命名')
      const series = [
        {
          name: this.chartConfig.seriesName,
          data: this.chartConfig.items.map(item => Number(item.value) || 0)
        }
      ]

      if (this.chartConfig.enableSecondSeries) {
        series.push({
          name: this.chartConfig.secondSeriesName,
          data: this.chartConfig.items.map(item => Number(item.compareValue) || 0)
        })
      }

      return {
        categories: names,
        series
      }
    },
    generatedOptionText() {
      return JSON.stringify(this.chartOptionWithoutData, null, 2)
    },
    generatedDataText() {
      return JSON.stringify(this.chartData, null, 2)
    }
  },
  watch: {
    chartOption: {
      deep: true,
      handler() {
        if (!this.customChartOption) {
          this.renderChart()
        }
      }
    },
    chartConfig: {
      deep: true,
      handler() {
        this.copyStatus = ''
        if (this.customChartOption) {
          this.customChartOption = null
          this.rawOptionsError = ''
        }
      }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    renderChart() {
      if (!this.chart) {
        return
      }

      this.chart.setOption(this.customChartOption || this.chartOption, true)
    },
    applyRawOptions() {
      try {
        const parsedOptions = JSON.parse(this.rawOptionsText)

        if (!parsedOptions || typeof parsedOptions !== 'object' || Array.isArray(parsedOptions)) {
          throw new Error('Options 必须是一个 JSON 对象')
        }

        this.customChartOption = parsedOptions
        this.rawOptionsError = ''
        this.renderChart()
      } catch (error) {
        this.rawOptionsError = error.message || 'Options JSON 解析失败'
      }
    },
    loadCurrentOptionText() {
      this.rawOptionsText = JSON.stringify(this.customChartOption || this.chartOptionWithoutData, null, 2)
      this.rawOptionsError = ''
    },
    clearRawOptions() {
      this.rawOptionsText = ''
      this.rawOptionsError = ''
      this.customChartOption = null
      this.renderChart()
    },
    copyGeneratedOption() {
      this.copyText(this.generatedOptionText, '已复制 option')
    },
    copyGeneratedData() {
      this.copyText(this.generatedDataText, '已复制 data')
    },
    copyText(text, successMessage) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.copyStatus = successMessage
        }).catch(() => {
          this.copyTextFallback(text, successMessage)
        })
        return
      }

      this.copyTextFallback(text, successMessage)
    },
    copyTextFallback(text, successMessage) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', 'readonly')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.copyStatus = successMessage
    },
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    addItem() {
      const nextIndex = this.chartConfig.items.length + 1
      this.chartConfig.items.push({
        id: 'custom-' + Date.now(),
        name: '分类' + nextIndex,
        value: 100,
        compareValue: 80
      })
    },
    removeItem() {
      if (this.chartConfig.items.length > 1) {
        this.chartConfig.items.pop()
      }
    },
    resetConfig() {
      this.chartConfig = defaultConfig()
      this.customChartOption = null
      this.rawOptionsText = ''
      this.rawOptionsError = ''
      this.copyStatus = ''
    }
  }
}
</script>

<style scoped>
.echart-page {
  position: fixed;
  inset: 0;
  height: auto;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 380px 1fr;
  overflow: hidden;
  background: #f1f5f9;
  color: #0f172a;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.config-panel {
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  border-right: 1px solid #dbe3ef;
  background: #ffffff;
}

.config-panel__header {
  margin-bottom: 20px;
}

.config-panel__header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.25;
}

.config-panel__header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.config-panel__section {
  display: grid;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
}

.config-panel__section h2 {
  margin: 0;
  font-size: 14px;
}

.field {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 13px;
}

.field-row,
.style-color-row {
  display: flex;
  gap: 10px;
  align-items: end;
}

.field--compact {
  flex: 1;
  min-width: 0;
}

.field--color-inline {
  flex: 1;
  min-width: 0;
  grid-template-columns: 1fr auto;
  align-items: center;
}

.field--color-inline span {
  grid-column: 1 / -1;
}

.field--color-inline input[type="color"] {
  width: 100%;
}

.field input[type="text"],
.field input[type="number"],
.field select,
.data-row input,
.options-editor {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
}

.options-editor {
  min-height: 220px;
  padding: 10px;
  resize: vertical;
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  line-height: 1.45;
}

.options-editor--readonly {
  min-height: 180px;
  background: #f8fafc;
}

.options-editor--data {
  min-height: 132px;
}

.options-error {
  margin: 0;
  color: #dc2626;
  font-size: 12px;
  line-height: 1.45;
}

.copy-status {
  margin: 0;
  color: #047857;
  font-size: 12px;
}

.field input[type="range"] {
  width: 100%;
}

.field em {
  color: #64748b;
  font-style: normal;
  font-size: 12px;
}

.field--inline {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.data-row {
  display: grid;
  grid-template-columns: 1fr 92px;
  gap: 8px;
}

.data-row--double {
  grid-template-columns: 1fr 82px 82px;
}

.config-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-actions button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

.config-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.chart-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

.chart-panel__canvas {
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

@media (max-width: 860px) {
  .echart-page {
    grid-template-columns: 1fr;
    grid-template-rows: 420px 1fr;
  }

  .config-panel {
    height: 420px;
    border-right: 0;
    border-bottom: 1px solid #dbe3ef;
  }

  .chart-panel {
    height: calc(100vh - 420px);
  }
}
</style>
