<template>
  <div class="single-replace-upload">
    <el-upload
      ref="upload"
      class="single-replace-upload__control"
      :action="action"
      :name="name"
      :data="extraData"
      :headers="headers"
      :with-credentials="withCredentials"
      :accept="accept"
      :disabled="disabled"
      :auto-upload="autoUpload"
      :before-upload="handleBeforeUpload"
      :http-request="httpRequest"
      :on-change="handleChange"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :file-list="fileList"
      :limit="1"
      :multiple="false"
      :show-file-list="false"
    >
      <slot
        :file="currentFile"
        :has-file="hasFile"
        :disabled="disabled"
      >
        <el-button
          :type="buttonType"
          :size="size"
          :disabled="disabled"
          icon="el-icon-upload2"
        >
          {{ resolvedButtonText }}
        </el-button>
      </slot>

      <div
        v-if="tip || $slots.tip"
        slot="tip"
        class="single-replace-upload__tip"
      >
        <slot name="tip">{{ tip }}</slot>
      </div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'SingleReplaceUpload',
  props: {
    action: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'file'
    },
    extraData: {
      type: Object,
      default() {
        return {}
      }
    },
    headers: {
      type: Object,
      default() {
        return {}
      }
    },
    withCredentials: {
      type: Boolean,
      default: false
    },
    accept: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    beforeUpload: {
      type: Function,
      default: null
    },
    httpRequest: {
      type: Function,
      default: undefined
    },
    buttonText: {
      type: String,
      default: '选择文件'
    },
    replaceText: {
      type: String,
      default: '重新选择文件'
    },
    buttonType: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: 'small',
      validator(value) {
        return ['', 'medium', 'small', 'mini'].includes(value)
      }
    },
    tip: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      fileList: [],
      currentFile: null,
      pendingReplacedFile: null
    }
  },
  computed: {
    hasFile() {
      return Boolean(this.currentFile)
    },
    resolvedButtonText() {
      return this.hasFile ? this.replaceText : this.buttonText
    }
  },
  methods: {
    handleBeforeUpload(rawFile) {
      if (!this.beforeUpload) {
        return true
      }

      return this.beforeUpload(rawFile)
    },
    handleChange(file, fileList) {
      const previousFile = this.pendingReplacedFile || (
        this.currentFile && this.currentFile.uid !== file.uid
          ? this.currentFile
          : null
      )

      this.currentFile = file
      this.fileList = fileList.slice(-1)
      this.pendingReplacedFile = null

      if (previousFile) {
        this.$emit('replace', {
          previousFile,
          currentFile: file
        })
      }

      this.$emit('change', file, this.fileList.slice())
    },
    handleSuccess(response, file, fileList) {
      this.currentFile = file
      this.fileList = fileList.slice(-1)
      this.$emit('success', response, file, this.fileList.slice())
    },
    handleError(error, file, fileList) {
      this.currentFile = file
      this.fileList = fileList.slice(-1)
      this.$emit('error', error, file, this.fileList.slice())
    },
    handleProgress(event, file, fileList) {
      this.$emit('progress', event, file, fileList.slice())
    },
    handleRemove(file, fileList) {
      if (this.currentFile && this.currentFile.uid === file.uid) {
        this.currentFile = null
      }
      this.fileList = fileList.slice(-1)
      this.$emit('remove', file, this.fileList.slice())
    },
    handleExceed(files, fileList) {
      const rawFile = files[files.length - 1]
      const upload = this.$refs.upload

      this.$emit('exceed', files, fileList)

      if (!rawFile || !upload || this.disabled) {
        return
      }

      this.pendingReplacedFile = this.currentFile || this.fileList[0] || null

      if (this.pendingReplacedFile) {
        upload.abort(this.pendingReplacedFile)
      }

      upload.clearFiles()
      this.fileList = []
      this.currentFile = null

      this.$nextTick(() => {
        if (!this.$refs.upload || this.disabled) {
          return
        }

        this.$refs.upload.handleStart(rawFile)

        if (this.autoUpload) {
          this.$refs.upload.submit()
        }
      })
    },
    submit() {
      if (this.$refs.upload) {
        this.$refs.upload.submit()
      }
    },
    clear() {
      if (!this.$refs.upload) {
        return
      }

      if (this.currentFile) {
        this.$refs.upload.abort(this.currentFile)
      }

      this.$refs.upload.clearFiles()
      this.fileList = []
      this.currentFile = null
      this.pendingReplacedFile = null
    },
    abort() {
      if (this.$refs.upload && this.currentFile) {
        this.$refs.upload.abort(this.currentFile)
      }
    }
  }
}
</script>

<style scoped>
.single-replace-upload {
  display: inline-block;
}

.single-replace-upload__control {
  display: inline-block;
}

.single-replace-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}
</style>
