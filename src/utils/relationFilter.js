function relationLabelOf(node) {
  return node && node.edge && node.edge.label ? String(node.edge.label) : ''
}

function nodeSearchText(node) {
  return [node.name, node.subtitle, node.tag, relationLabelOf(node)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function isWithinDateRange(node, startDate, endDate) {
  if (!startDate && !endDate) {
    return true
  }

  if (!node.eventDate) {
    return false
  }

  if (startDate && node.eventDate < startDate) {
    return false
  }

  if (endDate && node.eventDate > endDate) {
    return false
  }

  return true
}

export function collectRelationOptions(root) {
  const labels = []
  const seen = Object.create(null)

  const walk = node => {
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

export function filterRelationshipTree(root, filters = {}) {
  if (!root) {
    return root
  }

  const maxDepth = Number(filters.maxDepth || 10)
  const keyword = String(filters.tagText || '').trim().toLowerCase()
  const startDate = filters.startDate || ''
  const endDate = filters.endDate || ''
  const relationTags = Array.isArray(filters.relationTags) ? filters.relationTags.filter(Boolean) : []

  const hasKeywordFilter = Boolean(keyword)
  const hasDateFilter = Boolean(startDate || endDate)
  const hasRelationFilter = relationTags.length > 0

  const cloneMatchingNode = (node, depth, isRoot, inheritedRelationMatched = false) => {
    if (!node || depth > maxDepth) {
      return null
    }

    const relationMatched = inheritedRelationMatched || relationTags.indexOf(node.tag) >= 0
    const children = (node.children || [])
      .map(child => cloneMatchingNode(child, depth + 1, false, relationMatched))
      .filter(Boolean)

    const matchesKeyword = !hasKeywordFilter || nodeSearchText(node).includes(keyword)
    const matchesDate = !hasDateFilter || isWithinDateRange(node, startDate, endDate)
    const matchesRelation = !hasRelationFilter || relationMatched
    const matchesSelf = matchesKeyword && matchesDate && matchesRelation

    if (!isRoot && !matchesSelf && children.length === 0) {
      return null
    }

    return Object.assign({}, node, {
      children
    })
  }

  return cloneMatchingNode(root, 1, true)
}

export function filterTreeByRelations(root, relationLabels) {
  const selectedLabels = new Set(relationLabels || [])
  if (!root || selectedLabels.size === 0) {
    return root
  }

  const cloneMatchingNode = (node, isRoot) => {
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
      children
    })
  }

  return cloneMatchingNode(root, true)
}
