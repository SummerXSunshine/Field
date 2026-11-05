// Only children of selected, currently visible parents can enter the next level.
export function deriveLevels(data, value, fields) {
  const options = []
  const selected = []
  let candidates = data
  for (let level = 0; level < 4; level += 1) {
    options.push(candidates)
    const requested = new Set(Array.isArray(value[level]) ? value[level] : [])
    const active = candidates.filter(item => requested.has(item[fields.id]))
    selected.push(active.map(item => item[fields.id]))
    candidates = active.reduce((children, item) => children.concat(item[fields.children] || []), [])
  }
  return { options, selected }
}
