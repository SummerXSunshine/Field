<template>
  <main class="element-form-page">
    <aside class="config-panel" aria-label="Element UI 表单配置">
      <header class="config-panel__header">
        <h1>Element UI 表单</h1>
        <p>配置表单结构和数据，右侧实时预览。</p>
      </header>

      <section class="config-panel__section">
        <h2>表单配置</h2>

        <label class="field">
          <span>表单标题</span>
          <input v-model.trim="formConfig.title" type="text" />
        </label>

        <div class="field-row">
          <label class="field field--compact">
            <span>标签宽度</span>
            <input v-model.trim="formConfig.labelWidth" type="text" />
          </label>

          <label class="field field--compact">
            <span>组件尺寸</span>
            <select v-model="formConfig.size">
              <option value="medium">medium</option>
              <option value="small">small</option>
              <option value="mini">mini</option>
            </select>
          </label>
        </div>

        <label class="field">
          <span>栅格间距</span>
          <input v-model.number="formConfig.gutter" type="number" min="0" max="40" />
        </label>

        <label class="field">
          <span>标签位置</span>
          <select v-model="formConfig.labelPosition">
            <option value="left">左侧</option>
            <option value="right">右侧</option>
            <option value="top">顶部</option>
          </select>
        </label>

        <label class="field field--inline">
          <input v-model="formConfig.inline" type="checkbox" />
          <span>行内表单</span>
        </label>

        <label class="field field--inline">
          <input v-model="formConfig.disabled" type="checkbox" />
          <span>禁用整张表单</span>
        </label>

        <label class="field field--inline">
          <input v-model="formConfig.showActions" type="checkbox" />
          <span>显示底部按钮</span>
        </label>
      </section>

      <section class="config-panel__section">
        <h2>字段配置</h2>

        <div
          v-for="field in fields"
          :key="field.id"
          class="field-card"
        >
          <label class="field">
            <span>字段标题</span>
            <input v-model.trim="field.label" type="text" />
          </label>

          <div class="field-row">
            <label class="field field--compact">
              <span>类型</span>
              <select v-model="field.type">
                <option value="input">输入框</option>
                <option value="textarea">多行文本</option>
                <option value="select">选择器</option>
                <option value="date">日期</option>
                <option value="number">数字</option>
                <option value="switch">开关</option>
              </select>
            </label>

            <label class="field field--compact">
              <span>字段名</span>
              <input v-model.trim="field.prop" type="text" />
            </label>
          </div>

          <label class="field">
            <span>占比，24 为整行</span>
            <input v-model.number="field.span" type="number" min="1" max="24" />
          </label>

          <label v-if="field.type === 'select'" class="field">
            <span>选项键，对应 Select Options</span>
            <input v-model.trim="field.optionKey" type="text" />
          </label>

          <div class="field-card__actions">
            <label class="field field--inline">
              <input v-model="field.required" type="checkbox" />
              <span>必填</span>
            </label>
            <label class="field field--inline">
              <input v-model="field.visible" type="checkbox" />
              <span>显示</span>
            </label>
            <button type="button" :disabled="fields.length <= 1" @click="removeField(field.id)">删除</button>
          </div>
        </div>

        <div class="config-actions">
          <button type="button" @click="addField">新增字段</button>
          <button type="button" @click="resetDemo">重置 Demo</button>
        </div>
      </section>

      <section class="config-panel__section">
        <h2>Select Options</h2>
        <textarea v-model="selectOptionsJsonText" class="json-editor" spellcheck="false"></textarea>
        <p v-if="selectOptionsJsonError" class="form-error">{{ selectOptionsJsonError }}</p>
        <div class="config-actions">
          <button type="button" @click="applySelectOptionsJson">应用选项</button>
          <button type="button" @click="syncSelectOptionsJson">同步当前选项</button>
        </div>
      </section>

      <section class="config-panel__section">
        <h2>数据模型</h2>
        <div
          v-for="field in visibleFields"
          :key="'data-' + field.id"
          class="data-row"
        >
          <span>{{ field.label }}</span>
          <input
            v-if="field.type !== 'switch'"
            v-model="formModel[field.prop]"
            type="text"
          />
          <input
            v-else
            v-model="formModel[field.prop]"
            type="checkbox"
          />
        </div>
      </section>

      <section class="config-panel__section">
        <h2>Model JSON</h2>
        <textarea v-model="modelJsonText" class="json-editor" spellcheck="false"></textarea>
        <p v-if="modelJsonError" class="form-error">{{ modelJsonError }}</p>
        <div class="config-actions">
          <button type="button" @click="applyModelJson">应用数据</button>
          <button type="button" @click="syncModelJson">同步当前数据</button>
        </div>
      </section>

      <section class="config-panel__section">
        <h2>Default Fields</h2>
        <textarea class="json-editor json-editor--readonly" :value="generatedDefaultFieldsText" readonly spellcheck="false"></textarea>
        <div class="config-actions">
          <button type="button" @click="copyDefaultFields">复制 defaultFields</button>
        </div>
        <p v-if="copyStatus" class="copy-status">{{ copyStatus }}</p>
      </section>
    </aside>

    <section class="preview-panel">
      <div class="preview-shell">
        <header class="preview-shell__header">
          <h2>{{ formConfig.title || '基础表单' }}</h2>
          <span>{{ visibleFields.length }} 个字段</span>
        </header>

        <configurable-element-form
          ref="form"
          v-model="formModel"
          :fields="fields"
          :config="formConfig"
          :options-data="selectOptions"
          show-model-preview
          @submit="handleFormSubmit"
          @reset="resetFormModel"
        />
      </div>
    </section>
  </main>
</template>

<script>
import ConfigurableElementForm from '../components/ConfigurableElementForm/ConfigurableElementForm.vue'

const defaultFields = () => [
  {
    id: 'field-name',
    prop: 'name',
    label: '姓名',
    type: 'input',
    required: true,
    visible: true,
    span: 12,
    optionKey: ''
  },
  {
    id: 'field-department',
    prop: 'department',
    label: '部门',
    type: 'select',
    required: true,
    visible: true,
    span: 12,
    optionKey: 'departments'
  },
  {
    id: 'field-join-date',
    prop: 'joinDate',
    label: '入职日期',
    type: 'date',
    required: false,
    visible: true,
    span: 12,
    optionKey: ''
  },
  {
    id: 'field-score',
    prop: 'score',
    label: '绩效分',
    type: 'number',
    required: false,
    visible: true,
    span: 12,
    optionKey: ''
  },
  {
    id: 'field-enabled',
    prop: 'enabled',
    label: '启用账号',
    type: 'switch',
    required: false,
    visible: true,
    span: 12,
    optionKey: ''
  },
  {
    id: 'field-remark',
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    required: false,
    visible: true,
    span: 24,
    optionKey: ''
  }
]

const defaultModel = () => ({
  name: '张三',
  department: '研发部',
  joinDate: '2026-07-05',
  score: 86,
  enabled: true,
  remark: '可通过左侧配置实时修改表单字段和数据。'
})

const defaultSelectOptions = () => ({
  departments: [
    { label: '销售部', value: '销售部' },
    { label: '产品部', value: '产品部' },
    { label: '研发部', value: '研发部' },
    { label: '运营部', value: '运营部' }
  ]
})

const defaultFormConfig = () => ({
  title: '员工信息表单',
  labelWidth: '96px',
  labelPosition: 'right',
  size: 'medium',
  gutter: 16,
  inline: false,
  disabled: false,
  showActions: true
})

export default {
  name: 'ElementFormDemo',
  components: {
    ConfigurableElementForm
  },
  data() {
    const formModel = defaultModel()
    const selectOptions = defaultSelectOptions()

    return {
      formConfig: defaultFormConfig(),
      fields: defaultFields(),
      formModel,
      modelJsonText: JSON.stringify(formModel, null, 2),
      modelJsonError: '',
      selectOptions,
      selectOptionsJsonText: JSON.stringify(selectOptions, null, 2),
      selectOptionsJsonError: '',
      copyStatus: ''
    }
  },
  computed: {
    visibleFields() {
      return this.fields.filter(field => field.visible && field.prop)
    },
    generatedDefaultFieldsText() {
      return JSON.stringify(this.fields, null, 2)
    }
  },
  watch: {
    formModel: {
      deep: true,
      handler() {
        this.syncModelJson()
      }
    },
    fields: {
      deep: true,
      handler() {
        this.ensureModelKeys()
      }
    },
    selectOptions: {
      deep: true,
      handler() {
        this.syncSelectOptionsJson()
      }
    }
  },
  methods: {
    ensureModelKeys() {
      this.fields.forEach(field => {
        if (!field.prop || Object.prototype.hasOwnProperty.call(this.formModel, field.prop)) {
          return
        }

        this.$set(this.formModel, field.prop, this.defaultValueByType(field.type))
      })
    },
    defaultValueByType(type) {
      if (type === 'switch') {
        return false
      }

      if (type === 'number') {
        return 0
      }

      return ''
    },
    addField() {
      const nextIndex = this.fields.length + 1
      const prop = 'field' + nextIndex

      this.fields.push({
        id: 'custom-' + Date.now(),
        prop,
        label: '字段' + nextIndex,
        type: 'input',
        required: false,
        visible: true,
        span: 12,
        optionKey: ''
      })
      this.$set(this.formModel, prop, '')
    },
    removeField(id) {
      if (this.fields.length <= 1) {
        return
      }

      const removedField = this.fields.find(field => field.id === id)

      this.fields = this.fields.filter(field => field.id !== id)

      if (removedField && removedField.prop) {
        this.$delete(this.formModel, removedField.prop)
      }
    },
    applyModelJson() {
      try {
        const parsedModel = JSON.parse(this.modelJsonText)

        if (!parsedModel || typeof parsedModel !== 'object' || Array.isArray(parsedModel)) {
          throw new Error('Model JSON 必须是对象')
        }

        this.formModel = parsedModel
        this.modelJsonError = ''
        this.ensureModelKeys()
      } catch (error) {
        this.modelJsonError = error.message || 'Model JSON 解析失败'
      }
    },
    syncModelJson() {
      this.modelJsonText = JSON.stringify(this.formModel, null, 2)
      this.modelJsonError = ''
    },
    applySelectOptionsJson() {
      try {
        const parsedOptions = JSON.parse(this.selectOptionsJsonText)

        if (!parsedOptions || typeof parsedOptions !== 'object' || Array.isArray(parsedOptions)) {
          throw new Error('Select Options 必须是对象')
        }

        this.selectOptions = parsedOptions
        this.selectOptionsJsonError = ''
      } catch (error) {
        this.selectOptionsJsonError = error.message || 'Select Options JSON 解析失败'
      }
    },
    syncSelectOptionsJson() {
      this.selectOptionsJsonText = JSON.stringify(this.selectOptions, null, 2)
      this.selectOptionsJsonError = ''
    },
    copyDefaultFields() {
      this.copyText(this.generatedDefaultFieldsText, '已复制 defaultFields')
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
    handleFormSubmit() {
      this.$message.success('表单校验通过')
    },
    resetFormModel() {
      this.formModel = defaultModel()
      this.ensureModelKeys()
      this.syncModelJson()
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    resetDemo() {
      this.formConfig = defaultFormConfig()
      this.fields = defaultFields()
      this.formModel = defaultModel()
      this.selectOptions = defaultSelectOptions()
      this.syncModelJson()
      this.syncSelectOptionsJson()
      this.copyStatus = ''
    }
  }
}
</script>

<style scoped>
.element-form-page {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 420px 1fr;
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
  box-sizing: border-box;
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

.field-row {
  display: flex;
  gap: 10px;
  align-items: end;
}

.field--compact {
  flex: 1;
  min-width: 0;
}

.field--inline {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.field input[type="text"],
.field input[type="number"],
.field select,
.data-row input[type="text"],
.json-editor {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
}

.field-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.field-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.data-row {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 8px;
  align-items: center;
  color: #334155;
  font-size: 13px;
}

.data-row input[type="checkbox"] {
  justify-self: start;
}

.json-editor {
  min-height: 180px;
  padding: 10px;
  resize: vertical;
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  line-height: 1.45;
}

.json-editor--readonly {
  background: #f8fafc;
}

.form-error {
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

.config-actions,
.field-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-actions button,
.field-card__actions button {
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
}

.config-actions button:disabled,
.field-card__actions button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.preview-panel {
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
  padding: 24px;
}

.preview-shell {
  max-width: 920px;
  min-height: calc(100vh - 48px);
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.preview-shell__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}

.preview-shell__header h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
}

.preview-shell__header span {
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 900px) {
  .element-form-page {
    grid-template-columns: 1fr;
    grid-template-rows: 420px 1fr;
  }

  .config-panel {
    border-right: 0;
    border-bottom: 1px solid #dbe3ef;
  }

  .preview-shell {
    min-height: auto;
  }
}
</style>
