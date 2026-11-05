<template>
  <main class="upload-demo">
    <section class="upload-demo__panel">
      <header class="upload-demo__header">
        <div>
          <p class="upload-demo__eyebrow">Vue 2 · Element UI</p>
          <h1>单文件自动替换上传</h1>
          <p>上传时携带业务参数，不显示文件预览列表；再次选择文件会自动替换旧文件。</p>
        </div>
        <router-link class="upload-demo__back" to="/">返回组件列表</router-link>
      </header>

      <el-form
        class="upload-demo__form"
        :model="form"
        label-position="top"
      >
        <div class="upload-demo__fields">
          <el-form-item label="文档编号">
            <el-input v-model.trim="form.documentId" placeholder="请输入文档编号" />
          </el-form-item>
          <el-form-item label="业务类型">
            <el-select v-model="form.category" placeholder="请选择业务类型">
              <el-option label="整编情报" value="compiled" />
              <el-option label="所属情报" value="owned" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="选择附件">
          <div class="upload-demo__actions">
            <single-replace-upload
              ref="singleUpload"
              action="/api/demo/upload"
              accept=".doc,.docx,.pdf"
              tip="支持 doc、docx、pdf；再次选择将直接替换当前文件。"
              :extra-data="uploadData"
              :http-request="mockUploadRequest"
              @change="handleChange"
              @replace="handleReplace"
              @success="handleSuccess"
              @error="handleError"
            />
            <el-button size="small" @click="clearUpload">清空</el-button>
          </div>
        </el-form-item>
      </el-form>

      <section class="upload-demo__result" aria-live="polite">
        <span class="upload-demo__result-label">当前状态</span>
        <strong>{{ statusText }}</strong>
        <p>已替换 {{ replaceCount }} 次</p>
      </section>

      <section class="upload-demo__payload">
        <h2>本次请求携带的额外参数</h2>
        <pre>{{ formattedPayload }}</pre>
      </section>
    </section>
  </main>
</template>

<script>
import SingleReplaceUpload from '../components/SingleReplaceUpload/SingleReplaceUpload.vue'

export default {
  name: 'SingleReplaceUploadDemo',
  components: {
    SingleReplaceUpload
  },
  data() {
    return {
      form: {
        documentId: 'DOC-2026-001',
        category: 'compiled'
      },
      statusText: '等待选择文件',
      replaceCount: 0,
      lastPayload: null
    }
  },
  computed: {
    uploadData() {
      return {
        documentId: this.form.documentId,
        category: this.form.category
      }
    },
    formattedPayload() {
      return JSON.stringify(this.lastPayload || this.uploadData, null, 2)
    }
  },
  methods: {
    mockUploadRequest(options) {
      let percent = 0
      const timer = window.setInterval(() => {
        percent += 25
        options.onProgress({ percent })

        if (percent >= 100) {
          window.clearInterval(timer)
          options.onSuccess({
            code: 0,
            message: '上传成功',
            receivedData: { ...options.data }
          })
        }
      }, 180)

      return {
        abort() {
          window.clearInterval(timer)
        }
      }
    },
    handleChange() {
      this.statusText = '文件已选择，正在上传'
    },
    handleReplace() {
      this.replaceCount += 1
      this.statusText = '旧文件已替换，正在上传新文件'
    },
    handleSuccess(response) {
      this.statusText = '上传成功'
      this.lastPayload = response.receivedData
    },
    handleError() {
      this.statusText = '上传失败，请重新选择'
    },
    clearUpload() {
      this.$refs.singleUpload.clear()
      this.statusText = '已清空，等待选择文件'
      this.lastPayload = null
    }
  }
}
</script>

<style scoped>
.upload-demo {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 40px 24px;
  background: #f3f6fb;
  color: #1f2937;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.upload-demo__panel {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 16px 45px rgba(31, 41, 55, 0.08);
}

.upload-demo__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.upload-demo__header h1 {
  margin: 4px 0 10px;
  font-size: 26px;
  line-height: 1.3;
}

.upload-demo__header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.upload-demo__eyebrow {
  color: #409eff !important;
  font-size: 12px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.upload-demo__back {
  flex: none;
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.upload-demo__form {
  padding: 24px;
  border-radius: 8px;
  background: #f8fafc;
}

.upload-demo__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.upload-demo__fields .el-select {
  width: 100%;
}

.upload-demo__actions {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.upload-demo__result,
.upload-demo__payload {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
}

.upload-demo__result {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}

.upload-demo__result-label {
  color: #6b7280;
  font-size: 13px;
}

.upload-demo__result strong {
  color: #1677ff;
}

.upload-demo__result p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.upload-demo__payload h2 {
  margin: 0 0 12px;
  font-size: 15px;
}

.upload-demo__payload pre {
  margin: 0;
  padding: 14px;
  overflow-x: auto;
  border-radius: 6px;
  background: #172033;
  color: #d7e4ff;
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .upload-demo {
    padding: 16px;
  }

  .upload-demo__panel {
    padding: 20px;
  }

  .upload-demo__header {
    flex-direction: column;
  }

  .upload-demo__fields {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .upload-demo__result {
    grid-template-columns: 1fr;
  }
}
</style>
