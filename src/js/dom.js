import { warn } from './dev'

/**
 * @param time {number}
 * @return {Promise<void>}
 */
async function sleep (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

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

export async function enterFullscreen () {
  try {
    if (!isFullscreen()) {
      await document.documentElement.requestFullscreen({
        navigationUI: 'hide',
      })
    }
  } catch (err) {
    warn(err)
  }
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
  const listener = (e) => {
    e.stopPropagation()
    eventHandler(isFullscreen())
  }
  document.addEventListener('fullscreenchange', listener)

  return () => {
    document.removeEventListener('fullscreenchange', listener)
  }
}
