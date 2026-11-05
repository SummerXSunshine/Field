# AvatarInfoDisplay 头像信息展示

## 用途

用于展示人物、机构或对象摘要信息。组件使用 Element UI 的 el-row 和 el-col：

- 左侧展示头像。
- 右侧固定展示三项信息。
- 三项信息下方展示一行标签。
- 头像、信息项和标签的数据字段全部由 config 配置。
- 缺失数据统一显示 --。

组件使用 div 作为根节点，因为它是通用布局容器，不代表独立的文档章节。

## 基础用法

~~~vue
<template>
  <avatar-info-display
    :data="person"
    :config="displayConfig"
  />
</template>

<script>
import AvatarInfoDisplay from '@/components/AvatarInfoDisplay/AvatarInfoDisplay.vue'

export default {
  components: {
    AvatarInfoDisplay
  },
  data() {
    return {
      person: {
        avatar: '',
        name: '林知远',
        organization: '信息研判中心',
        position: '高级分析师',
        tags: [
          { id: 'status', name: '在职', type: 'success' },
          { id: 'ability', name: '领域专家', type: 'warning' }
        ]
      },
      displayConfig: {
        gutter: 24,
        bordered: true,
        avatar: {
          prop: 'avatar',
          span: 6,
          size: 96,
          shape: 'circle',
          fit: 'cover',
          fallback: '林'
        },
        contentSpan: 18,
        items: [
          {
            key: 'name',
            prop: 'name'
          },
          {
            key: 'organization',
            prop: 'organization'
          },
          {
            key: 'position',
            prop: 'position'
          }
        ],
        tags: {
          prop: 'tags',
          keyKey: 'id',
          labelKey: 'name',
          typeKey: 'type'
        }
      }
    }
  }
}
</script>
~~~

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| data | Object | {} | 业务数据 |
| config | Object | {} | 头像、信息项、标签和布局配置 |
| empty-text | String | -- | config 未设置 emptyText 时使用的占位文本 |
| loading | Boolean | false | 是否显示 Element UI loading 遮罩 |

## config 配置

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| gutter | Number | 24 | el-row 栅格间距 |
| bordered | Boolean | true | 是否显示外边框 |
| emptyText | String | -- | 空值占位文本 |
| avatar | Object | {} | 左侧头像配置 |
| contentSpan | Number | 18 | 右侧内容区域 el-col span |
| items | Array | [] | 右侧三项信息配置，最多读取三项 |
| tags | Object | {} | 标签行配置 |

## 头像配置

~~~js
{
  prop: 'avatar',
  span: 6,
  size: 96,
  shape: 'circle',
  fit: 'cover',
  fallback: '林'
}
~~~

| 字段 | 说明 |
| --- | --- |
| prop | 头像地址在 data 中的字段路径 |
| value | 固定头像地址或取值函数 |
| span | 左侧头像区域 el-col span |
| size | el-avatar 尺寸 |
| shape | circle 或 square |
| fit | 图片填充方式 |
| fallback | 没有头像时显示的文本，也可以是函数 |

fallback 函数：

~~~js
fallback(data) {
  return data.name ? data.name.slice(0, 1) : '--'
}
~~~

## 三项信息配置

items 最多读取三项。少于三项时，剩余位置显示 --。

~~~js
items: [
  {
    key: 'name',
    prop: 'name'
  },
  {
    key: 'organization',
    label: '单位',
    prop: 'organization'
  },
  {
    key: 'position',
    prop: 'position',
    formatter(value) {
      return '岗位：' + value
    }
  }
]
~~~

每一项支持：

| 字段 | 说明 |
| --- | --- |
| key | 唯一渲染键 |
| label | 可选的前置标签 |
| prop | 支持点路径的数据字段 |
| value | 固定值或 value(data, item) 取值函数 |
| formatter | formatter(rawValue, data, item) 格式化函数 |
| slot | 自定义插槽名称 |
| className | 附加样式类 |

三项默认样式：

1. 第一项字号较大、加粗。
2. 第二项使用普通正文样式。
3. 第三项使用较小的辅助文字样式。

## 标签配置

~~~js
tags: {
  label: '标签',
  prop: 'tags',
  keyKey: 'id',
  labelKey: 'name',
  typeKey: 'type',
  effect: 'light',
  size: 'small'
}
~~~

| 字段 | 说明 |
| --- | --- |
| label | 标签行前置文字 |
| prop | 标签数组在 data 中的字段路径 |
| items | 固定标签数组或 items(data, config) 函数 |
| keyKey | 标签唯一键字段 |
| labelKey | 标签文字字段 |
| typeKey | Element UI tag 类型字段 |
| type | 所有标签默认类型 |
| effect | 默认主题 |
| size | 默认尺寸 |
| hit | 默认是否描边 |
| color | 默认背景颜色 |

标签数据可以是字符串数组：

~~~js
tags: ['在职', '专家']
~~~

也可以是对象数组：

~~~js
tags: [
  {
    id: 'status',
    name: '在职',
    type: 'success'
  }
]
~~~

没有标签数据时，标签行显示 --。

## 空值规则

以下值显示为 --：

- null
- undefined
- 空字符串
- 只包含空格的字符串
- 空数组

数字 0 和布尔值 false 会正常显示。

信息项先检查原始值是否为空，非空时才调用 formatter，防止产生 undefined、null 等错误文本。

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| avatar | { src, config, data } | 自定义左侧头像 |
| info-item | { item, index, value, rawValue, data } | 三项信息默认插槽 |
| items 中配置的 slot | 同 info-item | 单独自定义某一项信息 |
| tags | { tags, config, data } | 自定义标签行 |

自定义第二项：

~~~js
{
  key: 'organization',
  prop: 'organization',
  slot: 'organization-info'
}
~~~

~~~vue
<template #organization-info="{ value }">
  <strong>{{ value }}</strong>
</template>
~~~

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| avatar-error | error | 头像加载失败时触发 |

## 响应式布局

桌面端默认：

- 头像区域 span 为 6。
- 内容区域 span 为 18。

移动端两个 el-col 的 xs 都是 24，因此头像和信息会自动上下排列。

## 关键逻辑

normalizedItems：

1. 读取 config.items 的前三项。
2. 固定生成三个展示位置。
3. 没有配置的信息项使用空配置。
4. 为每项补充稳定 key。

getRawValue：

1. 优先执行 value 函数。
2. 其次读取固定 value。
3. 最后根据 prop 从 data 中读取。

resolvedTags：

1. 读取 tags.items 或 tags.prop。
2. 同时兼容字符串和对象标签。
3. 根据 keyKey、labelKey 和 typeKey 映射到 el-tag。
4. 不修改外部标签数据。
