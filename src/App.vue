<template>
  <div id="app">
    <header class="toolbar">
      <div class="zoom-controls">
        <button @click="decreaseZoom">缩小</button>

        <span>{{ Math.round(zoom * 100) }}%</span>

        <button @click="increaseZoom">放大</button>

        <button @click="zoom = 1">恢复 100%</button>

        <button @click="fitTreeToView">自适应居中</button>
      </div>

      <div class="relation-filter" aria-label="关系筛选">
        <button
          type="button"
          class="relation-filter__option"
          :class="{ 'relation-filter__option--active': selectedRelationLabels.length === 0 }"
          @click="selectAllRelations"
        >
          全部关系
        </button>

        <button
          v-for="label in relationOptions"
          :key="label"
          type="button"
          class="relation-filter__option"
          :class="{ 'relation-filter__option--active': isRelationSelected(label) }"
          :aria-pressed="isRelationSelected(label) ? 'true' : 'false'"
          @click="toggleRelationFilter(label)"
        >
          {{ label }}
        </button>
      </div>

      <span v-if="selectedNode" class="selected-node">
        当前选择：{{ selectedNode.name }}
      </span>
    </header>

    <main class="tree-container">
      <RelationshipTree
        ref="relationshipTree"
        :root="filteredRelationshipData"
        :selected-node-id="selectedNodeId"
        :collapsed-node-ids="collapsedNodeIds"
        :enable-collapse="enableCollapse"
        :zoom="zoom"
        :min-zoom="minZoom"
        :max-zoom="maxZoom"
        :node-width="200"
        :node-height="41"
        :level-gap="136"
        :sibling-gap="34"
        :relation-group-child-gap="120"
        @node-click="handleNodeClick"
        @toggle-collapse="toggleCollapse"
        @zoom-change="handleZoomChange"
      />
    </main>
  </div>
</template>

<script>
import RelationshipTree from './components/RelationshipTree.vue'
import { collectRelationOptions, filterTreeByRelations } from './utils/relationFilter'

export default {
  name: 'App',

  components: {
    RelationshipTree
  },

  data() {
    const relationStyles = {
      contact: {
        stroke: '#ef4444',
        labelBackground: '#fef2f2',
        labelColor: '#b91c1c'
      },
      wechat: {
        stroke: '#06b6d4',
        labelBackground: '#ecfeff',
        labelColor: '#0e7490'
      },
      family: {
        stroke: '#f59e0b',
        labelBackground: '#fffbeb',
        labelColor: '#b45309'
      },
      peer: {
        stroke: '#2563eb',
        labelBackground: '#eff6ff',
        labelColor: '#1d4ed8'
      }
    }

    const createEdge = (type, label, extraStyle = {}) => {
      return Object.assign(
        {
          label,
          strokeWidth: 1
        },
        relationStyles[type],
        extraStyle
      )
    }

    return {
      zoom: 1,
      minZoom: 0.4,
      maxZoom: 2,
      selectedNodeId: '',
      selectedNode: null,
      collapsedNodeIds: [],
      enableCollapse: true,
      selectedRelationLabels: [],

      relationshipData: {
        id: 'zhang-san',
        name: '张三',
        subtitle: '核心人物',
        tag: '本人',
        variant: 'avatar',
        style: {
          background: '#ecfdf5',
          color: '#047857',
          borderColor: '#6ee7b7'
        },

        children: [
          {
            id: 'father',
            name: '张建国',
            subtitle: '父亲',
            tag: '亲属关系',

            edge: createEdge('family', '父子'),

            children: [
              {
                id: 'grandfather',
                name: '张德福',
                subtitle: '祖父',

                edge: createEdge('family', '父子')
              },

              {
                id: 'grandmother',
                name: '王秀兰',
                subtitle: '祖母',

                edge: createEdge('family', '母子')
              }
            ]
          },

          {
            id: 'mother',
            name: '李芳',
            subtitle: '母亲',
            tag: '亲属关系',

            edge: createEdge('family', '母子')
          },

          {
            id: 'wife',
            name: '王晓梅',
            subtitle: '配偶',
            tag: '亲属关系',

            edge: createEdge('family', '夫妻'),

            children: [
              {
                id: 'son',
                name: '张小明',
                subtitle: '儿子',
                variant: 'avatar',

                edge: createEdge('family', '父子')
              },

              {
                id: 'daughter',
                name: '张小雨',
                subtitle: '女儿',
                variant: 'avatar',

                edge: createEdge('family', '父女')
              }
            ]
          },

          {
            id: 'phone-contact-3',
            name: '朝鲜电话（189098789078）',
            subtitle: '夜间高频联系人',
            tag: '通联关系',
            highlightSignal: 'high',

            edge: createEdge('contact', '通联'),

            children: [
              {
                id: 'phone-contact-3-helper',
                name: '吴倩助理',
                subtitle: '代接电话 4 次',
                highlightSignal: 'low',

                edge: createEdge('contact', '代接')
              }
            ]
          },

          {
            id: 'phone-contact-4',
            name: '朝鲜电话（189098789075）',
            subtitle: '短信往来 12 条',
            tag: '通联关系',
            highlightSignal: 'medium',

            edge: createEdge('contact', '短信')
          },

          {
            id: 'wechat-friend',
            name: '陈晨',
            subtitle: '微信好友',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'wechat-friend-2',
            name: '黄雅',
            subtitle: '共同群聊 3 个',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'wechat-friend-3',
            name: '林凯',
            subtitle: '转账往来 5 笔',
            tag: '微信好友',

            edge: createEdge('wechat', '微信转账'),

            children: [
              {
                id: 'wechat-friend-3-group',
                name: '项目沟通群',
                subtitle: '共同微信群',

                edge: createEdge('wechat', '群聊')
              }
            ]
          },

          {
            id: 'wechat-friend-4',
            name: '马宁',
            subtitle: '最近互动 9 次',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'colleague',
            name: '赵强',
            subtitle: '技术部经理',
            tag: '同行关系',

            edge: createEdge('peer', '同行')
          },

          {
            id: 'colleague-2',
            name: '钱峰',
            subtitle: '同项目组成员',
            tag: '同行关系',

            edge: createEdge('peer', '同事')
          },

          {
            id: 'colleague-3',
            name: '郑琳',
            subtitle: '供应商接口人',
            tag: '同行关系',

            edge: createEdge('peer', '协作'),

            children: [
              {
                id: 'colleague-3-company',
                name: '星河科技',
                subtitle: '合作单位',

                edge: createEdge('peer', '任职')
              }
            ]
          },

          {
            id: 'colleague-4',
            name: '何宇',
            subtitle: '前同事',
            tag: '同行关系',

            edge: createEdge('peer', '前同事')
          }
        ]
      }
    }
  },

  computed: {
    relationOptions() {
      return collectRelationOptions(this.relationshipData)
    },

    filteredRelationshipData() {
      return filterTreeByRelations(this.relationshipData, this.selectedRelationLabels)
    }
  },

  methods: {
    handleNodeClick(node) {
      this.selectedNodeId = node.id
      this.selectedNode = node
    },

    toggleCollapse(node) {
      const index = this.collapsedNodeIds.indexOf(node.id)

      if (index >= 0) {
        this.collapsedNodeIds.splice(index, 1)
      } else {
        this.collapsedNodeIds.push(node.id)
      }
    },

    isRelationSelected(label) {
      return this.selectedRelationLabels.indexOf(label) >= 0
    },

    selectAllRelations() {
      this.selectedRelationLabels = []
    },

    toggleRelationFilter(label) {
      const index = this.selectedRelationLabels.indexOf(label)

      if (index >= 0) {
        this.selectedRelationLabels.splice(index, 1)
      } else {
        this.selectedRelationLabels.push(label)
      }
    },

    handleZoomChange(nextZoom) {
      this.zoom = this.clampZoom(nextZoom)
    },

    fitTreeToView() {
      this.$nextTick(() => {
        if (this.$refs.relationshipTree) {
          this.$refs.relationshipTree.fitToView()
        }
      })
    },

    clampZoom(zoom) {
      return Math.min(this.maxZoom, Math.max(this.minZoom, zoom))
    },

    increaseZoom() {
      this.zoom = this.clampZoom(Number((this.zoom + 0.1).toFixed(1)))
    },

    decreaseZoom() {
      this.zoom = this.clampZoom(Number((this.zoom - 0.1).toFixed(1)))
    }
  }
}
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  font-family:
    Arial,
    "Microsoft YaHei",
    sans-serif;
}

body {
  background: #f1f5f9;
}

button {
  padding: 7px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #f8fafc;
}

#app {
  box-sizing: border-box;
  height: 100vh;
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  min-height: 42px;
  margin-bottom: 12px;
}

.zoom-controls,
.relation-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.relation-filter__option {
  min-height: 34px;
  padding: 6px 12px;
  border-color: #d1d9e6;
  color: #334155;
}

.relation-filter__option--active {
  border-color: #0f766e;
  background: #ccfbf1;
  color: #115e59;
}

.selected-node {
  color: #334155;
}

.tree-container {
  height: calc(100vh - 112px);
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: white;
}
</style>