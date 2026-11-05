<template>
  <main class="excel-case-demo">
    <section class="excel-case-demo__panel">
      <header class="excel-case-demo__header">
        <div>
          <p class="excel-case-demo__eyebrow">ELEMENT UI · EXCEL STYLE</p>
          <h1>案件信息表格表单</h1>
          <p>将鼠标移到任意单元格上即可显示输入控件，点击图标后仅编辑当前单元格。</p>
        </div>
        <el-tag type="success" effect="plain">{{ caseRows.length }} 条案件</el-tag>
      </header>

      <excel-case-table-form
        v-model="caseRows"
        :region-options="regionOptions"
        @confirm-edit="handleConfirmEdit"
        @cancel-edit="handleCancelEdit"
      />

      <footer class="excel-case-demo__footer">
        <span><i class="el-icon-info" /> 表格支持横向滚动；地区可多选，时间字段使用日期选择器。</span>
        <span v-if="lastUpdatedRow">最近修改：{{ lastUpdatedRow.organizer }}</span>
      </footer>
    </section>
  </main>
</template>

<script>
import ExcelCaseTableForm from '../components/ExcelCaseTableForm/ExcelCaseTableForm.vue'

export default {
  name: 'ExcelCaseTableFormDemo',
  components: {
    ExcelCaseTableForm
  },
  data() {
    return {
      lastUpdatedRow: null,
      regionOptions: [
        { label: '华北地区', value: '华北' },
        { label: '华东地区', value: '华东' },
        { label: '华南地区', value: '华南' },
        { label: '华中地区', value: '华中' },
        { label: '西南地区', value: '西南' },
        { label: '西北地区', value: '西北' },
        { label: '东北地区', value: '东北' }
      ],
      caseRows: [
        {
          id: 'case-001',
          systemCaseNumber: 'ZF-2026-0001',
          caseNameOrCode: '晨曦一号',
          caseSupervisionDate: '2026-01-12',
          filingNumber: 'LA-2026-0112',
          bdProjectDate: '2026-01-18',
          supervisionReason: '重点领域跨区域案件',
          mmForceCode: 'MM-A17',
          caseSource: '上级交办',
          involvedPerson: '张某、李某',
          caseStatus: '已结案',
          closingDate: '2026-06-30',
          caseSummary: '围绕重点金融领域开展跨区域调查，已完成主要证据固定和案件处置。',
          progressStatus: '已完成侦查并依法结案。',
          criminalDetentionCount: 4,
          bailPendingTrialCount: 2,
          residentialSurveillanceCount: 1,
          arrestCount: 3,
          prosecutionTransferCount: 3,
          securityOfficerCount: 1,
          securityFineCount: 2,
          securityDetentionCount: 1,
          educationTransformationCount: 6,
          criticismEducationCount: 4,
          otherHandlingCount: 1,
          remark1: '重点督办',
          remark2: '跨区域协作',
          remark3: '证据链完整',
          remark4: '无',
          organizer: '经济案件专案组',
          caseLevel: '一级专案',
          caseCategory: '经济类案件',
          businessDomain: '金融监管',
          regions: ['华东', '华南'],
          handlingUnit: '第一办案中心'
        },
        {
          id: 'case-002',
          systemCaseNumber: 'ZF-2026-0002',
          caseNameOrCode: '清源行动',
          caseSupervisionDate: '2026-02-08',
          filingNumber: 'LA-2026-0208',
          bdProjectDate: '2026-02-15',
          supervisionReason: '市场秩序专项治理',
          mmForceCode: 'MM-B06',
          caseSource: '群众举报',
          involvedPerson: '王某',
          caseStatus: '办理中',
          closingDate: '2026-08-01',
          caseSummary: '根据群众举报核查市场经营行为，相关主体及交易资料正在进一步核验。',
          progressStatus: '正在核验交易资料并补充询问相关人员。',
          criminalDetentionCount: 1,
          bailPendingTrialCount: 3,
          residentialSurveillanceCount: 0,
          arrestCount: 0,
          prosecutionTransferCount: 0,
          securityOfficerCount: 2,
          securityFineCount: 5,
          securityDetentionCount: 2,
          educationTransformationCount: 8,
          criticismEducationCount: 6,
          otherHandlingCount: 0,
          remark1: '持续跟进',
          remark2: '群众举报案件',
          remark3: '资料核验中',
          remark4: '无',
          organizer: '市场监管联合组',
          caseLevel: '二级专案',
          caseCategory: '市场监管案件',
          businessDomain: '市场秩序',
          regions: ['华北'],
          handlingUnit: '综合执法支队'
        },
        {
          id: 'case-003',
          systemCaseNumber: 'ZF-2026-0003',
          caseNameOrCode: '云盾三号',
          caseSupervisionDate: '2026-03-16',
          filingNumber: 'LA-2026-0316',
          bdProjectDate: '2026-03-22',
          supervisionReason: '重大网络安全风险',
          mmForceCode: 'MM-C21',
          caseSource: '部门移送',
          involvedPerson: '赵某、陈某',
          caseStatus: '办理中',
          closingDate: '2026-09-15',
          caseSummary: '针对重大网络安全风险开展联合调查，已完成涉案设备和数据取证。',
          progressStatus: '已完成电子数据鉴定，正在审查关联线索。',
          criminalDetentionCount: 3,
          bailPendingTrialCount: 1,
          residentialSurveillanceCount: 2,
          arrestCount: 2,
          prosecutionTransferCount: 1,
          securityOfficerCount: 0,
          securityFineCount: 0,
          securityDetentionCount: 0,
          educationTransformationCount: 5,
          criticismEducationCount: 3,
          otherHandlingCount: 2,
          remark1: '网络专案',
          remark2: '联合调查',
          remark3: '电子数据已固定',
          remark4: '无',
          organizer: '网络安全专班',
          caseLevel: '一级专案',
          caseCategory: '网络安全案件',
          businessDomain: '数据安全',
          regions: ['华东', '华中', '西南'],
          handlingUnit: '网络案件办案处'
        },
        {
          id: 'case-004',
          systemCaseNumber: 'ZF-2026-0004',
          caseNameOrCode: '绿洲行动',
          caseSupervisionDate: '2026-04-10',
          filingNumber: 'LA-2026-0410',
          bdProjectDate: '2026-04-18',
          supervisionReason: '跨区域生态环境问题',
          mmForceCode: 'MM-D09',
          caseSource: '巡查发现',
          involvedPerson: '刘某',
          caseStatus: '已结案',
          closingDate: '2026-07-20',
          caseSummary: '对跨区域生态环境问题开展专项调查，责任主体已完成整改。',
          progressStatus: '整改验收完成，案件已归档。',
          criminalDetentionCount: 0,
          bailPendingTrialCount: 2,
          residentialSurveillanceCount: 0,
          arrestCount: 1,
          prosecutionTransferCount: 1,
          securityOfficerCount: 3,
          securityFineCount: 4,
          securityDetentionCount: 2,
          educationTransformationCount: 10,
          criticismEducationCount: 7,
          otherHandlingCount: 1,
          remark1: '重点督办',
          remark2: '跨区域协作',
          remark3: '证据链完整',
          remark4: '无',
          organizer: '生态环境调查组',
          caseLevel: '三级专案',
          caseCategory: '环境资源案件',
          businessDomain: '生态保护',
          regions: ['西北', '东北'],
          handlingUnit: '环境执法总队'
        }
      ]
    }
  },
  methods: {
    handleConfirmEdit(payload) {
      this.lastUpdatedRow = payload.row
      this.$message.success('案件信息已更新')
    },
    handleCancelEdit() {
      this.$message.info('已取消本次修改')
    }
  }
}
</script>

<style scoped>
.excel-case-demo {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 36px;
  background:
    linear-gradient(rgba(228, 235, 243, 0.52) 1px, transparent 1px),
    linear-gradient(90deg, rgba(228, 235, 243, 0.52) 1px, transparent 1px),
    #f4f7fa;
  background-size: 24px 24px;
  color: #1f2937;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.excel-case-demo__panel {
  max-width: 1480px;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 28px;
  border: 1px solid #cfd8e3;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 18px 48px rgba(43, 56, 73, 0.1);
}

.excel-case-demo__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.excel-case-demo__eyebrow {
  margin: 0 0 8px !important;
  color: #2e7d46 !important;
  font-size: 12px !important;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.excel-case-demo__header h1 {
  margin: 0 0 8px;
  color: #172033;
  font-size: 26px;
  line-height: 1.25;
}

.excel-case-demo__header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.excel-case-demo__footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  color: #64748b;
  font-size: 13px;
}

.excel-case-demo__footer i {
  margin-right: 4px;
  color: #2e7d46;
}

@media (max-width: 720px) {
  .excel-case-demo {
    padding: 16px;
  }

  .excel-case-demo__panel {
    padding: 18px;
  }

  .excel-case-demo__header,
  .excel-case-demo__footer {
    flex-direction: column;
  }
}
</style>
