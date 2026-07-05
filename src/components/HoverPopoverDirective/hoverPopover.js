import Vue from 'vue'
import HoverPopoverContent from './HoverPopoverContent.vue'

const defaultOptions = {
  placement: 'right',
  gap: 10,
  hideDelay: 120,
  maxWidth: 320,
  rightEdgeThreshold: 40,
  className: '',
  disabled: false
}

const stateKey = '__hoverPopoverState__'

const normalizeBinding = binding => {
  const value = binding.value

  if (typeof value === 'string' || typeof value === 'number') {
    return {
      ...defaultOptions,
      content: String(value)
    }
  }

  if (!value || typeof value !== 'object') {
    return {
      ...defaultOptions,
      content: ''
    }
  }

  return {
    ...defaultOptions,
    ...value
  }
}

const createPopover = state => {
  const vm = new Vue({
    data() {
      return {
        options: state.options,
        visible: false
      }
    },
    render(h) {
      return h(HoverPopoverContent, {
        props: {
          options: this.options,
          visible: this.visible
        }
      })
    }
  })

  vm.$mount()

  const popover = vm.$el
  popover.addEventListener('mouseenter', state.clearHideTimer)
  popover.addEventListener('mouseleave', state.scheduleHide)
  document.body.appendChild(popover)
  state.vm = vm

  return popover
}

const setPosition = state => {
  const rect = state.el.getBoundingClientRect()
  const popover = state.popover
  const options = state.options
  const gap = Number(options.gap) || defaultOptions.gap
  const maxWidth = Number(options.maxWidth) || defaultOptions.maxWidth
  const rightEdgeThreshold = Number(options.rightEdgeThreshold) || defaultOptions.rightEdgeThreshold

  popover.style.maxWidth = maxWidth + 'px'
  popover.style.visibility = 'hidden'
  popover.style.display = 'block'

  const popoverRect = popover.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const preferredPlacement = options.placement
  const rightSpace = viewportWidth - rect.right
  const shouldShowLeft = preferredPlacement === 'left' ||
    (preferredPlacement === 'right' && (
      rightSpace < rightEdgeThreshold ||
      rightSpace < popoverRect.width + gap
    ))

  let left = rect.right + gap
  let top = rect.top + rect.height / 2 - popoverRect.height / 2

  if (shouldShowLeft) {
    left = rect.left - popoverRect.width - gap
  }

  if (preferredPlacement === 'bottom') {
    left = rect.left + rect.width / 2 - popoverRect.width / 2
    top = rect.bottom + gap
  }

  if (preferredPlacement === 'top') {
    left = rect.left + rect.width / 2 - popoverRect.width / 2
    top = rect.top - popoverRect.height - gap
  }

  left = Math.min(Math.max(gap, left), viewportWidth - popoverRect.width - gap)
  top = Math.min(Math.max(gap, top), viewportHeight - popoverRect.height - gap)

  popover.style.left = left + 'px'
  popover.style.top = top + 'px'
  popover.style.visibility = 'visible'
}

const showPopover = state => {
  if (state.options.disabled) {
    return
  }

  state.clearHideTimer()

  if (!state.popover) {
    state.popover = createPopover(state)
  }

  state.vm.options = state.options
  state.vm.visible = false

  Vue.nextTick(() => {
    if (!state.popover) {
      return
    }

    setPosition(state)

    window.requestAnimationFrame(() => {
      if (state.vm) {
        state.vm.visible = true
      }
    })
  })
}

const hidePopover = state => {
  if (!state.popover) {
    return
  }

  state.vm.visible = false
  state.popover.removeEventListener('mouseenter', state.clearHideTimer)
  state.popover.removeEventListener('mouseleave', state.scheduleHide)

  if (state.popover.parentNode) {
    state.popover.parentNode.removeChild(state.popover)
  }

  state.vm.$destroy()
  state.vm = null
  state.popover = null
}

const bindDirective = (el, binding) => {
  const state = {
    el,
    options: normalizeBinding(binding),
    popover: null,
    vm: null,
    hideTimer: null,
    show: null,
    scheduleHide: null,
    clearHideTimer: null,
    updatePosition: null
  }

  state.show = () => showPopover(state)
  state.clearHideTimer = () => {
    if (!state.hideTimer) {
      return
    }

    window.clearTimeout(state.hideTimer)
    state.hideTimer = null
  }
  state.scheduleHide = () => {
    state.clearHideTimer()
    state.hideTimer = window.setTimeout(() => hidePopover(state), state.options.hideDelay)
  }
  state.updatePosition = () => {
    if (state.popover) {
      setPosition(state)
    }
  }

  el.addEventListener('mouseenter', state.show)
  el.addEventListener('mouseleave', state.scheduleHide)
  window.addEventListener('scroll', state.updatePosition, true)
  window.addEventListener('resize', state.updatePosition)
  el[stateKey] = state
}

const unbindDirective = el => {
  const state = el[stateKey]

  if (!state) {
    return
  }

  el.removeEventListener('mouseenter', state.show)
  el.removeEventListener('mouseleave', state.scheduleHide)
  window.removeEventListener('scroll', state.updatePosition, true)
  window.removeEventListener('resize', state.updatePosition)
  state.clearHideTimer()
  hidePopover(state)
  delete el[stateKey]
}

const updateDirective = (el, binding) => {
  const state = el[stateKey]

  if (!state) {
    bindDirective(el, binding)
    return
  }

  state.options = normalizeBinding(binding)

  if (state.popover) {
    showPopover(state)
  }
}

export default {
  bind: bindDirective,
  update: updateDirective,
  componentUpdated: updateDirective,
  unbind: unbindDirective
}
