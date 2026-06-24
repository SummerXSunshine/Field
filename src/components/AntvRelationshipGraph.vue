<template>
  <div class="antv-relationship-graph">
    <div ref="container" class="antv-relationship-graph__canvas"></div>
  </div>
</template>

<script>
import G6 from '@antv/g6'

const NODE_WIDTH = 200
const NODE_HEIGHT = 41
const AVATAR_NODE_WIDTH = 96
const AVATAR_NODE_HEIGHT = 84
const AVATAR_SIZE = 58
const GROUP_LINE_WIDTH = 220
const GROUP_LINE_HEIGHT = 32

export default {
  name: 'AntvRelationshipGraph',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      graph: null,
      resizeObserver: null
    }
  },
  mounted() {
    this.initGraph()
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.graph) {
      this.graph.destroy()
      this.graph = null
    }
  },
  watch: {
    data: {
      deep: true,
      handler() {
        if (this.graph) {
          this.graph.changeData(this.data)
          this.graph.fitView(32)
        }
      }
    }
  },
  methods: {
    initGraph() {
      const container = this.$refs.container
      if (!container) {
        return
      }

      this.registerShapes()

      const width = container.clientWidth || 960
      const height = container.clientHeight || 640

      this.graph = new G6.TreeGraph({
        container,
        width,
        height,
        modes: {
          default: ['drag-canvas', 'zoom-canvas', 'drag-node']
        },
        defaultNode: {
          type: 'relationship-node',
          anchorPoints: [[0, 0.5], [1, 0.5]]
        },
        defaultEdge: {
          type: 'relationship-polyline',
          style: {
            stroke: '#57708f',
            lineWidth: 1
          }
        },
        nodeStateStyles: {
          selected: {
            shadowColor: 'rgba(14, 116, 144, 0.35)',
            shadowBlur: 18
          }
        },
        layout: {
          type: 'compactBox',
          direction: 'LR',
          getId: node => node.id,
          getHeight: node => this.nodeSize(node).height,
          getWidth: node => this.nodeSize(node).width,
          getVGap: () => 34,
          getHGap: node => (node && node.isTagGroup ? 120 : 96)
        }
      })

      this.graph.node(node => {
        const style = this.nodeStyle(node)
        const size = this.nodeSize(node)

        return {
          size: [size.width, size.height],
          style,
          labelCfg: {
            style: {
              fill: style.color || '#202837',
              fontSize: node.isTagGroup || node.variant === 'avatar' ? 12 : 13,
              fontWeight: 700
            }
          }
        }
      })

      this.graph.edge(edge => {
        const target = edge.targetModel || {}
        const edgeStyle = target.edge || edge.style || {}
        const color = edgeStyle.stroke || target.color || '#57708f'
        const isGroupEdge = Boolean(target.isTagGroup)

        return {
          label: edgeStyle.label,
          labelCfg: edgeStyle.label
            ? {
                position: 'end',
                refX: -42,
                refY: -16,
                style: {
                  fill: edgeStyle.labelColor || color,
                  fontSize: 12,
                  fontWeight: 700,
                  background: {
                    fill: edgeStyle.labelBackground || '#ffffff',
                    stroke: 'rgba(16, 24, 40, 0.08)',
                    radius: 6,
                    padding: [4, 8, 4, 8]
                  }
                }
              }
            : undefined,
          style: {
            stroke: color,
            lineWidth: edgeStyle.strokeWidth || 1,
            lineDash: edgeStyle.strokeDasharray ? String(edgeStyle.strokeDasharray).split(',').map(Number) : undefined,
            endArrow: isGroupEdge
              ? false
              : {
                  path: G6.Arrow.triangle(7, 9, 0),
                  fill: color,
                  stroke: color
                }
          }
        }
      })

      this.graph.on('node:click', event => {
        const item = event.item
        this.graph.getNodes().forEach(node => this.graph.clearItemStates(node, ['selected']))
        this.graph.setItemState(item, 'selected', true)
        this.$emit('node-click', item.getModel())
      })

      this.graph.data(this.data)
      this.graph.render()
      this.graph.fitView(32)

      this.bindResize(container)
    },
    nodeSize(node) {
      if (node.isTagGroup) {
        return { width: GROUP_LINE_WIDTH, height: GROUP_LINE_HEIGHT }
      }

      if (node.variant === 'avatar') {
        return { width: AVATAR_NODE_WIDTH, height: AVATAR_NODE_HEIGHT }
      }

      return { width: NODE_WIDTH, height: NODE_HEIGHT }
    },
    nodeStyle(node) {
      if (node.isTagGroup) {
        const edge = node.edge || {}
        return {
          stroke: edge.stroke || '#57708f',
          fill: edge.labelBackground || '#ffffff',
          color: edge.labelColor || edge.stroke || '#344054'
        }
      }

      const edge = node.edge || {}
      const relationColor = edge.stroke || '#d7deea'
      const relationBackground = edge.labelBackground || '#ffffff'
      const relationTextColor = edge.labelColor || relationColor
      const highlightStyle = this.highlightSignalStyle(node)

      return Object.assign(
        {
          stroke: relationColor,
          fill: relationBackground,
          color: relationTextColor
        },
        highlightStyle || {},
        node.style || {}
      )
    },
    highlightSignalStyle(node) {
      const signal = node.highlightSignal
      if (!signal) {
        return null
      }

      const presets = {
        high: {
          fill: '#fef2f2',
          color: '#991b1b',
          stroke: '#ef4444'
        },
        medium: {
          fill: '#fff1f2',
          color: '#be123c',
          stroke: '#fb7185'
        },
        low: {
          fill: '#fff5f5',
          color: '#b91c1c',
          stroke: '#fca5a5'
        }
      }

      if (typeof signal === 'object') {
        return {
          fill: signal.background,
          color: signal.color,
          stroke: signal.borderColor || signal.color
        }
      }

      return presets[signal] || null
    },
    registerShapes() {
      if (!G6.Global.nodeType || !G6.Global.nodeType['relationship-node']) {
        G6.registerNode('relationship-node', {
          draw: (cfg, group) => this.drawNode(cfg, group),
          setState(name, value, item) {
            if (name !== 'selected') {
              return
            }

            const group = item.getContainer()
            const keyShape = item.getKeyShape()
            const halo = group.find(element => element.get('name') === 'selected-halo')

            if (value && !halo) {
              const bbox = keyShape.getBBox()
              group.addShape('rect', {
                attrs: {
                  x: bbox.minX - 5,
                  y: bbox.minY - 5,
                  width: bbox.width + 10,
                  height: bbox.height + 10,
                  radius: Math.min(12, (bbox.height + 10) / 2),
                  stroke: 'rgba(14, 116, 144, 0.45)',
                  lineWidth: 3,
                  fill: 'transparent'
                },
                name: 'selected-halo'
              })
              group.sort()
            }

            if (!value && halo) {
              halo.remove()
            }
          }
        }, 'single-node')
      }

      if (!G6.Global.edgeType || !G6.Global.edgeType['relationship-polyline']) {
        G6.registerEdge('relationship-polyline', {
          draw(cfg, group) {
            const startPoint = cfg.startPoint
            const endPoint = cfg.endPoint
            const offset = Math.min(48, Math.max(24, (endPoint.x - startPoint.x) / 2))
            const elbowX = startPoint.x + offset
            const path = [
              ['M', startPoint.x, startPoint.y],
              ['L', elbowX, startPoint.y],
              ['L', elbowX, endPoint.y],
              ['L', endPoint.x, endPoint.y]
            ]

            return group.addShape('path', {
              attrs: Object.assign(
                {
                  path,
                  stroke: '#57708f',
                  lineWidth: 1,
                  lineAppendWidth: 8
                },
                cfg.style || {}
              ),
              name: 'relationship-polyline'
            })
          }
        }, 'single-line')
      }
    },
    drawNode(cfg, group) {
      if (cfg.isTagGroup) {
        return this.drawTagGroupNode(cfg, group)
      }

      if (cfg.variant === 'avatar') {
        return this.drawAvatarNode(cfg, group)
      }

      return this.drawCardNode(cfg, group)
    },
    drawTagGroupNode(cfg, group) {
      const style = this.nodeStyle(cfg)
      const width = GROUP_LINE_WIDTH
      const height = GROUP_LINE_HEIGHT
      const line = group.addShape('line', {
        attrs: {
          x1: -width / 2,
          y1: 0,
          x2: width / 2,
          y2: 0,
          stroke: style.stroke,
          lineWidth: 1
        },
        name: 'group-line'
      })

      const labelWidth = Math.min(width - 24, Math.max(64, String(cfg.name || '').length * 14 + 22))
      group.addShape('rect', {
        attrs: {
          x: -labelWidth / 2,
          y: -12,
          width: labelWidth,
          height: 24,
          radius: 12,
          fill: style.fill,
          stroke: style.stroke,
          lineWidth: 1
        },
        name: 'group-label-bg'
      })
      group.addShape('text', {
        attrs: {
          text: cfg.name || '',
          x: 0,
          y: 0,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: style.color,
          fontSize: 12,
          fontWeight: 700
        },
        name: 'group-label'
      })

      return line
    },
    drawAvatarNode(cfg, group) {
      const style = this.nodeStyle(cfg)
      const circle = group.addShape('circle', {
        attrs: {
          x: 0,
          y: -13,
          r: AVATAR_SIZE / 2,
          fill: style.fill,
          stroke: style.stroke,
          lineWidth: 3,
          shadowColor: 'rgba(16, 24, 40, 0.16)',
          shadowBlur: 12
        },
        name: 'avatar-circle'
      })
      group.addShape('text', {
        attrs: {
          text: String(cfg.name || '').slice(0, 1),
          x: 0,
          y: -13,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: style.color,
          fontSize: 22,
          fontWeight: 800
        },
        name: 'avatar-initial'
      })
      group.addShape('rect', {
        attrs: {
          x: -42,
          y: 24,
          width: 84,
          height: 22,
          radius: 11,
          fill: 'rgba(255, 255, 255, 0.86)'
        },
        name: 'avatar-name-bg'
      })
      group.addShape('text', {
        attrs: {
          text: cfg.name || '',
          x: 0,
          y: 35,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: '#344054',
          fontSize: 12,
          fontWeight: 700
        },
        name: 'avatar-name'
      })

      return circle
    },
    drawCardNode(cfg, group) {
      const style = this.nodeStyle(cfg)
      const width = NODE_WIDTH
      const height = NODE_HEIGHT
      const rect = group.addShape('rect', {
        attrs: {
          x: -width / 2,
          y: -height / 2,
          width,
          height,
          radius: 8,
          fill: style.fill,
          stroke: style.stroke,
          lineWidth: 1,
          shadowColor: 'rgba(16, 24, 40, 0.1)',
          shadowBlur: 10
        },
        name: 'card-box'
      })

      group.addShape('text', {
        attrs: {
          text: cfg.name || '',
          x: 0,
          y: -1,
          textAlign: 'center',
          textBaseline: 'middle',
          fill: style.color || '#202837',
          fontSize: 13,
          fontWeight: 700
        },
        name: 'card-title'
      })

      return rect
    },
    bindResize(container) {
      if (!window.ResizeObserver) {
        return
      }

      this.resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0]
        if (!entry || !this.graph) {
          return
        }

        const width = entry.contentRect.width
        const height = entry.contentRect.height
        if (width > 0 && height > 0) {
          this.graph.changeSize(width, height)
          this.graph.fitView(32)
        }
      })
      this.resizeObserver.observe(container)
    }
  }
}
</script>

<style scoped>
.antv-relationship-graph {
  width: 100%;
  height: 100%;
  min-height: 620px;
  background:
    linear-gradient(#eef2f7 1px, transparent 1px),
    linear-gradient(90deg, #eef2f7 1px, transparent 1px),
    #fbfcfe;
  background-size: 26px 26px;
}

.antv-relationship-graph__canvas {
  width: 100%;
  height: 100%;
  min-height: 620px;
}
</style>
