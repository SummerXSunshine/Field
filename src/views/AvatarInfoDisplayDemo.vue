<template>
  <main class="avatar-info-demo">
    <section class="avatar-info-demo__shell">
      <header class="avatar-info-demo__header">
        <div>
          <p class="avatar-info-demo__eyebrow">Vue 2 · Element UI</p>
          <h1>头像信息展示</h1>
          <p>左侧头像，右侧三项信息，下方一行标签。</p>
        </div>
        <router-link class="avatar-info-demo__back" to="/">
          返回组件列表
        </router-link>
      </header>

      <div class="avatar-info-demo__toolbar">
        <el-switch
          v-model="showMissing"
          active-text="模拟缺失数据"
        />
        <el-switch
          v-model="loading"
          active-text="加载状态"
        />
      </div>

      <avatar-info-display
        :data="displayData"
        :config="displayConfig"
        :loading="loading"
      />

      <el-alert
        class="avatar-info-demo__note"
        title="打开“模拟缺失数据”后，第三项信息和标签行会显示为 --。"
        type="info"
        :closable="false"
        show-icon
      />
    </section>
  </main>
</template>

<script>
import AvatarInfoDisplay from '../components/AvatarInfoDisplay/AvatarInfoDisplay.vue'

export default {
  name: 'AvatarInfoDisplayDemo',
  components: {
    AvatarInfoDisplay
  },
  data() {
    return {
      loading: false,
      showMissing: false,
      person: {
        avatar: '',
        name: '林知远',
        organization: '信息研判中心',
        position: '高级分析师',
        tags: [
          {
            id: 'status',
            name: '在职',
            type: 'success'
          },
          {
            id: 'ability',
            name: '领域专家',
            type: 'warning'
          },
          {
            id: 'level',
            name: '高级',
            type: 'info'
          }
        ]
      },
      displayConfig: {
        gutter: 24,
        bordered: true,
        emptyText: '--',
        avatar: {
          prop: 'avatar',
          span: 6,
          size: 104,
          shape: 'circle',
          fit: 'cover',
          fallback: data => data.name
            ? data.name.slice(0, 1)
            : '--'
        },
        contentSpan: 18,
        items: [
          {
            key: 'name',
            prop: 'name'
          },
          {
            key: 'organization',
            prop: 'organization'
          },
          {
            key: 'position',
            prop: 'position'
          }
        ],
        tags: {
          label: '标签',
          prop: 'tags',
          keyKey: 'id',
          labelKey: 'name',
          typeKey: 'type',
          effect: 'light',
          size: 'small'
        }
      }
    }
  },
  computed: {
    displayData() {
      if (!this.showMissing) {
        return this.person
      }

      return {
        ...this.person,
        position: '',
        tags: []
      }
    }
  }
}
</script>

<style scoped>
.avatar-info-demo {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 36px 24px;
  background: #f3f6fb;
  color: #303133;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.avatar-info-demo__shell {
  max-width: 820px;
  margin: 0 auto;
}

.avatar-info-demo__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar-info-demo__header h1 {
  margin: 4px 0 8px;
  font-size: 28px;
  line-height: 1.3;
}

.avatar-info-demo__header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.avatar-info-demo__eyebrow {
  color: #409eff !important;
  font-size: 12px !important;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.avatar-info-demo__back {
  flex: none;
  color: #409eff;
  font-size: 14px;
  text-decoration: none;
}

.avatar-info-demo__toolbar {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 18px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
}

.avatar-info-demo__note {
  margin-top: 16px;
}

@media (max-width: 640px) {
  .avatar-info-demo {
    padding: 20px 12px;
  }

  .avatar-info-demo__header {
    flex-direction: column;
  }

  .avatar-info-demo__toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
