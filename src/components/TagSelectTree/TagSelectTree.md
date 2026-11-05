# 标签选择树 TagSelectTree

基于 Vue 2 与 Element UI 的标签多选树。勾选父节点不会勾选子节点；勾选子节点会勾选所有可选祖先。取消勾选仅影响当前节点，不自动取消父节点或子节点。

## 使用

```vue
<tag-select-tree v-model="selectedIds" :data="tags" />
```

注册组件：`import TagSelectTree from './TagSelectTree.vue'`。
`selectedIds` 为 ID 数组；`tags` 示例：`[{ id: 'root', label: '分类', children: [{ id: 'child', label: '标签' }] }]`。

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | Array | [] | v-model 选中 ID；ID 使用全树唯一的字符串或数字 |
| data | Array | [] | 树数据，不修改输入数据 |
| nodeKey | String | id | 节点唯一标识字段 |
| fields | Object | { label: 'label', children: 'children', disabled: 'disabled' } | 自定义字段映射，请传入完整映射 |
| disabled | Boolean | false | 禁用所有选择操作 |

## 事件与插槽

- `input(keys)`：更新 v-model。
- `change(keys, { node, checked })`：操作后的 ID、当前操作节点及勾选状态。清空时 node 为 null。
- `node` scoped slot：提供 `node`（Element UI 节点）和 `data`（原始数据），用于定制节点内容。

## 状态

支持默认、悬停、选中、搜索、空数据、节点禁用和整体禁用。搜索保留匹配节点的路径。禁用节点不自动勾选，沿其父链继续向上选择；已选禁用节点不可删除，清空时保留。外部 value 原样回显，不强制补选祖先，保持父子独立取消的语义。

## 关键逻辑说明

1. `check-strictly` 关闭 Element UI 默认的双向父子联动。
2. `selectedNodes` 深度遍历数据，按 value 筛出标签，标签顺序与树顺序一致。
3. value/data watcher 调用 `sync`，在下一次渲染后同步树复选框并重新应用搜索。
4. `handleCheck` 读取本次节点的勾选状态，用 `Set(this.value)` 保留其他节点并去重。
5. 勾选时先加入当前 ID，再通过 `parent` 循环到根节点；跳过禁用祖先，并保留更上层可选祖先。
6. 取消时仅删除当前 ID，不遍历后代或删除祖先。
7. `publish` 同步复选框并依次触发 input/change，交由调用方持有状态。
8. `remove` 使用同样的独立取消规则；`clear` 保留禁用节点。

## 验证

演示路由：`/#/components/tag-select-tree`。验证父节点不选子节点、三级子节点选中祖先且不选兄弟、取消父节点保留子节点、搜索与禁用、标签删除和清空。运行 `npm.cmd run build` 构建项目。
