<template>
  <div
    v-loading="loading"
    class="avatar-info-display"
    :class="{
      'avatar-info-display--bordered': resolvedBordered
    }"
  >
    <el-row
      class="avatar-info-display__row"
      :gutter="resolvedGutter"
      type="flex"
      align="middle"
    >
      <el-col
        :span="avatarConfig.span || 6"
        :xs="24"
      >
        <div class="avatar-info-display__avatar-wrap">
          <slot
            name="avatar"
            :src="avatarSrc"
            :config="avatarConfig"
            :data="data"
          >
            <el-avatar
              :src="avatarSrc"
              :size="avatarConfig.size || 96"
              :shape="avatarConfig.shape || 'circle'"
              :fit="avatarConfig.fit || 'cover'"
              @error="handleAvatarError"
            >
              {{ avatarFallback }}
            </el-avatar>
          </slot>
        </div>
      </el-col>

      <el-col
        :span="config.contentSpan || 18"
        :xs="24"
      >
        <div class="avatar-info-display__content">
          <div
            v-for="(item, index) in normalizedItems"
            :key="item.key"
            class="avatar-info-display__info"
            :class="getInfoClasses(item, index)"
          >
            <span
              v-if="item.label"
              class="avatar-info-display__info-label"
            >
              {{ item.label }}
            </span>

            <span class="avatar-info-display__info-value">
              <slot
                :name="item.slot || 'info-item'"
                :item="item"
                :index="index"
                :value="getDisplayValue(item)"
                :raw-value="getRawValue(item)"
                :data="data"
              >
                {{ getDisplayValue(item) }}
              </slot>
            </span>
          </div>

          <div class="avatar-info-display__tags">
            <span
              v-if="tagConfig.label"
              class="avatar-info-display__tag-label"
            >
              {{ tagConfig.label }}
            </span>

            <slot
              name="tags"
              :tags="resolvedTags"
              :config="tagConfig"
              :data="data"
            >
              <template v-if="resolvedTags.length">
                <el-tag
                  v-for="tag in resolvedTags"
                  :key="tag.key"
                  :type="tag.type"
                  :effect="tag.effect"
                  :size="tag.size"
                  :hit="tag.hit"
                  :color="tag.color"
                  class="avatar-info-display__tag"
                >
                  {{ tag.label }}
                </el-tag>
              </template>

              <span
                v-else
                class="avatar-info-display__empty"
              >
                {{ resolvedEmptyText }}
              </span>
            </slot>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key)
}

export default {
  name: 'AvatarInfoDisplay',
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
      return Number.isFinite(gutter) && gutter >= 0 ? gutter : 24
    },
    avatarConfig() {
      return this.config.avatar || {}
    },
    tagConfig() {
      return this.config.tags || {}
    },
    avatarSrc() {
      const value = this.getRawValue(this.avatarConfig)
      return this.isEmptyValue(value) ? '' : String(value)
    },
    avatarFallback() {
      const fallback = typeof this.avatarConfig.fallback === 'function'
        ? this.avatarConfig.fallback(this.data, this.avatarConfig)
        : this.avatarConfig.fallback

      return this.formatEmptyValue(fallback)
    },
    normalizedItems() {
      const items = Array.isArray(this.config.items)
        ? this.config.items.slice(0, 3)
        : []

      return [0, 1, 2].map(index => {
        const item = items[index] || {}

        return {
          ...item,
          key: item.key || item.prop || 'info-' + (index + 1)
        }
      })
    },
    resolvedTags() {
      const tags = this.getTagItems()

      if (!Array.isArray(tags)) {
        return []
      }

      const keyKey = this.tagConfig.keyKey || 'key'
      const labelKey = this.tagConfig.labelKey || 'label'
      const typeKey = this.tagConfig.typeKey || 'type'

      return tags.map((tag, index) => {
        if (tag === null || tag === undefined || typeof tag !== 'object') {
          const label = this.formatEmptyValue(tag)

          return {
            key: String(label) + '-' + index,
            label,
            type: this.tagConfig.type || '',
            effect: this.tagConfig.effect || 'light',
            size: this.tagConfig.size || 'small',
            hit: Boolean(this.tagConfig.hit),
            color: this.tagConfig.color || ''
          }
        }

        const label = this.formatEmptyValue(tag[labelKey])

        return {
          key: tag[keyKey] || String(label) + '-' + index,
          label,
          type: tag[typeKey] || this.tagConfig.type || '',
          effect: tag.effect || this.tagConfig.effect || 'light',
          size: tag.size || this.tagConfig.size || 'small',
          hit: hasOwn(tag, 'hit') ? Boolean(tag.hit) : Boolean(this.tagConfig.hit),
          color: tag.color || this.tagConfig.color || ''
        }
      })
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

      return this.formatEmptyValue(formattedValue)
    },
    getTagItems() {
      if (typeof this.tagConfig.items === 'function') {
        return this.tagConfig.items(this.data, this.tagConfig)
      }

      if (Array.isArray(this.tagConfig.items)) {
        return this.tagConfig.items
      }

      return this.getValueByPath(this.data, this.tagConfig.prop)
    },
    isEmptyValue(value) {
      const isEmptyString = typeof value === 'string' && value.trim() === ''
      const isEmptyArray = Array.isArray(value) && value.length === 0

      return value === null || value === undefined || isEmptyString || isEmptyArray
    },
    formatEmptyValue(value) {
      return this.isEmptyValue(value) ? this.resolvedEmptyText : value
    },
    getInfoClasses(item, index) {
      const classes = {
        ['avatar-info-display__info--' + (index + 1)]: true
      }

      if (item.className) {
        classes[item.className] = true
      }

      return classes
    },
    handleAvatarError(error) {
      this.$emit('avatar-error', error)
      return true
    }
  }
}
</script>

<style scoped>
.avatar-info-display {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  border-radius: 8px;
  background: #ffffff;
  color: #303133;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.avatar-info-display--bordered {
  border: 1px solid #e4e7ed;
}

.avatar-info-display__row {
  flex-wrap: wrap;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.avatar-info-display__avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 104px;
}

.avatar-info-display__content {
  min-width: 0;
}

.avatar-info-display__info {
  display: flex;
  gap: 8px;
  align-items: baseline;
  min-width: 0;
  color: #606266;
  line-height: 1.5;
}

.avatar-info-display__info + .avatar-info-display__info {
  margin-top: 4px;
}

.avatar-info-display__info--1 {
  color: #303133;
  font-size: 22px;
  font-weight: 600;
}

.avatar-info-display__info--2 {
  font-size: 15px;
}

.avatar-info-display__info--3 {
  color: #909399;
  font-size: 13px;
}

.avatar-info-display__info-label {
  flex: none;
  color: #909399;
  font-size: 13px;
  font-weight: 400;
}

.avatar-info-display__info-value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar-info-display__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 24px;
  margin-top: 12px;
}

.avatar-info-display__tag-label {
  color: #909399;
  font-size: 13px;
}

.avatar-info-display__tag {
  margin: 0;
}

.avatar-info-display__empty {
  color: #909399;
  font-size: 14px;
}

@media (max-width: 767px) {
  .avatar-info-display {
    padding: 20px;
  }

  .avatar-info-display__content {
    margin-top: 16px;
    text-align: center;
  }

  .avatar-info-display__info {
    justify-content: center;
  }

  .avatar-info-display__tags {
    justify-content: center;
  }
}
</style>
