# CodeViewer

## 用途

`CodeViewer` 是基于 highlight.js 的代码可视化展示组件，用于在页面中展示示例代码。提供语法高亮、行号、语言标识和一键复制，适合低代码配置页、组件 Demo 的"示例代码"区域。

## 依赖

- `highlight.js`（10.x），按需注册 `xml`、`javascript`、`json` 三种语言，不引入全量语言包。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `code` | String | `''` | 需要展示的代码字符串 |
| `language` | String | `'xml'` | 高亮语言，支持 `xml`、`javascript`、`json`；未注册的语言回退为 `xml` |
| `title` | String | `'示例代码'` | 头部标题 |
| `maxHeight` | String | `'360px'` | 代码区最大高度，超出后纵向滚动 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `copy` | code | 复制成功后触发，参数为复制内容 |

## 展示规则

- 左侧为行号栏，右侧为代码区，两者共用同一滚动容器，纵向滚动时始终保持对齐。
- 代码区超出宽度时横向滚动，行号栏固定不跟随横向滚动。
- 复制优先使用 `navigator.clipboard`，不可用时回退到 `document.execCommand('copy')`。
- 复制成功后按钮文案变为"已复制"，1.6 秒后恢复。
- 代码内容通过 highlight.js 转义后以 `v-html` 渲染，不会执行其中的标签。

## 使用示例

```vue
<code-viewer
  :code="sampleCode"
  language="xml"
  title="ViewForm 用法示例"
  max-height="420px"
/>
```

## 配套的示例代码生成

示例代码统一使用 `src/utils/sampleCode.js` 的 `buildSfcCode` 生成，参数为 `tag`、`componentName`、`importPath`、`attrs`、`data`、`methods`：

```js
import { buildSfcCode } from '@/utils/sampleCode'

sampleCode() {
  return buildSfcCode({
    tag: 'base-form',
    componentName: 'BaseForm',
    importPath: '@/components/BaseForm/BaseForm.vue',
    attrs: ['v-model="formModel"', ':fields="fields"'],
    data: {
      formModel: this.formModel,
      fields: this.fields
    }
  })
}
```

生成的代码为可直接运行的 Vue 2 SFC，`data` 中每一项会按 JSON 格式化并缩进。需要演示事件回调时，用 `methods` 传入方法源码行数组。

## 说明

组件内部使用 highlight.js 10.x 的 `hljs.highlight(language, code)` 接口。若后续升级到 11.x，需要改为 `hljs.highlight(code, { language })`。
