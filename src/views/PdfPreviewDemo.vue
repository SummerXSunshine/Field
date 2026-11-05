<template>
  <main class="pdf-demo">
    <h1>PDF 预览</h1>
    <p>选择本地 PDF，使用 Blob URL 在 iframe 中预览，文件不会上传。</p>
    <div class="pdf-demo__actions">
      <button type="button" @click="loadExample">加载示例 PDF</button>
      <input type="file" accept="application/pdf,.pdf" aria-label="选择 PDF 文件" @change="selectFile">
      <button type="button" @click="clear">清空</button>
    </div>
    <p>预览由浏览器内置 PDF 查看器提供；无法显示时可点击下载。</p>
    <pdf-preview :source="file" :filename="filename" height="70vh" />
  </main>
</template>

<script>
import PdfPreview from '../components/PdfPreview/PdfPreview.vue'

export default {
  name: 'PdfPreviewDemo',
  components: { PdfPreview },
  data() {
    return { file: null }
  },
  computed: {
    filename() { return this.file ? this.file.name : 'document.pdf' }
  },
  methods: {
    loadExample() {
      // 仅供演示的单页 PDF；全部使用 ASCII，使字符串长度与字节偏移一致。
      const content = 'BT /F1 26 Tf 64 740 Td (PDF Preview Demo) Tj 0 -48 Td /F1 14 Tf (Vue 2 + iframe + Blob URL) Tj 0 -30 Td (No third-party PDF library required.) Tj ET'
      const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
      ]
      let pdf = '%PDF-1.4\n'
      const offsets = [0]
      objects.forEach((object, index) => {
        offsets.push(pdf.length)
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
      })
      const xrefOffset = pdf.length
      pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
      offsets.slice(1).forEach(offset => {
        pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
      })
      pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
      this.file = new File([pdf], 'preview-example.pdf', { type: 'application/pdf' })
    },
    selectFile(event) {
      const file = event.target.files[0]
      if (file) this.file = file
      event.target.value = ''
    },
    clear() { this.file = null }
  }
}
</script>

<style scoped>
.pdf-demo { padding: 24px; color: #334155; }
.pdf-demo h1 { margin-top: 0; }
.pdf-demo p { line-height: 1.6; color: #64748b; }
.pdf-demo__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.pdf-demo__actions button { padding: 6px 16px; cursor: pointer; }
</style>
