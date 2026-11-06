<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 高度百分比链路：让最外层容器的 height: 100% 能正确撑满视口 */
html,
body,
#app {
  height: 100%;
  margin: 0;
}
</style>
