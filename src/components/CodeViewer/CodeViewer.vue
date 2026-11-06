<template>
  <div class="code-viewer">
    <header class="code-viewer__header">
      <div class="code-viewer__title">
        <i class="el-icon-document" aria-hidden="true"></i>
        <span class="code-viewer__name">{{ title }}</span>
        <span class="code-viewer__lang">{{ language }}</span>
      </div>

      <button type="button" class="code-viewer__copy" @click="copy">
        <i class="el-icon-document-copy" aria-hidden="true"></i>
        {{ copyStatus || '复制代码' }}
      </button>
    </header>

    <div class="code-viewer__body" :style="{ maxHeight: maxHeight }">
      <div class="code-viewer__gutter" aria-hidden="true">
        <span v-for="line in lineCount" :key="line">{{ line }}</span>
      </div>

      <pre class="code-viewer__pre"><code class="hljs" v-html="highlighted"></code></pre>
    </div>
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)

export default {
  name: 'CodeViewer',
  props: {
    code: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'xml'
    },
    title: {
      type: String,
      default: '示例代码'
    },
    maxHeight: {
      type: String,
      default: '360px'
    }
  },
  data() {
    return {
      copyStatus: ''
    }
  },
  computed: {
    highlighted() {
      const source = this.code || ''
      const language = hljs.getLanguage(this.language) ? this.language : 'xml'

      return hljs.highlight(language, source).value
    },
    lineCount() {
      return Math.max(1, String(this.code || '').split('\n').length)
    }
  },
  watch: {
    code() {
      this.copyStatus = ''
    }
  },
  methods: {
    copy() {
      const text = this.code || ''

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.markCopied()
        }).catch(() => {
          this.copyFallback(text)
        })
        return
      }

      this.copyFallback(text)
    },
    copyFallback(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', 'readonly')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      this.markCopied()
    },
    markCopied() {
      this.copyStatus = '已复制'
      this.$emit('copy', this.code)

      if (this.copyTimer) {
        clearTimeout(this.copyTimer)
      }

      this.copyTimer = setTimeout(() => {
        this.copyStatus = ''
      }, 1600)
    }
  },
  beforeDestroy() {
    if (this.copyTimer) {
      clearTimeout(this.copyTimer)
    }
  }
}
</script>

<style scoped>
.code-viewer {
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fbfcfd;
}

.code-viewer__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 7px 12px;
  border-bottom: 1px solid #e9edf3;
  background: #f5f7fa;
}

.code-viewer__title {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  color: #606266;
  font-size: 12px;
}

.code-viewer__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-viewer__lang {
  flex: none;
  padding: 1px 7px;
  border-radius: 10px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 11px;
  line-height: 16px;
  text-transform: uppercase;
}

.code-viewer__copy {
  flex: none;
  padding: 3px 9px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #ffffff;
  color: #606266;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.code-viewer__copy:hover {
  border-color: #a0cfff;
  color: #409eff;
}

.code-viewer__body {
  display: flex;
  overflow: auto;
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  line-height: 1.65;
}

.code-viewer__gutter {
  flex: none;
  padding: 10px 8px;
  border-right: 1px solid #e9edf3;
  background: #f5f7fa;
  color: #b1b7c0;
  text-align: right;
  user-select: none;
}

.code-viewer__gutter span {
  display: block;
}

.code-viewer__pre {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 10px 14px;
}

.code-viewer__pre code {
  display: block;
  color: #2f3441;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  white-space: pre;
}

.code-viewer ::v-deep .hljs-tag,
.code-viewer ::v-deep .hljs-name {
  color: #22863a;
}

.code-viewer ::v-deep .hljs-attr {
  color: #6f42c1;
}

.code-viewer ::v-deep .hljs-string,
.code-viewer ::v-deep .hljs-template-tag {
  color: #032f62;
}

.code-viewer ::v-deep .hljs-keyword,
.code-viewer ::v-deep .hljs-selector-tag {
  color: #d73a49;
}

.code-viewer ::v-deep .hljs-comment {
  color: #6a737d;
  font-style: italic;
}

.code-viewer ::v-deep .hljs-number,
.code-viewer ::v-deep .hljs-literal {
  color: #005cc5;
}

.code-viewer ::v-deep .hljs-title,
.code-viewer ::v-deep .hljs-function {
  color: #6f42c1;
}

@media (max-width: 640px) {
  .code-viewer__body {
    font-size: 11px;
  }
}
</style>
