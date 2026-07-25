# RelationshipTree 组件说明

## 1. 组件概览

`RelationshipTree` 是一个基于 Vue 2 Options API 的关系树组件，用于展示人物、组织、事件等具有父子层级的关系数据。

组件采用以下渲染方式：

- SVG `path` 绘制父子连线、关系标签和箭头。
- SVG `foreignObject` 承载 HTML 节点，便于使用普通 CSS 和 Vue 插槽定制节点内容。
- 外层 HTML 负责悬浮详情弹窗，避免弹窗被 `foreignObject` 边界裁剪。
- 固定尺寸 SVG 缩略图展示全局关系结构和当前视口范围。
- 通过平移状态和受控 `zoom` 实现拖拽、滚轮缩放与自适应居中。

组件只处理通用树结构、尺寸和交互，不依赖具体业务数据源。

## 2. 文件位置

| 文件 | 说明 |
| --- | --- |
| `src/components/RelationshipTree/RelationshipTree.vue` | 组件实现 |
| `src/components/RelationshipTree/RelationshipTree.md` | 当前说明文档 |
| `src/views/RelationshipTreeDemo.vue` | 完整演示数据与交互示例 |
| `src/utils/relationFilter.js` | 演示页使用的关系数据过滤工具 |

演示路由：

```text
/#/components/relationship-tree
```

本地开发地址：

```text
http://127.0.0.1:8080/#/components/relationship-tree
```

## 3. 快速使用

```vue
<template>
  <RelationshipTree
    ref="relationshipTree"
    :root="treeData"
    :selected-node-id="selectedNodeId"
    :collapsed-node-ids="collapsedNodeIds"
    :zoom="zoom"
    :min-zoom="0.4"
    :max-zoom="2"
    @node-click="handleNodeClick"
    @toggle-collapse="handleToggleCollapse"
    @zoom-change="zoom = $event"
  />
</template>

<script>
import RelationshipTree from '@/components/RelationshipTree/RelationshipTree.vue'

export default {
  components: {
    RelationshipTree
  },

  data() {
    return {
      zoom: 1,
      selectedNodeId: '',
      collapsedNodeIds: [],
      treeData: {
        id: 'root',
        name: '根节点',
        variant: 'avatar',
        children: [
          {
            id: 'child-1',
            name: '文本节点',
            tag: '同事关系',
            edge: {
              label: '同事',
              stroke: '#2563eb'
            }
          }
        ]
      }
    }
  },

  methods: {
    handleNodeClick(node) {
      this.selectedNodeId = node.id
    },

    handleToggleCollapse(node) {
      const index = this.collapsedNodeIds.indexOf(node.id)

      if (index >= 0) {
        this.collapsedNodeIds.splice(index, 1)
      } else {
        this.collapsedNodeIds.push(node.id)
      }
    }
  }
}
</script>
```

## 4. 节点数据结构

### 4.1 基础节点

```js
{
  id: 'person-1',
  name: '张三',
  subtitle: '核心人物',
  avatar: '/avatar.png',
  variant: 'avatar',
  type: 'person',
  tag: '同事关系',
  width: 96,
  height: 84,
  eventDate: '2026-07-25',
  highlightSignal: 'high',
  style: {
    background: '#ecfdf5',
    color: '#047857'
  },
  edge: {
    label: '同事',
    stroke: '#2563eb',
    strokeWidth: 2,
    strokeDasharray: '4 4',
    labelBackground: '#eff6ff',
    labelColor: '#1d4ed8'
  },
  children: []
}
```

### 4.2 节点字段

| 字段 | 类型 | 必需 | 说明 |
| --- | --- | --- | --- |
| `id` | String | 是 | 节点唯一标识，同时用于选中、折叠和 Vue key |
| `name` | String | 建议 | 默认节点显示名称 |
| `subtitle` | String | 否 | 默认悬浮详情中的副标题 |
| `children` | Array | 否 | 子节点数组 |
| `tag` | String | 否 | 根节点直接子节点的关系分组依据 |
| `variant` | String | 否 | 设置为 `avatar` 时使用头像节点外观 |
| `type` | String | 否 | 生成 `relationship-tree__node--{type}` 类名 |
| `avatar` | String | 否 | 头像图片地址；缺失时显示名称首字符 |
| `width` | Number | 否 | 覆盖当前节点默认宽度 |
| `height` | Number | 否 | 覆盖当前节点默认高度 |
| `style` | Object | 否 | 合并到节点根元素的内联样式 |
| `edge` | Object | 否 | 当前节点与父节点之间的连线配置 |
| `eventDate` | String | 否 | 默认悬浮详情中的时间 |
| `highlightSignal` | String/Object | 否 | 高亮信号，支持 `high`、`medium`、`low` 或样式对象 |

### 4.3 连线字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | String | 关系描述文字 |
| `stroke` | String | 线条颜色 |
| `strokeWidth` | Number | 线条宽度 |
| `strokeDasharray` | String | SVG 虚线配置，例如 `4 4` |
| `labelBackground` | String | 标签背景颜色 |
| `labelColor` | String | 标签文字颜色 |

## 5. Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `root` | Object | 必填 | 根节点数据 |
| `selectedNodeId` | String | `''` | 当前选中节点 ID |
| `collapsedNodeIds` | Array | `() => []` | 受控折叠节点 ID 数组 |
| `enableCollapse` | Boolean | `true` | 是否显示折叠按钮 |
| `zoom` | Number | `1` | 受控缩放比例，必须大于 0 |
| `minZoom` | Number | `0.4` | 最小缩放比例 |
| `maxZoom` | Number | `2` | 最大缩放比例 |
| `edgeLabelBackground` | Boolean | `true` | 是否绘制连线标签背景 |
| `nodeWidth` | Number | `188` | 普通文本节点默认宽度 |
| `nodeHeight` | Number | `82` | 普通文本节点默认高度 |
| `levelGap` | Number | `136` | 普通层级之间的水平间距 |
| `siblingGap` | Number | `34` | 纵向兄弟节点间距 |
| `avatarNodeWidth` | Number | `96` | 头像节点默认宽度 |
| `avatarNodeHeight` | Number | `84` | 头像节点默认高度 |
| `relationGroupLineWidth` | Number | `220` | 关系分组节点默认宽度 |
| `relationGroupLineHeight` | Number | `64` | 关系分组节点默认高度 |
| `relationGroupRootGap` | Number | `96` | 根节点到关系分组层的水平间距 |
| `relationGroupChildGap` | Number | `96` | 关系分组层到普通节点层的额外水平间距 |

### 5.1 受控属性约定

`zoom`、`selectedNodeId` 和 `collapsedNodeIds` 均由调用方维护。

组件不会直接修改这些 Props：

- 缩放时触发 `zoom-change`。
- 点击节点时触发 `node-click`。
- 点击折叠按钮时触发 `toggle-collapse`。

调用方必须接收事件并更新对应状态。

## 6. Events

| 事件 | 参数 | 触发条件 |
| --- | --- | --- |
| `node-click` | `node` | 点击节点且本次操作不是拖动画布 |
| `toggle-collapse` | `node` | 点击有子节点的折叠按钮 |
| `zoom-change` | `nextZoom` | 滚轮缩放或调用 `fitToView()` 时 |

## 7. Slots

### 7.1 node

替换默认节点内容。

```vue
<RelationshipTree :root="treeData">
  <template #node="{ node }">
    <div class="custom-node">
      <strong>{{ node.name }}</strong>
      <small>{{ node.subtitle }}</small>
    </div>
  </template>
</RelationshipTree>
```

插槽只替换节点内部内容，节点外层仍负责：

- 尺寸约束；
- 选中状态；
- 点击事件；
- 悬浮事件；
- 折叠按钮的默认实现将同时被插槽替换。

自定义内容的实际尺寸应与节点数据中的 `width`、`height` 一致，否则 SVG `foreignObject` 可能裁剪内容，布局计算也无法感知真实 DOM 尺寸。

### 7.2 popover

替换默认悬浮详情。

```vue
<RelationshipTree :root="treeData">
  <template #popover="{ node }">
    <h3>{{ node.name }}</h3>
    <p>{{ node.subtitle }}</p>
  </template>
</RelationshipTree>
```

## 8. 公开方法

### fitToView()

使整棵关系树按当前容器尺寸缩放并居中。

```js
this.$refs.relationshipTree.fitToView()
```

计算步骤：

```js
const fitZoom = Math.min(
  viewportWidth / treeWidth,
  viewportHeight / treeHeight
)

const nextZoom = clampZoom(fitZoom * 0.9)
```

随后根据缩放后的树宽高计算 `panX`、`panY`，并触发 `zoom-change` 通知调用方更新受控缩放值。

## 9. 内部状态

| 状态 | 说明 |
| --- | --- |
| `dragState.active` | 主画布是否正在拖动 |
| `dragState.moved` | 鼠标是否超过点击判定阈值 |
| `dragState.panX/panY` | 主画布平移量 |
| `popoverNodeId` | 当前悬浮详情对应的节点 ID |
| `popoverHideTimer` | 悬浮详情延迟隐藏定时器 |
| `viewportSize` | 当前关系树容器尺寸 |
| `minimapDragState` | 缩略图视口框拖动状态 |

组件销毁前会移除全局鼠标和窗口尺寸监听，并清理悬浮详情定时器。

## 10. 数据分组逻辑

组件只对根节点的直接子节点按 `tag` 分组。

执行过程：

```js
const root = this.root || {}
const children = root.children || []
```

1. 使用空对象和空数组处理缺失数据。
2. 遍历根节点的直接子节点。
3. 将 `tag` 转换为去除首尾空格的字符串。
4. 相同 `tag` 的节点放入同一个虚拟关系分组节点。
5. 分组节点使用 `__tag_group__` 前缀生成内部 ID。
6. 通过 `Object.assign` 创建新的根对象，不直接修改传入的 `root`。

没有 `tag` 的根级子节点会进入空字符串分组。

分组节点属于组件内部布局结构，不要求业务数据预先创建。

## 11. 布局算法

### 11.1 横向坐标

根节点位于第 0 层：

```js
depth === 0 ? 0 : groupX + ...
```

其中：

- `groupX = rootWidth + relationGroupRootGap`
- 后续普通层级使用 `nodeWidth + levelGap`
- 深度大于 1 时额外加入 `relationGroupChildGap`

节点自身的 `width` 不会改变同层全局步长，因此超宽自定义节点需要同时调整相关 Gap。

### 11.2 节点尺寸

尺寸优先级：

1. 节点自身的 `width`、`height`；
2. 关系分组节点尺寸；
3. 头像节点尺寸；
4. 普通节点尺寸。

```js
const height =
  node.height ||
  (node.isTagGroup
    ? relationGroupLineHeight
    : node.variant === 'avatar'
      ? avatarNodeHeight
      : nodeHeight)
```

### 11.3 连线锚点

普通节点和关系分组节点使用高度中心：

```js
height / 2
```

头像节点使用头像圆的中心：

```js
58 / 2
```

因此头像节点的连线会连接头像圆心，而不是整个“头像加姓名”容器的中心。

### 11.4 叶子节点布局

叶子节点使用当前纵向游标：

```js
y = nextLeafY.value
```

然后推进到下一个可用位置：

```js
nextLeafY.value += height + siblingGap
```

### 11.5 非叶子节点布局

父节点的锚点对齐第一个和最后一个子节点锚点的中点：

```js
y =
  (
    firstChild.y + firstChild.anchorOffset +
    lastChild.y + lastChild.anchorOffset
  ) / 2 -
  parentAnchorOffset
```

这样父节点不是按自身外框中心对齐，而是按实际连线锚点对齐。

### 11.6 父节点底边校正

当非叶子父节点比它的单个叶子子节点更高时，父节点底边可能超过叶子节点已经预留的范围。

当前实现会再次校正 `nextLeafY`：

```js
nextLeafY.value = Math.max(
  nextLeafY.value,
  y + height + siblingGap
)
```

含义是下一个兄弟分支必须位于以下两者中更低的位置：

- 叶子节点计算出的下一个位置；
- 当前父节点底边加兄弟间距。

该逻辑用于解决以下结构中头像节点被文本兄弟节点遮挡的问题：

```text
文本父节点
├─ 头像子节点
│  └─ 文本孙节点
└─ 文本子节点
```

## 12. 连线与箭头

### 12.1 折线路径

连线使用水平—垂直—水平折线：

```text
父节点右侧 → 中间折点 → 子节点锚点高度 → 子节点左侧
```

`edgePath()` 使用节点尺寸和 `nodeAnchorY()` 计算路径。

### 12.2 箭头

箭头使用普通 SVG 三角形 `path` 绘制，不依赖 SVG `marker` URL。

连接到关系分组节点时不显示箭头：

```js
return !(edge.to && edge.to.isTagGroup)
```

### 12.3 标签

关系标签位于最后一段水平线附近。

当 `edgeLabelBackground=true` 时，会在文字后绘制背景矩形。

## 13. 缩放和平移

### 13.1 主画布拖动

按下鼠标左键时记录：

- 鼠标起始坐标；
- 当前 `panX`、`panY`。

移动时：

```js
panX = startPanX + deltaX
panY = startPanY + deltaY
```

按钮、链接、输入框、折叠按钮和悬浮详情不会触发画布拖动。

### 13.2 鼠标位置缩放

滚轮缩放前，先将鼠标位置转换成未缩放的内容坐标：

```js
contentX = (pointerX - panX) / currentZoom
contentY = (pointerY - panY) / currentZoom
```

再根据新缩放比例反算平移值：

```js
panX = pointerX - contentX * nextZoom
panY = pointerY - contentY * nextZoom
```

因此缩放过程中，鼠标指向的内容点保持不动。

## 14. 缩略图导航

缩略图固定在组件右下角，工具尺寸固定为：

```text
190 × 128px
```

它不会跟随主关系图的缩放比例改变工具尺寸。

缩略图包含：

- 简化的父子连线；
- 简化的节点矩形；
- 选中节点高亮；
- 当前主视口矩形。

### 14.1 映射范围

缩略图使用以下范围的并集：

```text
关系树内容范围 ∪ 当前主视口范围
```

因此主视口超过关系树边界的部分也会完整显示，不会被关系树内容边界裁剪。

### 14.2 点击与拖动

- 点击缩略图空白区域：将对应内容坐标移动到主视口中心。
- 拖动视口矩形：按照缩略图比例反向更新主画布 `panX`、`panY`。
- 拖动开始时锁定映射比例，防止拖动过程中缩略图范围变化导致跳动。
- 在缩略图上滚轮不会缩放主画布。

## 15. 悬浮详情

鼠标进入节点时记录 `popoverNodeId`。

鼠标离开节点或弹窗时延迟 120ms 隐藏，使鼠标可以从节点移动到弹窗内部。

弹窗位置考虑：

- 节点布局坐标；
- 当前 `zoom`；
- 当前 `panX`、`panY`；
- 容器可用宽度。

右侧空间不足时自动切换到左侧。

默认弹窗宽高为当前组件样式中的固定值，定制大尺寸内容时应同步检查定位和滚动效果。

## 16. 折叠行为

组件通过 `collapsedNodeIds` 判断节点是否折叠。

布局阶段遇到折叠节点时，将其子节点视为空数组：

```js
const children = collapsedSet.has(node.id)
  ? []
  : node.children || []
```

折叠只影响渲染和布局，不修改原始业务数据。

## 17. 样式状态

组件支持以下状态类：

| 类名 | 说明 |
| --- | --- |
| `relationship-tree--dragging` | 主画布拖动中 |
| `relationship-tree__node--selected` | 节点被选中 |
| `relationship-tree__node--selected-{type}` | 指定类型的选中节点 |
| `relationship-tree__node--{type}` | 节点类型 |
| `relationship-tree__node--avatar` | 头像节点 |
| `relationship-tree__node--tag-group` | 内部关系分组节点 |
| `relationship-tree__minimap-node--selected` | 缩略图选中节点 |

## 18. 混合高度测试用例

演示页包含以下专用测试结构：

```text
测试：文本父节点
├─ 测试：头像子节点
│  └─ 测试：头像下的文本孙节点
└─ 测试：文本子节点
```

测试节点 ID 使用 `mixed-node-test-` 前缀。

该场景用于验证：

- 文本父节点的锚点居中；
- 头像节点与文本兄弟节点不会重叠；
- 头像节点到文本孙节点的连线位置；
- `nextLeafY` 是否考虑非叶子节点底边；
- 折叠后布局是否重新计算。

演示页还包含高头像父节点与矮文本叶子节点的高度差测试。

## 19. 常见问题

### 19.1 节点内容被裁剪

原因通常是自定义插槽的真实 DOM 尺寸大于节点数据中的 `width`、`height`。

处理方式：

- 增大节点数据的尺寸；
- 或限制插槽内容尺寸；
- 确保 CSS 使用 `box-sizing: border-box`。

### 19.2 头像被文本兄弟节点遮挡

检查非叶子节点定位后是否使用自身底边校正 `nextLeafY`。

当前实现已经包含：

```js
nextLeafY = Math.max(
  nextLeafY,
  parentY + parentHeight + siblingGap
)
```

### 19.3 连线与自定义内容没有对齐

布局无法读取插槽内部真实视觉锚点。

应保证：

- 普通节点的视觉连接点位于高度中心；
- 头像节点的视觉连接点位于默认 58px 头像圆心；
- 自定义结构与组件的锚点约定一致。

### 19.4 受控缩放没有更新

必须监听 `zoom-change`：

```vue
<RelationshipTree
  :zoom="zoom"
  @zoom-change="zoom = $event"
/>
```

### 19.5 折叠按钮点击后没有变化

必须监听 `toggle-collapse` 并更新 `collapsedNodeIds`。

## 20. 性能注意事项

- 每次 `root`、折叠状态、尺寸参数变化都会重新计算布局。
- 节点和连线数量较大时，`foreignObject` 的渲染成本高于纯 SVG 图形。
- 悬浮详情只渲染当前活动节点。
- 缩略图会复用布局结果，不重新执行独立树布局。
- 应避免频繁创建新的大型 `root` 对象。
- 动态加载子节点时应保持稳定、唯一的节点 ID。
- 超大关系图可以考虑虚拟化、分层加载或切换到 Canvas/WebGL 图引擎。

## 21. 验证清单

修改组件后至少验证以下内容：

- 普通节点、头像节点、关系分组节点正常显示。
- 单叶子、多叶子和多层嵌套布局无重叠。
- 父节点高于单个叶子节点时，后续兄弟节点不会遮挡父节点。
- 连线、箭头和关系标签位置正确。
- 折叠和展开后布局重新计算。
- 节点点击与画布拖动不会互相误触发。
- 鼠标滚轮以指针位置为中心缩放。
- `fitToView()` 可以完整居中关系树。
- 悬浮详情可以从节点移动到弹窗。
- 缩略图点击、拖动和超出关系树范围的视口框正常。
- 选中状态在主图和缩略图中同步。
- 自定义 `node`、`popover` 插槽不会被意外裁剪。

构建验证：

```bash
npm.cmd run build
```

## 22. 维护约束

- 保持组件数据源无关，不在组件内部硬编码业务字段映射。
- 不直接修改传入的 `root`、`collapsedNodeIds` 等 Props。
- 新增布局参数时优先通过 Props 暴露。
- 修改节点视觉尺寸时同步检查布局尺寸和连线锚点。
- 修改缩略图尺寸时同步更新 SVG 映射常量和 CSS。
- 修改全局鼠标监听时必须在 `beforeDestroy` 中清理。
- 源文件使用 UTF-8 无 BOM。
- 不手动编辑 `dist` 生成文件。
