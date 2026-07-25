<template>
  <div
    class="element-tree-select"
    :class="{
      'element-tree-select--disabled': disabled,
      'element-tree-select--multiple': multiple,
    }"
  >
    <el-popover
      ref="popover"
      v-model="popoverVisible"
      placement="bottom-start"
      trigger="click"
      :width="popoverWidth"
      :disabled="disabled"
      popper-class="element-tree-select__popper"
      @show="handlePopoverShow"
    >
      <div class="element-tree-select__panel">
        <el-input
          v-if="filterable"
          v-model="filterText"
          class="element-tree-select__filter"
          :placeholder="filterPlaceholder"
          size="small"
          clearable
          :disabled="disabled"
        />

        <div class="element-tree-select__tree-wrap">
          <el-tree
            ref="tree"
            class="element-tree-select__tree"
            :data="data"
            :props="treeProps"
            :node-key="nodeKey"
            :show-checkbox="multiple"
            :check-strictly="checkStrictly"
            :default-expand-all="defaultExpandAll"
            :expand-on-click-node="expandOnClickNode"
            :filter-node-method="filterNode"
            :highlight-current="!multiple"
            :current-node-key="multiple ? undefined : currentSingleKey"
            :empty-text="emptyText"
            :disabled="disabled"
            @node-click="handleNodeClick"
            @check="handleCheck"
          >
            <span
              slot-scope="{ node, data: nodeData }"
              class="element-tree-select__node"
            >
              <slot name="node" :node="node" :data="nodeData">
                <span class="element-tree-select__node-label">{{ node.label }}</span>
              </slot>
            </span>
          </el-tree>
        </div>

        <div v-if="multiple" class="element-tree-select__actions">
          <el-button size="mini" type="text" @click="clearSelection">清空</el-button>
          <el-button size="mini" type="primary" @click="closePopover">确定</el-button>
        </div>
      </div>

      <el-input
        slot="reference"
        ref="reference"
        class="element-tree-select__reference"
        :value="displayText"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="true"
        :clearable="clearable && hasValue && !disabled"
        :size="size"
        :suffix-icon="popoverVisible ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
        @clear="clearSelection"
      />
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'ElementTreeSelect',
  inheritAttrs: false,
  props: {
    value: {
      type: [String, Number, Array],
      default: '',
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    props: {
      type: Object,
      default() {
        return {};
      },
    },
    nodeKey: {
      type: String,
      default: 'id',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    checkStrictly: {
      type: Boolean,
      default: true,
    },
    clearable: {
      type: Boolean,
      default: true,
    },
    filterable: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    defaultExpandAll: {
      type: Boolean,
      default: false,
    },
    expandOnClickNode: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    filterPlaceholder: {
      type: String,
      default: '输入关键字过滤',
    },
    emptyText: {
      type: String,
      default: '暂无数据',
    },
    size: {
      type: String,
      default: 'small',
      validator(value) {
        return ['medium', 'small', 'mini', ''].includes(value);
      },
    },
    popoverWidth: {
      type: Number,
      default: 280,
    },
    separator: {
      type: String,
      default: '、',
    },
  },
  data() {
    return {
      popoverVisible: false,
      filterText: '',
    };
  },
  computed: {
    treeProps() {
      return {
        label: 'label',
        children: 'children',
        disabled: 'disabled',
        ...this.props,
      };
    },
    labelKey() {
      return this.treeProps.label || 'label';
    },
    normalizedValue() {
      if (this.multiple) {
        return Array.isArray(this.value) ? this.value : [];
      }

      return Array.isArray(this.value) ? this.value[0] : this.value;
    },
    selectedKeys() {
      if (this.multiple) {
        return this.normalizedValue;
      }

      return this.normalizedValue || this.normalizedValue === 0
        ? [this.normalizedValue]
        : [];
    },
    currentSingleKey() {
      return this.selectedKeys[0];
    },
    selectedNodes() {
      const selectedKeySet = new Set(this.selectedKeys);
      return this.flattenedNodes.filter((node) => selectedKeySet.has(node[this.nodeKey]));
    },
    displayText() {
      return this.selectedNodes
        .map((node) => this.getNodeLabel(node))
        .filter(Boolean)
        .join(this.separator);
    },
    hasValue() {
      return this.selectedKeys.length > 0;
    },
    flattenedNodes() {
      const result = [];
      const childrenKey = this.treeProps.children || 'children';

      const walk = (nodes) => {
        if (!Array.isArray(nodes)) {
          return;
        }

        nodes.forEach((node) => {
          result.push(node);
          walk(node[childrenKey]);
        });
      };

      walk(this.data);
      return result;
    },
  },
  watch: {
    filterText(value) {
      if (this.$refs.tree) {
        this.$refs.tree.filter(value);
      }
    },
    value: {
      immediate: true,
      handler() {
        this.$nextTick(this.syncTreeCheckedState);
      },
    },
    data() {
      this.$nextTick(this.syncTreeCheckedState);
    },
  },
  methods: {
    handlePopoverShow() {
      this.$nextTick(this.syncTreeCheckedState);
    },
    handleNodeClick(nodeData) {
      if (this.disabled || this.isNodeDisabled(nodeData)) {
        return;
      }

      this.$emit('node-click', nodeData);

      if (this.multiple) {
        return;
      }

      const nextValue = nodeData[this.nodeKey];
      this.emitValue(nextValue);
      this.closePopover();
    },
    handleCheck() {
      if (!this.multiple || !this.$refs.tree) {
        return;
      }

      const checkedKeys = this.$refs.tree.getCheckedKeys();
      this.emitValue(checkedKeys);
    },
    clearSelection() {
      const emptyValue = this.multiple ? [] : '';

      this.emitValue(emptyValue);
      this.filterText = '';
      this.$emit('clear');
      this.$nextTick(this.syncTreeCheckedState);
    },
    closePopover() {
      this.popoverVisible = false;
    },
    emitValue(value) {
      this.$emit('input', value);
      this.$emit('change', value, this.getSelectedNodesByValue(value));
    },
    syncTreeCheckedState() {
      const tree = this.$refs.tree;

      if (!tree) {
        return;
      }

      if (this.multiple) {
        tree.setCheckedKeys(this.selectedKeys);
        return;
      }

      tree.setCurrentKey(this.currentSingleKey);
    },
    filterNode(keyword, data) {
      if (!keyword) {
        return true;
      }

      return this.getNodeLabel(data).toLowerCase().includes(String(keyword).toLowerCase());
    },
    getNodeLabel(node) {
      const label = node && node[this.labelKey];
      return label || label === 0 ? String(label) : '';
    },
    getSelectedNodesByValue(value) {
      const keys = Array.isArray(value)
        ? value
        : value || value === 0
          ? [value]
          : [];
      const keySet = new Set(keys);

      return this.flattenedNodes.filter((node) => keySet.has(node[this.nodeKey]));
    },
    isNodeDisabled(node) {
      const disabledKey = this.treeProps.disabled || 'disabled';
      return Boolean(node && node[disabledKey]);
    },
  },
};
</script>

<style scoped>
.element-tree-select {
  display: inline-block;
  width: 100%;
}

.element-tree-select--disabled {
  cursor: not-allowed;
}

.element-tree-select__reference {
  width: 100%;
}

.element-tree-select__panel {
  box-sizing: border-box;
}

.element-tree-select__filter {
  margin-bottom: 8px;
}

.element-tree-select__tree-wrap {
  max-height: 260px;
  overflow: auto;
}

.element-tree-select__tree {
  min-width: 100%;
}

.element-tree-select__node {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.element-tree-select__node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.element-tree-select__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
  margin-top: 8px;
}
</style>
