function relationLabelOf(node) {
  return node && node.edge && node.edge.label ? String(node.edge.label) : ''
}

export function collectRelationOptions(root) {
  const labels = []
  const seen = Object.create(null)

  function walk(node) {
    if (!node) {
      return
    }

    const label = relationLabelOf(node)
    if (label && !seen[label]) {
      seen[label] = true
      labels.push(label)
    }

    ;(node.children || []).forEach(walk)
  }

  walk(root)

  return labels
}

export function filterTreeByRelations(root, relationLabels) {
  const selectedLabels = new Set(relationLabels || [])
  if (!root || selectedLabels.size === 0) {
    return root
  }

  function cloneMatchingNode(node, isRoot) {
    if (!node) {
      return null
    }

    const children = (node.children || [])
      .map(child => cloneMatchingNode(child, false))
      .filter(Boolean)

    const matches = selectedLabels.has(relationLabelOf(node))
    if (!isRoot && !matches && children.length === 0) {
      return null
    }

    return Object.assign({}, node, {
      children: children
    })
  }

  return cloneMatchingNode(root, true)
}