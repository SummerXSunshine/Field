<template>
  <div class="tag-select-tree">
    <div class="tag-select-tree__selection">
      <el-tag v-for="item in selectedNodes" :key="item[nodeKey]" :closable="!disabled && !item[fields.disabled]" size="small" @close="remove(item[nodeKey])">{{ item[fields.label] }}</el-tag>
      <span v-if="!selectedNodes.length" class="tag-select-tree__placeholder">尚未选择标签</span>
      <el-button type="text" :disabled="disabled || !value.length" @click="clear">清空</el-button>
    </div>
    <el-input v-model="query" placeholder="搜索标签" prefix-icon="el-icon-search" clearable size="small" :disabled="disabled" />
    <el-tree ref="tree" class="tag-select-tree__tree" :data="data" :node-key="nodeKey" :props="treeProps" show-checkbox check-strictly default-expand-all :expand-on-click-node="false" :filter-node-method="filterNode" empty-text="暂无标签" @check="handleCheck">
      <span slot-scope="{ node, data: item }"><slot name="node" :node="node" :data="item">{{ node.label }}</slot></span>
    </el-tree>
  </div>
</template>
<script>
export default {
  name: 'TagSelectTree',
  props: {
    value: { type: Array, default: () => [] },
    data: { type: Array, default: () => [] },
    nodeKey: { type: String, default: 'id' },
    fields: { type: Object, default: () => ({ label: 'label', children: 'children', disabled: 'disabled' }) },
    disabled: { type: Boolean, default: false }
  },
  data() { return { query: '' } },
  computed: {
    treeProps() { return { label: this.fields.label, children: this.fields.children, disabled: item => this.disabled || Boolean(item[this.fields.disabled]) } },
    selectedNodes() {
      const result = []
      const visit = items => items.forEach(item => {
        if (this.value.includes(item[this.nodeKey])) result.push(item)
        visit(item[this.fields.children] || [])
      })
      visit(this.data)
      return result
    }
  },
  watch: {
    value: { deep: true, handler() { this.sync() } },
    data: { deep: true, handler() { this.sync() } },
    query(value) { this.$refs.tree.filter(value) }
  },
  mounted() { this.sync() },
  methods: {
    sync() { this.$nextTick(() => { this.$refs.tree.setCheckedKeys(this.value); this.$refs.tree.filter(this.query) }) },
    filterNode(query, item) { return String(item[this.fields.label] || '').toLowerCase().includes(query.trim().toLowerCase()) },
    handleCheck(item, state) {
      if (this.disabled) return this.sync()
      const key = item[this.nodeKey]
      const checked = state.checkedKeys.includes(key)
      const keys = new Set(this.value)
      if (checked) {
        keys.add(key)
        let parent = this.$refs.tree.getNode(key).parent
        while (parent && parent.level > 0) {
          if (!parent.disabled) keys.add(parent.key)
          parent = parent.parent
        }
      } else keys.delete(key)
      this.publish(Array.from(keys), item, checked)
    },
    publish(keys, node = null, checked = false) {
      this.$refs.tree.setCheckedKeys(keys)
      this.$emit('input', keys)
      this.$emit('change', keys, { node, checked })
    },
    remove(key) {
      const node = this.$refs.tree.getNode(key)
      if (this.disabled || (node && node.disabled)) return
      this.publish(this.value.filter(item => item !== key), node ? node.data : null)
    },
    clear() {
      if (this.disabled) return
      this.publish(this.value.filter(key => { const node = this.$refs.tree.getNode(key); return node && node.disabled }))
    }
  }
}
</script>
<style scoped>
.tag-select-tree { background: #fff; border: 1px solid #e3e8ef; border-radius: 12px; padding: 20px; }
.tag-select-tree__selection { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 40px; padding-bottom: 14px; }
.tag-select-tree__selection .el-button { margin-left: auto; }
.tag-select-tree__placeholder { color: #909399; font-size: 13px; }
.tag-select-tree__tree { margin-top: 16px; max-height: 400px; overflow: auto; }
.tag-select-tree__tree ::v-deep .el-tree-node__content { height: 36px; border-radius: 5px; }
</style>
