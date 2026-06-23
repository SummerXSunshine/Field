<template>
  <div
    ref="viewport"
    class="relationship-tree"
    :class="{ 'relationship-tree--dragging': dragState.active }"
    role="img"
    aria-label="人物关系树"
    @mousedown="handleDragStart"
  >
    <div class="relationship-tree__stage" :style="stageStyle">
      <svg class="relationship-tree__canvas" :viewBox="viewBox" :style="canvasStyle">
        <defs>
          <marker
            id="relationship-arrow-vue2"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>

        <g class="relationship-tree__edges">
          <g v-for="edge in treeLayout.edges" :key="edge.id">
            <path
              :d="edgePath(edge)"
              :stroke="edge.style && edge.style.stroke ? edge.style.stroke : '#57708f'"
              :stroke-width="edge.style && edge.style.strokeWidth ? edge.style.strokeWidth : 2"
              :stroke-dasharray="edge.style && edge.style.strokeDasharray"
              fill="none"
              marker-end="url(#relationship-arrow-vue2)"
            />
            <g v-if="edge.style && edge.style.label" class="relationship-tree__edge-label">
              <rect
                :x="edgeLabelPoint(edge).x - 36"
                :y="edgeLabelPoint(edge).y - 20"
                width="72"
                height="24"
                rx="6"
                :fill="edge.style.labelBackground || '#ffffff'"
              />
              <text
                :x="edgeLabelPoint(edge).x"
                :y="edgeLabelPoint(edge).y - 4"
                text-anchor="middle"
                :fill="edge.style.labelColor || '#344054'"
              >
                {{ edge.style.label }}
              </text>
            </g>
          </g>
        </g>

        <foreignObject
          v-for="node in treeLayout.nodes"
          :key="node.id"
          :x="node.x"
          :y="node.y"
          :width="node.width"
          :height="node.height"
        >
          <div
            class="relationship-tree__node"
            :class="{
              'relationship-tree__node--selected': node.id === selectedNodeId,
              'relationship-tree__node--avatar': node.variant === 'avatar',
              'relationship-tree__node--tag-group': node.isTagGroup,
            }"
            :style="node.style"
            @click="$emit('node-click', node)"
          >
            <slot name="node" :node="node">
              <template v-if="node.variant === 'avatar'">
                <div class="relationship-tree__avatar-node">
                  <img v-if="node.avatar" :src="node.avatar" :alt="node.name" />
                  <span v-else>{{ nodeInitial(node) }}</span>
                </div>
                <strong class="relationship-tree__avatar-name">{{ node.name }}</strong>
              </template>
              <template v-else>
                <img v-if="node.avatar" class="relationship-tree__avatar" :src="node.avatar" alt="" />
                <div class="relationship-tree__content">
                  <strong>{{ node.name }}</strong>
                </div>
              </template>
              <button
                v-if="hasChildren(node)"
                type="button"
                class="relationship-tree__collapse"
                :aria-label="isCollapsed(node) ? '展开 ' + node.name : '折叠 ' + node.name"
                @click.stop="$emit('toggle-collapse', node)"
              >
                {{ isCollapsed(node) ? '+' : '-' }}
              </button>
            </slot>
          </div>
        </foreignObject>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RelationshipTree',
  data: function () {
    return {
      dragState: {
        active: false,
        moved: false,
        startX: 0,
        startY: 0,
        startScrollLeft: 0,
        startScrollTop: 0,
      },
    };
  },
  mounted: function () {
    window.addEventListener('mousemove', this.handleDragMove);
    window.addEventListener('mouseup', this.handleDragEnd);
  },
  beforeDestroy: function () {
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
  },
  props: {
    root: {
      type: Object,
      required: true,
    },
    selectedNodeId: {
      type: String,
      default: '',
    },
    collapsedNodeIds: {
      type: Array,
      default: function () {
        return [];
      },
    },
    zoom: {
      type: Number,
      default: 1,
    },
    nodeWidth: {
      type: Number,
      default: 188,
    },
    nodeHeight: {
      type: Number,
      default: 82,
    },
    levelGap: {
      type: Number,
      default: 136,
    },
    siblingGap: {
      type: Number,
      default: 34,
    },
  },
  computed: {
    collapsedNodeIdSet: function () {
      return new Set(this.collapsedNodeIds);
    },
    groupedRoot: function () {
      var root = this.root || {};
      var children = root.children || [];
      var groups = [];
      var groupMap = Object.create(null);

      children.forEach(function (child, index) {
        var tag = child.tag && String(child.tag).trim() ? String(child.tag).trim() : '未分组';
        if (!groupMap[tag]) {
          groupMap[tag] = {
            id: '__tag_group__' + tag + '__' + index,
            name: tag,
            isTagGroup: true,
            children: [],
          };
          groups.push(groupMap[tag]);
        }
        groupMap[tag].children.push(child);
      });

      return Object.assign({}, root, {
        children: groups,
      });
    },
    treeLayout: function () {
      var nodes = [];
      var edges = [];
      var nextLeafY = { value: 0 };
      var self = this;

      function measure(node, depth) {
        var children = self.collapsedNodeIdSet.has(node.id) ? [] : (node.children || []);
        var laidOutChildren = children.map(function (child) {
          return measure(child, depth + 1);
        });
        var y =
          laidOutChildren.length > 0
            ? (laidOutChildren[0].y + laidOutChildren[laidOutChildren.length - 1].y) / 2
            : nextLeafY.value++ * (self.nodeHeight + self.siblingGap);
        var positioned = Object.assign({}, node, {
          depth: depth,
          x: depth * (self.nodeWidth + self.levelGap),
          y: y,
          width: self.nodeWidth,
          height: self.nodeHeight,
        });

        nodes.push(positioned);
        laidOutChildren.forEach(function (child) {
          edges.push({
            id: positioned.id + '-' + child.id,
            from: positioned,
            to: child,
            style: child.edge,
          });
        });

        return positioned;
      }

      measure(this.groupedRoot, 0);

      var padding = 32;
      var maxX = Math.max.apply(
        Math,
        nodes.map(function (node) {
          return node.x + node.width;
        }).concat([0]),
      );
      var maxY = Math.max.apply(
        Math,
        nodes.map(function (node) {
          return node.y + node.height;
        }).concat([0]),
      );

      return {
        nodes: nodes.map(function (node) {
          return Object.assign({}, node, {
            x: node.x + padding,
            y: node.y + padding,
          });
        }),
        edges: edges,
        width: maxX + padding * 2,
        height: maxY + padding * 2,
      };
    },
    viewBox: function () {
      return '0 0 ' + this.treeLayout.width + ' ' + this.treeLayout.height;
    },
    stageStyle: function () {
      return {
        width: this.treeLayout.width * this.zoom + 'px',
        height: this.treeLayout.height * this.zoom + 'px',
      };
    },
    canvasStyle: function () {
      return {
        width: this.treeLayout.width + 'px',
        height: this.treeLayout.height + 'px',
        transform: 'scale(' + this.zoom + ')',
      };
    },
  },
  methods: {
    handleDragStart: function (event) {
      if (event.button !== 0) {
        return;
      }

      var interactiveTarget = event.target.closest(
        '.relationship-tree__node, .relationship-tree__collapse, button, a, input, textarea, select',
      );

      if (interactiveTarget) {
        return;
      }

      var viewport = this.$refs.viewport;
      if (!viewport) {
        return;
      }

      this.dragState.active = true;
      this.dragState.moved = false;
      this.dragState.startX = event.clientX;
      this.dragState.startY = event.clientY;
      this.dragState.startScrollLeft = viewport.scrollLeft;
      this.dragState.startScrollTop = viewport.scrollTop;

      event.preventDefault();
    },
    handleDragMove: function (event) {
      if (!this.dragState.active) {
        return;
      }

      var viewport = this.$refs.viewport;
      if (!viewport) {
        return;
      }

      var deltaX = event.clientX - this.dragState.startX;
      var deltaY = event.clientY - this.dragState.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.dragState.moved = true;
      }

      viewport.scrollLeft = this.dragState.startScrollLeft - deltaX;
      viewport.scrollTop = this.dragState.startScrollTop - deltaY;

      event.preventDefault();
    },
    handleDragEnd: function () {
      if (!this.dragState.active) {
        return;
      }

      this.dragState.active = false;
    },
    edgePath: function (edge) {
      var fromX = edge.from.x + edge.from.width + 32;
      var fromY = edge.from.y + edge.from.height / 2 + 32;
      var toX = edge.to.x + 32;
      var toY = edge.to.y + edge.to.height / 2 + 32;
      var elbowX = fromX + Math.min(48, Math.max(24, (toX - fromX) / 2));

      return 'M ' + fromX + ' ' + fromY + ' H ' + elbowX + ' V ' + toY + ' H ' + toX;
    },
    edgeLabelPoint: function (edge) {
      var fromX = edge.from.x + edge.from.width + 32;
      var toX = edge.to.x + 32;
      var toY = edge.to.y + edge.to.height / 2 + 32;
      var elbowX = fromX + Math.min(48, Math.max(24, (toX - fromX) / 2));

      return {
        x: (elbowX + toX) / 2,
        y: toY - 16,
      };
    },
    hasChildren: function (node) {
      return Boolean(node.children && node.children.length);
    },
    isCollapsed: function (node) {
      return this.collapsedNodeIdSet.has(node.id);
    },
    nodeInitial: function (node) {
      return (node.name || '').trim().slice(0, 1).toUpperCase();
    },
  },
};
</script>

<style scoped>
.relationship-tree {
  width: 100%;
  min-height: 480px;
  overflow: auto;
  background:
    linear-gradient(#eef2f7 1px, transparent 1px),
    linear-gradient(90deg, #eef2f7 1px, transparent 1px),
    #fbfcfe;
  background-size: 26px 26px;
  cursor: grab;
  user-select: none;
}

.relationship-tree--dragging {
  cursor: grabbing;
}

.relationship-tree--dragging * {
  cursor: grabbing !important;
}

.relationship-tree__canvas {
  display: block;
  transform-origin: top left;
}

.relationship-tree__stage {
  min-width: 100%;
  min-height: 100%;
}

.relationship-tree__edges path {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.relationship-tree__edge-label text {
  font-size: 12px;
  font-weight: 700;
}

.relationship-tree__edge-label rect {
  stroke: rgba(16, 24, 40, 0.08);
}

.relationship-tree__node {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #d7deea;
  border-radius: 8px;
  background: #ffffff;
  color: #202837;
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.1);
  cursor: pointer;
  box-sizing: border-box;
}

.relationship-tree__collapse {
  position: absolute;
  right: -10px;
  top: 50%;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(15, 118, 110, 0.35);
  border-radius: 999px;
  padding: 0;
  color: #0f766e;
  background: #ffffff;
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.15);
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  transform: translateY(-50%);
}

.relationship-tree__collapse:hover {
  border-color: #0f766e;
  background: #f0fdfa;
}

.relationship-tree__node--tag-group {
  grid-template-columns: 1fr;
  justify-items: center;
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
}

.relationship-tree__node--tag-group .relationship-tree__content {
  width: 100%;
  text-align: center;
}

.relationship-tree__node--tag-group .relationship-tree__content strong {
  font-size: 14px;
}

.relationship-tree__node--selected {
  outline: 3px solid rgba(15, 118, 110, 0.28);
  outline-offset: -3px;
}

.relationship-tree__node--avatar {
  grid-template-columns: 1fr;
  justify-items: center;
  align-content: center;
  gap: 5px;
  border: none;
  background: transparent !important;
  box-shadow: none;
  color: #344054;
  padding: 0;
}

.relationship-tree__node--avatar.relationship-tree__node--tag-group {
  grid-template-columns: 1fr;
  justify-items: center;
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.12);
}

.relationship-tree__node--tag-group .relationship-tree__content {
  width: 100%;
  text-align: center;
}

.relationship-tree__node--tag-group .relationship-tree__content strong {
  font-size: 14px;
}

.relationship-tree__node--selected {
  outline: none;
}

.relationship-tree__node--avatar.relationship-tree__node--selected .relationship-tree__avatar-node {
  outline: 3px solid rgba(15, 118, 110, 0.3);
  outline-offset: 3px;
}

.relationship-tree__avatar-node {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid #ffffff;
  border-radius: 999px;
  background: #e0f2fe;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.16);
  color: #0369a1;
  font-size: 22px;
  font-weight: 800;
}

.relationship-tree__avatar-node img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.relationship-tree__avatar-name {
  max-width: 100%;
  overflow: hidden;
  border-radius: 999px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.86);
  color: #344054;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relationship-tree__avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  object-fit: cover;
}

.relationship-tree__content {
  min-width: 0;
  display: grid;
  gap: 3px;
  text-align: left;
}

.relationship-tree__content strong {
  overflow: hidden;
  font-size: 16px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}


</style>
