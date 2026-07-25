const POSITION_STATE = '__elementPositionDirective__'

function getViewportPosition (el) {
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

function createState (el, callback) {
  const state = {
    callback,
    frameId: null,
    resizeObserver: null,
    update () {
      if (state.frameId !== null) return

      state.frameId = window.requestAnimationFrame(() => {
        state.frameId = null
        state.callback(getViewportPosition(el), el)
      })
    }
  }

  return state
}

function validateCallback (binding) {
  if (typeof binding.value !== 'function') {
    console.warn('[v-element-position] 指令值必须是一个方法。')
    return false
  }

  return true
}

export default {
  inserted (el, binding) {
    if (!validateCallback(binding)) return

    const state = createState(el, binding.value)
    el[POSITION_STATE] = state

    window.addEventListener('resize', state.update)
    window.addEventListener('scroll', state.update, true)

    if (typeof ResizeObserver !== 'undefined') {
      state.resizeObserver = new ResizeObserver(state.update)
      state.resizeObserver.observe(el)
    }

    state.update()
  },

  componentUpdated (el, binding) {
    const state = el[POSITION_STATE]
    if (!state || !validateCallback(binding)) return

    state.callback = binding.value
    state.update()
  },

  unbind (el) {
    const state = el[POSITION_STATE]
    if (!state) return

    window.removeEventListener('resize', state.update)
    window.removeEventListener('scroll', state.update, true)

    if (state.resizeObserver) {
      state.resizeObserver.disconnect()
    }

    if (state.frameId !== null) {
      window.cancelAnimationFrame(state.frameId)
    }

    delete el[POSITION_STATE]
  }
}
