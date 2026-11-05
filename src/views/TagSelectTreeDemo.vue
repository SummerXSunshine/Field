<template>
  <section class="tag-demo">
    <p class="tag-demo__eyebrow">TAG SELECTION</p>
    <h1>标签选择树</h1>
    <p class="tag-demo__intro">按层级管理标签，自由选择每一个节点。</p>
    <div class="tag-demo__layout">
      <div>
        <h3>选择标签 <small>支持多选与搜索</small></h3>
        <tag-select-tree v-model="selected" :data="tags" :disabled="disabled" />
      </div>
      <aside>
        <h3>选择规则</h3>
        <p><b>01</b> 勾选父节点，子节点保持原状。</p>
        <p><b>02</b> 勾选子节点，自动勾选所有可选祖先。</p>
        <p><b>03</b> 取消任一节点，只取消当前节点。</p>
        <el-switch v-model="disabled" active-text="禁用组件" />
        <h3 class="tag-demo__result">已选节点 · {{ selected.length }}</h3>
        <pre>{{ JSON.stringify(selected, null, 2) }}</pre>
      </aside>
    </div>
  </section>
</template>
<script>
import TagSelectTree from '../components/TagSelectTree/TagSelectTree.vue'
export default {
  name: 'TagSelectTreeDemo',
  components: { TagSelectTree },
  data() {
    return {
      selected: [], disabled: false,
      tags: [
        { id: 'industry', label: '行业领域', children: [
          { id: 'technology', label: '科技互联网', children: [{ id: 'ai', label: '人工智能' }, { id: 'cloud', label: '云计算' }] },
          { id: 'finance', label: '金融服务', children: [{ id: 'bank', label: '银行' }, { id: 'insurance', label: '保险' }] }
        ] },
        { id: 'region', label: '区域标签', children: [{ id: 'east', label: '华东地区' }, { id: 'south', label: '华南地区' }, { id: 'north', label: '华北地区' }] },
        { id: 'status', label: '跟进状态', children: [{ id: 'focus', label: '重点关注' }, { id: 'ongoing', label: '持续跟进' }, { id: 'archived', label: '已归档（禁用）', disabled: true }] }
      ]
    }
  }
}
</script>
<style scoped>
.tag-demo { max-width: 1100px; margin: 0 auto; padding: 28px; color: #263449; }
.tag-demo__eyebrow { color: #409eff; letter-spacing: 3px; font-size: 12px; font-weight: 700; }
.tag-demo h1 { font-size: 30px; margin: 12px 0; }
.tag-demo__intro { color: #7b8797; margin-bottom: 32px; }
.tag-demo__layout { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(260px, 1fr); gap: 30px; }
.tag-demo h3 { font-size: 16px; }
.tag-demo small { font-size: 12px; font-weight: 400; color: #909399; margin-left: 12px; }
.tag-demo aside { background: #f5f8fc; border-radius: 12px; padding: 8px 24px 24px; }
.tag-demo aside p { font-size: 13px; line-height: 1.8; margin: 20px 0; }
.tag-demo b { color: #409eff; margin-right: 8px; }
.tag-demo__result { margin-top: 32px; }
.tag-demo pre { background: #fff; padding: 16px; border-radius: 8px; color: #52657d; white-space: pre-wrap; }
@media (max-width: 800px) { .tag-demo__layout { grid-template-columns: 1fr; } .tag-demo { padding: 12px; } }
</style>
