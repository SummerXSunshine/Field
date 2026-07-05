<template>
  <div class="configurable-element-form">
    <el-form
      ref="form"
      :model="localModel"
      :rules="formRules"
      :label-width="normalizedConfig.labelPosition === 'top' ? 'auto' : normalizedConfig.labelWidth"
      :label-position="normalizedConfig.labelPosition"
      :size="normalizedConfig.size"
      :inline="normalizedConfig.inline"
      :disabled="normalizedConfig.disabled"
      class="configurable-element-form__form"
    >
      <el-row :gutter="normalizedConfig.gutter" class="configurable-element-form__row">
        <el-col
          v-for="field in visibleFields"
          :key="field.id || field.prop"
          :span="normalizedSpan(field.span)"
          :xs="24"
        >
          <el-form-item
            :label="field.label"
            :prop="field.prop"
          >
            <slot
              :name="'field-' + field.prop"
              :field="field"
              :model="localModel"
            >
              <el-select
                v-if="field.type === 'select'"
                v-model="localModel[field.prop]"
                v-bind="fieldAttrs(field)"
              >
                <el-option
                  v-for="option in fieldOptions(field)"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <component
                v-else
                :is="fieldComponent(field)"
                v-model="localModel[field.prop]"
                v-bind="fieldAttrs(field)"
              />
            </slot>
          </el-form-item>
        </el-col>

        <el-col
          v-if="normalizedConfig.showActions"
          :span="24"
          :xs="24"
        >
          <el-form-item>
            <slot name="actions" :validate="validate" :reset="requestReset">
              <el-button type="primary" @click="validate">提交</el-button>
              <el-button @click="requestReset">重置数据</el-button>
            </slot>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <section v-if="showModelPreview" class="configurable-element-form__model" aria-label="当前表单数据">
      <h3>当前数据</h3>
      <pre>{{ formattedModel }}</pre>
    </section>
  </div>
</template>

<script>
const cloneValue = value => JSON.parse(JSON.stringify(value || {}))

const defaultConfig = () => ({
  labelWidth: '96px',
  labelPosition: 'right',
  size: 'medium',
  gutter: 16,
  inline: false,
  disabled: false,
  showActions: true
})

export default {
  name: 'ConfigurableElementForm',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: defaultConfig
    },
    optionsData: {
      type: Object,
      default: () => ({})
    },
    showModelPreview: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localModel: cloneValue(this.value)
    }
  },
  computed: {
    normalizedConfig() {
      return {
        ...defaultConfig(),
        ...this.config
      }
    },
    visibleFields() {
      return this.fields.filter(field => field && field.visible !== false && field.prop)
    },
    formRules() {
      return this.visibleFields.reduce((rules, field) => {
        if (field.required) {
          rules[field.prop] = [
            {
              required: true,
              message: '请填写' + field.label,
              trigger: field.type === 'select' || field.type === 'date' ? 'change' : 'blur'
            }
          ]
        }

        return rules
      }, {})
    },
    formattedModel() {
      return JSON.stringify(this.localModel, null, 2)
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        const nextModel = cloneValue(value)

        if (JSON.stringify(nextModel) !== JSON.stringify(this.localModel)) {
          this.localModel = nextModel
        }
      }
    },
    localModel: {
      deep: true,
      handler(value) {
        const nextModel = cloneValue(value)

        if (JSON.stringify(nextModel) !== JSON.stringify(this.value || {})) {
          this.$emit('input', nextModel)
          this.$emit('update:model', nextModel)
        }
      }
    },
    visibleFields: {
      deep: true,
      immediate: true,
      handler() {
        this.ensureModelKeys()
      }
    }
  },
  methods: {
    normalizedSpan(span) {
      const spanNumber = Number(span)

      if (!Number.isFinite(spanNumber)) {
        return 24
      }

      return Math.min(24, Math.max(1, Math.round(spanNumber)))
    },
    fieldComponent(field) {
      const componentMap = {
        input: 'el-input',
        textarea: 'el-input',
        select: 'el-select',
        date: 'el-date-picker',
        number: 'el-input-number',
        switch: 'el-switch'
      }

      return componentMap[field.type] || 'el-input'
    },
    fieldAttrs(field) {
      if (field.type === 'textarea') {
        return {
          type: 'textarea',
          rows: field.rows || 3,
          placeholder: field.placeholder || '请输入' + field.label
        }
      }

      if (field.type === 'select') {
        return {
          placeholder: field.placeholder || '请选择' + field.label,
          filterable: true
        }
      }

      if (field.type === 'date') {
        return {
          type: 'date',
          valueFormat: 'yyyy-MM-dd',
          placeholder: field.placeholder || '选择' + field.label
        }
      }

      if (field.type === 'number') {
        return {
          min: 0,
          controlsPosition: 'right'
        }
      }

      if (field.type === 'switch') {
        return {}
      }

      return {
        placeholder: field.placeholder || '请输入' + field.label
      }
    },
    fieldOptions(field) {
      const optionSource = field.options ||
        this.optionsData[field.optionKey] ||
        this.optionsData[field.prop] ||
        field.optionsText

      if (Array.isArray(optionSource)) {
        return optionSource.map(option => {
          if (option && typeof option === 'object') {
            return {
              label: option.label,
              value: option.value
            }
          }

          return {
            label: option,
            value: option
          }
        })
      }

      return String(optionSource || '')
        .split(',')
        .map(option => option.trim())
        .filter(Boolean)
        .map(option => ({
          label: option,
          value: option
        }))
    },
    ensureModelKeys() {
      this.visibleFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(this.localModel, field.prop)) {
          return
        }

        this.$set(this.localModel, field.prop, this.defaultValueByType(field.type))
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
    validate() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', cloneValue(this.localModel))
        }
      })
    },
    clearValidate() {
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },
    requestReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.configurable-element-form__form {
  max-width: 720px;
}

.configurable-element-form__form ::v-deep .el-select,
.configurable-element-form__form ::v-deep .el-date-editor.el-input,
.configurable-element-form__form ::v-deep .el-input-number {
  width: 100%;
}

.configurable-element-form__model {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.configurable-element-form__model h3 {
  margin: 0 0 10px;
  font-size: 14px;
}

.configurable-element-form__model pre {
  margin: 0;
  padding: 14px;
  overflow: auto;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.55;
}
</style>
