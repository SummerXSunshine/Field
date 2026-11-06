<template>
  <main class="view-form-demo">
    <section class="view-form-demo__preview">
      <div class="view-form-demo__shell">
        <header class="view-form-demo__header">
          <div>
            <p class="view-form-demo__eyebrow">Vue 2 · Element UI</p>
            <h1>ViewForm 配置化文本信息展示</h1>
            <p>在右侧通过表单填写展示项，实时生成组件配置并预览。</p>
          </div>
          <router-link class="view-form-demo__back" to="/">
            返回组件列表
          </router-link>
        </header>

        <view-form
          :data="detailData"
          :config="displayConfig"
          :loading="loading"
          @field-click="handleFieldClick"
        />

        <el-alert
          class="view-form-demo__note"
          title="prop 在 data 中无对应数据时自动显示为 --；数字 0 与布尔值 false 仍按有效值展示。"
          type="info"
          :closable="false"
          show-icon
        />

        <el-divider content-position="left">示例代码</el-divider>

        <code-viewer
          :code="sampleCode"
          language="xml"
          title="ViewForm 用法示例"
          max-height="420px"
        />
      </div>
    </section>

    <aside class="config-panel">
      <header class="config-panel__header">
        <h2>配置生成</h2>
        <p>填写展示项后点击“生成配置”，左侧实时预览。</p>
      </header>

      <el-divider content-position="left">全局配置</el-divider>

      <div class="config-grid">
        <label class="config-field">
          <span>标签宽度 (px)</span>
          <el-input-number v-model="globalConfig.labelWidth" :min="40" :max="300" controls-position="right" />
        </label>

        <label class="config-field">
          <span>栅格间距</span>
          <el-input-number v-model="globalConfig.gutter" :min="0" :max="60" controls-position="right" />
        </label>

        <label class="config-field">
          <span>占位文本</span>
          <el-input v-model.trim="globalConfig.emptyText" placeholder="--" />
        </label>

        <label class="config-field config-field--checkbox">
          <el-checkbox v-model="globalConfig.bordered">显示边框</el-checkbox>
          <el-checkbox v-model="loading">加载状态</el-checkbox>
        </label>
      </div>

      <el-divider content-position="left">数据 (data)</el-divider>

      <el-input
        v-model="dataJsonText"
        type="textarea"
        :rows="8"
        class="json-editor"
        spellcheck="false"
      />
      <p v-if="dataJsonError" class="config-error">{{ dataJsonError }}</p>
      <div class="config-actions">
        <el-button size="small" type="primary" @click="applyDataJson">应用数据</el-button>
      </div>

      <el-divider content-position="left">展示项 (fields)</el-divider>

      <div
        v-for="(item, index) in fieldItems"
        :key="item.uid"
        class="field-card"
      >
        <div class="field-card__title">
          <strong>{{ item.label || '未命名字段 ' + (index + 1) }}</strong>
          <el-button
            type="text"
            size="mini"
            icon="el-icon-delete"
            @click="removeField(index)"
          >删除</el-button>
        </div>

        <div class="config-grid config-grid--compact">
          <label class="config-field">
            <span>标题 label</span>
            <el-input v-model.trim="item.label" placeholder="姓名" />
          </label>

          <label class="config-field">
            <span>取值路径 prop</span>
            <el-input v-model.trim="item.prop" placeholder="contact.phone" />
          </label>

          <label class="config-field">
            <span>循环键 key（可留空）</span>
            <el-input v-model.trim="item.key" placeholder="自动生成" />
          </label>

          <label class="config-field">
            <span>占宽 span</span>
            <el-select v-model="item.span" size="small">
              <el-option :label="'24（一行一列）'" :value="24" />
              <el-option :label="'12（一行两列）'" :value="12" />
              <el-option :label="'16'" :value="16" />
              <el-option :label="'8'" :value="8" />
            </el-select>
          </label>
        </div>
      </div>

      <div class="config-actions">
        <el-button size="small" type="primary" icon="el-icon-plus" @click="addField">新增展示项</el-button>
        <el-button size="small" type="primary" plain icon="el-icon-s-unfold" @click="openBatchDialog">批量新增</el-button>
        <el-button size="small" @click="resetDemo">重置 Demo</el-button>
      </div>

      <el-divider content-position="left">生成的配置 (config)</el-divider>

      <el-input
        v-model="configJsonText"
        type="textarea"
        :rows="12"
        class="json-editor"
        spellcheck="false"
      />
      <p v-if="configJsonError" class="config-error">{{ configJsonError }}</p>
      <div class="config-actions">
        <el-button size="small" type="primary" @click="applyConfigJson">应用配置</el-button>
        <el-button size="small" type="primary" plain icon="el-icon-document-copy" @click="copyConfig">复制配置</el-button>
      </div>
      <p v-if="copyStatus" class="config-success">{{ copyStatus }}</p>

      <el-dialog
        title="批量新增展示项"
        :visible.sync="batchDialogVisible"
        width="360px"
        append-to-body
      >
        <label class="batch-field">
          <span>新增数量（每个展示项自动生成默认配置）</span>
          <el-input-number v-model="batchCount" :min="1" :max="50" controls-position="right" />
        </label>
        <template #footer>
          <el-button size="small" @click="batchDialogVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="confirmBatchAdd">确 定</el-button>
        </template>
      </el-dialog>
    </aside>
  </main>
</template>

<script>
import ViewForm from '../components/ViewForm/ViewForm.vue'
import CodeViewer from '../components/CodeViewer/CodeViewer.vue'
import { buildSfcCode } from '../utils/sampleCode'

const defaultGlobalConfig = () => ({
  labelWidth: 94,
  gutter: 28,
  emptyText: '--',
  bordered: true
})

const defaultFieldItems = () => [
  { uid: 'f1', key: 'name', label: '姓名', prop: 'name', span: 12 },
  { uid: 'f2', key: 'organization', label: '所属单位', prop: 'organization', span: 12 },
  { uid: 'f3', key: 'phone', label: '联系电话', prop: 'contact.phone', span: 12 },
  { uid: 'f4', key: 'email', label: '电子邮箱', prop: 'contact.email', span: 12 },
  { uid: 'f5', key: 'location', label: '工作地点', prop: 'location', span: 12 },
  { uid: 'f6', key: 'project-count', label: '项目数量', prop: 'projectCount', span: 12 },
  { uid: 'f7', key: 'description', label: '个人简介', prop: 'description', span: 24 }
]

const defaultData = () => ({
  name: '林知远',
  gender: '男',
  organization: '信息研判中心',
  position: '高级分析师',
  contact: {
    phone: '138 0000 0000',
    email: ''
  },
  location: '北京市海淀区',
  projectCount: 0,
  enabled: false,
  description: '负责信息研判、专题分析和跨部门协作。'
})

const buildDisplayConfig = (globalConfig, fieldItems) => ({
  emptyText: globalConfig.emptyText,
  bordered: globalConfig.bordered,
  gutter: globalConfig.gutter,
  labelWidth: globalConfig.labelWidth,
  fields: fieldItems.map(item => ({
    key: item.key || item.prop || item.label,
    label: item.label,
    prop: item.prop,
    span: Number(item.span) || 24
  }))
})

export default {
  name: 'ViewFormDemo',
  components: {
    ViewForm,
    CodeViewer
  },
  data() {
    const detailData = defaultData()
    const dataJsonText = JSON.stringify(detailData, null, 2)
    const displayConfig = buildDisplayConfig(defaultGlobalConfig(), defaultFieldItems())

    return {
      loading: false,
      globalConfig: defaultGlobalConfig(),
      fieldItems: defaultFieldItems(),
      detailData,
      dataJsonText,
      dataJsonError: '',
      configJsonText: JSON.stringify(displayConfig, null, 2),
      configJsonError: '',
      batchDialogVisible: false,
      batchCount: 3,
      copyStatus: ''
    }
  },
  computed: {
    displayConfig() {
      return buildDisplayConfig(this.globalConfig, this.fieldItems)
    },
    sampleCode() {
      const attrs = [
        ':data="detailData"',
        ':config="displayConfig"'
      ]

      if (this.loading) {
        attrs.push(':loading="true"')
      }

      return buildSfcCode({
        tag: 'view-form',
        componentName: 'ViewForm',
        importPath: '@/components/ViewForm/ViewForm.vue',
        attrs,
        data: {
          detailData: this.detailData,
          displayConfig: this.displayConfig
        }
      })
    }
  },
  watch: {
    displayConfig: {
      deep: true,
      handler(value) {
        this.configJsonText = JSON.stringify(value, null, 2)
      }
    }
  },
  methods: {
    addField() {
      this.fieldItems.push({
        uid: 'f-' + Date.now(),
        key: '',
        label: '',
        prop: '',
        span: 12
      })
    },
    openBatchDialog() {
      this.batchCount = 3
      this.batchDialogVisible = true
    },
    confirmBatchAdd() {
      const count = Math.min(50, Math.max(1, Math.round(Number(this.batchCount) || 1)))
      const timestamp = Date.now()

      for (let i = 0; i < count; i++) {
        this.fieldItems.push({
          uid: 'f-' + timestamp + '-' + i,
          key: '',
          label: '',
          prop: '',
          span: 12
        })
      }

      this.batchDialogVisible = false
      this.$message.success('已新增 ' + count + ' 个展示项')
    },
    removeField(index) {
      this.fieldItems.splice(index, 1)
    },
    applyConfigJson() {
      try {
        const parsed = JSON.parse(this.configJsonText)

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('config 必须是 JSON 对象')
        }

        const globalConfig = this.globalConfig

        if (parsed.labelWidth !== undefined && parsed.labelWidth !== null && parsed.labelWidth !== '') {
          const labelWidth = Number(parsed.labelWidth)

          if (Number.isFinite(labelWidth) && labelWidth > 0) {
            globalConfig.labelWidth = labelWidth
          }
        }

        if (parsed.gutter !== undefined && parsed.gutter !== null && parsed.gutter !== '') {
          const gutter = Number(parsed.gutter)

          if (Number.isFinite(gutter) && gutter >= 0) {
            globalConfig.gutter = gutter
          }
        }

        if (parsed.emptyText !== undefined) {
          this.$set(globalConfig, 'emptyText', String(parsed.emptyText))
        }

        if (parsed.bordered !== undefined) {
          this.$set(globalConfig, 'bordered', parsed.bordered !== false)
        }

        if (Array.isArray(parsed.fields)) {
          const timestamp = Date.now()

          this.fieldItems = parsed.fields.map((field, index) => ({
            uid: 'f-' + timestamp + '-' + index,
            key: field && typeof field.key === 'string' ? field.key : '',
            label: field && typeof field.label === 'string' ? field.label : '',
            prop: field && typeof field.prop === 'string' ? field.prop : '',
            span: field && Number.isFinite(Number(field.span)) && Number(field.span) > 0 ? Number(field.span) : 24
          }))
        }

        this.configJsonError = ''
      } catch (error) {
        this.configJsonError = error.message || '配置 JSON 解析失败'
      }
    },
    applyDataJson() {
      try {
        const parsed = JSON.parse(this.dataJsonText)

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('data 必须是 JSON 对象')
        }

        this.detailData = parsed
        this.dataJsonError = ''
      } catch (error) {
        this.dataJsonError = error.message || 'JSON 解析失败'
      }
    },
    resetDemo() {
      this.globalConfig = defaultGlobalConfig()
      this.fieldItems = defaultFieldItems()
      this.detailData = defaultData()
      this.dataJsonText = JSON.stringify(this.detailData, null, 2)
      this.dataJsonError = ''
      this.configJsonText = JSON.stringify(buildDisplayConfig(this.globalConfig, this.fieldItems), null, 2)
      this.configJsonError = ''
      this.copyStatus = ''
    },
    copyConfig() {
      this.copyText(this.configJsonText, '已复制 ViewForm 配置')
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
    handleFieldClick({ item }) {
      this.$message({
        message: '点击字段：' + item.label,
        type: 'success',
        duration: 1200
      })
    }
  }
}
</script>

<style scoped>
.view-form-demo {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  height: 100%;
  overflow: hidden;
  background: #f1f5f9;
  color: #303133;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.view-form-demo__preview {
  box-sizing: border-box;
  height: 100%;
  min-width: 0;
  overflow: auto;
  padding: 24px;
}

.view-form-demo__shell {
  box-sizing: border-box;
  min-height: 100%;
  padding: 24px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.view-form-demo__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.view-form-demo__header h1 {
  margin: 4px 0 8px;
  font-size: 24px;
  line-height: 1.3;
}

.view-form-demo__header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.view-form-demo__eyebrow {
  color: #409eff !important;
  font-size: 12px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.view-form-demo__back {
  flex: none;
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.view-form-demo__note {
  margin-top: 16px;
}

.config-panel {
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  border-left: 1px solid #dbe3ef;
  background: #ffffff;
}

.config-panel__header {
  margin-bottom: 8px;
}

.config-panel__header h2 {
  margin: 0 0 6px;
  font-size: 18px;
  line-height: 1.3;
}

.config-panel__header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.config-grid--compact {
  grid-template-columns: 1fr;
}

.config-field {
  display: grid;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}

.config-field--checkbox {
  grid-column: 1 / -1;
  grid-template-columns: none;
  display: flex;
  gap: 16px;
}

.field-card {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.field-card + .field-card {
  margin-top: 10px;
}

.field-card__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.field-card__title strong {
  color: #303133;
  font-size: 13px;
}

.json-editor {
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
}

.json-editor--readonly {
  background: #f8fafc;
}

.config-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.config-error {
  margin: 6px 0 0;
  color: #dc2626;
  font-size: 12px;
}

.config-success {
  margin: 6px 0 0;
  color: #047857;
  font-size: 12px;
}

.batch-field {
  display: grid;
  gap: 10px;
  color: #606266;
  font-size: 13px;
}

@media (max-width: 900px) {
  .view-form-demo {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    height: 100%;
  }

  .config-panel {
    height: auto;
    max-height: 50%;
    border-top: 1px solid #dbe3ef;
    border-left: 0;
  }
}
</style>
