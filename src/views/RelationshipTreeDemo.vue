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
        <div class="relation-filter__choices" aria-label="关系类型筛选">
          <label
            v-for="option in relationTypeOptions"
            :key="option.value"
            class="relation-filter__choice"
            :class="{ 'relation-filter__choice--active': filters.relationTags.indexOf(option.value) >= 0 }"
          >
            <input v-model="filters.relationTags" type="checkbox" :value="option.value" />
            <span class="relation-filter__choice-icon" :class="'relation-filter__choice-icon--' + option.icon" aria-hidden="true"></span>
            <span class="relation-filter__choice-text">{{ option.label }}</span>
            <span class="relation-filter__choice-check" aria-hidden="true">✓</span>
          </label>
        </div>

        <label class="relation-filter__field">
          <span>层级</span>
          <select v-model.number="filters.maxDepth">
            <option v-for="level in levelOptions" :key="level" :value="level">
              {{ level }} 层
            </option>
          </select>
        </label>

        <label class="relation-filter__field relation-filter__field--text">
          <span>标签</span>
          <input v-model.trim="filters.tagText" type="search" placeholder="输入标签/关系/节点文本" />
        </label>

        <label class="relation-filter__field">
          <span>开始时间</span>
          <input v-model="filters.startDate" type="date" />
        </label>

        <label class="relation-filter__field">
          <span>结束时间</span>
          <input v-model="filters.endDate" type="date" />
        </label>

        <button type="button" class="relation-filter__reset" @click="resetFilters">重置</button>
      </div>

      <span v-if="selectedNode" class="selected-node">
        当前选择：{{ selectedNode.name }}
        <em v-if="isNodeLoading(selectedNode.id)">加载中...</em>
        <em v-else-if="isNodeLoaded(selectedNode.id)">已加载子节点</em>
        <em v-else-if="canLoadChildren(selectedNode.id)">点击后可加载子节点</em>
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
        :edge-label-background="false"
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
import RelationshipTree from '../components/RelationshipTree/RelationshipTree.vue'
import { filterRelationshipTree } from '../utils/relationFilter'

export default {
  name: 'RelationshipTreeDemo',

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
      loadingNodeIds: [],
      loadedNodeIds: [],
      enableCollapse: true,
      filters: {
        maxDepth: 10,
        tagText: '',
        startDate: '',
        endDate: '',
        relationTags: []
      },
      relationTypeOptions: [
        { value: '亲属关系', label: '亲属关系', icon: 'family' },
        { value: '通联关系', label: '通联关系', icon: 'contact' },
        { value: '微信好友', label: '微信好友', icon: 'wechat' },
        { value: '同行关系', label: '同行关系', icon: 'peer' }
      ],
      externalChildrenMap: {
        'phone-contact-4': [
          {
            id: 'phone-contact-4-detail-1',
            eventDate: '2026-03-04',
            name: '短信号码 13800138001',
            subtitle: '外部加载：短信 7 条',
            tag: '通联关系',
            highlightSignal: 'low',
            edge: createEdge('contact', '短信')
          },
          {
            id: 'phone-contact-4-detail-2',
            eventDate: '2026-03-05',
            name: '短信号码 13800138002',
            subtitle: '外部加载：短信 5 条',
            tag: '通联关系',
            edge: createEdge('contact', '短信')
          }
        ],
        'wechat-friend': [
          {
            id: 'wechat-friend-detail-1',
            eventDate: '2026-03-20',
            name: '共同好友：陆远',
            subtitle: '外部加载：共同好友',
            tag: '微信好友',
            edge: createEdge('wechat', '共同好友')
          },
          {
            id: 'wechat-friend-detail-2',
            eventDate: '2026-03-21',
            name: '共同群：项目二群',
            subtitle: '外部加载：微信群',
            tag: '微信好友',
            edge: createEdge('wechat', '群聊')
          }
        ],
        colleague: [
          {
            id: 'colleague-detail-1',
            eventDate: '2026-05-04',
            name: '技术部成员 A',
            subtitle: '外部加载：下属',
            tag: '同行关系',
            edge: createEdge('peer', '同部门')
          },
          {
            id: 'colleague-detail-2',
            eventDate: '2026-05-05',
            name: '技术部成员 B',
            subtitle: '外部加载：协作',
            tag: '同行关系',
            edge: createEdge('peer', '协作')
          }
        ]
      },

      relationshipData: {
        id: 'zhang-san',
        eventDate: '2026-01-01',
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
            id: 'mixed-node-test-text-parent',
            eventDate: '2026-07-24',
            name: '测试：文本父节点',
            subtitle: '包含一个头像子节点和一个文本子节点',
            tag: '混合节点测试',
            height: 41,
            edge: createEdge('peer', '混合节点测试', {
              stroke: '#7c3aed',
              labelColor: '#6d28d9',
              labelBackground: '#f5f3ff'
            }),
            children: [
              {
                id: 'mixed-node-test-avatar-child',
                eventDate: '2026-07-24',
                name: '测试：头像子节点',
                subtitle: '该头像节点下还有文本节点',
                variant: 'avatar',
                height: 84,
                edge: createEdge('peer', '头像分支', {
                  stroke: '#7c3aed'
                }),
                children: [
                  {
                    id: 'mixed-node-test-avatar-text-grandchild',
                    eventDate: '2026-07-24',
                    name: '测试：头像下的文本孙节点',
                    subtitle: '用于检查头像到文本的连线',
                    height: 41,
                    edge: createEdge('peer', '头像的文本子节点', {
                      stroke: '#7c3aed'
                    })
                  }
                ]
              },
              {
                id: 'mixed-node-test-text-child',
                eventDate: '2026-07-24',
                name: '测试：文本子节点',
                subtitle: '与头像子节点同级',
                height: 41,
                edge: createEdge('peer', '文本分支', {
                  stroke: '#7c3aed'
                })
              }
            ]
          },
          {
            id: 'layout-test-avatar-parent',
            eventDate: '2026-07-24',
            name: '高头像父节点（140px）',
            subtitle: '布局测试：父节点明显高于文本叶子',
            tag: '布局高度测试',
            variant: 'avatar',
            width: 108,
            height: 140,
            edge: createEdge('peer', '高度差测试', {
              stroke: '#7c3aed',
              labelColor: '#6d28d9',
              labelBackground: '#f5f3ff'
            }),
            children: [
              {
                id: 'layout-test-short-leaf-28',
                name: '矮文本叶子 A（28px）',
                subtitle: '验证上边界',
                height: 28,
                style: {
                  padding: '4px 10px'
                },
                edge: createEdge('peer', '28px 叶子', {
                  stroke: '#7c3aed'
                })
              },
            
            ]
          },
          {
            id: 'layout-test-following-leaf',
            eventDate: '2026-07-24',
            name: '相邻对照节点（30px）',
            subtitle: '不应与高头像父节点或连线重叠',
            tag: '布局高度测试',
            height: 30,
            style: {
              padding: '4px 10px'
            },
            edge: createEdge('peer', '相邻节点', {
              stroke: '#7c3aed',
              labelColor: '#6d28d9',
              labelBackground: '#f5f3ff'
            })
          },
          {
            id: 'father',
            eventDate: '2026-01-03',
            name: '张建国',
            subtitle: '父亲',
            tag: '亲属关系',

            edge: createEdge('family', '父子'),

            children: [
              {
                id: 'grandfather',
            eventDate: '2026-01-04',
                name: '张德福',
                subtitle: '祖父',

                edge: createEdge('family', '父子')
              },

              {
                id: 'grandmother',
            eventDate: '2026-01-05',
                name: '王秀兰',
                subtitle: '祖母',

                edge: createEdge('family', '母子')
              }
            ]
          },

          {
            id: 'mother',
            eventDate: '2026-01-06',
            name: '李芳',
            subtitle: '母亲',
            tag: '亲属关系',

            edge: createEdge('family', '母子')
          },

          {
            id: 'wife',
            eventDate: '2026-01-08',
            name: '王晓梅',
            subtitle: '配偶',
            tag: '亲属关系',

            edge: createEdge('family', '夫妻'),

            children: [
              {
                id: 'son',
            eventDate: '2026-01-10',
                name: '张小明',
                subtitle: '儿子',
                variant: 'avatar',

                edge: createEdge('family', '父子')
              },

              {
                id: 'daughter',
            eventDate: '2026-01-12',
                name: '张小雨',
                subtitle: '女儿',
                variant: 'avatar',

                edge: createEdge('family', '父女')
              }
            ]
          },

          {
            id: 'phone-contact-3',
            eventDate: '2026-02-15',
            name: '朝鲜电话（189098789078）',
            subtitle: '夜间高频联系人',
            tag: '通联关系',
            highlightSignal: 'high',

            edge: createEdge('contact', '通联'),

            children: [
              {
                id: 'phone-contact-3-helper',
            eventDate: '2026-02-16',
                name: '吴倩助理',
                subtitle: '代接电话 4 次',
                highlightSignal: 'low',

                edge: createEdge('contact', '代接')
              }
            ]
          },

          {
            id: 'phone-contact-4',
            eventDate: '2026-03-03',
            name: '高亮节点',
            subtitle: '短信往来 12 条',
            tag: '通联关系',
            highlightSignal: 'medium',

            edge: createEdge('contact', '短信')
          },

          {
            id: 'wechat-friend',
            eventDate: '2026-03-18',
            name: '陈晨',
            subtitle: '微信好友',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'wechat-friend-2',
            eventDate: '2026-03-22',
            name: '黄雅',
            subtitle: '共同群聊 3 个',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'wechat-friend-3',
            eventDate: '2026-04-06',
            name: '林凯',
            subtitle: '转账往来 5 笔',
            tag: '微信好友',

            edge: createEdge('wechat', '微信转账'),

            children: [
              {
                id: 'wechat-friend-3-group',
            eventDate: '2026-04-08',
                name: '项目沟通群',
                subtitle: '共同微信群',

                edge: createEdge('wechat', '群聊')
              }
            ]
          },

          {
            id: 'wechat-friend-4',
            eventDate: '2026-04-21',
            name: '马宁',
            subtitle: '最近互动 9 次',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'colleague',
            eventDate: '2026-05-02',
            name: '赵强',
            subtitle: '技术部经理',
            tag: '同行关系',

            edge: createEdge('peer', '同行')
          },

          {
            id: 'colleague-2',
            eventDate: '2026-05-09',
            name: '钱峰',
            subtitle: '同项目组成员',
            tag: '同行关系',

            edge: createEdge('peer', '同事')
          },

          {
            id: 'colleague-3',
            eventDate: '2026-05-18',
            name: '郑琳',
            subtitle: '供应商接口人',
            tag: '同行关系',

            edge: createEdge('peer', '协作'),

            children: [
              {
                id: 'colleague-3-company',
            eventDate: '2026-05-20',
                name: '星河科技',
                subtitle: '合作单位',

                edge: createEdge('peer', '任职')
              }
            ]
          },

          {
            id: 'colleague-4',
            eventDate: '2026-06-02',
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
    levelOptions() {
      return Array.from({ length: 9 }, (_, index) => index + 2)
    },

    filteredRelationshipData() {
      return filterRelationshipTree(this.relationshipData, this.filters)
    }
  },

  methods: {
    handleNodeClick(node) {
      this.selectedNodeId = node.id
      this.selectedNode = node
      this.loadExternalChildren(node)
    },

    canLoadChildren(nodeId) {
      const children = this.externalChildrenMap[nodeId]
      return Boolean(children && children.length && this.loadedNodeIds.indexOf(nodeId) < 0)
    },

    isNodeLoading(nodeId) {
      return this.loadingNodeIds.indexOf(nodeId) >= 0
    },

    isNodeLoaded(nodeId) {
      return this.loadedNodeIds.indexOf(nodeId) >= 0
    },

    loadExternalChildren(node) {
      if (!node || this.loadedNodeIds.indexOf(node.id) >= 0 || this.loadingNodeIds.indexOf(node.id) >= 0) {
        return
      }

      const externalChildren = this.externalChildrenMap[node.id]
      if (!externalChildren || externalChildren.length === 0) {
        return
      }

      this.loadingNodeIds.push(node.id)
      setTimeout(() => {
        this.appendChildrenToNode(node.id, externalChildren)
        this.loadedNodeIds.push(node.id)
        const loadingIndex = this.loadingNodeIds.indexOf(node.id)
        if (loadingIndex >= 0) {
          this.loadingNodeIds.splice(loadingIndex, 1)
        }
      }, 300)
    },

    appendChildrenToNode(targetId, children) {
      const appendTo = currentNode => {
        if (!currentNode) {
          return currentNode
        }

        if (currentNode.id === targetId) {
          const existingChildren = currentNode.children || []
          const existingIds = new Set(existingChildren.map(child => child.id))
          const nextChildren = children.filter(child => !existingIds.has(child.id))

          return Object.assign({}, currentNode, {
            children: existingChildren.concat(nextChildren)
          })
        }

        if (!currentNode.children || currentNode.children.length === 0) {
          return currentNode
        }

        return Object.assign({}, currentNode, {
          children: currentNode.children.map(appendTo)
        })
      }

      this.relationshipData = appendTo(this.relationshipData)
    },

    toggleCollapse(node) {
      const index = this.collapsedNodeIds.indexOf(node.id)

      if (index >= 0) {
        this.collapsedNodeIds.splice(index, 1)
      } else {
        this.collapsedNodeIds.push(node.id)
      }
    },

    resetFilters() {
      this.filters = {
        maxDepth: 10,
        tagText: '',
        startDate: '',
        endDate: '',
        relationTags: []
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

.relation-filter__choices {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

.relation-filter__choice {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  box-sizing: border-box;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.relation-filter__choice:hover {
  border-color: #94a3b8;
  background: #f8fafc;
}

.relation-filter__choice--active {
  border-color: #0f766e;
  background: #f0fdfa;
  color: #0f766e;
}

.relation-filter__choice input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.relation-filter__choice-icon {
  position: relative;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  color: currentColor;
}

.relation-filter__choice-icon::before,
.relation-filter__choice-icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.relation-filter__choice-icon--family::before {
  left: 2px;
  top: 6px;
  width: 12px;
  height: 8px;
  border: 2px solid currentColor;
  border-top: 0;
  border-radius: 2px;
}

.relation-filter__choice-icon--family::after {
  left: 3px;
  top: 1px;
  width: 10px;
  height: 10px;
  border-top: 2px solid currentColor;
  border-left: 2px solid currentColor;
  transform: rotate(45deg);
}

.relation-filter__choice-icon--contact::before {
  left: 3px;
  top: 2px;
  width: 10px;
  height: 12px;
  border: 2px solid currentColor;
  border-radius: 6px;
  transform: rotate(-24deg);
}

.relation-filter__choice-icon--contact::after {
  left: 7px;
  top: 11px;
  width: 5px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  transform: rotate(-24deg);
}

.relation-filter__choice-icon--wechat::before,
.relation-filter__choice-icon--wechat::after {
  border: 2px solid currentColor;
  border-radius: 50%;
}

.relation-filter__choice-icon--wechat::before {
  left: 1px;
  top: 3px;
  width: 10px;
  height: 8px;
}

.relation-filter__choice-icon--wechat::after {
  right: 1px;
  bottom: 3px;
  width: 8px;
  height: 7px;
  background: #ffffff;
}

.relation-filter__choice--active .relation-filter__choice-icon--wechat::after {
  background: #f0fdfa;
}

.relation-filter__choice-icon--peer::before,
.relation-filter__choice-icon--peer::after {
  width: 7px;
  height: 7px;
  border: 2px solid currentColor;
  border-radius: 50%;
}

.relation-filter__choice-icon--peer::before {
  left: 1px;
  top: 2px;
}

.relation-filter__choice-icon--peer::after {
  right: 1px;
  bottom: 2px;
}

.relation-filter__choice-check {
  width: 14px;
  color: transparent;
  font-weight: 700;
  text-align: center;
}

.relation-filter__choice--active .relation-filter__choice-check {
  color: currentColor;
}

.relation-filter__field {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 13px;
}

.relation-filter__field--text {
  min-width: 260px;
}

.relation-filter__field select,
.relation-filter__field input {
  height: 34px;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 10px;
  background: #ffffff;
  color: #1e293b;
  font: inherit;
}

.relation-filter__field--text input {
  width: 100%;
}

.relation-filter__reset {
  height: 34px;
  padding: 0 12px;
}

.selected-node {
  color: #334155;
}

.selected-node em {
  margin-left: 8px;
  color: #0f766e;
  font-style: normal;
  font-size: 12px;
}

.tree-container {
  height: calc(100vh - 112px);
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: white;
}
</style>