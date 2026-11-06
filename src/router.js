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
      component: ComponentHome,
      children: [
        {
          path: 'components/pdf-preview',
          name: 'pdf-preview-demo',
          component: () => import('./views/PdfPreviewDemo.vue')
        },
        {
          path: 'components/four-level-tag-filter',
          name: 'four-level-tag-filter-demo',
          component: () => import('./views/FourLevelTagFilterDemo.vue')
        },
        {
          path: 'components/tag-select-tree',
          name: 'tag-select-tree-demo',
          component: () => import('./views/TagSelectTreeDemo.vue')
        },
        {
          path: 'components/relationship-tree',
          name: 'relationship-tree-demo',
          component: () => import('./views/RelationshipTreeDemo.vue')
        },
        {
          path: 'components/antv-relationship-graph',
          name: 'antv-relationship-graph-demo',
          component: () => import('./AntvTestPage.vue')
        },
        {
          path: 'components/organization-relation-graph',
          name: 'organization-relation-graph-demo',
          component: () => import('./views/OrganizationRelationGraph.vue')
        },
        {
          path: 'components/echart-bar-demo',
          name: 'echart-bar-demo',
          component: () => import('./views/EChartBarDemo.vue')
        },
        {
          path: 'components/element-form-demo',
          name: 'element-form-demo',
          component: () => import('./views/ElementFormDemo.vue')
        },
        {
          path: 'components/view-form-demo',
          name: 'view-form-demo',
          component: () => import('./views/ViewFormDemo.vue')
        },
        {
          path: 'components/hover-popover-demo',
          name: 'hover-popover-demo',
          component: () => import('./views/HoverPopoverDemo.vue')
        },
        {
          path: 'components/excel-case-table-form',
          name: 'excel-case-table-form-demo',
          component: () => import('./views/ExcelCaseTableFormDemo.vue')
        },
        {
          path: 'components/intelligence-browser',
          name: 'intelligence-browser-demo',
          component: () => import('./views/IntelligenceBrowserDemo.vue')
        },
        {
          path: 'components/single-replace-upload',
          name: 'single-replace-upload-demo',
          component: () => import('./views/SingleReplaceUploadDemo.vue')
        },
        {
          path: 'components/avatar-info-display',
          name: 'avatar-info-display-demo',
          component: () => import('./views/AvatarInfoDisplayDemo.vue')
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
