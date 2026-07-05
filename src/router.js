import Vue from 'vue'
import Router from 'vue-router'
import ComponentHome from './views/ComponentHome.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      name: 'component-home',
      component: ComponentHome
    },
    {
      path: '/components/relationship-tree',
      name: 'relationship-tree-demo',
      component: () => import('./views/RelationshipTreeDemo.vue')
    },
    {
      path: '/components/antv-relationship-graph',
      name: 'antv-relationship-graph-demo',
      component: () => import('./AntvTestPage.vue')
    },
    {
      path: '/components/organization-relation-graph',
      name: 'organization-relation-graph-demo',
      component: () => import('./views/OrganizationRelationGraph.vue')
    },
    {
      path: '/components/echart-bar-demo',
      name: 'echart-bar-demo',
      component: () => import('./views/EChartBarDemo.vue')
    },
    {
      path: '/components/element-form-demo',
      name: 'element-form-demo',
      component: () => import('./views/ElementFormDemo.vue')
    },
    {
      path: '/components/hover-popover-demo',
      name: 'hover-popover-demo',
      component: () => import('./views/HoverPopoverDemo.vue')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
