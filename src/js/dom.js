import { dev } from './dev'

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
