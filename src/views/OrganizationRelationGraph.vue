<template>
  <main class="org-page">
    <header class="org-page__header">
      <div>
        <h1>机构层级树</h1>
        <p>基于 relation-graph@2.2.11，第二层兄弟节点间距 400，其余兄弟节点间距 200。</p>
      </div>
      <button type="button" @click="resetView">重置视图</button>
    </header>

    <section class="org-graph">
      <RelationGraph
        ref="graphRef"
        :options="graphOptions"
        :on-node-click="handleNodeClick"
      >
        <template #node="{ node }">
          <article class="org-node" :class="'org-node--' + node.data.levelType">
            <span class="org-node__type">{{ node.data.type }}</span>
            <strong>{{ node.text }}</strong>
            <small>{{ node.data.code }}</small>
          </article>
        </template>
      </RelationGraph>
    </section>
  </main>
</template>

<script>
import RelationGraph from 'relation-graph'

const SECOND_LEVEL_GAP = 400
const DEFAULT_SIBLING_GAP = 200

export default {
  name: 'OrganizationRelationGraph',
  components: {
    RelationGraph
  },
  data() {
    return {
      selectedNode: null,
      graphOptions: {
        debug: false,
        allowShowMiniToolBar: true,
        allowShowMiniNameFilter: false,
        allowSwitchLineShape: false,
        allowSwitchJunctionPoint: false,
        defaultNodeShape: 1,
        defaultLineShape: 4,
        defaultLineColor: '#94a3b8',
        defaultLineWidth: 1,
        defaultJunctionPoint: 'border',
        defaultPolyLineRadius: 8,
        layoutDirection: 'h',
        moveToCenterWhenRefresh: false,
        zoomToFitWhenRefresh: false
      }
    }
  },
  mounted() {
    this.renderGraph()
  },
  methods: {
    buildGraphData() {
      const levelX = {
        root: 0,
        second: 320,
        third: 640
      }

      const nodes = [
        this.createNode('hq', '集团总部', '总部', 'ORG-000', 'root', levelX.root, 0),

        this.createNode('north', '华北事业群', '二级机构', 'ORG-100', 'second', levelX.second, -SECOND_LEVEL_GAP),
        this.createNode('east', '华东事业群', '二级机构', 'ORG-200', 'second', levelX.second, 0),
        this.createNode('south', '华南事业群', '二级机构', 'ORG-300', 'second', levelX.second, SECOND_LEVEL_GAP),

        this.createNode('north-sales', '华北销售中心', '三级机构', 'ORG-110', 'third', levelX.third, -SECOND_LEVEL_GAP - DEFAULT_SIBLING_GAP / 2),
        this.createNode('north-service', '华北服务中心', '三级机构', 'ORG-120', 'third', levelX.third, -SECOND_LEVEL_GAP + DEFAULT_SIBLING_GAP / 2),

        this.createNode('east-sales', '华东销售中心', '三级机构', 'ORG-210', 'third', levelX.third, -DEFAULT_SIBLING_GAP / 2),
        this.createNode('east-delivery', '华东交付中心', '三级机构', 'ORG-220', 'third', levelX.third, DEFAULT_SIBLING_GAP / 2),

        this.createNode('south-sales', '华南销售中心', '三级机构', 'ORG-310', 'third', levelX.third, SECOND_LEVEL_GAP - DEFAULT_SIBLING_GAP / 2),
        this.createNode('south-service', '华南服务中心', '三级机构', 'ORG-320', 'third', levelX.third, SECOND_LEVEL_GAP + DEFAULT_SIBLING_GAP / 2)
      ]

      const lines = [
        this.createLine('hq', 'north'),
        this.createLine('hq', 'east'),
        this.createLine('hq', 'south'),
        this.createLine('north', 'north-sales'),
        this.createLine('north', 'north-service'),
        this.createLine('east', 'east-sales'),
        this.createLine('east', 'east-delivery'),
        this.createLine('south', 'south-sales'),
        this.createLine('south', 'south-service')
      ]

      return {
        nodes,
        lines
      }
    },
    createNode(id, text, type, code, levelType, x, y) {
      return {
        id,
        text,
        x,
        y,
        fixed: true,
        width: levelType === 'root' ? 176 : 160,
        height: 76,
        nodeShape: 1,
        data: {
          type,
          code,
          levelType
        }
      }
    },
    createLine(from, to) {
      return {
        from,
        to,
        color: '#94a3b8',
        lineWidth: 1,
        text: '隶属',
        lineShape: 4
      }
    },
    renderGraph() {
      this.$nextTick(() => {
        const graphInstance = this.$refs.graphRef.getInstance()
        const graphData = this.buildGraphData()

        graphInstance.clearGraph()
        graphInstance.addNodes(graphData.nodes)
        graphInstance.addLines(graphData.lines)
        graphInstance.rootNode = graphInstance.getNodeById('hq')
        graphInstance.moveToCenter()
        graphInstance.zoomToFit()
      })
    },
    resetView() {
      const graphInstance = this.$refs.graphRef.getInstance()
      graphInstance.moveToCenter()
      graphInstance.zoomToFit()
    },
    handleNodeClick(node) {
      this.selectedNode = node
    }
  }
}
</script>

<style scoped>
.org-page {
  min-height: 100vh;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 16px;
  padding: 24px;
  background: #f1f5f9;
  color: #0f172a;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.org-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.org-page__header h1 {
  margin: 0 0 6px;
  font-size: 24px;
}

.org-page__header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.org-page__header button {
  height: 34px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  cursor: pointer;
}

.org-graph {
  min-height: 0;
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.org-graph ::v-deep .relation-graph {
  height: 100%;
}

.org-graph ::v-deep .rel-map {
  background:
    linear-gradient(#edf2f7 1px, transparent 1px),
    linear-gradient(90deg, #edf2f7 1px, transparent 1px),
    #ffffff;
  background-size: 28px 28px;
}

.org-node {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: grid;
  align-content: center;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  text-align: left;
}

.org-node--root {
  border-color: #0f766e;
  background: #ecfdf5;
}

.org-node--second {
  border-color: #2563eb;
  background: #eff6ff;
}

.org-node--third {
  border-color: #94a3b8;
  background: #ffffff;
}

.org-node__type {
  color: #64748b;
  font-size: 12px;
}

.org-node strong {
  overflow: hidden;
  font-size: 15px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-node small {
  color: #64748b;
  font-size: 12px;
}
</style>
