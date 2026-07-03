<template>
  <main class="component-home">
    <header class="component-home__header">
      <h1>组件示例</h1>
      <p>查看当前项目中的组件演示页面。</p>
    </header>

    <section class="component-home__grid" aria-label="组件示例列表">
      <router-link
        v-for="item in examples"
        :key="item.path"
        class="component-home__item"
        :to="item.path"
      >
        <span class="component-home__icon" :class="'component-home__icon--' + item.icon" aria-hidden="true"></span>
        <strong>{{ item.name }}</strong>
        <span>{{ item.description }}</span>
      </router-link>
    </section>
  </main>
</template>

<script>
export default {
  name: 'ComponentHome',
  data() {
    return {
      examples: [
        {
          name: 'RelationshipTree',
          description: 'SVG 关系线、节点分组、筛选、缩放、拖拽和节点浮窗示例。',
          path: '/components/relationship-tree',
          icon: 'tree'
        },
        {
          name: 'AntVRelationshipGraph',
          description: '使用 AntV G6 渲染的关系图对照示例。',
          path: '/components/antv-relationship-graph',
          icon: 'graph'
        },
        {
          name: 'OrganizationRelationGraph',
          description: '使用 relation-graph 渲染机构层级树，第二层间距 400，其余层级间距 200。',
          path: '/components/organization-relation-graph',
          icon: 'graph'
        },
        {
          name: 'EChartBarDemo',
          description: '左侧配置、右侧实时预览的 ECharts 柱状图组件示例。',
          path: '/components/echart-bar-demo',
          icon: 'graph'
        }
      ]
    }
  }
}
</script>

<style scoped>
.component-home {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px;
  background: #f1f5f9;
  color: #0f172a;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.component-home__header {
  margin-bottom: 20px;
}

.component-home__header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  line-height: 1.25;
}

.component-home__header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.component-home__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  max-width: 960px;
}

.component-home__item {
  display: grid;
  grid-template-columns: 42px 1fr;
  grid-template-rows: auto auto;
  gap: 6px 12px;
  align-items: center;
  min-height: 92px;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: #ffffff;
  color: inherit;
  text-decoration: none;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.component-home__item:hover {
  border-color: #0f766e;
  box-shadow: 0 14px 34px rgba(15, 118, 110, 0.12);
}

.component-home__item strong {
  font-size: 16px;
}

.component-home__item span:last-child {
  grid-column: 2;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.component-home__icon {
  position: relative;
  grid-row: 1 / span 2;
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #0f766e;
}

.component-home__icon::before,
.component-home__icon::after {
  content: '';
  position: absolute;
  box-sizing: border-box;
}

.component-home__icon--tree::before {
  left: 9px;
  top: 8px;
  width: 24px;
  height: 22px;
  border-left: 2px solid currentColor;
  border-bottom: 2px solid currentColor;
}

.component-home__icon--tree::after {
  left: 17px;
  top: 7px;
  width: 8px;
  height: 8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-shadow: -10px 20px 0 -2px #ecfdf5, -10px 20px 0 0 currentColor, 10px 20px 0 -2px #ecfdf5, 10px 20px 0 0 currentColor;
}

.component-home__icon--graph::before {
  left: 9px;
  top: 20px;
  width: 24px;
  border-top: 2px solid currentColor;
  transform: rotate(-24deg);
}

.component-home__icon--graph::after {
  left: 8px;
  top: 8px;
  width: 9px;
  height: 9px;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-shadow: 17px 16px 0 -2px #ecfdf5, 17px 16px 0 0 currentColor;
}
</style>
