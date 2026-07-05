<template>
  <div
    class="hover-popover-directive"
    :class="popoverClasses"
    role="tooltip"
  >
    <div
      v-if="options.title"
      class="hover-popover-directive__title"
    >
      {{ options.title }}
    </div>

    <div
      v-if="options.html"
      class="hover-popover-directive__content"
      v-html="options.html"
    />

    <div
      v-else-if="normalizedRows.length"
      class="hover-popover-directive__content"
    >
      <div
        v-for="(row, index) in normalizedRows"
        :key="row.key || index"
        class="hover-popover-directive__row"
      >
        <span class="hover-popover-directive__label">{{ row.label }}</span>
        <span class="hover-popover-directive__value">{{ row.value }}</span>
      </div>
    </div>

    <div
      v-else
      class="hover-popover-directive__content"
    >
      <div class="hover-popover-directive__value">{{ options.content }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HoverPopoverContent',
  props: {
    options: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    popoverClasses() {
      return [
        {
          'hover-popover-directive--visible': this.visible
        },
        this.options.className,
        this.options.popoverClass
      ]
    },
    normalizedRows() {
      if (!Array.isArray(this.options.rows)) {
        return []
      }

      return this.options.rows.map((row, index) => {
        if (!row || typeof row !== 'object') {
          return {
            key: index,
            label: '',
            value: row || ''
          }
        }

        return {
          key: row.key || row.prop || row.label || index,
          label: row.label || '',
          value: row.value == null ? '' : row.value
        }
      })
    }
  }
}
</script>

<style scoped>
.hover-popover-directive {
  position: fixed;
  z-index: 3000;
  box-sizing: border-box;
  max-width: 320px;
  padding: 12px 14px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
  font-family: Arial, "Microsoft YaHei", sans-serif;
  font-size: 13px;
  line-height: 1.45;
  user-select: text;
  pointer-events: auto;
  opacity: 0;
  transform: translateY(2px);
  transition: opacity 120ms ease, transform 120ms ease;
}

.hover-popover-directive--visible {
  opacity: 1;
  transform: translateY(0);
}

.hover-popover-directive__title {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.hover-popover-directive__content {
  display: grid;
  gap: 6px;
}

.hover-popover-directive__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
}

.hover-popover-directive__label {
  color: #64748b;
  white-space: nowrap;
}

.hover-popover-directive__value {
  min-width: 0;
  color: #334155;
  word-break: break-word;
}
</style>
