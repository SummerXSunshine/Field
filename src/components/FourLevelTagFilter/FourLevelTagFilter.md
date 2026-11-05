# 四级标签筛选 FourLevelTagFilter

Vue 2 / Element UI 组件。初始仅展示一级 checkbox；勾选后合并展示所选父项的直接子标签，最多四级。取消上级仅清除该分支下失效的后代选择，保留其他分支。无子项时不显示空的下一级。

## 使用

```vue
<four-level-tag-filter v-model="selected" :data="tags" @change="onChange" />
```

注册 `import FourLevelTagFilter from './FourLevelTagFilter.vue'`。
初始化 `selected: [[], [], [], []]`。
数据格式：`[{ id: 'a', label: '标签', children: [{ id: 'b', label: '子标签' }] }]`。
ID 使用唯一字符串或数字；同级不能重复，建议全树唯一。第五级及以下不参与展示与输出。

## Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| value | Array | [[], [], [], []] | v-model：按一级至四级排列的四个 ID 数组 |
| data | Array | [] | 树数据 |
| fields | Object | {} | 可部分覆盖 id、label、children、disabled 字段名 |
| levelLabels | Array | 一级标签至四级标签 | 各行标题 |
| disabled | Boolean | false | 禁用勾选与重置 |

## 事件、插槽与方法

- `input([level1Ids, level2Ids, level3Ids, level4Ids])`：v-model 输出，每次创建新数组。
- `change(level1Ids, level2Ids, level3Ids, level4Ids)`：四个独立数组参数，可用于查询接口。
- `reset(level)`：1–4 表示重置对应层级及其下级；null 表示全部重置。
- `label` 作用域插槽：`{ item, level }`，level 为 1–4，用于自定义标签显示。
- `resetAll()`：通过 ref 调用，清空四层，恢复仅一级可见。
- `resetLevel(index)`：通过 ref 调用，index 为 0–3。

## 状态和重置语义

每个已展示层级右侧都有“重置”，顶部“全部重置”一键清空所有选择。重置下级保留上级；重置上级同时清除依赖它的下级。禁用标签不能通过 checkbox 修改，但重置可以清除其历史选择。空数据展示一级空状态。支持选中、悬停、禁用和窄屏换行。

## 关键逻辑逐项说明

1. `deriveLevels` 从根数组开始，固定循环四次，保证输出始终为四个数组。
2. `options.push(candidates)` 记录当前层可见标签。
3. `Set(value[level])` 用于判断勾选 ID，当前可见候选项之外的 ID 自动丢弃。
4. `active` 筛出当前层可见且已选的节点，输出顺序按原始数据排列。
5. `active.reduce` 合并已选节点的 children，成为下一级候选项；未选分支不会进入下一级。
6. `state` 根据 props 推导展示与选择，不修改原始数据。
7. `visibleRows` 始终保留一级，其他层仅在有候选标签时展示。
8. `updateLevel` 只替换操作层的数组，再运行 deriveLevels，递归清除失效后代且保留其他分支。
9. `resetLevel` 清空当前级与更深层数组；`resetAll` 生成四个独立空数组。
10. `publish` 先发 input 再发带四个独立数组参数的 change，避免依赖内部状态。
11. state watcher 清理外部 value 或异步数据更新中的失效 ID，内容相同时不重复触发。

## 验证

演示地址：`/#/components/four-level-tag-filter`。
检查初始仅一级、多父项子集并集、逐层展开四级、取消分支清理后代且保留其他分支、每级重置、全部重置、叶节点和空数据。运行 `npm.cmd run build`。
