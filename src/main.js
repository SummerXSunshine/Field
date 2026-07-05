import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import HoverPopover from './directives/hoverPopover'

Vue.use(ElementUI)
Vue.directive('hover-popover', HoverPopover)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
