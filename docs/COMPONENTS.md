# 组件说明文档

## RelationshipTree

`src/components/RelationshipTree/RelationshipTree.vue` 是当前主用的关系树组件。它只负责渲染传入的树数据、处理视图交互和抛出事件，不直接请求外部接口，也不持有业务数据源。组件同目录文档见 `src/components/RelationshipTree/RelationshipTree.md`。

## 基本用法

```vue
<RelationshipTree
  ref="relationshipTree"
  :root="filteredRelationshipData"
  :selected-node-id="selectedNodeId"
  :collapsed-node-ids="collapsedNodeIds"
  :enable-collapse="enableCollapse"
  :zoom="zoom"
  :min-zoom="minZoom"
  :max-zoom="maxZoom"
  :edge-label-background="false"
  :node-width="200"
  :node-height="41"
  :level-gap="136"
  :sibling-gap="34"
  :relation-group-child-gap="120"
  @node-click="handleNodeClick"
  @toggle-collapse="toggleCollapse"
  @zoom-change="handleZoomChange"
/>
```

## 数据结构

组件接收一棵树，根节点通过 `root` 传入。节点常用字段如下：

```js
{
  id: 'phone-contact-4',
  name: '高亮节点',
  subtitle: '短信往来 12 条',
  tag: '通联关系',
  eventDate: '2026-03-03',
  variant: 'avatar',
  highlightSignal: 'medium',
  edge: {
    label: '短信',
    stroke: '#ef4444',
    strokeWidth: 1,
    labelBackground: '#fef2f2',
    labelColor: '#b91c1c'
  },
  children: []
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 必填，节点唯一标识。 |
| `name` | `string` | 节点主文本。 |
| `subtitle` | `string` | 节点说明文本，目前主要用于数据和筛选。 |
| `tag` | `string` | 顶层子节点按 `tag` 自动聚合成关系分组节点。 |
| `eventDate` | `string` | 日期筛选字段，格式建议为 `YYYY-MM-DD`。 |
| `variant` | `string` | 为 `'avatar'` 时渲染头像节点。 |
| `highlightSignal` | `string/object` | 高亮信号。支持 `high`、`medium`、`low` 或自定义颜色对象。 |
| `edge` | `object` | 从父节点连接到当前节点的边样式。 |
| `children` | `array` | 子节点列表。 |
| `style` | `object` | 节点内联样式，会覆盖关系颜色派生样式。 |

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `root` | `Object` | 必填 | 关系树根数据。 |
| `selectedNodeId` | `String` | `''` | 当前选中节点 id。 |
| `collapsedNodeIds` | `Array` | `[]` | 已折叠节点 id 列表。 |
| `enableCollapse` | `Boolean` | `true` | 是否显示折叠按钮。根节点折叠按钮固定隐藏。 |
| `zoom` | `Number` | `1` | 当前缩放比例。 |
| `minZoom` | `Number` | `0.4` | 最小缩放比例。 |
| `maxZoom` | `Number` | `2` | 最大缩放比例。 |
| `nodeWidth` | `Number` | `188` | 普通节点宽度。 |
| `nodeHeight` | `Number` | `82` | 普通节点高度。 |
| `levelGap` | `Number` | `136` | 普通层级横向间距。 |
| `siblingGap` | `Number` | `34` | 兄弟节点纵向间距。 |
| `avatarNodeWidth` | `Number` | `96` | 头像节点宽度。 |
| `avatarNodeHeight` | `Number` | `84` | 头像节点高度。 |
| `relationGroupLineWidth` | `Number` | `220` | 关系分组节点横线长度。 |
| `relationGroupLineHeight` | `Number` | `32` | 关系分组节点高度。 |
| `relationGroupRootGap` | `Number` | `96` | 根节点到关系分组节点的横向距离。 |
| `relationGroupChildGap` | `Number` | `96` | 关系分组节点到子节点的额外距离。 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `node-click` | `node` | 点击节点时触发。外层可在这里选中节点或加载外部 children。 |
| `toggle-collapse` | `node` | 点击折叠按钮时触发。 |
| `zoom-change` | `nextZoom` | 鼠标滚轮缩放时触发。外层需要同步更新 `zoom`。 |

## 公开方法

通过 `ref` 调用：

```js
this.$refs.relationshipTree.fitToView()
```

| 方法 | 说明 |
| --- | --- |
| `fitToView()` | 根据容器大小自动缩放并居中整棵树。 |

## 关系分组逻辑

组件会把根节点的直接子节点按 `tag` 分组，生成内部关系分组节点。分组节点使用第一条同类关系的 `edge.stroke`、`edge.labelBackground` 和 `edge.labelColor` 作为颜色来源。

边线规则：

- 根节点到关系分组节点：使用分组关系颜色，不显示箭头。
- 普通节点关系线：使用目标节点 `edge` 颜色，显示箭头。
- 边线路径为正交折线：水平、垂直、水平。

## 选中、高亮和头像节点

- 选中态由外层传入 `selectedNodeId` 控制。
- 普通节点、头像节点、关系分组节点有独立选中样式。
- 头像节点的连线锚点和折叠按钮按头像圆心对齐。
- `highlightSignal` 会覆盖节点背景色、字色和边框色。

内置高亮信号：

| 值 | 说明 |
| --- | --- |
| `high` | 深红强调。 |
| `medium` | 中等红色强调。 |
| `low` | 浅红强调。 |

自定义高亮信号示例：

```js
highlightSignal: {
  background: '#fef2f2',
  color: '#991b1b',
  borderColor: '#ef4444'
}
```

## 外部加载子节点

组件不负责请求外部数据。推荐在外层 `node-click` 中加载并合并数据：

```js
handleNodeClick(node) {
  this.selectedNodeId = node.id
  this.selectedNode = node
  this.loadExternalChildren(node)
}
```

当前示例在 `src/App.vue` 中使用 `externalChildrenMap` 模拟外部数据源，并通过 `appendChildrenToNode` 合并回 `relationshipData`。

## 外层筛选

筛选逻辑位于 `src/utils/relationFilter.js`，不放在组件内部。当前支持：

- 层级筛选：2-10 层。
- 标签文本筛选：匹配节点名称、说明、标签、关系文本。
- 时间范围筛选：通过 `eventDate` 过滤。

筛选会保留命中节点的祖先路径，避免深层节点失去上下文。

## AntV 测试组件

`src/components/AntvRelationshipGraph.vue` 是 AntV G6 版本的技术验证组件。测试页入口：

```text
/?page=antv
```

它使用 G6 自定义节点和正交折线边，尽量复刻现有组件逻辑。当前建议仍以 `RelationshipTree` 作为主实现；AntV 版本保留用于后续图谱化、大规模节点或复杂图交互验证。

## 开发和验证

常用命令：

```bash
npm.cmd run build
```

注意事项：

- 不要手动修改 `dist/`。
- 不要提交 `node_modules/`、日志、临时文件。
- 源码使用 UTF-8 无 BOM。
- 修改组件交互后，至少执行一次构建验证。