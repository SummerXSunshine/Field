# ExcelCaseTableForm

## 用途

`ExcelCaseTableForm` 是一个基于 Element UI `el-table` 的 Vue 2 单元格编辑组件。页面默认以 Excel 风格的网格展示案件信息；鼠标悬停某个单元格时显示输入控件和编辑图标；点击后只编辑当前单元格，并显示确认与取消图标。地区字段使用 `el-select`，支持多选、搜索和折叠标签。立案督专案时间、立BD专案时间和结案时间使用 `el-date-picker`，数据格式为 `yyyy-MM-dd`。“打击处理情况（人次）”使用多级表头，其子字段均为非负整数；其后提供备注１至备注４四个独立文本列。

## 数据结构

```js
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
  organizer: '第一主办单位',
  caseLevel: '一级专案',
  caseCategory: '经济类',
  businessDomain: '金融监管',
  regions: ['华东', '华南'],
  handlingUnit: '第一办案单位'
}
```

`id` 默认作为行唯一标识。如果业务数据使用其他字段，可通过 `row-key` 指定。

## 列编辑配置

`createColumns`、`createHandlingColumns` 和 `createTrailingColumns` 返回的列对象支持 `edit` 配置：

```js
{
  prop: 'systemCaseNumber',
  label: '执法办案系统案件编号',
  type: 'text',
  edit: true
}
```

- `edit: true`：鼠标悬停时显示编辑控件和编辑图标。
- `edit: false`：始终以只读文本展示，不能进入编辑状态。

当前仅以下字段支持修改：地区、办案单位、执法办案系统案件编号、立案督专案时间、立BD专案时间、督办事由、发挥作用MM力量代号、结案时间、进展情况、“打击处理情况（人次）”的全部子属性，以及备注１至备注４。其他字段均为只读。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `Array` | `[]` | 表格数据，支持 Vue 2 `v-model` |
| `regionOptions` | `Array` | `[]` | 地区选项，元素格式为 `{ label, value }` |
| `rowKey` | `String` | `id` | 行唯一标识字段 |
| `height` | `String / Number` | `null` | 表格高度，设置后表头固定 |
| `emptyText` | `String` | `暂无案件数据` | 空数据提示 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `input` | `rows` | 确认修改时触发，用于更新 `v-model` |
| `edit-start` | `payload` | 点击单元格编辑图标后触发 |
| `confirm-edit` | `payload` | 当前单元格校验通过并确认后触发 |
| `cancel-edit` | `payload` | 取消并恢复当前单元格原值后触发 |
| `validation-error` | `message, payload` | 当前单元格校验未通过 |

## 使用示例

```vue
<excel-case-table-form
  v-model="caseRows"
  :region-options="regionOptions"
  height="420"
  @confirm-edit="handleConfirm"
/>
```

```js
import ExcelCaseTableForm from '@/components/ExcelCaseTableForm/ExcelCaseTableForm.vue'

export default {
  components: { ExcelCaseTableForm },
  data() {
    return {
      caseRows: [],
      regionOptions: [
        { label: '华东地区', value: '华东' },
        { label: '华南地区', value: '华南' }
      ]
    }
  }
}
```

## 交互和关键逻辑

1. `displayRows` 使用 `cloneRows(value)` 创建展示数据，`el-table` 始终以该数组作为数据源。
2. `editRows` 是独立的修改数据副本，所有输入框、日期选择器、地区多选框和数字输入框只更新该数组。
3. `getEditValue(row, field)` 从修改数据中读取控件值，`updateEditValue(row, field, value)` 使用 `$set` 写入草稿字段。
4. `editingCell` 同时记录行标识和字段名，因此同一时间只有一个单元格处于编辑状态。
5. `startEdit(row, field)` 进入编辑前，将当前展示值复制到对应修改字段，保证每次编辑都从已确认值开始。
6. `confirmEdit(row)` 校验修改数据，通过后只把当前字段写入 `displayRows`，再触发 `input` 和 `confirm-edit`。
7. `cancelEdit()` 使用展示值覆盖当前修改字段，不改变 `displayRows`，也不触发父组件数据更新。
8. 编辑事件的 `payload` 包含 `{ row, field, value }`，确认事件中的值来自已经更新的展示数据。
9. `type: 'date'` 的列使用 `el-date-picker`，通过 `value-format="yyyy-MM-dd"` 保持数据模型格式稳定。
10. `handlingColumns` 生成“打击处理情况（人次）”的二级表头，子列使用 `el-input-number` 并限制为非负整数。
11. `trailingColumns` 在多级表头后生成备注１至备注４，进展情况则紧跟简要案情。
12. `pendingInputRows` 标记组件刚发出的数组引用；该数据经 `v-model` 回流时，`value` 监听器直接忽略，避免整表展示数据被替换。

## 校验

- 除序号外，当前编辑的文本或日期字段不能为空。
- 地区至少选择一项。
- 打击处理情况字段接受 `0`，但不能为负数。

校验失败时，表格上方显示警告，同时触发 `validation-error`。取消修改不会更新父组件数据。

## 状态说明

- 默认：显示纯文本单元格。
- 悬停：仅当前单元格显示只读输入控件和编辑图标。
- 编辑：仅当前单元格的修改数据可操作，展示数据保持不变；点击确认后才更新展示值。
- 校验失败：保持编辑状态并显示警告。
- 空数据：显示 Element UI 表格的空状态文案。
