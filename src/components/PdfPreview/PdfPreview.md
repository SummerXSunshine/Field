# PdfPreview

Vue 2 PDF 预览组件，无第三方依赖，使用 `Blob → URL.createObjectURL → iframe`。

## 用法

```vue
<template>
  <pdf-preview :source="pdf" filename="报告.pdf" height="70vh" @error="handleError" />
</template>
<script>
import PdfPreview from '@/components/PdfPreview/PdfPreview.vue'

export default {
  components: { PdfPreview },
  data() { return { pdf: null } },
  methods: {
    async loadPdf() {
      const response = await fetch('/api/report')
      if (!response.ok) throw new Error('请求 PDF 失败')
      this.pdf = await response.blob()
    },
    handleError(error) { console.error(error.message) }
  }
}
</script>
```

本地选择文件时，直接将 `input.files[0]` 赋给 `pdf`。Axios 已在业务层使用时，设置 `responseType: 'blob'`，传入 `response.data`。不要传入整个响应对象、文件地址或 Base64 字符串。请求鉴权、加载状态与请求失败由业务层处理。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| source | Blob / File / ArrayBuffer / Uint8Array | null | PDF 数据；设为 null 清空 |
| filename | String | document.pdf | 工具栏和下载文件名 |
| title | String | PDF 文档预览 | iframe 的可访问标题 |
| height | String | 600px | CSS 高度，如 70vh、600px |

## 事件和插槽

- `error(error)`：输入类型错误、空文件或 Blob URL 创建失败。
- `frame-load`：iframe 触发 load；**不代表 PDF 已成功解析或渲染**。
- `empty`：自定义空态。
- `error` 作用域插槽：接收 `{ error }`，自定义错误提示。

## 关键逻辑

1. `source` 的 immediate watcher 在初始化及数据引用变化时调用 `updatePreview`，无需手动初始化。修改二进制内容后应传入新的引用。
2. `releaseUrl()` 调用 `URL.revokeObjectURL`，释放本组件创建的 URL，再清空内部地址；不会修改传入的数据。
3. `updatePreview()` 先释放旧 URL 并清除错误，null 数据直接进入空态。
4. 类型检查确保输入为支持的二进制类型；`new Blob([source], { type: 'application/pdf' })` 统一响应 MIME，保留原始字节。
5. 空文件抛出错误；有效数据通过 `URL.createObjectURL` 得到临时地址，赋给 iframe 的 src。
6. 创建失败时保存错误并发出 error 事件；模板优先显示错误，其次显示 iframe，否则显示空态。
7. iframe 的 key 使用 URL，切换文件时创建新 iframe。下载链接复用当前 URL。
8. `beforeDestroy` 释放 URL，覆盖路由离开、组件卸载等情况。
9. 容器使用纵向 flex；工具栏占据自然高度，iframe 通过 flex: 1 和 min-height: 0 填满剩余空间。

## 状态、限制与验证

演示地址：`/#/components/pdf-preview`。选择本地 PDF、再次选择另一份、清空以及离开页面，可验证替换和释放流程。组件不检测 PDF 内容是否合法，传入的数据应来自可信 PDF 来源。

依赖浏览器内置 PDF 查看器，部分移动端或禁用内置查看器的环境可能下载文件或显示空白，可使用工具栏下载入口。浏览器查看器内部错误无法由 iframe load/error 可靠识别。浏览器控制缩放、翻页、打印等功能，组件不实现页码控制。CSP 部署需要允许 `frame-src blob:`。Blob URL 属于当前页面的临时资源，不能保存为长期文件链接。组件面向浏览器运行，不支持直接在 SSR 环境初始化。

执行 `npm.cmd run build` 验证 Vue 模板和生产构建。
