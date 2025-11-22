/**
 * @param id {string}
 * @return {HTMLElement}
 */
export function $ (id) {
  return document.getElementById(id)
}

/**
 * @param btnId {string}
 * @param handler {Function}
 */
export function bindClick (btnId, handler) {
  $(btnId).addEventListener('click', handler)
}

export function enterFullscreen () {
  return document.documentElement.requestFullscreen({
    navigationUI: 'hide',
  })
}

export function exitFullscreen () {
  return document.exitFullscreen()
}

export function isFullscreen () {
  return !!document.fullscreenElement
}

/**
 * @param eventHandler {function (fullscreen: boolean): void}
 */
export function listenFullscreenChange (eventHandler) {
  const listener = () => {
    eventHandler(isFullscreen())
  }
  document.addEventListener('fullscreenchange', listener)

  return () => {
    document.removeEventListener('fullscreenchange', listener)
  }
}
