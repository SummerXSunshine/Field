<template>
  <div class="excel-table-form">
    <el-alert
      v-if="validationMessage"
      class="excel-table-form__alert"
      type="warning"
      :title="validationMessage"
      show-icon
      :closable="false"
    />

    <el-table
      class="excel-table-form__table"
      :data="displayRows"
      :height="height"
      :empty-text="emptyText"
      :row-key="rowKey"
      border
      stripe
    >
      <el-table-column type="index" label="序号" width="72" align="center" fixed="left" />

      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :label="column.label"
        :min-width="column.minWidth"
      >
        <template slot-scope="scope">
          <div
            class="excel-table-form__cell"
            :class="{
              'excel-table-form__cell--editable': column.edit,
              'excel-table-form__cell--editing': isEditingCell(scope.row, column.prop)
            }"
          >
            <span
              class="excel-table-form__display"
              :class="{
                'excel-table-form__display--regions': column.type === 'regions'
              }"
              :title="formatCellValue(scope.row, column)"
            >
              {{ formatCellValue(scope.row, column) || '—' }}
            </span>

            <div v-if="column.edit" class="excel-table-form__edit-box">
              <el-select
                v-if="column.type === 'regions'"
                :value="getEditValue(scope.row, column.prop)"
                class="excel-table-form__editor excel-table-form__region-select"
                size="mini"
                multiple
                collapse-tags
                filterable
                :disabled="!isEditingCell(scope.row, column.prop)"
                :placeholder="column.placeholder"
                @input="updateEditValue(scope.row, column.prop, $event)"
              >
                <el-option
                  v-for="option in regionOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <el-date-picker
                v-else-if="column.type === 'date'"
                :value="getEditValue(scope.row, column.prop)"
                class="excel-table-form__editor excel-table-form__date-picker"
                size="mini"
                type="date"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                :disabled="!isEditingCell(scope.row, column.prop)"
                :placeholder="column.placeholder"
                @input="updateEditValue(scope.row, column.prop, $event)"
              />

              <el-input
                v-else
                :value="getEditValue(scope.row, column.prop)"
                class="excel-table-form__editor"
                size="mini"
                :readonly="!isEditingCell(scope.row, column.prop)"
                :placeholder="column.placeholder"
                @input="updateEditValue(scope.row, column.prop, $event)"
              />

              <div class="excel-table-form__cell-actions">
                <template v-if="isEditingCell(scope.row, column.prop)">
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-check"
                    circle
                    title="确认修改"
                    aria-label="确认修改"
                    @click="confirmEdit(scope.row)"
                  />
                  <el-button
                    size="mini"
                    icon="el-icon-close"
                    circle
                    title="取消修改"
                    aria-label="取消修改"
                    @click="cancelEdit"
                  />
                </template>
                <el-button
                  v-else
                  size="mini"
                  icon="el-icon-edit"
                  circle
                  title="编辑"
                  :aria-label="'编辑' + column.label"
                  @click="startEdit(scope.row, column.prop)"
                />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="打击处理情况（人次）" align="center">
        <el-table-column
          v-for="column in handlingColumns"
          :key="column.prop"
          :label="column.label"
          :min-width="column.minWidth"
          align="center"
        >
          <template slot-scope="scope">
            <div
              class="excel-table-form__cell"
              :class="{
                'excel-table-form__cell--editable': column.edit,
                'excel-table-form__cell--editing': isEditingCell(scope.row, column.prop)
              }"
            >
              <span class="excel-table-form__display" :title="formatCellValue(scope.row, column)">
                {{ formatCellValue(scope.row, column) || '—' }}
              </span>

              <div v-if="column.edit" class="excel-table-form__edit-box">
                <el-input-number
                  :value="getEditValue(scope.row, column.prop)"
                  class="excel-table-form__editor excel-table-form__number-input"
                  size="mini"
                  :min="0"
                  :step="1"
                  :precision="0"
                  :controls="false"
                  :disabled="!isEditingCell(scope.row, column.prop)"
                  :aria-label="column.label"
                  @input="updateEditValue(scope.row, column.prop, $event)"
                />

                <div class="excel-table-form__cell-actions">
                  <template v-if="isEditingCell(scope.row, column.prop)">
                    <el-button type="primary" size="mini" icon="el-icon-check" circle title="确认修改" aria-label="确认修改" @click="confirmEdit(scope.row)" />
                    <el-button size="mini" icon="el-icon-close" circle title="取消修改" aria-label="取消修改" @click="cancelEdit" />
                  </template>
                  <el-button v-else size="mini" icon="el-icon-edit" circle title="编辑" :aria-label="'编辑' + column.label" @click="startEdit(scope.row, column.prop)" />
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column
        v-for="column in trailingColumns"
        :key="column.prop"
        :label="column.label"
        :min-width="column.minWidth"
      >
        <template slot-scope="scope">
          <div
            class="excel-table-form__cell"
            :class="{
              'excel-table-form__cell--editable': column.edit,
              'excel-table-form__cell--editing': isEditingCell(scope.row, column.prop)
            }"
          >
            <span class="excel-table-form__display" :title="formatCellValue(scope.row, column)">
              {{ formatCellValue(scope.row, column) || '—' }}
            </span>

            <div v-if="column.edit" class="excel-table-form__edit-box">
              <el-input
                :value="getEditValue(scope.row, column.prop)"
                class="excel-table-form__editor"
                size="mini"
                :readonly="!isEditingCell(scope.row, column.prop)"
                :placeholder="column.placeholder"
                @input="updateEditValue(scope.row, column.prop, $event)"
              />

              <div class="excel-table-form__cell-actions">
                <template v-if="isEditingCell(scope.row, column.prop)">
                  <el-button type="primary" size="mini" icon="el-icon-check" circle title="确认修改" aria-label="确认修改" @click="confirmEdit(scope.row)" />
                  <el-button size="mini" icon="el-icon-close" circle title="取消修改" aria-label="取消修改" @click="cancelEdit" />
                </template>
                <el-button v-else size="mini" icon="el-icon-edit" circle title="编辑" :aria-label="'编辑' + column.label" @click="startEdit(scope.row, column.prop)" />
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
const createColumns = () => [
  {
    prop: 'organizer',
    label: '主办单位',
    minWidth: 190,
    placeholder: '请输入主办单位',
    type: 'text',
    edit: false
  },
  {
    prop: 'caseLevel',
    label: '专案级别',
    minWidth: 160,
    placeholder: '请输入专案级别',
    type: 'text',
    edit: false
  },
  {
    prop: 'caseCategory',
    label: '案件类别',
    minWidth: 180,
    placeholder: '请输入案件类别',
    type: 'text',
    edit: false
  },
  {
    prop: 'businessDomain',
    label: '业务领域',
    minWidth: 180,
    placeholder: '请输入业务领域',
    type: 'text',
    edit: false
  },
  {
    prop: 'regions',
    label: '地区',
    minWidth: 250,
    placeholder: '请选择地区',
    type: 'regions',
    edit: true
  },
  {
    prop: 'handlingUnit',
    label: '办案单位',
    minWidth: 200,
    placeholder: '请输入办案单位',
    type: 'text',
    edit: true
  },
  {
    prop: 'systemCaseNumber',
    label: '执法办案系统案件编号',
    minWidth: 220,
    placeholder: '请输入系统案件编号',
    type: 'text',
    edit: true
  },
  {
    prop: 'caseNameOrCode',
    label: '案件名称或代号',
    minWidth: 200,
    placeholder: '请输入案件名称或代号',
    type: 'text',
    edit: false
  },
  {
    prop: 'caseSupervisionDate',
    label: '立案督专案时间',
    minWidth: 210,
    placeholder: '请选择立案督专案时间',
    type: 'date',
    edit: true
  },
  {
    prop: 'filingNumber',
    label: '立案编号',
    minWidth: 180,
    placeholder: '请输入立案编号',
    type: 'text',
    edit: false
  },
  {
    prop: 'bdProjectDate',
    label: '立BD专案时间',
    minWidth: 200,
    placeholder: '请选择立BD专案时间',
    type: 'date',
    edit: true
  },
  {
    prop: 'supervisionReason',
    label: '督办事由',
    minWidth: 220,
    placeholder: '请输入督办事由',
    type: 'text',
    edit: true
  },
  {
    prop: 'mmForceCode',
    label: '发挥作用MM力量代号',
    minWidth: 230,
    placeholder: '请输入MM力量代号',
    type: 'text',
    edit: true
  },
  {
    prop: 'caseSource',
    label: '案件来源',
    minWidth: 180,
    placeholder: '请输入案件来源',
    type: 'text',
    edit: false
  },
  {
    prop: 'involvedPerson',
    label: '涉案人',
    minWidth: 160,
    placeholder: '请输入涉案人',
    type: 'text',
    edit: false
  },
  {
    prop: 'caseStatus',
    label: '案件状态',
    minWidth: 160,
    placeholder: '请输入案件状态',
    type: 'text',
    edit: false
  },
  {
    prop: 'closingDate',
    label: '结案时间',
    minWidth: 180,
    placeholder: '请选择结案时间',
    type: 'date',
    edit: true
  },
  {
    prop: 'caseSummary',
    label: '简要案情',
    minWidth: 320,
    placeholder: '请输入简要案情',
    type: 'text',
    edit: false
  },
  {
    prop: 'progressStatus',
    label: '进展情况',
    minWidth: 320,
    placeholder: '请输入进展情况',
    type: 'text',
    edit: true
  }
]

const createHandlingColumns = () => [
  { prop: 'criminalDetentionCount', label: '刑事拘留', minWidth: 150, type: 'number', edit: true },
  { prop: 'bailPendingTrialCount', label: '取保候审', minWidth: 150, type: 'number', edit: true },
  { prop: 'residentialSurveillanceCount', label: '监视居住', minWidth: 150, type: 'number', edit: true },
  { prop: 'arrestCount', label: '逮捕', minWidth: 130, type: 'number', edit: true },
  { prop: 'prosecutionTransferCount', label: '移送起诉', minWidth: 150, type: 'number', edit: true },
  { prop: 'securityOfficerCount', label: '治安警官', minWidth: 150, type: 'number', edit: true },
  { prop: 'securityFineCount', label: '治安罚款', minWidth: 150, type: 'number', edit: true },
  { prop: 'securityDetentionCount', label: '治安拘留', minWidth: 150, type: 'number', edit: true },
  { prop: 'educationTransformationCount', label: '落实教育转化措施', minWidth: 210, type: 'number', edit: true },
  { prop: 'criticismEducationCount', label: '批评教育', minWidth: 150, type: 'number', edit: true },
  { prop: 'otherHandlingCount', label: '其他（例如：取缔组织，收缴反宣品）', minWidth: 330, type: 'number', edit: true }
]

const createTrailingColumns = () => [
  { prop: 'remark1', label: '备注１', minWidth: 220, placeholder: '请输入备注１', type: 'text', edit: true },
  { prop: 'remark2', label: '备注２', minWidth: 220, placeholder: '请输入备注２', type: 'text', edit: true },
  { prop: 'remark3', label: '备注３', minWidth: 220, placeholder: '请输入备注３', type: 'text', edit: true },
  { prop: 'remark4', label: '备注４', minWidth: 220, placeholder: '请输入备注４', type: 'text', edit: true }
]

export default {
  name: 'ExcelCaseTableForm',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    regionOptions: {
      type: Array,
      default: () => []
    },
    rowKey: {
      type: String,
      default: 'id'
    },
    height: {
      type: [String, Number],
      default: null
    },
    emptyText: {
      type: String,
      default: '暂无案件数据'
    }
  },
  data() {
    return {
      columns: createColumns(),
      handlingColumns: createHandlingColumns(),
      trailingColumns: createTrailingColumns(),
      displayRows: this.cloneRows(this.value),
      editRows: this.cloneRows(this.value),
      pendingInputRows: null,
      editingCell: null,
      validationMessage: ''
    }
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        if (value === this.pendingInputRows) {
          this.pendingInputRows = null
          return
        }

        if (!this.editingCell) {
          this.displayRows = this.cloneRows(value)
          this.editRows = this.cloneRows(value)
        }
      }
    }
  },
  methods: {
    cloneRows(rows) {
      return (rows || []).map(row => this.cloneRow(row))
    },
    cloneRow(row) {
      return {
        ...row,
        regions: Array.isArray(row.regions) ? row.regions.slice() : []
      }
    },
    cloneValue(value) {
      return Array.isArray(value) ? value.slice() : value
    },
    getRowId(row) {
      return row[this.rowKey]
    },
    getEditRow(row) {
      const rowId = this.getRowId(row)
      return this.editRows.find(item => this.getRowId(item) === rowId)
    },
    getEditValue(row, field) {
      const editRow = this.getEditRow(row)
      return editRow ? editRow[field] : row[field]
    },
    updateEditValue(row, field, value) {
      const editRow = this.getEditRow(row)
      if (!editRow) {
        return
      }

      const nextValue = typeof value === 'string' ? value.trim() : this.cloneValue(value)
      this.$set(editRow, field, nextValue)
    },
    isEditingCell(row, field) {
      return Boolean(
        this.editingCell &&
        this.editingCell.rowId === this.getRowId(row) &&
        this.editingCell.field === field
      )
    },
    formatCellValue(row, column) {
      if (column.type === 'regions') {
        return this.formatRegions(row[column.prop])
      }

      const value = row[column.prop]
      return value === null || value === undefined || value === '' ? '' : String(value)
    },
    formatRegions(regions) {
      if (!Array.isArray(regions)) {
        return ''
      }

      return regions.map(value => {
        const option = this.regionOptions.find(item => item.value === value)
        return option ? option.label : value
      }).join('、')
    },
    startEdit(row, field) {
      const column = this.columns
        .concat(this.handlingColumns, this.trailingColumns)
        .find(item => item.prop === field)

      if (!column || !column.edit) {
        return
      }

      if (this.editingCell) {
        this.cancelEdit()
      }

      const editRow = this.getEditRow(row)
      if (!editRow) {
        return
      }

      this.$set(editRow, field, this.cloneValue(row[field]))

      this.editingCell = {
        rowId: this.getRowId(row),
        field
      }
      this.validationMessage = ''
      this.$emit('edit-start', this.createEventPayload(row, field))
    },
    confirmEdit(row) {
      if (!this.editingCell) {
        return
      }

      const field = this.editingCell.field
      const editRow = this.getEditRow(row)
      if (!editRow) {
        return
      }

      const message = this.validateCell(editRow, field)

      if (message) {
        this.validationMessage = message
        this.$emit('validation-error', message, this.createEventPayload(editRow, field))
        return
      }

      this.$set(row, field, this.cloneValue(editRow[field]))
      const payload = this.createEventPayload(row, field)
      const nextRows = this.cloneRows(this.displayRows)
      this.editingCell = null
      this.validationMessage = ''
      this.pendingInputRows = nextRows
      this.$emit('input', nextRows)
      this.$emit('confirm-edit', payload)
      this.$nextTick(() => {
        if (this.pendingInputRows === nextRows) {
          this.pendingInputRows = null
        }
      })
    },
    cancelEdit() {
      if (!this.editingCell) {
        return
      }

      const { rowId, field } = this.editingCell
      const row = this.displayRows.find(item => this.getRowId(item) === rowId)
      const editRow = this.editRows.find(item => this.getRowId(item) === rowId)

      if (row && editRow) {
        this.$set(editRow, field, this.cloneValue(row[field]))
      }

      const payload = row ? this.createEventPayload(row, field) : { row: null, field, value: null }
      this.editingCell = null
      this.validationMessage = ''
      this.$emit('cancel-edit', payload)
    },
    createEventPayload(row, field) {
      return {
        row: this.cloneRow(row),
        field,
        value: this.cloneValue(row[field])
      }
    },
    validateCell(row, field) {
      const column = this.columns
        .concat(this.handlingColumns, this.trailingColumns)
        .find(item => item.prop === field)

      if (field === 'regions') {
        return Array.isArray(row[field]) && row[field].length > 0 ? '' : '请至少选择一个地区'
      }

      if (column && column.type === 'number') {
        if (row[field] === null || row[field] === undefined || row[field] === '') {
          return column.label + '不能为空'
        }

        return Number(row[field]) >= 0 ? '' : column.label + '不能小于 0'
      }

      if (!String(row[field] || '').trim()) {
        return (column ? column.label : '当前字段') + '不能为空'
      }

      return ''
    }
  }
}
</script>

<style scoped>
.excel-table-form {
  width: 100%;
  color: #1f2937;
  font-family: Arial, "Microsoft YaHei", sans-serif;
}

.excel-table-form__alert {
  margin-bottom: 12px;
}

.excel-table-form__cell {
  min-width: 0;
  min-height: 30px;
  box-sizing: border-box;
}

.excel-table-form__display {
  display: block;
  overflow: hidden;
  padding: 6px 0;
  color: #374151;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.excel-table-form__display--regions {
  color: #2563eb;
}

.excel-table-form__edit-box {
  display: none;
  gap: 4px;
  align-items: center;
  min-width: 0;
}

.excel-table-form__cell--editable:hover .excel-table-form__display,
.excel-table-form__cell--editing .excel-table-form__display {
  display: none;
}

.excel-table-form__cell--editable:hover .excel-table-form__edit-box,
.excel-table-form__cell--editing .excel-table-form__edit-box {
  display: flex;
}

.excel-table-form__cell--editing {
  box-shadow: inset 0 0 0 1px #409eff;
}

.excel-table-form__editor {
  flex: 1;
  min-width: 0;
}

.excel-table-form__date-picker {
  width: 100%;
}

.excel-table-form__number-input {
  width: 100%;
}

.excel-table-form__cell-actions {
  display: flex;
  flex: none;
  gap: 3px;
  align-items: center;
}

.excel-table-form ::v-deep .el-table {
  border-color: #b7c3d0;
  color: #1f2937;
}

.excel-table-form ::v-deep .el-table th.el-table__cell {
  padding: 9px 0;
  border-color: #aebdca;
  background: #e7f1e8;
  color: #254b2b;
  font-weight: 600;
}

.excel-table-form ::v-deep .el-table td.el-table__cell {
  height: 48px;
  padding: 5px 0;
  border-color: #c8d1da;
}

.excel-table-form ::v-deep .el-table--border::after,
.excel-table-form ::v-deep .el-table--group::after,
.excel-table-form ::v-deep .el-table::before {
  background-color: #aebdca;
}

.excel-table-form ::v-deep .el-table__row:hover > td.el-table__cell {
  background: #f8fbff !important;
}

.excel-table-form ::v-deep .el-input__inner {
  border-color: #9fb3c8;
  border-radius: 2px;
  background: #ffffff;
}

.excel-table-form ::v-deep .excel-table-form__cell:not(.excel-table-form__cell--editing) .el-input__inner {
  cursor: default;
}

.excel-table-form ::v-deep .excel-table-form__cell:not(.excel-table-form__cell--editing) .el-select .el-input.is-disabled .el-input__inner {
  border-color: #9fb3c8;
  background: #ffffff;
  color: #606266;
  cursor: default;
}

.excel-table-form ::v-deep .el-button--mini.is-circle {
  width: 28px;
  height: 28px;
  padding: 6px;
}

.excel-table-form ::v-deep .el-button + .el-button {
  margin-left: 0;
}
</style>
