<template>
  <div
    ref="viewport"
    class="relationship-tree"
    :class="{ 'relationship-tree--dragging': dragState.active }"
    role="img"
    aria-label="人物关系树"
    draggable="false"
    @mousedown="handleDragStart"
    @dragstart.prevent
    @wheel.prevent="handleWheel"
  >
    <div class="relationship-tree__stage" :style="stageStyle">
      <svg class="relationship-tree__canvas" :viewBox="viewBox" :style="canvasStyle">
        <g class="relationship-tree__edges">
          <g v-for="edge in treeLayout.edges" :key="edge.id">
            <path
              :d="edgePath(edge)"
              :stroke="edgeColor(edge)"
              :stroke-width="edgeStrokeWidth(edge)"
              :stroke-dasharray="edge.style && edge.style.strokeDasharray"
              fill="none"
            />
            <path
              v-if="edgeHasArrow(edge)"
              :d="edgeArrowPath(edge)"
              :fill="edgeColor(edge)"
            />
            <g v-if="edge.style && edge.style.label" class="relationship-tree__edge-label">
              <rect
                v-if="edgeLabelBackground"
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
            :class="nodeClass(node)"
            :style="relationNodeStyle(node)"
            @click="handleNodeClick($event, node)"
            @mouseenter="showNodePopover(node)"
            @mouseleave="scheduleHideNodePopover"
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
                <div class="relationship-tree__content" :title="node.name">
                  <strong>{{ node.name }}</strong>
                </div>
              </template>
              <button
                v-if="enableCollapse && node.depth > 0 && hasChildren(node)"
                type="button"
                class="relationship-tree__collapse"
                :aria-label="(isCollapsed(node) ? '展开 ' : '收起 ') + node.name"
                @click.stop="$emit('toggle-collapse', node)"
              >
                {{ isCollapsed(node) ? '+' : '-' }}
              </button>
            </slot>
          </div>
        </foreignObject>
      </svg>
    </div>

    <div
      v-if="activePopoverNode"
      class="relationship-tree__popover"
      :class="'relationship-tree__popover--' + nodePopoverSide"
      :style="nodePopoverStyle"
      @mousedown.stop
      @mouseenter="clearPopoverHideTimer"
      @mouseleave="scheduleHideNodePopover"
      @wheel.stop
    >
      <slot name="popover" :node="activePopoverNode">
        <strong>{{ activePopoverNode.name }}</strong>
        <span v-if="activePopoverNode.subtitle">{{ activePopoverNode.subtitle }}</span>
        <dl>
          <template v-if="activePopoverNode.tag">
            <dt>关系分类</dt>
            <dd>{{ activePopoverNode.tag }}</dd>
          </template>
          <template v-if="activePopoverNode.edge && activePopoverNode.edge.label">
            <dt>关系描述</dt>
            <dd>{{ activePopoverNode.edge.label }}</dd>
          </template>
          <template v-if="activePopoverNode.eventDate">
            <dt>时间</dt>
            <dd>{{ activePopoverNode.eventDate }}</dd>
          </template>
          <template v-if="activePopoverNode.highlightSignal">
            <dt>高亮信号</dt>
            <dd>{{ activePopoverNode.highlightSignal }}</dd>
          </template>
        </dl>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RelationshipTree',
  data() {
    return {
      dragState: {
        active: false,
        moved: false,
        panX: 0,
        panY: 0,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0,
      },
      popoverNodeId: '',
      popoverHideTimer: null,
    };
  },
  mounted() {
    window.addEventListener('mousemove', this.handleDragMove);
    window.addEventListener('mouseup', this.handleDragEnd);
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.handleDragMove);
    window.removeEventListener('mouseup', this.handleDragEnd);
    this.clearPopoverHideTimer();
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
      default() {
        return [];
      },
    },
    enableCollapse: {
      type: Boolean,
      default: true,
    },
    zoom: {
      type: Number,
      default: 1,
      validator(value) {
        return value > 0;
      },
    },
    minZoom: {
      type: Number,
      default: 0.4,
      validator(value) {
        return value > 0;
      },
    },
    maxZoom: {
      type: Number,
      default: 2,
      validator(value) {
        return value > 0;
      },
    },
    edgeLabelBackground: {
      type: Boolean,
      default: true,
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
    avatarNodeWidth: {
      type: Number,
      default: 96,
    },
    avatarNodeHeight: {
      type: Number,
      default: 84,
    },
    relationGroupLineWidth: {
      type: Number,
      default: 220,
    },
    relationGroupLineHeight: {
      type: Number,
      default: 64,
    },
    relationGroupRootGap: {
      type: Number,
      default: 96,
    },
    relationGroupChildGap: {
      type: Number,
      default: 96,
    },
  },
  computed: {
    collapsedNodeIdSet() {
      if (!this.enableCollapse) {
        return new Set();
      }

      return new Set(this.collapsedNodeIds);
    },
    groupedRoot() {
      const root = this.root || {};
      const children = root.children || [];
      const groups = [];
      const groupMap = Object.create(null);

      children.forEach((child, index) => {
        const tag = child.tag && String(child.tag).trim() ? String(child.tag).trim() : '';
        if (!groupMap[tag]) {
          const edge = child.edge || {};
          groupMap[tag] = {
            id: '__tag_group__' + tag + '__' + index,
            name: tag,
            isTagGroup: true,
            style: {
              '--relationship-group-color': edge.stroke || '#57708f',
              '--relationship-group-label-bg': edge.labelBackground || '#ffffff',
              '--relationship-group-label-color': edge.labelColor || edge.stroke || '#344054',
            },
            edge: {
              stroke: edge.stroke || '#57708f',
              strokeWidth: edge.strokeWidth || 1,
              strokeDasharray: edge.strokeDasharray,
            },
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
    treeLayout() {
      const nodes = [];
      const edges = [];
      const nextLeafY = { value: 0 };
      const rootWidth =
        this.groupedRoot.width ||
        (this.groupedRoot.variant === 'avatar' ? this.avatarNodeWidth : this.nodeWidth);
      const groupX = rootWidth + this.relationGroupRootGap;
      const levelWidth = this.nodeWidth + this.levelGap;
      const nodeX = depth => {
        if (depth === 0) {
          return 0;
        }

        return groupX + (depth - 1) * levelWidth + (depth > 1 ? this.relationGroupChildGap : 0);
      };

      const anchorOffsetFor = (node, height) => {
        const avatarCircleSize = 58;
        return node.variant === 'avatar' ? avatarCircleSize / 2 : height / 2;
      };

      const measure = (node, depth) => {
        const children = this.collapsedNodeIdSet.has(node.id) ? [] : (node.children || []);
        const laidOutChildren = children.map(child => measure(child, depth + 1));
        const width =
          node.width ||
          (node.isTagGroup
            ? this.relationGroupLineWidth
            : node.variant === 'avatar'
              ? this.avatarNodeWidth
              : this.nodeWidth);
        const height =
          node.height ||
          (node.isTagGroup
            ? this.relationGroupLineHeight
            : node.variant === 'avatar'
              ? this.avatarNodeHeight
              : this.nodeHeight);
        const anchorOffset = anchorOffsetFor(node, height);
        const y =
          laidOutChildren.length > 0
            ? (laidOutChildren[0].y +
                laidOutChildren[0].anchorOffset +
                laidOutChildren[laidOutChildren.length - 1].y +
                laidOutChildren[laidOutChildren.length - 1].anchorOffset) /
                2 -
              anchorOffset
            : nextLeafY.value;
        if (laidOutChildren.length === 0) {
          nextLeafY.value += height + this.siblingGap;
        }
        const positioned = Object.assign({}, node, {
          depth,
          x: nodeX(depth),
          y,
          width,
          height,
          anchorOffset,
        });

        nodes.push(positioned);
        laidOutChildren.forEach(child => {
          edges.push({
            id: positioned.id + '-' + child.id,
            from: positioned,
            to: child,
            style: child.edge,
          });
        });

        return positioned;
      };

      measure(this.groupedRoot, 0);

      const padding = 32;
      const maxX = Math.max.apply(
        Math,
        nodes.map(node => node.x + node.width).concat([0]),
      );
      const maxY = Math.max.apply(
        Math,
        nodes.map(node => node.y + node.height).concat([0]),
      );

      return {
        nodes: nodes.map(node => Object.assign({}, node, {
          x: node.x + padding,
          y: node.y + padding,
        })),
        edges,
        width: maxX + padding * 2,
        height: maxY + padding * 2,
      };
    },
    viewBox() {
      return '0 0 ' + this.treeLayout.width + ' ' + this.treeLayout.height;
    },
    stageStyle() {
      return {
        width: this.treeLayout.width * this.zoom + 'px',
        height: this.treeLayout.height * this.zoom + 'px',
        transform: 'translate(' + this.dragState.panX + 'px, ' + this.dragState.panY + 'px)',
      };
    },
    canvasStyle() {
      return {
        width: this.treeLayout.width + 'px',
        height: this.treeLayout.height + 'px',
        transform: 'scale(' + this.zoom + ')',
      };
    },
    activePopoverNode() {
      if (!this.popoverNodeId) {
        return null;
      }

      return this.treeLayout.nodes.find(node => node.id === this.popoverNodeId) || null;
    },
    nodePopoverSide() {
      const node = this.activePopoverNode;
      const viewport = this.$refs.viewport;
      if (!node || !viewport) {
        return 'right';
      }

      const popoverWidth = 743;
      const gap = 12;
      const rightLeft = this.dragState.panX + (node.x + node.width) * this.zoom + gap;

      return rightLeft + popoverWidth <= viewport.clientWidth ? 'right' : 'left';
    },
    nodePopoverStyle() {
      const node = this.activePopoverNode;
      if (!node) {
        return {};
      }

      const popoverWidth = 743;
      const gap = 12;
      const rightLeft = this.dragState.panX + (node.x + node.width) * this.zoom + gap;
      const leftLeft = this.dragState.panX + node.x * this.zoom - popoverWidth - gap;
      const left = this.nodePopoverSide === 'right' ? rightLeft : leftLeft;

      return {
        left: Math.max(8, left) + 'px',
        top: this.dragState.panY + (node.y + node.height / 2) * this.zoom + 'px',
      };
    },
  },
  methods: {
    nodeClass(node) {
      return {
        'relationship-tree__node--selected': node.id === this.selectedNodeId,
        [`relationship-tree__node--selected-${node.type}`]: node.id === this.selectedNodeId && node.type,
        [`relationship-tree__node--${node.type}`]: node.type,
        'relationship-tree__node--avatar': node.variant === 'avatar',
        'relationship-tree__node--tag-group': node.isTagGroup,
      };
    },
    highlightSignalStyle(node) {
      const signal = node.highlightSignal;
      if (!signal) {
        return null;
      }

      if (typeof signal === 'object') {
        return {
          background: signal.background,
          color: signal.color,
          borderColor: signal.borderColor || signal.color,
          '--relationship-node-bg': signal.background,
          '--relationship-node-text': signal.color,
          '--relationship-node-color': signal.borderColor || signal.color,
        };
      }

      const presets = {
        high: {
          background: '#fef2f2',
          color: '#991b1b',
          borderColor: '#ef4444',
        },
        medium: {
          background: '#fff1f2',
          color: '#be123c',
          borderColor: '#fb7185',
        },
        low: {
          background: '#fff5f5',
          color: '#b91c1c',
          borderColor: '#fca5a5',
        },
      };
      const preset = presets[signal];

      if (!preset) {
        return null;
      }

      return {
        background: preset.background,
        color: preset.color,
        borderColor: preset.borderColor,
        '--relationship-node-bg': preset.background,
        '--relationship-node-text': preset.color,
        '--relationship-node-color': preset.borderColor,
      };
    },
    relationNodeStyle(node) {
      if (!node.edge || node.isTagGroup) {
        return node.style;
      }

      const relationColor = node.edge.stroke || '#57708f';
      const relationBackground = node.edge.labelBackground || '#ffffff';
      const relationTextColor = node.edge.labelColor || relationColor;

      return Object.assign(
        {
          '--relationship-node-color': relationColor,
          '--relationship-node-bg': relationBackground,
          '--relationship-node-text': relationTextColor,
          borderColor: relationColor,
          background: relationBackground,
          color: relationTextColor,
          boxShadow: '0 10px 24px rgba(16, 24, 40, 0.1)',
        },
        this.highlightSignalStyle(node) || {},
        node.style || {},
      );
    },
    clampZoom(zoom) {
      return Math.min(this.maxZoom, Math.max(this.minZoom, zoom));
    },
    fitToView() {
      const viewport = this.$refs.viewport;
      if (!viewport || !this.treeLayout.width || !this.treeLayout.height) {
        return;
      }

      const viewportWidth = viewport.clientWidth;
      const viewportHeight = viewport.clientHeight;
      if (!viewportWidth || !viewportHeight) {
        return;
      }

      const paddingRatio = 0.9;
      const fitZoom = Math.min(viewportWidth / this.treeLayout.width, viewportHeight / this.treeLayout.height);
      const nextZoom = this.clampZoom(Number((fitZoom * paddingRatio).toFixed(3)));

      this.dragState.panX = (viewportWidth - this.treeLayout.width * nextZoom) / 2;
      this.dragState.panY = (viewportHeight - this.treeLayout.height * nextZoom) / 2;
      this.$emit('zoom-change', nextZoom);
    },
    handleWheel(event) {
      const viewport = this.$refs.viewport;
      if (!viewport) {
        return;
      }

      const currentZoom = this.clampZoom(this.zoom);
      const zoomStep = event.deltaY > 0 ? 0.9 : 1.1;
      const nextZoom = this.clampZoom(Number((currentZoom * zoomStep).toFixed(3)));
      if (nextZoom === currentZoom) {
        return;
      }

      const rect = viewport.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const contentX = (pointerX - this.dragState.panX) / currentZoom;
      const contentY = (pointerY - this.dragState.panY) / currentZoom;

      this.dragState.panX = pointerX - contentX * nextZoom;
      this.dragState.panY = pointerY - contentY * nextZoom;
      this.$emit('zoom-change', nextZoom);
    },
    handleDragStart(event) {
      if (event.button !== 0) {
        return;
      }

      const interactiveTarget = event.target.closest(
        '.relationship-tree__popover, .relationship-tree__collapse, button, a, input, textarea, select',
      );

      if (interactiveTarget) {
        return;
      }

      this.dragState.active = true;
      this.dragState.moved = false;
      this.dragState.startX = event.clientX;
      this.dragState.startY = event.clientY;
      this.dragState.startPanX = this.dragState.panX;
      this.dragState.startPanY = this.dragState.panY;

      event.preventDefault();
    },
    handleDragMove(event) {
      if (!this.dragState.active) {
        return;
      }

      const deltaX = event.clientX - this.dragState.startX;
      const deltaY = event.clientY - this.dragState.startY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.dragState.moved = true;
      }

      this.dragState.panX = this.dragState.startPanX + deltaX;
      this.dragState.panY = this.dragState.startPanY + deltaY;

      event.preventDefault();
    },
    handleDragEnd() {
      if (!this.dragState.active) {
        return;
      }

      this.dragState.active = false;
    },
    showNodePopover(node) {
      if (!node || this.dragState.active) {
        return;
      }

      this.clearPopoverHideTimer();
      this.popoverNodeId = node.id;
    },
    scheduleHideNodePopover() {
      this.clearPopoverHideTimer();
      this.popoverHideTimer = window.setTimeout(() => {
        this.popoverNodeId = '';
        this.popoverHideTimer = null;
      }, 120);
    },
    clearPopoverHideTimer() {
      if (!this.popoverHideTimer) {
        return;
      }

      window.clearTimeout(this.popoverHideTimer);
      this.popoverHideTimer = null;
    },
    handleNodeClick(event, node) {
      if (this.dragState.moved) {
        event.preventDefault();
        event.stopPropagation();
        this.dragState.moved = false;
        return;
      }

      this.$emit('node-click', node);
    },
    nodeAnchorY(node) {
      const anchorOffset = typeof node.anchorOffset === 'number' ? node.anchorOffset : node.height / 2;

      return node.y + anchorOffset + 32;
    },
    edgeColor(edge) {
      return edge.style && edge.style.stroke ? edge.style.stroke : '#57708f';
    },
    edgeStrokeWidth(edge) {
      return edge.style && edge.style.strokeWidth ? edge.style.strokeWidth : 2;
    },

    edgeHasArrow(edge) {
      return !(edge.to && edge.to.isTagGroup);
    },

    edgeArrowPath(edge) {
      const tipX = edge.to.x + 32;
      const tipY = this.nodeAnchorY(edge.to);
      const arrowLength = 8;
      const arrowHalfHeight = 5;

      return (
        'M ' + tipX + ' ' + tipY +
        ' L ' + (tipX - arrowLength) + ' ' + (tipY - arrowHalfHeight) +
        ' L ' + (tipX - arrowLength) + ' ' + (tipY + arrowHalfHeight) +
        ' Z'
      );
    },

    edgePath(edge) {
      const fromX = edge.from.x + edge.from.width + 32;
      const fromY = this.nodeAnchorY(edge.from);
      const toX = edge.to.x + 32;
      const toY = this.nodeAnchorY(edge.to);
      const elbowX = fromX + Math.min(48, Math.max(24, (toX - fromX) / 2));

      return 'M ' + fromX + ' ' + fromY + ' H ' + elbowX + ' V ' + toY + ' H ' + toX;
    },
    edgeLabelPoint(edge) {
      const fromX = edge.from.x + edge.from.width + 32;
      const toX = edge.to.x + 32;
      const toY = this.nodeAnchorY(edge.to);
      const elbowX = fromX + Math.min(48, Math.max(24, (toX - fromX) / 2));

      return {
        x: (elbowX + toX) / 2,
        y: toY - 16,
      };
    },
    hasChildren(node) {
      return Boolean(node.children && node.children.length);
    },
    isCollapsed(node) {
      return this.collapsedNodeIdSet.has(node.id);
    },
    nodeInitial(node) {
      return (node.name || '').trim().slice(0, 1).toUpperCase();
    },
  },
};
</script>

<style scoped>
.relationship-tree {
  position: relative;
  width: 100%;
  min-height: 480px;
  overflow: hidden;
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
  transform-origin: top left;
  will-change: transform;
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

.relationship-tree__popover {
  position: absolute;
  z-index: 5;
  width: 743px;
  height: 293px;
  box-sizing: border-box;
  overflow: auto;
  padding: 10px 12px;
  border: 1px solid rgba(15, 118, 110, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
  color: #334155;
  cursor: default;
  font-size: 12px;
  line-height: 1.45;
  pointer-events: auto;
  transform: translateY(-50%);
  user-select: text;
}

.relationship-tree__popover * {
  user-select: text;
}

.relationship-tree__popover::before {
  content: '';
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.96);
  transform: translateY(-50%) rotate(45deg);
}

.relationship-tree__popover--right::before {
  left: -6px;
  border-left: 1px solid rgba(15, 118, 110, 0.18);
  border-bottom: 1px solid rgba(15, 118, 110, 0.18);
}

.relationship-tree__popover--left::before {
  right: -6px;
  border-top: 1px solid rgba(15, 118, 110, 0.18);
  border-right: 1px solid rgba(15, 118, 110, 0.18);
}

.relationship-tree__popover strong {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
  font-size: 13px;
}

.relationship-tree__popover span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
}

.relationship-tree__popover dl {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 4px 8px;
  margin: 0;
}

.relationship-tree__popover dt {
  color: #64748b;
}

.relationship-tree__popover dd {
  min-width: 0;
  margin: 0;
  color: #1e293b;
  overflow-wrap: anywhere;
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
  right: 0;
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

.relationship-tree__node--avatar .relationship-tree__collapse {
  right: 7px;
  top: 29px;
}

.relationship-tree__node--tag-group {
  grid-template-columns: 1fr;
  justify-items: center;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent !important;
  box-shadow: none;
  color: var(--relationship-group-label-color, #344054);
  cursor: grab;
}

.relationship-tree__node--tag-group::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1px solid var(--relationship-group-color, #57708f);
  transform: translateY(-50%);
}

.relationship-tree__node--tag-group .relationship-tree__content {
  position: relative;
  z-index: 1;
  width: auto;
  max-width: 100%;
  text-align: center;
  transform: translateY(-12px);
}

.relationship-tree__node--tag-group .relationship-tree__content strong {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  padding: 2px 10px;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--relationship-group-label-color, #344054);
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relationship-tree__node--selected {
  outline: 3px solid rgba(14, 116, 144, 0.35);
  outline-offset: 3px;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.95),
    0 0 0 6px rgba(14, 116, 144, 0.18),
    0 14px 30px rgba(16, 24, 40, 0.18);
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
  border: 0;
  background: transparent !important;
  color: var(--relationship-group-label-color, #344054);
  box-shadow: none;
}

.relationship-tree__node--tag-group .relationship-tree__content {
  width: auto;
  text-align: center;
}

.relationship-tree__node--tag-group .relationship-tree__content strong {
  font-size: 12px;
}

.relationship-tree__node--tag-group.relationship-tree__node--selected {
  outline: none;
  box-shadow: none;
}

.relationship-tree__node--tag-group.relationship-tree__node--selected .relationship-tree__content strong {
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.95),
    0 0 0 6px rgba(14, 116, 144, 0.22);
}

.relationship-tree__node--avatar.relationship-tree__node--selected {
  outline: none;
  box-shadow: none;
}

.relationship-tree__node--avatar.relationship-tree__node--selected .relationship-tree__avatar-node {
  outline: 3px solid rgba(14, 116, 144, 0.45);
  outline-offset: 4px;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.95),
    0 14px 28px rgba(16, 24, 40, 0.2);
}

.relationship-tree__avatar-node {
  width: 58px;
  height: 58px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 3px solid var(--relationship-node-color, #ffffff);
  border-radius: 999px;
  background: var(--relationship-node-bg, #e0f2fe);
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.16);
  color: var(--relationship-node-text, #0369a1);
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
