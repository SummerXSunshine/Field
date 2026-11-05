<template>
  <main class="info-display-demo">
    <section class="info-display-demo__shell">
      <header class="info-display-demo__header">
        <div>
          <p class="info-display-demo__eyebrow">Vue 2 · Element UI</p>
          <h1>配置化文本信息展示</h1>
          <p>根据 fields 中的 span 直接控制 el-row、el-col 一列或两列布局。</p>
        </div>
        <router-link class="info-display-demo__back" to="/">
          返回组件列表
        </router-link>
      </header>

      <div class="info-display-demo__toolbar">
        <span>字段布局</span>
        <el-radio-group v-model="columnSpan" size="small">
          <el-radio-button :label="24">1 列</el-radio-button>
          <el-radio-button :label="12">2 列</el-radio-button>
        </el-radio-group>
        <el-switch
          v-model="loading"
          active-text="加载状态"
        />
      </div>

      <configurable-info-display
        :data="detailData"
        :config="displayConfig"
        :loading="loading"
        @field-click="handleFieldClick"
      />

      <el-alert
        class="info-display-demo__note"
        title="电子邮箱和直属领导没有对应数据，因此自动显示为 --；项目数量为 0，仍按有效值展示。"
        type="info"
        :closable="false"
        show-icon
      />
    </section>
  </main>
</template>

<script>
import ConfigurableInfoDisplay from '../components/ConfigurableInfoDisplay/ConfigurableInfoDisplay.vue'

export default {
  name: 'ConfigurableInfoDisplayDemo',
  components: {
    ConfigurableInfoDisplay
  },
  data() {
    return {
      columnSpan: 12,
      loading: false,
      detailData: {
        employeeNo: 'A-2026-018',
        name: '林知远',
        gender: '男',
        organization: '信息研判中心',
        position: '高级分析师',
        contact: {
          phone: '138 0000 0000',
          email: ''
        },
        location: '北京市海淀区',
        projectCount: 0,
        enabled: false,
        description: '负责信息研判、专题分析和跨部门协作。'
      }
    }
  },
  computed: {
    displayConfig() {
      return {
        emptyText: '--',
        bordered: true,
        gutter: 28,
        labelWidth: 94,
        fields: [
          {
            key: 'employee-no',
            label: '员工编号',
            prop: 'employeeNo'
          },
          {
            key: 'name',
            label: '姓名',
            prop: 'name'
          },
          {
            key: 'gender',
            label: '性别',
            prop: 'gender'
          },
          {
            key: 'organization',
            label: '所属单位',
            prop: 'organization'
          },
          {
            key: 'position',
            label: '岗位',
            prop: 'position'
          },
          {
            key: 'phone',
            label: '联系电话',
            prop: 'contact.phone'
          },
          {
            key: 'email',
            label: '电子邮箱',
            prop: 'contact.email'
          },
          {
            key: 'manager',
            label: '直属领导',
            prop: 'department.manager'
          },
          {
            key: 'location',
            label: '工作地点',
            prop: 'location'
          },
          {
            key: 'project-count',
            label: '项目数量',
            prop: 'projectCount',
            formatter: value => value + ' 个'
          },
          {
            key: 'enabled',
            label: '管理权限',
            prop: 'enabled',
            formatter: value => value ? '已开通' : '未开通'
          },
          {
            key: 'description',
            label: '个人简介',
            prop: 'description',
            span: 24
          }
        ].map(item => ({
          ...item,
          span: item.span || this.columnSpan
        }))
      }
    }
  },
  methods: {
    handleFieldClick({ item }) {
      this.$message({
        message: '点击字段：' + item.label,
        type: 'success',
        duration: 1200
      })
    }
  }
}
</script>

<style scoped>
.info-display-demo {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 36px 24px;
  background: #f3f6fb;
  color: #303133;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.info-display-demo__shell {
  max-width: 900px;
  margin: 0 auto;
}

.info-display-demo__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.info-display-demo__header h1 {
  margin: 4px 0 8px;
  font-size: 28px;
  line-height: 1.3;
}

.info-display-demo__header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.info-display-demo__eyebrow {
  color: #409eff !important;
  font-size: 12px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-display-demo__back {
  flex: none;
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.info-display-demo__toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 18px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
  font-size: 14px;
}

.info-display-demo__toolbar > span {
  color: #606266;
}

.info-display-demo__note {
  margin-top: 16px;
}

@media (max-width: 640px) {
  .info-display-demo {
    padding: 20px 12px;
  }

  .info-display-demo__header,
  .info-display-demo__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
