import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import HoverPopover from './directives/hoverPopover'
import ElementPosition from './directives/elementPosition'
import HoverPopup from './directives/hoverPopup'

Vue.use(ElementUI)
Vue.directive('hover-popover', HoverPopover)
Vue.directive('element-position', ElementPosition)
Vue.directive('hover-popup', HoverPopup)

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
