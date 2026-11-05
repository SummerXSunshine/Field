<template>
  <section class="four-level-filter" aria-label="四级标签筛选">
    <header class="four-level-filter__header">
      <div><strong>标签筛选</strong><span>已选 {{ selectedCount }} 项</span></div>
      <el-button size="small" :disabled="disabled || !selectedCount" icon="el-icon-refresh-left" @click="resetAll">全部重置</el-button>
    </header>
    <div v-for="row in visibleRows" :key="row.level" class="four-level-filter__row">
      <div class="four-level-filter__title"><span class="four-level-filter__number">{{ row.level + 1 }}</span><strong>{{ levelLabels[row.level] || `第 ${row.level + 1} 级` }}</strong></div>
      <el-checkbox-group :value="state.selected[row.level]" :disabled="disabled" class="four-level-filter__options" :aria-label="levelLabels[row.level] || `第 ${row.level + 1} 级标签`" @input="updateLevel(row.level, $event)">
        <el-checkbox v-for="item in row.options" :key="item[fieldMap.id]" :label="item[fieldMap.id]" :disabled="Boolean(item[fieldMap.disabled])" border>
          <slot name="label" :item="item" :level="row.level + 1">{{ item[fieldMap.label] }}</slot>
        </el-checkbox>
        <span v-if="!row.options.length" class="four-level-filter__empty">暂无标签</span>
      </el-checkbox-group>
      <el-button type="text" :disabled="disabled || !state.selected[row.level].length" :aria-label="`重置第 ${row.level + 1} 级标签`" @click="resetLevel(row.level)">重置</el-button>
    </div>
    <footer class="four-level-filter__hint">勾选标签后展示其子标签；取消上级时，对应下级选择同步清除。</footer>
  </section>
</template>

<script>
import { deriveLevels } from './selection'

const emptySelection = () => [[], [], [], []]
export default {
  name: 'FourLevelTagFilter',
  props: {
    value: { type: Array, default: emptySelection },
    data: { type: Array, default: () => [] },
    fields: { type: Object, default: () => ({}) },
    levelLabels: { type: Array, default: () => ['一级标签', '二级标签', '三级标签', '四级标签'] },
    disabled: { type: Boolean, default: false }
  },
  computed: {
    fieldMap() { return { id: 'id', label: 'label', children: 'children', disabled: 'disabled', ...this.fields } },
    state() { return deriveLevels(this.data, this.value, this.fieldMap) },
    visibleRows() {
      return this.state.options.map((options, level) => ({ options, level })).filter(row => row.level === 0 || row.options.length)
    },
    selectedCount() { return this.state.selected.reduce((count, ids) => count + ids.length, 0) }
  },
  watch: {
    state: {
      deep: true,
      immediate: true,
      handler(state) {
        // Remove stale IDs after external data/value changes, including hidden descendants.
        if (JSON.stringify(state.selected) !== JSON.stringify(this.value)) this.publish(state.selected)
      }
    }
  },
  methods: {
    publish(selected) {
      const output = selected.map(ids => ids.slice())
      this.$emit('input', output)
      this.$emit('change', ...output.map(ids => ids.slice()))
    },
    updateLevel(level, ids) {
      if (this.disabled) return
      const next = this.state.selected.map(values => values.slice())
      next[level] = ids
      this.publish(deriveLevels(this.data, next, this.fieldMap).selected)
    },
    resetLevel(level) {
      if (this.disabled) return
      const next = this.state.selected.map((ids, index) => index >= level ? [] : ids.slice())
      this.publish(next)
      this.$emit('reset', level + 1)
    },
    resetAll() {
      if (this.disabled) return
      this.publish(emptySelection())
      this.$emit('reset', null)
    }
  }
}
</script>

<style scoped>
.four-level-filter { border: 1px solid #e4eaf2; border-radius: 12px; background: #fff; color: #303c50; overflow: hidden; }
.four-level-filter__header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 24px; background: #f8faff; border-bottom: 1px solid #e9edf5; }
.four-level-filter__header span { color: #8390a3; font-size: 12px; margin-left: 14px; }
.four-level-filter__row { display: flex; align-items: flex-start; gap: 20px; padding: 24px; border-bottom: 1px dashed #e8ecf2; }
.four-level-filter__title { display: flex; align-items: center; gap: 10px; min-width: 112px; padding-top: 6px; font-size: 14px; }
.four-level-filter__number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 7px; color: #4089e8; background: #edf4ff; font-size: 12px; }
.four-level-filter__options { display: flex; flex: 1; flex-wrap: wrap; gap: 10px; min-width: 0; }
.four-level-filter__options ::v-deep .el-checkbox.is-bordered { margin: 0; height: auto; min-height: 36px; padding: 9px 12px; border-radius: 6px; white-space: normal; }
.four-level-filter__options ::v-deep .el-checkbox.is-checked { background: #f0f7ff; }
.four-level-filter__empty, .four-level-filter__hint { color: #8994a4; font-size: 12px; line-height: 24px; }
.four-level-filter__hint { padding: 14px 24px; }
@media (max-width: 700px) { .four-level-filter__row { flex-wrap: wrap; gap: 12px; padding: 18px; } .four-level-filter__title { min-width: 0; } .four-level-filter__options { order: 3; flex-basis: 100%; } .four-level-filter__row > .el-button { margin-left: auto; } }
</style>
