const STATE_KEY = '__hoverPopupDirective__'

function getPosition (el) {
  const rect = el.getBoundingClientRect()

  return {
    x: rect.left,
    y: rect.top,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height
  }
}

function normalizeBinding (value) {
  if (typeof value === 'function') {
    return {
      handler: value,
      params: undefined
    }
  }

  if (value && typeof value === 'object' && typeof value.handler === 'function') {
    return {
      handler: value.handler,
      params: value.params
    }
  }

  return null
}

function warnInvalidBinding () {
  console.warn(
    '[v-hover-popup] ???????????? handler ??? params ??????'
  )
}

function bindDirective (el, binding) {
  const options = normalizeBinding(binding.value)

  if (!options) {
    warnInvalidBinding()
    return
  }

  const state = {
    handler: options.handler,
    params: options.params,
    visible: false,
    frameId: null,
    emit: null,
    show: null,
    hide: null
  }

  state.emit = () => {
    if (state.frameId !== null) return

    state.frameId = window.requestAnimationFrame(() => {
      state.frameId = null
      state.handler({
        visible: state.visible,
        position: getPosition(el),
        params: state.params
      })
    })
  }

  state.show = () => {
    state.visible = true
    state.emit()
  }

  state.hide = () => {
    state.visible = false
    state.emit()
  }

  el.addEventListener('mouseenter', state.show)
  el.addEventListener('mouseleave', state.hide)
  window.addEventListener('scroll', state.emit, true)
  window.addEventListener('resize', state.emit)
  el[STATE_KEY] = state
}

function updateDirective (el, binding) {
  const state = el[STATE_KEY]
  const options = normalizeBinding(binding.value)

  if (!state) {
    bindDirective(el, binding)
    return
  }

  if (!options) {
    warnInvalidBinding()
    return
  }

  state.handler = options.handler
  state.params = options.params

  if (state.visible) {
    state.emit()
  }
}

function unbindDirective (el) {
  const state = el[STATE_KEY]
  if (!state) return

  el.removeEventListener('mouseenter', state.show)
  el.removeEventListener('mouseleave', state.hide)
  window.removeEventListener('scroll', state.emit, true)
  window.removeEventListener('resize', state.emit)

  if (state.frameId !== null) {
    window.cancelAnimationFrame(state.frameId)
  }

  delete el[STATE_KEY]
}

export default {
  bind: bindDirective,
  update: updateDirective,
  unbind: unbindDirective
}
