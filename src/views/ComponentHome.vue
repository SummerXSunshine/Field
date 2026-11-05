<template>
  <div class="component-home">
    <aside
      class="component-home__sidebar"
      aria-label="组件示例导航"
    >
      <button
        type="button"
        class="component-home__brand"
        @click="goHome"
      >
        <span class="component-home__brand-icon" aria-hidden="true">
          <i class="el-icon-s-grid"></i>
        </span>
        <span>
          <strong>组件示例</strong>
          <small>Component demos</small>
        </span>
      </button>

      <nav class="component-home__navigation">
        <section
          v-for="category in categories"
          :key="category.key"
          class="component-home__category"
        >
          <h2>{{ category.name }}</h2>

          <div
            class="component-home__tabs"
            role="tablist"
            :aria-label="category.name"
          >
            <button
              v-for="item in category.items"
              :key="item.path"
              type="button"
              role="tab"
              class="component-home__tab"
              :class="{
                'component-home__tab--active': isActive(item)
              }"
              :aria-selected="isActive(item)"
              aria-controls="component-demo-panel"
              @click="selectExample(item)"
            >
              <i :class="item.icon" aria-hidden="true"></i>
              <span>{{ item.name }}</span>
            </button>
          </div>
        </section>
      </nav>
    </aside>

    <div class="component-home__workspace">
      <header class="component-home__topbar">
        <div>
          <span>{{ currentCategoryName }}</span>
          <strong>{{ currentExampleName }}</strong>
        </div>

        <button
          v-if="!isOverview"
          type="button"
          class="component-home__overview-button"
          @click="goHome"
        >
          <i class="el-icon-menu" aria-hidden="true"></i>
          组件概览
        </button>
      </header>

      <main
        id="component-demo-panel"
        class="component-home__panel"
        role="tabpanel"
      >
        <section
          v-if="isOverview"
          class="component-home__overview"
          aria-labelledby="component-overview-title"
        >
          <div class="component-home__welcome">
            <p>VUE 2 COMPONENTS</p>
            <h1 id="component-overview-title">组件演示中心</h1>
            <span>从左侧按照业务分类选择组件，示例将在当前右侧区域切换。</span>
          </div>

          <div class="component-home__category-grid">
            <button
              v-for="category in categories"
              :key="category.key"
              type="button"
              class="component-home__category-card"
              @click="selectExample(category.items[0])"
            >
              <span
                class="component-home__category-icon"
                :class="'component-home__category-icon--' + category.theme"
                aria-hidden="true"
              >
                <i :class="category.icon"></i>
              </span>
              <strong>{{ category.name }}</strong>
              <small>{{ category.items.length }} 个组件示例</small>
              <i class="el-icon-right component-home__category-arrow" aria-hidden="true"></i>
            </button>
          </div>
        </section>

        <router-view v-else />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ComponentHome',
  data() {
    return {
      categories: [
        {
          key: 'intelligence',
          name: '情报业务',
          icon: 'el-icon-document',
          theme: 'blue',
          items: [
            {
              name: 'IntelligenceBrowser',
              description: '整编与所属情报双页签，支持组合筛选和详情切换。',
              path: '/components/intelligence-browser',
              icon: 'el-icon-document-copy'
            }
          ]
        },
        {
          key: 'relation',
          name: '关系分析',
          icon: 'el-icon-share',
          theme: 'purple',
          items: [
            {
              name: 'RelationshipTree',
              description: 'SVG 关系线、节点分组、筛选、缩放和拖拽。',
              path: '/components/relationship-tree',
              icon: 'el-icon-share'
            },
            {
              name: 'AntVRelationshipGraph',
              description: '使用 AntV G6 渲染的关系图对照示例。',
              path: '/components/antv-relationship-graph',
              icon: 'el-icon-connection'
            },
            {
              name: 'OrganizationRelationGraph',
              description: '使用 relation-graph 渲染机构层级树。',
              path: '/components/organization-relation-graph',
              icon: 'el-icon-office-building'
            }
          ]
        },
        {
          key: 'display',
          name: '数据展示',
          icon: 'el-icon-data-analysis',
          theme: 'green',
          items: [
            {
              name: 'EChartBarDemo',
              description: '支持配置和实时预览的 ECharts 图表。',
              path: '/components/echart-bar-demo',
              icon: 'el-icon-data-analysis'
            },
            {
              name: 'ExcelCaseTableForm',
              description: 'Excel 风格案件表格和行内编辑。',
              path: '/components/excel-case-table-form',
              icon: 'el-icon-s-grid'
            },
            {
              name: 'ConfigurableInfoDisplay',
              description: '读取配置展示一列或两列文本字段。',
              path: '/components/configurable-info-display',
              icon: 'el-icon-tickets'
            },
            {
              name: 'AvatarInfoDisplay',
              description: '头像、三项摘要信息和标签行。',
              path: '/components/avatar-info-display',
              icon: 'el-icon-user'
            }
          ]
        },
        {
          key: 'form-file',
          name: '表单与文件',
          icon: 'el-icon-edit-outline',
          theme: 'orange',
          items: [
            {
              name: 'ElementFormDemo',
              description: '基于 Element UI 的可配置基础表单。',
              path: '/components/element-form-demo',
              icon: 'el-icon-edit-outline'
            },
            {
              name: '标签选择树',
              description: '父子独立选择，子节点勾选时自动选中祖先。',
              path: '/components/tag-select-tree',
              icon: 'el-icon-collection-tag'
            },
            {
              name: '四级标签筛选',
              description: 'Checkbox 逐级展开，分层输出 ID，支持逐级和全部重置。',
              path: '/components/four-level-tag-filter',
              icon: 'el-icon-filter'
            },
            {
              name: 'SingleReplaceUpload',
              description: '单文件上传和重新选择自动替换。',
              path: '/components/single-replace-upload',
              icon: 'el-icon-upload2'
            },
            {
              name: 'PdfPreview',
              description: '使用 iframe 和 Blob 预览 PDF，无第三方依赖。',
              path: '/components/pdf-preview',
              icon: 'el-icon-document'
            }
          ]
        },
        {
          key: 'interaction',
          name: '交互能力',
          icon: 'el-icon-magic-stick',
          theme: 'cyan',
          items: [
            {
              name: 'HoverPopoverDirective',
              description: 'Vue 2 指令形式的节点悬浮窗。',
              path: '/components/hover-popover-demo',
              icon: 'el-icon-chat-dot-round'
            }
          ]
        }
      ]
    }
  },
  computed: {
    isOverview() {
      return this.$route.name === 'component-home'
    },
    activeExample() {
      for (const category of this.categories) {
        const matchedItem = category.items.find(item => item.path === this.$route.path)

        if (matchedItem) {
          return matchedItem
        }
      }

      return null
    },
    activeCategory() {
      return this.categories.find(category => {
        return category.items.some(item => item.path === this.$route.path)
      }) || null
    },
    currentCategoryName() {
      return this.activeCategory ? this.activeCategory.name : '组件中心'
    },
    currentExampleName() {
      return this.activeExample ? this.activeExample.name : '全部示例'
    }
  },
  methods: {
    isActive(item) {
      return this.$route.path === item.path
    },
    selectExample(item) {
      if (this.$route.path !== item.path) {
        this.$router.push(item.path)
      }
    },
    goHome() {
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style scoped>
.component-home {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f4f7fb;
  color: #1f2937;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.component-home__sidebar {
  flex: 0 0 264px;
  box-sizing: border-box;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #e5eaf2;
  background: #ffffff;
  box-shadow: 4px 0 18px rgba(31, 41, 55, 0.04);
}

.component-home__brand {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 22px 20px;
  border: 0;
  border-bottom: 1px solid #eef1f6;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.component-home__brand:focus-visible,
.component-home__tab:focus-visible,
.component-home__category-card:focus-visible,
.component-home__overview-button:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: -2px;
}

.component-home__brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: linear-gradient(135deg, #409eff, #337ecc);
  color: #ffffff;
  font-size: 20px;
  box-shadow: 0 8px 18px rgba(64, 158, 255, 0.24);
}

.component-home__brand strong,
.component-home__brand small {
  display: block;
}

.component-home__brand strong {
  font-size: 17px;
  line-height: 1.4;
}

.component-home__brand small {
  margin-top: 2px;
  color: #a1a8b3;
  font-size: 11px;
  letter-spacing: 0.04em;
}

.component-home__navigation {
  padding: 10px 12px 24px;
}

.component-home__category {
  margin-top: 18px;
}

.component-home__category h2 {
  margin: 0 10px 7px;
  color: #9aa2ad;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.component-home__tabs {
  display: grid;
  gap: 3px;
}

.component-home__tab {
  position: relative;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 40px;
  padding: 9px 12px;
  overflow: hidden;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #596273;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.component-home__tab::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: transparent;
}

.component-home__tab:hover {
  background: #f3f7fc;
  color: #337ecc;
}

.component-home__tab--active {
  background: #ecf5ff;
  color: #337ecc;
  font-weight: 600;
}

.component-home__tab--active::before {
  background: #409eff;
}

.component-home__tab i {
  font-size: 16px;
  text-align: center;
}

.component-home__tab span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-home__workspace {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
}

.component-home__topbar {
  display: flex;
  flex: 0 0 64px;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 24px;
  border-bottom: 1px solid #e5eaf2;
  background: rgba(255, 255, 255, 0.96);
}

.component-home__topbar div {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.component-home__topbar span {
  flex: none;
  color: #9098a6;
  font-size: 13px;
}

.component-home__topbar span::after {
  content: '/';
  margin-left: 10px;
  color: #d2d7df;
}

.component-home__topbar strong {
  overflow: hidden;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-home__overview-button {
  padding: 7px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  color: #606266;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.component-home__overview-button:hover {
  border-color: #a0cfff;
  color: #409eff;
}

.component-home__panel {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.component-home__overview {
  box-sizing: border-box;
  min-height: 100%;
  padding: 54px;
}

.component-home__welcome {
  max-width: 680px;
}

.component-home__welcome p {
  margin: 0 0 10px;
  color: #409eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.component-home__welcome h1 {
  margin: 0 0 12px;
  color: #172033;
  font-size: 34px;
  line-height: 1.25;
}

.component-home__welcome span {
  color: #657084;
  font-size: 15px;
  line-height: 1.8;
}

.component-home__category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 16px;
  max-width: 920px;
  margin-top: 34px;
}

.component-home__category-card {
  position: relative;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 5px 13px;
  align-items: center;
  box-sizing: border-box;
  min-height: 108px;
  padding: 19px;
  border: 1px solid #e1e7f0;
  border-radius: 10px;
  background: #ffffff;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(31, 41, 55, 0.05);
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.component-home__category-card:hover {
  border-color: #b8d9ff;
  box-shadow: 0 12px 30px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.component-home__category-card strong {
  padding-right: 22px;
  font-size: 15px;
}

.component-home__category-card small {
  grid-column: 2;
  color: #8a93a3;
  font-size: 12px;
}

.component-home__category-icon {
  display: inline-flex;
  grid-row: 1 / span 2;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  font-size: 20px;
}

.component-home__category-icon--blue {
  background: #ecf5ff;
  color: #409eff;
}

.component-home__category-icon--purple {
  background: #f3efff;
  color: #7c5ce7;
}

.component-home__category-icon--green {
  background: #ecf9f2;
  color: #26a269;
}

.component-home__category-icon--orange {
  background: #fff4e8;
  color: #e98b2a;
}

.component-home__category-icon--cyan {
  background: #eaf9fa;
  color: #159aa6;
}

.component-home__category-arrow {
  position: absolute;
  top: 50%;
  right: 16px;
  color: #c0c7d1;
  transform: translateY(-50%);
}

@media (max-width: 900px) {
  .component-home {
    display: block;
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .component-home__sidebar {
    width: 100%;
    height: auto;
    overflow: visible;
    border-right: 0;
    border-bottom: 1px solid #e5eaf2;
  }

  .component-home__navigation {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 12px;
  }

  .component-home__workspace {
    height: auto;
    min-height: 70vh;
  }

  .component-home__panel {
    overflow: visible;
  }
}

@media (max-width: 600px) {
  .component-home__navigation {
    grid-template-columns: 1fr;
  }

  .component-home__topbar {
    padding: 0 16px;
  }

  .component-home__overview {
    padding: 30px 18px;
  }

  .component-home__welcome h1 {
    font-size: 28px;
  }
}
</style>
