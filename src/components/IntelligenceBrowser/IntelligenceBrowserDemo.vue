<template>
  <main class="intelligence-demo">
    <header class="intelligence-demo__header">
      <div>
        <router-link to="/" class="intelligence-demo__home-link">← 返回组件列表</router-link>
        <h1>情报浏览组件</h1>
        <p>整编情报直接展示卡片，所属情报支持组合检索；点击卡片可在原区域查看详情。</p>
      </div>
      <span v-if="lastAction" class="intelligence-demo__action">{{ lastAction }}</span>
    </header>

    <intelligence-browser
      :integrated-rows="integratedRows"
      :owned-rows="ownedRows"
      @query="handleQuery"
      @row-click="handleRowClick"
      @back="handleBack"
      @tab-change="handleTabChange"
    />
  </main>
</template>

<script>
import IntelligenceBrowser from '../components/IntelligenceBrowser/IntelligenceBrowser.vue'

const integratedRows = [
  {
    id: 'integrated-001',
    title: '重点区域风险动态综合研判',
    sourceType: 'body',
    sourceTypeLabel: '整编',
    sourceOrg: '综合情报中心',
    publishDate: '2026-08-18',
    status: '已发布',
    content: '根据近期多源情报线索，对重点区域风险情况进行综合分析。\n\n一、总体态势保持平稳；二、重点时段需加强巡查；三、建议相关单位及时复核关联线索并反馈处置结果。'
  },
  {
    id: 'integrated-002',
    title: '近期关联线索汇总与趋势分析',
    sourceType: 'body',
    sourceTypeLabel: '整编',
    sourceOrg: '信息研判处',
    publishDate: '2026-08-16',
    status: '已发布',
    content: '本期共汇总关联线索 18 条，涉及重点事项 4 类。经交叉比对，暂未发现重大异常，部分重复线索已合并归档。'
  },
  {
    id: 'integrated-003',
    title: '跨部门协同处置工作情况专报',
    sourceType: 'received',
    sourceTypeLabel: '整编',
    sourceOrg: '联合作战中心',
    publishDate: '2026-08-12',
    status: '待复核',
    content: '各协同单位已按工作要求完成第一阶段核查。下一步将围绕尚未闭环的事项开展补充调查，并于本周内形成反馈材料。'
  }
]

const ownedRows = [
  {
    id: 'owned-001',
    title: '关于加强重点场所日常巡查的情况报告',
    sourceType: 'body',
    sourceTypeLabel: '正文',
    sourceOrg: '第一情报大队',
    publishDate: '2026-08-17',
    status: '已上报',
    content: '第一情报大队对辖区重点场所开展了集中巡查。巡查期间运行秩序正常，已对发现的一般性问题完成现场提醒和登记。'
  },
  {
    id: 'owned-002',
    title: '重点线索核查结果反馈',
    sourceType: 'body',
    sourceTypeLabel: '正文',
    sourceOrg: '第二情报大队',
    publishDate: '2026-08-14',
    status: '已上报',
    content: '经核查，相关线索基础信息属实，暂未发现进一步风险。核查过程和佐证材料已按要求整理归档。'
  },
  {
    id: 'owned-003',
    title: '市级部门工作提示函',
    sourceType: 'received',
    sourceTypeLabel: '收文',
    sourceOrg: '市级业务部门',
    publishDate: '2026-08-15',
    status: '已阅',
    content: '请各单位结合实际做好近期情报信息收集、核验和报送工作，重要情况第一时间上报，确保信息流转及时准确。'
  },
  {
    id: 'owned-004',
    title: '关于开展专项信息核验的通知',
    sourceType: 'received',
    sourceTypeLabel: '收文',
    sourceOrg: '综合业务处',
    publishDate: '2026-08-09',
    status: '办理中',
    content: '现就专项信息核验工作作出安排。请明确专人负责，按照清单逐项核对，并在规定时间内提交核验结果。'
  },
  {
    id: 'owned-005',
    title: '辖区风险要素排查日报',
    sourceType: 'body',
    sourceTypeLabel: '正文',
    sourceOrg: '第三情报大队',
    publishDate: '2026-08-06',
    status: '草稿',
    content: '今日共排查风险要素 12 项，其中 10 项已完成核验，2 项正在补充信息。整体情况可控，无紧急事项。'
  }
]

const drafterNames = ['张宁', '李妍', '王磊', '赵敏', '陈川']

const enrichRows = rows => rows.map((row, index) => ({
  ...row,
  drafter: drafterNames[index % drafterNames.length],
  draftUnit: row.sourceOrg,
  draftTime: row.publishDate + ' 09:30',
  content: row.content
    .split('\n\n')
    .map(paragraph => '<p>' + paragraph + '</p>')
    .join('')
}))

export default {
  name: 'IntelligenceBrowserDemo',
  components: {
    IntelligenceBrowser
  },
  data() {
    return {
      integratedRows: enrichRows(integratedRows),
      ownedRows: enrichRows(ownedRows),
      lastAction: ''
    }
  },
  methods: {
    handleQuery({ filters }) {
      const typeLabel = filters.sourceType === 'body' ? '正文' : '收文'
      this.lastAction = `已查询：${typeLabel}${filters.keyword ? ` / ${filters.keyword}` : ''}`
    },
    handleRowClick({ row }) {
      this.lastAction = `正在查看：${row.title}`
    },
    handleBack() {
      this.lastAction = '已返回情报列表'
    },
    handleTabChange(tab) {
      this.lastAction = tab === 'integrated' ? '已切换到整编情报' : '已切换到所属情报'
    }
  }
}
</script>

<style scoped>
.intelligence-demo {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 32px;
  background: #eef2f7;
  color: #172033;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.intelligence-demo__header {
  display: flex;
  gap: 24px;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1280px;
  margin: 0 auto 20px;
}

.intelligence-demo__header h1 {
  margin: 10px 0 8px;
  font-size: 28px;
}

.intelligence-demo__header p {
  margin: 0;
  color: #677386;
  font-size: 14px;
}

.intelligence-demo__home-link {
  color: #1769aa;
  font-size: 14px;
  text-decoration: none;
}

.intelligence-demo__action {
  max-width: 360px;
  overflow: hidden;
  padding: 8px 12px;
  border-radius: 4px;
  background: #e7f3ff;
  color: #1769aa;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intelligence-demo > .intelligence-browser {
  max-width: 1280px;
  margin: 0 auto;
}

@media (max-width: 760px) {
  .intelligence-demo {
    padding: 18px 12px;
  }

  .intelligence-demo__header {
    display: block;
  }

  .intelligence-demo__action {
    display: inline-block;
    margin-top: 12px;
  }
}
</style>
