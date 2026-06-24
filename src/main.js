import Vue from 'vue'
import App from './App.vue'

const params = new URLSearchParams(window.location.search)
const RootComponent = params.get('page') === 'antv' ? () => import('./AntvTestPage.vue') : App

new Vue({
  el: '#app',
  render: h => h(RootComponent)
})
