# IntelligenceBrowser 情报浏览组件

## 用途

`IntelligenceBrowser` 用于展示“整编情报”和“所属情报”两个列表。整编情报直接显示卡片列表；所属情报提供情报类型、开始/结束时间和检索内容筛选。点击任意情报卡片会在原区域切换为详情模块，详情顶部的“返回”按钮可恢复此前列表及筛选状态。

## 基础用法

```vue
<template>
  <intelligence-browser
    :integrated-rows="integratedRows"
    :owned-rows="ownedRows"
    :loading="loading"
    @query="handleQuery"
    @row-click="handleRowClick"
    @back="handleBack"
  />
</template>

<script>
import IntelligenceBrowser from '@/components/IntelligenceBrowser/IntelligenceBrowser.vue'

export default {
  components: { IntelligenceBrowser },
  data() {
    return {
      loading: false,
      integratedRows: [],
      ownedRows: []
    }
  },
  methods: {
    handleQuery({ tab, filters }) {
      // 组件会先完成本地筛选；也可以在这里请求后端并更新 ownedRows。
      console.log(tab, filters)
    },
    handleRowClick({ row }) {
      console.log('打开详情', row)
    },
    handleBack({ row }) {
      console.log('返回列表', row)
    }
  }
}
</script>
```

## 数据结构

默认卡片读取以下字段：

```js
{
  id: 'intel-001',
  title: '情报标题',
  sourceType: 'body', // body 为正文，received 为收文
  sourceTypeLabel: '正文',
  sourceOrg: '来源单位',
  publishDate: '2026-08-18',
  status: '已发布',
  drafter: '张宁',
  draftUnit: '综合情报中心',
  draftTime: '2026-08-18 09:30',
  content: '<p>情报<strong>富文本</strong>正文内容</p>'
}
```

字段名不一致时，可以使用 `columns`、`field-map` 和 `search-fields` 映射，不需要修改组件内部代码。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `integrated-rows` | Array | `[]` | 整编情报数据 |
| `owned-rows` | Array | `[]` | 所属情报数据 |
| `columns` | Array | 拟稿三项 | 保留的详情元信息配置，支持 `prop`、`label`、`formatter`、`showInDetail` |
| `field-map` | Object | 默认字段映射 | 指定 `title`、`content`、`sourceType`、`publishDate`、`drafter`、`draftUnit`、`draftTime` 字段名 |
| `search-fields` | Array | 标题、来源、正文 | 关键词本地检索字段 |
| `body-value` | String/Number/Boolean | `body` | “正文”单选值 |
| `received-value` | String/Number/Boolean | `received` | “收文”单选值 |
| `initial-tab` | String | `integrated` | 初始页签，只允许 `integrated` 或 `owned` |
| `row-key` | String | `id` | 卡片唯一键字段 |
| `loading` | Boolean | `false` | 卡片列表加载状态 |
| `empty-text` | String | `暂无情报数据` | 空列表提示 |
| `rich-text-sanitizer` | Function | `null` | 可选富文本清洗函数，参数为 `(html, row)` |

## Events

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `query` | `{ tab, filters }` | 所属情报校验通过并点击查询 |
| `row-click` | `{ row, column, event, tab }` | 点击卡片内容并进入详情 |
| `back` | `{ row, tab }` | 从详情返回列表 |
| `tab-change` | `tabName` | 切换页签 |
| `view-change` | `{ view, row, tab }` | 列表和详情互相切换 |

## Slots

### `card`

完整卡片作用域插槽，参数为 `{ row, tab }`，可接管标题、正文和拟稿信息的整体展示。

### `cell`

卡片字段作用域插槽，参数为 `{ row, column, value }`，可分别接管标题、正文、拟稿人、拟稿单位和拟稿时间。

### `detail`

详情作用域插槽，参数为 `{ record, tab }`。不传时使用组件内置的标题、元信息和正文模块。

```vue
<template #detail="{ record }">
  <custom-detail :record="record" />
</template>
```

## 富文本安全

正文通过 `v-html` 呈现。可信的后端清洗结果可以直接传入；用户输入或其他不可信 HTML 应通过 `rich-text-sanitizer` 传入 DOMPurify 等清洗函数后再显示。卡片正文使用 CSS `-webkit-line-clamp: 3` 限制为三行，详情中展示完整富文本。

## 关键逻辑说明

1. `activeTab` 保存当前页签，`viewMode` 保存 `list/detail` 状态，因此详情是在当前卡片列表区域内切换，而不是新页面。
2. `draftFilters` 保存输入中的条件；只有 `handleQuery` 校验日期范围成功后才复制到 `appliedFilters`，避免未查询时表格跟着输入即时跳动。
3. `visibleRows` 在整编情报页直接返回传入数据；所属情报页依次匹配正文/收文、日期范围和关键词。
4. `openDetail` 保存当前行并将 `viewMode` 改成 `detail`，随后发出 `row-click` 和 `view-change`。
5. `handleBack` 清理当前详情并恢复 `list`，但不会重置页签、查询条件或查询结果。
6. 开始时间晚于结束时间时显示组件内错误，不执行筛选，也不发出 `query`。

## 状态与验证

- 默认态：整编情报卡片列表，无筛选区域。
- 所属情报态：显示正文/收文、开始时间、结束时间和检索内容。
- 加载态：由 `loading` 控制 Element UI loading 遮罩。
- 空态：使用 `empty-text`。
- 详情态：隐藏筛选和卡片列表，在相同区域展示返回按钮与内容模块。
- 日期错误态：开始时间晚于结束时间时显示红色错误信息。
- 响应式：小于 900px 时筛选项改为纵向排列。

## 验证建议

1. 切换两个页签，确认整编情报不显示筛选项。
2. 在所属情报分别选择正文、收文并组合日期、关键词查询。
3. 输入晚于结束时间的开始时间，确认出现校验信息。
4. 点击不同情报卡片，确认详情在原区域打开。
5. 点击返回，确认原页签、筛选条件和查询结果仍然保留。
