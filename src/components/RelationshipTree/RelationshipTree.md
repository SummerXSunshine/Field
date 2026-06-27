# RelationshipTree

## 组件用途

`RelationshipTree` 是一个 Vue 2 关系树组件。它使用 SVG 绘制关系线，使用 `foreignObject` 承载 HTML 节点内容，支持关系分组、节点选中、折叠、缩放、拖拽、鼠标滚轮缩放、普通 SVG 箭头和节点悬浮窗。

悬浮窗放在 SVG/`foreignObject` 外层的 HTML 层中，因此不会被 `foreignObject` 的边界裁剪。

## 文件说明

- `RelationshipTree.vue`：组件实现文件。
- `RelationshipTree.md`：组件 API、使用方式和关键逻辑说明。

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `root` | Object | 必填 | 根节点数据。 |
| `selectedNodeId` | String | `''` | 当前选中节点 id，用于选中高亮。 |
| `collapsedNodeIds` | Array | `[]` | 外部控制的折叠节点 id 列表。 |
| `enableCollapse` | Boolean | `true` | 是否启用折叠按钮。 |
| `zoom` | Number | `1` | 当前缩放比例，由外部控制。 |
| `minZoom` | Number | `0.4` | 最小缩放比例。 |
| `maxZoom` | Number | `2` | 最大缩放比例。 |
| `edgeLabelBackground` | Boolean | `true` | 是否显示关系线描述文字的背景矩形。 |
| `nodeWidth/nodeHeight` | Number | `188/82` | 普通节点默认尺寸。 |
| `avatarNodeWidth/avatarNodeHeight` | Number | `96/84` | 头像节点默认尺寸。 |
| `relationGroupLineWidth/relationGroupLineHeight` | Number | `220/64` | 关系分组节点默认尺寸。 |
| `relationGroupRootGap` | Number | `96` | 根节点到关系分组层的横向间距。 |
| `relationGroupChildGap` | Number | `96` | 关系分组层到普通节点层的额外横向间距。 |

## Events

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| `node-click` | node | 节点被点击且没有发生拖拽移动时触发。 |
| `toggle-collapse` | node | 点击折叠按钮时触发，由外部更新 `collapsedNodeIds`。 |
| `zoom-change` | number | 请求外部更新受控缩放值。 |

## Slots

| 插槽名 | 参数 | 说明 |
| --- | --- | --- |
| `node` | `{ node }` | 替换默认节点内容。 |
| `popover` | `{ node }` | 替换默认节点悬浮窗内容。 |

## 组件状态

- 默认状态：根据分组后的树数据渲染所有未折叠节点。
- 选中状态：通过 `selectedNodeId` 给匹配节点添加选中 class。
- 折叠状态：通过 `collapsedNodeIds` 在布局测量阶段隐藏子节点。
- 拖拽状态：鼠标移动时更新平移坐标。
- 缩放状态：鼠标滚轮或外部按钮更新缩放比例。
- 悬浮窗状态：鼠标 hover 节点时记录 `popoverNodeId`，并把浮窗定位到节点右侧。

## 示例路由

当前项目中的关系树组件示例路由为：

```text
/#/components/relationship-tree
```

组件示例页文件为：

```text
src/views/RelationshipTreeDemo.vue
```

## 基本用法

```vue
<RelationshipTree
  :root="treeData"
  :selected-node-id="selectedNodeId"
  :collapsed-node-ids="collapsedNodeIds"
  :zoom="zoom"
  :edge-label-background="false"
  @node-click="handleNodeClick"
  @toggle-collapse="toggleCollapse"
  @zoom-change="zoom = $event"
/>
```

## 重要逻辑逐段说明

### 根节点子节点分组

```js
const root = this.root || {};
```
当外部还没有传入有效根节点时，使用空对象兜底，避免后续布局逻辑读取属性时报错。

```js
const children = root.children || [];
```
把缺失的 `children` 统一处理为空数组，后续逻辑就可以稳定使用数组方法。

```js
const tag = child.tag && String(child.tag).trim() ? String(child.tag).trim() : '';
```
把每个子节点的 `tag` 转成去除前后空格的字符串。没有 tag 或 tag 为空时，会归到空字符串分组。

```js
if (!groupMap[tag]) { ... }
```
如果当前 tag 还没有对应的分组节点，就创建一个新的关系分组节点。

```js
groupMap[tag].children.push(child);
```
把原始子节点放入对应分组节点下，不直接修改原始子节点本身。

### 布局测量

```js
const children = this.collapsedNodeIdSet.has(node.id) ? [] : (node.children || []);
```
如果节点被折叠，就在布局计算中把它当成叶子节点处理，不再测量它的子节点。

```js
const laidOutChildren = children.map(child => measure(child, depth + 1));
```
先递归测量子节点，再根据子节点的位置反推当前父节点的位置。

```js
const width = node.width || (...);
const height = node.height || (...);
```
节点可以通过自身 `width/height` 覆盖默认尺寸；没有配置时按分组节点、头像节点、普通节点分别取默认值。

```js
const y = laidOutChildren.length > 0 ? (...) / 2 - anchorOffset : nextLeafY.value;
```
有子节点时，父节点垂直居中到第一个和最后一个子节点锚点之间；没有子节点时，使用当前叶子节点游标。

```js
nextLeafY.value += height + this.siblingGap;
```
只有叶子节点会推进垂直游标，这样父节点位置始终由子节点范围决定。

### 鼠标位置缩放

```js
const contentX = (pointerX - this.dragState.panX) / currentZoom;
const contentY = (pointerY - this.dragState.panY) / currentZoom;
```
把鼠标在视口里的坐标转换成未缩放前的树内容坐标。

```js
this.dragState.panX = pointerX - contentX * nextZoom;
this.dragState.panY = pointerY - contentY * nextZoom;
```
根据新的缩放比例反算平移值，让缩放前后鼠标指向的树内容位置保持不变。

### 手动画箭头

```js
edgeHasArrow(edge) {
  return !(edge.to && edge.to.isTagGroup);
}
```
普通节点连线保留箭头；连接到关系分组节点的线不显示箭头。

```js
edgeArrowPath(edge) { ... }
```
用普通 SVG 三角形 `path` 绘制箭头，不再依赖 `marker-end=url(#...)`，可以避开部分浏览器对 SVG marker URL 引用兼容性差的问题。

### 节点悬浮窗定位

```js
left: this.dragState.panX + (node.x + node.width + 12) * this.zoom + 'px'
```
把浮窗放到节点右侧，并同时考虑当前拖拽平移和缩放比例。

```js
top: this.dragState.panY + (node.y + node.height / 2) * this.zoom + 'px'
```
把浮窗垂直方向对齐到节点中心点，同样考虑当前平移和缩放。

## 验证方式

修改组件后运行：

```bash
npm.cmd run build
```
