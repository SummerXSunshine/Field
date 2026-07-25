# ElementTreeSelect

## 用途

`ElementTreeSelect` 是一个基于 Element UI 的 Vue 2 树形选择器组件。它使用 `el-popover` 承载 `el-tree`，外层以 `el-input` 展示已选节点文本，适合在表单中选择组织、部门、区域、分类等树形数据。

组件保持数据源无关，不硬编码业务字段。节点唯一值字段通过 `nodeKey` 配置，节点显示字段、子节点字段、禁用字段通过 `props` 配置。

## Props

- `value`：当前选中值，支持 `String`、`Number`、`Array`。单选时使用单个值，多选时使用数组。
- `data`：树形数据数组，直接传给 `el-tree`。
- `props`：Element UI tree 字段映射，默认 `{ label: 'label', children: 'children', disabled: 'disabled' }`。
- `nodeKey`：节点唯一键字段，默认 `id`。
- `multiple`：是否多选，默认 `false`。
- `checkStrictly`：多选时父子节点是否不联动，默认 `true`。
- `clearable`：是否允许清空，默认 `true`。
- `filterable`：是否显示过滤输入框，默认 `true`。
- `disabled`：是否禁用，默认 `false`。
- `defaultExpandAll`：是否默认展开全部节点，默认 `false`。
- `expandOnClickNode`：是否点击节点时展开或收起节点，默认 `false`。
- `placeholder`：选择器占位文本，默认 `请选择`。
- `filterPlaceholder`：过滤框占位文本，默认 `输入关键字过滤`。
- `emptyText`：空数据文本，默认 `暂无数据`。
- `size`：输入框尺寸，支持 `medium`、`small`、`mini`、空字符串，默认 `small`。
- `popoverWidth`：下拉面板宽度，默认 `280`。
- `separator`：多选展示文本分隔符，默认 `、`。

## Events

- `input(value)`：选中值变化时触发，用于 Vue 2 `v-model`。
- `change(value, nodes)`：选中值变化时触发，第二个参数是当前选中的完整节点数组。
- `node-click(node)`：点击树节点时触发。
- `clear()`：清空选择时触发。

## Slots

- `node`：自定义树节点内容。插槽参数为 `{ node, data }`，其中 `node` 是 Element UI TreeNode，`data` 是原始节点数据。

## 状态

- 默认状态：展示输入框，点击后展开树形面板。
- 选中状态：输入框展示已选节点名称。
- 多选状态：树节点展示 checkbox，输入框用 `separator` 拼接多个节点名称。
- 禁用状态：输入框和树选择行为禁用。
- 空数据状态：使用 Element UI `empty-text` 展示空提示。
- 过滤状态：输入关键字后调用 `el-tree.filter` 过滤节点。

## 关键逻辑说明

- `treeProps`：合并默认字段映射和外部传入的 `props`，避免组件绑定固定字段名。
- `normalizedValue`：根据 `multiple` 把外部 `value` 标准化。多选强制使用数组，单选从数组中取第一个值。
- `selectedKeys`：把当前选中值统一转成数组，方便后续查找节点、同步 `el-tree` 状态。
- `flattenedNodes`：递归拍平 `data`，用于根据选中 key 找到完整节点对象。
- `displayText`：从 `selectedNodes` 里取节点 label，并用 `separator` 拼接成输入框展示文本。
- `syncTreeCheckedState`：外部 `value` 或 `data` 变化后同步 Element UI Tree 内部状态。多选调用 `setCheckedKeys`，单选调用 `setCurrentKey`。
- `handleNodeClick`：单选模式点击节点后立即写入当前节点 key，并关闭下拉面板；多选模式交给 checkbox 的 `check` 事件处理。
- `handleCheck`：多选模式读取 `getCheckedKeys()`，然后通过 `input` 和 `change` 把新值同步给父组件。
- `filterNode`：根据当前 label 字段执行大小写不敏感的关键字过滤。

## 使用示例

```vue
<template>
  <element-tree-select
    v-model="departmentId"
    :data="departmentTree"
    :props="{ label: 'name', children: 'children', disabled: 'disabled' }"
    node-key="id"
    placeholder="请选择部门"
    @change="handleDepartmentChange"
  />
</template>

<script>
import ElementTreeSelect from '@/components/ElementTreeSelect/ElementTreeSelect.vue';

export default {
  components: {
    ElementTreeSelect,
  },
  data() {
    return {
      departmentId: '',
      departmentTree: [
        {
          id: 'root',
          name: '总部',
          children: [
            { id: 'tech', name: '技术部' },
            { id: 'market', name: '市场部' },
          ],
        },
      ],
    };
  },
  methods: {
    handleDepartmentChange(value, nodes) {
      console.log(value, nodes);
    },
  },
};
</script>
```

## 多选示例

```vue
<element-tree-select
  v-model="departmentIds"
  multiple
  :data="departmentTree"
  :props="{ label: 'name', children: 'children' }"
  node-key="id"
/>
```

## 验证说明

组件依赖 Element UI，当前项目已在 `src/main.js` 中通过 `Vue.use(ElementUI)` 全局注册。新增或修改组件后需要运行：

```bash
npm.cmd run build
```
