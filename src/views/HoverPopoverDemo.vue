<template>
  <main class="hover-popover-page">
    <header class="hover-popover-page__header">
      <h1>HoverPopoverDirective</h1>
      <p>鼠标悬浮节点显示浮窗，移动到浮窗内可选中文本复制。</p>
    </header>

    <section class="node-board" aria-label="节点浮窗示例">
      <article
        v-for="node in nodes"
        :key="node.id"
        v-hover-popover="nodePopover(node)"
        class="demo-node"
        tabindex="0"
      >
        <strong>{{ node.name }}</strong>
        <span>{{ node.role }}</span>
      </article>
    </section>

    <section class="config-panel" aria-label="浮窗配置示例">
      <h2>指令绑定值</h2>
      <pre>{{ sampleBindingText }}</pre>
    </section>
  </main>
</template>

<script>
export default {
  name: 'HoverPopoverDemo',
  data() {
    return {
      nodes: [
        {
          id: 'node-1',
          name: '张三',
          role: '项目负责人',
          code: 'EMP-1001',
          phone: '138-0000-0001',
          email: 'zhangsan@example.com'
        },
        {
          id: 'node-2',
          name: '李四',
          role: '前端工程师',
          code: 'EMP-1002',
          phone: '138-0000-0002',
          email: 'lisi@example.com'
        },
        {
          id: 'node-3',
          name: '王五',
          role: '产品经理',
          code: 'EMP-1003',
          phone: '138-0000-0003',
          email: 'wangwu@example.com'
        }
      ]
    }
  },
  computed: {
    sampleBindingText() {
      return JSON.stringify(this.nodePopover(this.nodes[0]), null, 2)
    }
  },
  methods: {
    nodePopover(node) {
      return {
        title: node.name + ' - ' + node.role,
        placement: 'right',
        maxWidth: 360,
        rightEdgeThreshold: 40,
        rows: [
          { label: '员工编号', value: node.code },
          { label: '手机', value: node.phone },
          { label: '邮箱', value: node.email },
          { label: '复制提示', value: '这段浮窗内容可以被鼠标选中复制。' }
        ]
      }
    }
  }
}
</script>

<style scoped>
.hover-popover-page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px;
  background: #f1f5f9;
  color: #0f172a;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.hover-popover-page__header {
  margin-bottom: 20px;
}

.hover-popover-page__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  line-height: 1.25;
}

.hover-popover-page__header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.node-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  max-width: 900px;
  margin-bottom: 18px;
}

.demo-node {
  display: grid;
  gap: 6px;
  min-height: 92px;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
  cursor: default;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.demo-node:hover,
.demo-node:focus {
  border-color: #0f766e;
  outline: none;
  box-shadow: 0 14px 34px rgba(15, 118, 110, 0.12);
}

.demo-node strong {
  font-size: 16px;
}

.demo-node span {
  color: #64748b;
  font-size: 13px;
}

.config-panel {
  max-width: 900px;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
}

.config-panel h2 {
  margin: 0 0 10px;
  font-size: 16px;
}

.config-panel pre {
  margin: 0;
  overflow: auto;
  padding: 14px;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.55;
}
</style>
