# SingleReplaceUpload 单文件替换上传

基于 Vue 2 和 Element UI el-upload 封装。组件始终只保留一个文件，不展示上传文件列表；再次选择文件时会中止旧上传、清除旧记录并自动上传新文件。

## 基础用法

~~~vue
<template>
  <single-replace-upload
    action="/api/file/upload"
    name="multipartFile"
    accept=".doc,.docx,.pdf"
    :extra-data="uploadData"
    :headers="{ Authorization: token }"
    @success="handleSuccess"
    @error="handleError"
    @replace="handleReplace"
  />
</template>

<script>
import SingleReplaceUpload from '@/components/SingleReplaceUpload/SingleReplaceUpload.vue'

export default {
  components: { SingleReplaceUpload },
  data() {
    return {
      token: 'Bearer token-value',
      uploadData: {
        documentId: 'DOC-2026-001',
        category: 'intelligence'
      }
    }
  },
  methods: {
    handleSuccess(response) {
      console.log('上传成功', response)
    },
    handleError(error) {
      console.error('上传失败', error)
    },
    handleReplace({ previousFile, currentFile }) {
      console.log('文件已替换', previousFile, currentFile)
    }
  }
}
</script>
~~~

额外参数通过 extra-data 传给 el-upload 的 data 属性，请求会以 multipart 表单字段一并提交。文件字段名由 name 控制，默认值为 file。

## 手动上传

~~~vue
<single-replace-upload
  ref="uploader"
  action="/api/file/upload"
  :auto-upload="false"
/>

<el-button @click="$refs.uploader.submit()">开始上传</el-button>
~~~

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| action | String | 必填 | 上传接口地址 |
| name | String | file | multipart 文件字段名 |
| extra-data | Object | {} | 随文件一起提交的额外表单参数 |
| headers | Object | {} | 上传请求头 |
| with-credentials | Boolean | false | 是否携带 Cookie |
| accept | String | 空字符串 | 文件选择器接受的文件类型 |
| disabled | Boolean | false | 是否禁用 |
| auto-upload | Boolean | true | 选择后是否自动上传 |
| before-upload | Function | null | 上传前校验函数，与 el-upload 一致 |
| http-request | Function | Element UI 默认实现 | 自定义上传请求 |
| button-text | String | 选择文件 | 首次选择按钮文字 |
| replace-text | String | 重新选择文件 | 已有文件时按钮文字 |
| button-type | String | primary | Element UI 按钮类型 |
| size | String | small | 按钮尺寸 |
| tip | String | 空字符串 | 按钮下方提示文字 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| change | (file, fileList) | 文件状态变化 |
| replace | ({ previousFile, currentFile }) | 新文件替换旧文件 |
| success | (response, file, fileList) | 上传成功 |
| error | (error, file, fileList) | 上传失败 |
| progress | (event, file, fileList) | 上传进度变化 |
| remove | (file, fileList) | 文件被移除 |
| exceed | (files, fileList) | 选择新文件触发单文件替换前 |

## Methods

| 方法 | 说明 |
| --- | --- |
| submit() | 手动提交当前文件 |
| clear() | 中止上传并清空当前文件 |
| abort() | 中止当前文件上传 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| default | { file, hasFile, disabled } | 自定义选择按钮 |
| tip | 无 | 自定义提示内容 |

组件内部固定使用 limit="1"、multiple="false" 和 show-file-list="false"。由于 Element UI 超限时不会自动加入新文件，组件会在 on-exceed 中清除旧文件并重新提交所选文件。
