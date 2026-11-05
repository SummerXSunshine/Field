<template>
  <section class="tag-filter-demo">
    <p class="tag-filter-demo__eyebrow">PROGRESSIVE FILTER</p>
    <h1>四级标签筛选</h1>
    <p class="tag-filter-demo__intro">从一级开始，逐层缩小范围。多选分支的子标签会同时展示。</p>
    <four-level-tag-filter v-model="selected" :data="tags" @change="handleChange" />
    <div class="tag-filter-demo__outputs">
      <article v-for="(ids, index) in selected" :key="index"><span>LEVEL 0{{ index + 1 }}</span><h3>{{ names[index] }} ID <small>{{ ids.length }} 项</small></h3><pre>{{ JSON.stringify(ids, null, 2) }}</pre></article>
    </div>
    <p class="tag-filter-demo__note">每级“重置”清空当前级及下级；“全部重置”清空四个数组，仅保留一级标签。</p>
  </section>
</template>
<script>
import FourLevelTagFilter from '../components/FourLevelTagFilter/FourLevelTagFilter.vue'
export default {
  name: 'FourLevelTagFilterDemo',
  components: { FourLevelTagFilter },
  data() {
    return {
      selected: [[], [], [], []],
      names: ['一级', '二级', '三级', '四级'],
      tags: [
        { id: 'technology', label: '科技互联网', children: [
          { id: 'ai', label: '人工智能', children: [
            { id: 'language', label: '语言智能', children: [{ id: 'translation', label: '机器翻译' }, { id: 'dialog', label: '智能对话' }] },
            { id: 'vision', label: '计算机视觉', children: [{ id: 'image', label: '图像识别' }, { id: 'video', label: '视频分析' }] }
          ] },
          { id: 'cloud', label: '云计算', children: [{ id: 'infrastructure', label: '基础设施', children: [{ id: 'compute', label: '弹性计算' }, { id: 'storage', label: '对象存储' }] }] }
        ] },
        { id: 'finance', label: '金融服务', children: [
          { id: 'bank', label: '银行', children: [{ id: 'retail', label: '零售业务', children: [{ id: 'deposit', label: '储蓄存款' }, { id: 'card', label: '信用卡' }] }] },
          { id: 'insurance', label: '保险', children: [{ id: 'property', label: '财产保险', children: [{ id: 'vehicle', label: '车险' }, { id: 'home', label: '家财险' }] }] }
        ] },
        { id: 'manufacturing', label: '先进制造', children: [{ id: 'equipment', label: '智能装备', children: [{ id: 'robot', label: '机器人', children: [{ id: 'industrial', label: '工业机器人' }, { id: 'service', label: '服务机器人' }] }] }] },
        { id: 'other', label: '其他（无子标签）' }
      ]
    }
  },
  methods: {
    handleChange(level1Ids, level2Ids, level3Ids, level4Ids) {
      // 四个独立数组可以直接用于筛选接口参数。
      this.selected = [level1Ids, level2Ids, level3Ids, level4Ids]
    }
  }
}
</script>
<style scoped>
.tag-filter-demo { max-width: 1180px; margin: 0 auto; padding: 30px; color: #29374b; }
.tag-filter-demo__eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #409eff; }
.tag-filter-demo h1 { font-size: 28px; margin: 12px 0; }
.tag-filter-demo__intro { color: #7f8b9c; font-size: 14px; margin-bottom: 30px; line-height: 1.8; }
.tag-filter-demo__outputs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
.tag-filter-demo article { border: 1px solid #e5eaf1; border-radius: 10px; padding: 18px; background: #fff; }
.tag-filter-demo article > span { color: #8b9aaf; font-size: 10px; letter-spacing: 2px; }
.tag-filter-demo h3 { font-size: 14px; margin: 12px 0; }
.tag-filter-demo small { font-weight: 400; color: #8b9aaf; margin-left: 8px; }
.tag-filter-demo pre { color: #4678b5; font-size: 12px; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.8; }
.tag-filter-demo__note { color: #8994a4; font-size: 12px; line-height: 1.8; }
@media (max-width: 800px) { .tag-filter-demo { padding: 16px; } .tag-filter-demo__outputs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
