<template>
  <section
    v-loading="loading"
    class="view-form"
    :class="{
      'view-form--bordered': resolvedBordered
    }"
  >
    <el-row
      v-if="visibleFields.length"
      class="view-form__row"
      :gutter="resolvedGutter"
    >
      <el-col
        v-for="item in visibleFields"
        :key="item.key"
        :span="item.span"
        :xs="24"
      >
        <div
          class="view-form__item"
          :class="item.className"
          @click="handleFieldClick(item)"
        >
          <span
            class="view-form__label"
            :style="getLabelStyle()"
          >
            {{ item.label || resolvedEmptyText }}
          </span>

          <span class="view-form__value">
            <slot
              :name="item.slot || 'field-value'"
              :item="item"
              :value="getDisplayValue(item)"
              :raw-value="getRawValue(item)"
              :data="data"
            >
              {{ getDisplayValue(item) }}
            </slot>
          </span>
        </div>
      </el-col>
    </el-row>

    <div
      v-else
      class="view-form__empty"
    >
      {{ resolvedEmptyText }}
    </div>
  </section>
</template>

<script>
function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export default {
  name: 'ViewForm',
  props: {
    data: {
      type: Object,
      default() {
        return {}
      }
    },
    config: {
      type: Object,
      default() {
        return {}
      }
    },
    emptyText: {
      type: String,
      default: '--'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    resolvedEmptyText() {
      return this.config.emptyText || this.emptyText
    },
    resolvedBordered() {
      return this.config.bordered !== false
    },
    resolvedGutter() {
      const gutter = Number(this.config.gutter)
      return Number.isFinite(gutter) && gutter >= 0 ? gutter : 20
    },
    visibleFields() {
      const fields = Array.isArray(this.config.fields)
        ? this.config.fields
        : []

      return fields
        .filter(item => item && item.hidden !== true)
        .map((item, index) => ({
          ...item,
          key: item.key || item.prop || 'field-' + (index + 1)
        }))
    }
  },
  methods: {
    getValueByPath(source, path) {
      if (!path) {
        return undefined
      }

      return String(path)
        .split('.')
        .reduce((current, key) => {
          if (current === null || current === undefined) {
            return undefined
          }

          return current[key]
        }, source)
    },
    getRawValue(item) {
      if (typeof item.value === 'function') {
        return item.value(this.data, item)
      }

      if (hasOwn(item, 'value')) {
        return item.value
      }

      return this.getValueByPath(this.data, item.prop)
    },
    getDisplayValue(item) {
      const rawValue = this.getRawValue(item)

      if (this.isEmptyValue(rawValue)) {
        return this.resolvedEmptyText
      }

      const formattedValue = typeof item.formatter === 'function'
        ? item.formatter(rawValue, this.data, item)
        : rawValue

      return this.isEmptyValue(formattedValue)
        ? this.resolvedEmptyText
        : formattedValue
    },
    isEmptyValue(value) {
      const isEmptyString = typeof value === 'string' && value.trim() === ''
      const isEmptyArray = Array.isArray(value) && value.length === 0

      return value === null || value === undefined || isEmptyString || isEmptyArray
    },
    getLabelStyle() {
      const labelWidth = this.config.labelWidth

      if (!labelWidth) {
        return null
      }

      const width = typeof labelWidth === 'number'
        ? String(labelWidth) + 'px'
        : labelWidth

      return {
        flexBasis: width,
        width
      }
    },
    handleFieldClick(item) {
      this.$emit('field-click', {
        item,
        value: this.getRawValue(item),
        data: this.data
      })
    }
  }
}
</script>

<style scoped>
.view-form {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 24px;
  border-radius: 8px;
  background: #ffffff;
  color: #303133;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.view-form--bordered {
  border: 1px solid #e4e7ed;
}

.view-form__row {
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.view-form__item {
  display: flex;
  align-items: flex-start;
  min-height: 24px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 24px;
}

.view-form__label {
  flex: 0 0 96px;
  box-sizing: border-box;
  padding-right: 12px;
  color: #909399;
}

.view-form__value {
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
  color: #303133;
  white-space: pre-wrap;
}

.view-form__empty {
  min-height: 44px;
  color: #909399;
  font-size: 14px;
  line-height: 44px;
  text-align: center;
}

@media (max-width: 767px) {
  .view-form {
    padding-right: 20px;
    padding-left: 20px;
  }
}
</style>
