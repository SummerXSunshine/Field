<template>
  <div id="app">
    <header class="toolbar">
      <button @click="decreaseZoom">缩小</button>

      <span>{{ Math.round(zoom * 100) }}%</span>

      <button @click="increaseZoom">放大</button>

      <button @click="zoom = 1">恢复 100%</button>

      <span v-if="selectedNode">
        当前选择：{{ selectedNode.name }}
      </span>
    </header>

    <main class="tree-container">
      <RelationshipTree
        :root="relationshipData"
        :selected-node-id="selectedNodeId"
        :collapsed-node-ids="collapsedNodeIds"
        :zoom="zoom"
        :node-width="154"
        :node-height="41"
        :level-gap="136"
        :sibling-gap="34"
        @node-click="handleNodeClick"
        @toggle-collapse="toggleCollapse"
      />
    </main>
  </div>
</template>

<script>
import RelationshipTree from './components/RelationshipTree.vue'

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
          strokeWidth: 3
        },
        relationStyles[type],
        extraStyle
      )
    }

    return {
      zoom: 1,
      selectedNodeId: '',
      selectedNode: null,
      collapsedNodeIds: [],

      relationshipData: {
        id: 'zhang-san',
        name: '张三',
        subtitle: '核心人物',
        tag: '本人',
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
            id: 'phone-contact',
            name: '刘敏',
            subtitle: '近 30 天通话 18 次',
            tag: '通联关系',

            edge: createEdge('contact', '通联')
          },

          {
            id: 'wechat-friend',
            name: '陈晨',
            subtitle: '微信好友',
            tag: '微信好友',

            edge: createEdge('wechat', '微信')
          },

          {
            id: 'colleague',
            name: '赵强',
            subtitle: '技术部经理',
            tag: '同行关系',

            edge: createEdge('peer', '同行')
          }
        ]
      }
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

    increaseZoom() {
      this.zoom = Math.min(2, Number((this.zoom + 0.1).toFixed(1)))
    },

    decreaseZoom() {
      this.zoom = Math.max(0.4, Number((this.zoom - 0.1).toFixed(1)))
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
  gap: 12px;
  height: 42px;
  margin-bottom: 12px;
}

.tree-container {
  height: calc(100vh - 94px);
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: white;
}
</style>
