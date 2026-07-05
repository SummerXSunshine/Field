# ConfigurableElementForm

## 用途

`ConfigurableElementForm` 是一个基于 Element UI 的 Vue 2 可配置表单组件。它负责把字段配置渲染成 `el-form`、`el-row`、`el-col` 和对应的 Element UI 输入组件，适合在 demo、低代码配置页或动态表单场景中复用。

## Props

- `value`：表单数据对象，用作 Vue 2 `v-model`。
- `fields`：字段配置数组。组件会读取 `prop`、`label`、`type`、`required`、`visible`、`span`、`optionKey`、`optionsText` 或 `options`。
- `config`：表单配置对象。支持 `labelWidth`、`labelPosition`、`size`、`gutter`、`inline`、`disabled`、`showActions`。
- `optionsData`：选择器选项对象。字段可通过 `optionKey` 指向其中一组选项；如果没有 `optionKey`，组件会尝试用字段 `prop` 读取。
- `showModelPreview`：是否展示当前表单数据预览。

## Events

- `input`：表单数据变化时触发，用于 `v-model`。
- `update:model`：表单数据变化时同步触发，方便非 `v-model` 场景使用。
- `submit`：点击提交且 Element UI 表单校验通过后触发，参数为当前表单数据。
- `reset`：点击默认重置按钮时触发，由父组件决定如何重置数据。

## Slots

- `field-${prop}`：按字段名覆盖单个表单项内容。插槽参数包含 `field` 和 `model`。
- `actions`：覆盖底部按钮。插槽参数包含 `validate` 和 `reset` 方法。

## 关键逻辑说明

- `visibleFields` 会过滤 `visible === false` 或缺少 `prop` 的字段，避免在模板中同时使用 `v-if` 和 `v-for`。
- `formRules` 根据字段的 `required` 动态生成 Element UI 校验规则，选择器和日期使用 `change` 触发，其余字段使用 `blur`。
- `normalizedSpan` 把字段 `span` 限制在 `1` 到 `24`，然后传给 `el-col`，避免非法配置破坏栅格布局。
- `fieldComponent` 根据字段 `type` 映射到 Element UI 组件，例如 `input` 到 `el-input`，`date` 到 `el-date-picker`。
- `fieldAttrs` 为不同类型生成对应属性，例如 textarea 的 `rows`、date 的 `valueFormat`、number 的 `controlsPosition`。
- `fieldOptions` 支持多种选项来源，优先级为字段内 `options`、外部 `optionsData[optionKey]`、外部 `optionsData[prop]`，最后兼容英文逗号分隔 `optionsText`。
- `ensureModelKeys` 会在字段配置变化后补齐缺失数据键，保证新增字段可以立刻编辑。
- `validate` 调用 Element UI 表单校验，通过后触发 `submit`，组件本身不直接处理业务提交逻辑。

## 使用示例

```vue
<configurable-element-form
  v-model="formModel"
  :fields="fields"
  :config="formConfig"
  :options-data="selectOptions"
  show-model-preview
  @submit="handleSubmit"
  @reset="resetFormModel"
/>
```

## 验证说明

组件随项目通过 `npm run build` 验证。父组件需要先注册 Element UI，本项目在 `src/main.js` 中全量注册。
