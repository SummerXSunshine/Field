const indentBlock = (text, spaces) => {
  const padding = ' '.repeat(spaces)

  return String(text)
    .split('\n')
    .map((line, index) => (index === 0 ? line : padding + line))
    .join('\n')
}

/**
 * 生成组件用法的 Vue 2 SFC 示例代码。
 * 关闭 script 标签使用字符串拼接，避免本文件所在 SFC 解析出错。
 *
 * @param {Object} options
 * @param {String} options.tag 模板中使用的标签名，如 base-form
 * @param {String} options.componentName 组件注册名，如 BaseForm
 * @param {String} options.importPath 组件引入路径
 * @param {Array<String>} [options.attrs] 模板属性行，如 ['v-model="formModel"']
 * @param {Object} [options.data] data() 中返回的数据
 * @param {Array<String>} [options.methods] methods 中的方法源码行，每行会自动缩进
 * @returns {String}
 */
export function buildSfcCode({
  tag,
  componentName,
  importPath,
  attrs = [],
  data = {},
  methods = []
}) {
  const lines = ['<template>', '  <' + tag]

  attrs.forEach(attr => {
    lines.push('    ' + attr)
  })

  lines.push('  />')
  lines.push('</template>')
  lines.push('')
  lines.push('<' + 'script>')
  lines.push("import " + componentName + " from '" + importPath + "'")
  lines.push('')
  lines.push('export default {')
  lines.push('  components: {')
  lines.push('    ' + componentName)
  lines.push('  },')

  const bodySections = []
  const dataKeys = Object.keys(data || {})

  if (dataKeys.length) {
    const dataLines = ['  data() {', '    return {']

    dataKeys.forEach((key, index) => {
      const isLast = index === dataKeys.length - 1
      const valueText = indentBlock(JSON.stringify(data[key], null, 2), 6)

      dataLines.push('      ' + key + ': ' + valueText + (isLast ? '' : ','))
    })

    dataLines.push('    }')
    dataLines.push('  }')
    bodySections.push(dataLines.join('\n'))
  }

  if (Array.isArray(methods) && methods.length) {
    const methodLines = ['  methods: {']

    methods.forEach(line => {
      methodLines.push('    ' + line)
    })

    methodLines.push('  }')
    bodySections.push(methodLines.join('\n'))
  }

  bodySections.forEach((section, index) => {
    const isLast = index === bodySections.length - 1

    lines.push(section + (isLast ? '' : ','))
  })

  lines.push('}')
  lines.push('<' + '/script>')

  return lines.join('\n')
}

export default buildSfcCode
