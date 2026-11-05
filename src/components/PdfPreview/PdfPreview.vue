<template>
  <section class="pdf-preview" :style="{ height }">
    <header v-if="objectUrl" class="pdf-preview__toolbar">
      <span>{{ filename }}</span>
      <a :href="objectUrl" :download="filename">下载 PDF</a>
    </header>
    <div v-if="error" class="pdf-preview__message" role="alert">
      <slot name="error" :error="error">{{ error.message }}</slot>
    </div>
    <iframe
      v-else-if="objectUrl"
      :key="objectUrl"
      class="pdf-preview__frame"
      :src="objectUrl"
      :title="title"
      @load="$emit('frame-load')"
    />
    <div v-else class="pdf-preview__message">
      <slot name="empty">暂无 PDF 文件</slot>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PdfPreview',
  props: {
    // File 继承自 Blob，接口返回的 ArrayBuffer 和 Uint8Array 也可直接传入。
    source: {
      type: [Blob, ArrayBuffer, Uint8Array],
      default: null
    },
    filename: {
      type: String,
      default: 'document.pdf'
    },
    title: {
      type: String,
      default: 'PDF 文档预览'
    },
    height: {
      type: String,
      default: '600px'
    }
  },
  data() {
    return { objectUrl: '', error: null }
  },
  watch: {
    source: {
      immediate: true,
      handler: 'updatePreview'
    }
  },
  beforeDestroy() {
    this.releaseUrl()
  },
  methods: {
    releaseUrl() {
      if (this.objectUrl) {
        URL.revokeObjectURL(this.objectUrl)
        this.objectUrl = ''
      }
    },
    updatePreview(source) {
      this.releaseUrl()
      this.error = null
      if (source == null) return

      try {
        if (!(source instanceof Blob) && !(source instanceof ArrayBuffer) && !(source instanceof Uint8Array)) {
          throw new Error('请传入 Blob、File、ArrayBuffer 或 Uint8Array')
        }
        // 统一 MIME，避免接口返回 application/octet-stream 时被当作普通附件。
        const blob = new Blob([source], { type: 'application/pdf' })
        if (!blob.size) throw new Error('PDF 文件内容为空')
        this.objectUrl = URL.createObjectURL(blob)
      } catch (error) {
        this.error = error
        this.$emit('error', error)
      }
    }
  }
}
</script>

<style scoped>
.pdf-preview {
  display: flex;
  flex-direction: column;
  min-height: 180px;
  overflow: hidden;
  border: 1px solid #dce2eb;
  border-radius: 8px;
  background: #f5f7fa;
}
.pdf-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #dce2eb;
}
.pdf-preview__toolbar span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pdf-preview__toolbar a { flex-shrink: 0; color: #2563eb; }
.pdf-preview__frame { flex: 1; width: 100%; min-height: 0; border: 0; }
.pdf-preview__message {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #64748b;
}
</style>
