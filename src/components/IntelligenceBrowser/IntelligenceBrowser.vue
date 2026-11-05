<template>
  <section class="intelligence-browser">
    <el-tabs v-model="activeTab" class="intelligence-browser__tabs" @tab-click="handleTabClick">
      <el-tab-pane label="整编情报" name="integrated" />
      <el-tab-pane label="所属情报" name="owned" />
    </el-tabs>

    <template v-if="viewMode === 'list'">
      <el-form
        v-if="activeTab === 'owned'"
        class="intelligence-browser__filters"
        :model="draftFilters"
        inline
        label-position="left"
        size="small"
        @submit.native.prevent="handleQuery"
      >
        <el-form-item label="情报类型">
          <el-radio-group v-model="draftFilters.sourceType">
            <el-radio :label="bodyValue">正文</el-radio>
            <el-radio :label="receivedValue">收文</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="开始时间">
          <el-date-picker
            v-model="draftFilters.startDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择开始时间"
            :clearable="true"
          />
        </el-form-item>

        <el-form-item label="结束时间">
          <el-date-picker
            v-model="draftFilters.endDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择结束时间"
            :clearable="true"
          />
        </el-form-item>

        <el-form-item label="检索内容">
          <el-input
            v-model.trim="draftFilters.keyword"
            class="intelligence-browser__keyword"
            clearable
            placeholder="请输入标题、来源或正文内容"
          />
        </el-form-item>

        <el-form-item class="intelligence-browser__filter-actions">
          <el-button type="primary" native-type="submit" icon="el-icon-search">
            查询
          </el-button>
        </el-form-item>

        <p v-if="filterError" class="intelligence-browser__filter-error" role="alert">
          {{ filterError }}
        </p>
      </el-form>

      <div v-loading="loading" class="intelligence-browser__card-shell">
        <div v-if="visibleRows.length" class="intelligence-browser__card-list" role="list">
          <article
            v-for="(row, index) in visibleRows"
            :key="getRowKey(row, index)"
            class="intelligence-browser__card"
            role="button"
            tabindex="0"
            @click="openDetail(row, null, $event)"
            @keydown.enter.prevent="openDetail(row, null, $event)"
            @keydown.space.prevent="openDetail(row, null, $event)"
          >
            <slot name="card" :row="row" :tab="activeTab">
              <header class="intelligence-browser__card-title-block">
                <slot
                  name="cell"
                  :row="row"
                  :column="cardFields.title"
                  :value="row[cardFields.title.prop]"
                >
                  <h3>{{ row[normalizedFieldMap.title] || '未命名情报' }}</h3>
                </slot>
              </header>

              <section class="intelligence-browser__card-content-block">
                <slot
                  name="cell"
                  :row="row"
                  :column="cardFields.content"
                  :value="row[cardFields.content.prop]"
                >
                  <div
                    class="intelligence-browser__rich-text-preview"
                    v-html="getRichContent(row)"
                  ></div>
                </slot>
              </section>

              <footer class="intelligence-browser__card-meta-block">
                <div
                  v-for="field in cardFields.meta"
                  :key="field.prop"
                  class="intelligence-browser__card-meta-item"
                >
                  <slot
                    name="cell"
                    :row="row"
                    :column="field"
                    :value="row[field.prop]"
                  >
                    <span>{{ field.label }}</span>
                    <strong>{{ formatFieldValue(row, field.prop) }}</strong>
                  </slot>
                </div>
              </footer>
            </slot>
          </article>
        </div>

        <div v-else class="intelligence-browser__empty">
          <i class="el-icon-document"></i>
          <span>{{ emptyText }}</span>
        </div>

        <footer class="intelligence-browser__list-footer">
          共 {{ visibleRows.length }} 条情报，点击卡片查看详情
        </footer>
      </div>
    </template>

    <article v-else class="intelligence-browser__detail">
      <header class="intelligence-browser__detail-header">
        <el-button
          size="small"
          icon="el-icon-arrow-left"
          class="intelligence-browser__back"
          @click="handleBack"
        >
          返回
        </el-button>
        <span class="intelligence-browser__detail-label">情报详情</span>
      </header>

      <slot name="detail" :record="selectedRecord" :tab="activeTab">
        <div class="intelligence-browser__detail-body">
          <h2>{{ selectedRecord[normalizedFieldMap.title] || '未命名情报' }}</h2>

          <dl class="intelligence-browser__meta">
            <div
              v-for="column in detailMetaColumns"
              :key="column.prop"
              class="intelligence-browser__meta-item"
            >
              <dt>{{ column.label }}</dt>
              <dd>{{ formatCellValue(selectedRecord, column) }}</dd>
            </div>
          </dl>

          <section class="intelligence-browser__content-module">
            <h3>情报内容</h3>
            <div
              class="intelligence-browser__content"
              v-html="getRichContent(selectedRecord)"
            ></div>
          </section>
        </div>
      </slot>
    </article>
  </section>
</template>

<script>
const defaultFieldMap = {
  title: 'title',
  content: 'content',
  sourceType: 'sourceType',
  publishDate: 'publishDate',
  drafter: 'drafter',
  draftUnit: 'draftUnit',
  draftTime: 'draftTime'
}

const createDefaultColumns = () => [
  { prop: 'drafter', label: '拟稿人' },
  { prop: 'draftUnit', label: '拟稿单位' },
  { prop: 'draftTime', label: '拟稿时间' }
]

const createFilters = bodyValue => ({
  sourceType: bodyValue,
  startDate: '',
  endDate: '',
  keyword: ''
})

export default {
  name: 'IntelligenceBrowser',
  props: {
    integratedRows: {
      type: Array,
      default: () => []
    },
    ownedRows: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: createDefaultColumns
    },
    fieldMap: {
      type: Object,
      default: () => ({ ...defaultFieldMap })
    },
    searchFields: {
      type: Array,
      default: () => ['title', 'sourceOrg', 'content']
    },
    bodyValue: {
      type: [String, Number, Boolean],
      default: 'body'
    },
    receivedValue: {
      type: [String, Number, Boolean],
      default: 'received'
    },
    initialTab: {
      type: String,
      default: 'integrated',
      validator: value => ['integrated', 'owned'].includes(value)
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyText: {
      type: String,
      default: '暂无情报数据'
    },
    richTextSanitizer: {
      type: Function,
      default: null
    }
  },
  data() {
    const filters = createFilters(this.bodyValue)

    return {
      activeTab: this.initialTab,
      viewMode: 'list',
      selectedRecord: null,
      draftFilters: { ...filters },
      appliedFilters: { ...filters },
      filterError: ''
    }
  },
  computed: {
    normalizedFieldMap() {
      return {
        ...defaultFieldMap,
        ...this.fieldMap
      }
    },
    cardFields() {
      return {
        title: { prop: this.normalizedFieldMap.title, label: '标题' },
        content: { prop: this.normalizedFieldMap.content, label: '正文' },
        meta: [
          { prop: this.normalizedFieldMap.drafter, label: '拟稿人' },
          { prop: this.normalizedFieldMap.draftUnit, label: '拟稿单位' },
          { prop: this.normalizedFieldMap.draftTime, label: '拟稿时间' }
        ]
      }
    },
    currentRows() {
      return this.activeTab === 'integrated' ? this.integratedRows : this.ownedRows
    },
    visibleRows() {
      if (this.activeTab === 'integrated') {
        return this.currentRows
      }

      const { sourceType, startDate, endDate, keyword } = this.appliedFilters
      const normalizedKeyword = String(keyword || '').trim().toLowerCase()
      const sourceTypeField = this.normalizedFieldMap.sourceType
      const publishDateField = this.normalizedFieldMap.publishDate

      return this.currentRows.filter(row => {
        const matchesType = row[sourceTypeField] === sourceType
        const publishDate = String(row[publishDateField] || '').slice(0, 10)
        const matchesStartDate = !startDate || (publishDate && publishDate >= startDate)
        const matchesEndDate = !endDate || (publishDate && publishDate <= endDate)
        const matchesKeyword = !normalizedKeyword || this.searchFields.some(field => {
          return this.getPlainText(row[field]).toLowerCase().includes(normalizedKeyword)
        })

        return matchesType && matchesStartDate && matchesEndDate && matchesKeyword
      })
    },
    detailMetaColumns() {
      return this.columns.filter(column => {
        return column.showInDetail !== false &&
          column.prop !== this.normalizedFieldMap.title &&
          column.prop !== this.normalizedFieldMap.content
      })
    }
  },
  watch: {
    initialTab(value) {
      this.activeTab = value
      this.returnToList()
    },
    bodyValue(value) {
      if (this.draftFilters.sourceType === this.appliedFilters.sourceType) {
        this.draftFilters.sourceType = value
      }
      this.appliedFilters.sourceType = value
    }
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
      this.returnToList()
      this.$emit('tab-change', tab.name)
    },
    handleQuery() {
      if (
        this.draftFilters.startDate &&
        this.draftFilters.endDate &&
        this.draftFilters.startDate > this.draftFilters.endDate
      ) {
        this.filterError = '开始时间不能晚于结束时间'
        return
      }

      this.filterError = ''
      this.appliedFilters = { ...this.draftFilters }
      this.$emit('query', {
        tab: this.activeTab,
        filters: { ...this.appliedFilters }
      })
    },
    openDetail(row, column, event) {
      this.selectedRecord = row
      this.viewMode = 'detail'
      this.$emit('row-click', { row, column, event, tab: this.activeTab })
      this.$emit('view-change', { view: 'detail', row, tab: this.activeTab })
    },
    handleBack() {
      const record = this.selectedRecord
      this.returnToList()
      this.$emit('back', { row: record, tab: this.activeTab })
      this.$emit('view-change', { view: 'list', row: record, tab: this.activeTab })
    },
    returnToList() {
      this.viewMode = 'list'
      this.selectedRecord = null
    },
    formatCellValue(row, column) {
      if (!row) {
        return '—'
      }

      const value = row[column.prop]
      if (typeof column.formatter === 'function') {
        return column.formatter(row, column, value)
      }

      return value === null || value === undefined || value === '' ? '—' : String(value)
    },
    formatFieldValue(row, field) {
      const value = row && row[field]
      return value === null || value === undefined || value === '' ? '—' : String(value)
    },
    getRowKey(row, index) {
      return row[this.rowKey] === null || row[this.rowKey] === undefined
        ? 'intelligence-card-' + index
        : row[this.rowKey]
    },
    getRichContent(row) {
      const content = row && row[this.normalizedFieldMap.content]
      const html = content === null || content === undefined || content === ''
        ? '<p>暂无正文内容</p>'
        : String(content)

      return this.richTextSanitizer ? this.richTextSanitizer(html, row) : html
    },
    getPlainText(value) {
      return String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    }
  }
}
</script>

<style scoped>
.intelligence-browser {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  color: #1f2937;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.intelligence-browser__tabs {
  padding: 0 24px;
}

.intelligence-browser__tabs ::v-deep .el-tabs__header {
  margin-bottom: 0;
}

.intelligence-browser__tabs ::v-deep .el-tabs__item {
  height: 52px;
  font-size: 16px;
  line-height: 52px;
}

.intelligence-browser__filters {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  align-items: flex-start;
  margin: 0;
  padding: 20px 24px 8px;
  border-bottom: 1px solid #edf0f4;
  background: #f8fafc;
}

.intelligence-browser__filters ::v-deep .el-form-item {
  margin-right: 0;
  margin-bottom: 12px;
}

.intelligence-browser__filters ::v-deep .el-form-item__label {
  color: #4b5563;
  font-weight: 600;
}

.intelligence-browser__filters ::v-deep .el-date-editor.el-input {
  width: 180px;
}

.intelligence-browser__keyword {
  width: 260px;
}

.intelligence-browser__filter-actions {
  margin-left: auto;
}

.intelligence-browser__filter-error {
  flex-basis: 100%;
  margin: -4px 0 8px;
  color: #f56c6c;
  font-size: 13px;
}

.intelligence-browser__card-shell {
  min-height: 260px;
  padding: 20px 24px 16px;
}

.intelligence-browser__card-list {
  display: grid;
  gap: 14px;
}

.intelligence-browser__card {
  overflow: hidden;
  border: 1px solid #dfe5ec;
  border-radius: 7px;
  outline: none;
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.intelligence-browser__card:hover,
.intelligence-browser__card:focus-visible {
  border-color: #7bb4df;
  box-shadow: 0 8px 22px rgba(23, 105, 170, 0.12);
  transform: translateY(-1px);
}

.intelligence-browser__card-title-block {
  padding: 15px 20px;
  border-bottom: 1px solid #e8edf3;
  background: #f6f9fc;
}

.intelligence-browser__card-title-block h3 {
  margin: 0;
  color: #1769aa;
  font-size: 17px;
  line-height: 1.5;
}

.intelligence-browser__card-content-block {
  min-height: 82px;
  padding: 14px 20px;
}

.intelligence-browser__rich-text-preview {
  display: -webkit-box;
  overflow: hidden;
  color: #465266;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.intelligence-browser__rich-text-preview ::v-deep > * {
  margin-top: 0;
  margin-bottom: 0;
}

.intelligence-browser__card-meta-block {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 36px;
  padding: 11px 20px;
  border-top: 1px solid #e8edf3;
  background: #fafbfc;
}

.intelligence-browser__card-meta-item {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 180px;
  color: #7a8494;
  font-size: 13px;
}

.intelligence-browser__card-meta-item strong {
  color: #445064;
  font-weight: 500;
}

.intelligence-browser__empty {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #98a1ad;
  font-size: 14px;
}

.intelligence-browser__empty i {
  font-size: 38px;
}

.intelligence-browser__list-footer {
  padding-top: 12px;
  color: #7b8490;
  font-size: 13px;
  text-align: right;
}

.intelligence-browser__detail {
  min-height: 420px;
  border-top: 1px solid #edf0f4;
}

.intelligence-browser__detail-header {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #edf0f4;
  background: #f8fafc;
}

.intelligence-browser__back {
  color: #1769aa;
}

.intelligence-browser__detail-label {
  color: #4b5563;
  font-weight: 600;
}

.intelligence-browser__detail-body {
  padding: 28px 32px 36px;
}

.intelligence-browser__detail-body h2 {
  margin: 0 0 22px;
  color: #172033;
  font-size: 24px;
  line-height: 1.45;
  text-align: center;
}

.intelligence-browser__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0;
  margin: 0 0 26px;
  border-top: 1px solid #e5e9ef;
  border-left: 1px solid #e5e9ef;
}

.intelligence-browser__meta-item {
  display: grid;
  grid-template-columns: 84px 1fr;
  margin: 0;
  border-right: 1px solid #e5e9ef;
  border-bottom: 1px solid #e5e9ef;
}

.intelligence-browser__meta-item dt,
.intelligence-browser__meta-item dd {
  margin: 0;
  padding: 11px 12px;
  line-height: 20px;
}

.intelligence-browser__meta-item dt {
  background: #f5f7fa;
  color: #5c6675;
  font-weight: 600;
}

.intelligence-browser__meta-item dd {
  color: #253047;
}

.intelligence-browser__content-module {
  overflow: hidden;
  border: 1px solid #e3e8ef;
  border-radius: 6px;
}

.intelligence-browser__content-module h3 {
  margin: 0;
  padding: 13px 18px;
  border-bottom: 1px solid #e3e8ef;
  background: #f5f7fa;
  color: #303a4d;
  font-size: 16px;
}

.intelligence-browser__content {
  min-height: 180px;
  padding: 22px;
  color: #3f4a5e;
  font-size: 15px;
  line-height: 1.9;
  word-break: break-word;
}

.intelligence-browser__content ::v-deep > :first-child {
  margin-top: 0;
}

.intelligence-browser__content ::v-deep > :last-child {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .intelligence-browser__filters {
    display: block;
  }

  .intelligence-browser__filters ::v-deep .el-form-item,
  .intelligence-browser__filters ::v-deep .el-form-item__content,
  .intelligence-browser__filters ::v-deep .el-date-editor.el-input,
  .intelligence-browser__keyword {
    width: 100%;
  }

  .intelligence-browser__filters ::v-deep .el-form-item__label {
    float: none;
  }

  .intelligence-browser__card-meta-block {
    flex-direction: column;
    gap: 8px;
  }

  .intelligence-browser__card-meta-item {
    min-width: 0;
  }

  .intelligence-browser__detail-body {
    padding: 22px 18px 28px;
  }
}
</style>
