# ConfigurableInfoDisplay 配置化文本信息展示

## 组件用途

ConfigurableInfoDisplay 是一个纯文本信息展示组件。组件只接收业务数据 data 和展示配置 config，不绑定姓名、单位、电话等具体业务字段。

主要能力：

1. 根据 config.fields 动态展示文本字段。
2. 每个字段直接通过 span 控制 el-col 宽度。
3. span 为 24 时一行一列，span 为 12 时一行两列。
4. labelWidth 在顶层 config 中统一配置。
5. 支持嵌套路径、固定值、函数取值和 formatter。
6. 数据缺失时统一显示 --。
7. 数字 0 和布尔值 false 会正常展示。

## 基础用法

~~~vue
<template>
  <configurable-info-display
    :data="detailData"
    :config="displayConfig"
  />
</template>

<script>
import ConfigurableInfoDisplay from '@/components/ConfigurableInfoDisplay/ConfigurableInfoDisplay.vue'

export default {
  components: {
    ConfigurableInfoDisplay
  },
  data() {
    return {
      detailData: {
        name: '林知远',
        organization: '信息研判中心',
        contact: {
          phone: '138 0000 0000',
          email: ''
        },
        projectCount: 0
      },
      displayConfig: {
        emptyText: '--',
        labelWidth: 96,
        fields: [
          {
            key: 'name',
            label: '姓名',
            prop: 'name',
            span: 12
          },
          {
            key: 'organization',
            label: '所属单位',
            prop: 'organization',
            span: 12
          },
          {
            key: 'phone',
            label: '联系电话',
            prop: 'contact.phone',
            span: 12
          },
          {
            key: 'email',
            label: '电子邮箱',
            prop: 'contact.email',
            span: 12
          },
          {
            key: 'project-count',
            label: '项目数量',
            prop: 'projectCount',
            span: 24,
            formatter: value => value + ' 个'
          }
        ]
      }
    }
  }
}
</script>
~~~

contact.email 是空字符串，所以展示 --；projectCount 等于 0，因此展示 0 个。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | Object | {} | 被读取的业务数据 |
| config | Object | {} | 布局和字段配置 |
| empty-text | String | -- | config 未配置 emptyText 时使用的占位文本 |
| loading | Boolean | false | 是否显示 Element UI loading 遮罩 |

## config 配置

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| fields | Array | [] | 文本字段配置列表 |
| labelWidth | Number/String | 未设置时使用样式默认值 96px | 所有字段统一使用的标签宽度 |
| emptyText | String | -- | 无数据时的占位文本 |
| gutter | Number | 20 | el-row 栅格间距，必须是非负数 |
| bordered | Boolean | true | 是否显示组件边框 |

labelWidth 只能在 config 中统一配置：

~~~js
{
  labelWidth: 120,
  fields: [...]
}
~~~

也支持带单位的字符串：

~~~js
{
  labelWidth: '8em',
  fields: [...]
}
~~~

## fields 字段项

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| key | String/Number | 循环渲染键，建议始终填写 |
| label | String | 字段名称 |
| prop | String | 从 data 中读取的字段路径，支持 contact.phone |
| span | Number | 直接传给当前字段 el-col 的 span |
| value | Any/Function | 固定值或计算函数，优先级高于 prop |
| formatter | Function | 格式化非空值 |
| hidden | Boolean | true 时隐藏字段 |
| className | String/Object/Array | 字段容器附加样式 |
| slot | String | 单独指定字段值插槽 |

建议每项提供唯一 key。未提供时，组件依次使用 prop 或字段序号生成 key。

## 一列与两列

组件不再提供 columns 配置，也不会计算或修正 span。

一列布局时，每个字段配置 span 为 24：

~~~js
{
  fields: [
    {
      key: 'name',
      label: '姓名',
      prop: 'name',
      span: 24
    },
    {
      key: 'phone',
      label: '联系电话',
      prop: 'phone',
      span: 24
    }
  ]
}
~~~

两列布局时，每个字段配置 span 为 12：

~~~js
{
  fields: [
    {
      key: 'name',
      label: '姓名',
      prop: 'name',
      span: 12
    },
    {
      key: 'phone',
      label: '联系电话',
      prop: 'phone',
      span: 12
    }
  ]
}
~~~

一个字段需要单独占满整行时，只需要把该字段的 span 设置为 24：

~~~js
{
  key: 'description',
  label: '说明',
  prop: 'description',
  span: 24
}
~~~

组件模板直接读取：

~~~vue
<el-col
  v-for="item in visibleFields"
  :key="item.key"
  :span="item.span"
  :xs="24"
>
~~~

移动端 xs 固定为 24，因此手机宽度下会自动单列展示。

## 取值规则

每个字段按照以下顺序取值：

1. 如果 value 是函数，调用 value(data, item)。
2. 如果显式配置了 value，直接使用该值。
3. 否则根据 prop 从 data 中读取。
4. prop 支持点分隔的嵌套路径。
5. 原始值为空时直接返回 emptyText，不调用 formatter。
6. 原始值非空且存在 formatter 时，调用 formatter(rawValue, data, item)。
7. formatter 返回空值时仍显示 emptyText。

函数取值示例：

~~~js
{
  key: 'full-name',
  label: '姓名',
  span: 12,
  value(data) {
    return data.firstName + data.lastName
  }
}
~~~

格式化示例：

~~~js
{
  key: 'amount',
  label: '金额',
  prop: 'amount',
  span: 12,
  formatter(value) {
    return '¥' + Number(value).toFixed(2)
  }
}
~~~

## 空值规则

以下值展示为 --：

- null
- undefined
- 空字符串
- 只包含空格的字符串
- 空数组

以下值是有效数据：

- 数字 0
- 布尔值 false
- 非空数组
- 非空对象

如果 config.fields 为空或没有可见字段，整个组件显示 --。

## Slots

默认字段值插槽：

~~~vue
<configurable-info-display
  :data="detailData"
  :config="displayConfig"
>
  <template #field-value="{ value, item, rawValue, data }">
    <span>{{ value }}</span>
  </template>
</configurable-info-display>
~~~

单独配置插槽：

~~~js
{
  key: 'phone',
  label: '联系电话',
  prop: 'contact.phone',
  span: 12,
  slot: 'phone-value'
}
~~~

~~~vue
<template #phone-value="{ value }">
  <el-link type="primary">{{ value }}</el-link>
</template>
~~~

插槽参数：

| 参数 | 说明 |
| --- | --- |
| item | 当前字段配置 |
| value | 经过空值处理和 formatter 后的展示值 |
| rawValue | 未格式化的原始值 |
| data | 完整业务数据 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| field-click | { item, value, data } | 点击字段时触发，value 是原始值 |

## 关键实现说明

visibleFields：

1. 判断 config.fields 是否为数组。
2. 过滤 hidden 为 true 的字段。
3. 为每个字段补充稳定 key。
4. 不修改外部传入的 config。

getRawValue：

1. 优先执行 value 函数。
2. 其次读取固定 value。
3. 最后按照 prop 路径从 data 中读取。

getDisplayValue：

1. 先检查原始值是否为空。
2. 空值直接返回 --。
3. 非空值才调用 formatter。
4. formatter 结果再次进行空值检查。

布局处理：

1. el-col 的 span 直接读取 item.span。
2. 组件不再包含 columns 和 normalizeSpan。
3. label 宽度只读取 config.labelWidth。
4. span 的合法性由 Element UI el-col 自身处理。

## 组件状态

- 默认状态：按照字段配置正常展示。
- 加载状态：loading 为 true 时显示遮罩。
- 字段空值状态：当前字段展示 --。
- 配置为空状态：组件中央展示 --。
- 隐藏状态：字段 hidden 为 true 时不渲染。
