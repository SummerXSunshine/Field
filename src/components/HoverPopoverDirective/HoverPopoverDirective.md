# HoverPopoverDirective

## 用途

`v-hover-popover` 是一个 Vue 2 指令，用于给任意 DOM 节点添加鼠标悬浮浮窗。鼠标移入目标节点时自动显示浮窗，移出目标和浮窗后自动隐藏。浮窗挂载在 `document.body` 上，不会被父容器 `overflow` 裁剪，浮窗内容允许选中和复制。

当前实现拆成两层：

- `hoverPopover.js`：指令逻辑，只负责监听悬浮、创建组件实例、计算浮窗位置和销毁。
- `HoverPopoverContent.vue`：浮窗内容组件，通过 `options` prop 接收外部传入的数据并渲染标题、文本或键值行。

## 注册

本项目在 `src/main.js` 中全局注册：

```js
import HoverPopover from './directives/hoverPopover'

Vue.directive('hover-popover', HoverPopover)
```

## 基础用法

```vue
<div
  v-hover-popover="{
    title: '节点详情',
    rows: [
      { label: '名称', value: node.name },
      { label: '编号', value: node.code }
    ]
  }"
>
  {{ node.name }}
</div>
```

## 配置项

- `title`：浮窗标题。
- `content`：简单文本内容。
- `rows`：键值行数组，格式为 `{ label, value }`。
- `html`：自定义 HTML 内容。使用时需要保证内容可信。
- `placement`：浮窗位置，支持 `right`、`left`、`top`、`bottom`，默认 `right`。
- `gap`：浮窗和目标节点之间的间距，默认 `10`。
- `rightEdgeThreshold`：当默认右侧展示时，节点右边缘距离屏幕右侧小于该值会自动改为左侧展示，默认 `40`。
- `hideDelay`：鼠标离开后的隐藏延迟，默认 `120` 毫秒。
- `maxWidth`：浮窗最大宽度，默认 `320`。
- `className` / `popoverClass`：额外类名。
- `disabled`：禁用浮窗。

## 内容组件 Props

`HoverPopoverContent.vue` 接收两个 props：

- `options`：浮窗数据和展示配置，来自指令绑定值。
- `visible`：是否显示浮窗，用于控制透明度和位移动画。

## 关键逻辑说明

- `bindDirective` 会给目标元素绑定 `mouseenter` 和 `mouseleave`，并监听窗口滚动和 resize。
- `createPopover` 使用 `new Vue` 创建 `HoverPopoverContent` 实例，把指令绑定值作为 `options` prop 传给内容组件。
- `showPopover` 更新组件实例的 `options`，等待 Vue 完成 DOM 更新后调用 `setPosition` 计算浮窗位置。
- `scheduleHide` 使用短延迟隐藏浮窗，给用户从目标节点移动到浮窗复制内容的时间。
- 浮窗自身也绑定 `mouseenter` 和 `mouseleave`，鼠标进入浮窗会取消隐藏计时，移出后再隐藏。
- `setPosition` 优先按配置位置展示；默认右侧展示时，如果节点右侧离屏幕右边缘过近，或右侧放不下浮窗，会自动切到左侧。
- `hidePopover` 和 `unbindDirective` 会移除事件监听、销毁 Vue 实例并清理浮窗节点，避免列表销毁或路由切换后遗留 DOM。

## 验证

随项目通过 `npm run build` 验证。
