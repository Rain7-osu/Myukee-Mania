import { KeyCode } from './KeyCode'
import { DEFAULT_SPEED } from './Config'

/**
 * @typedef {Object} KeyBinds
 * @property {Record<number, string>} keys4
 * @property {Record<number, string>} keys5
 * @property {Record<number, string>} keys6
 * @property {Record<number, string>} keys7
 * @property {Record<number, string>} keys8
 */

/**
 * @typedef {Object} SettingsValue
 * @property {number} backgroundDark
 * @property {number} speed
 * @property {boolean} hideObjects
 * @property {KeyBinds} maniaKeyBinds
 */

export class Settings {
  /**
   * @private
   * @type {SettingsValue}
   */
  #value

  constructor () {
    this.#value = {
      backgroundDark: 80,
      speed: DEFAULT_SPEED,
      hideObjects: false,
      maniaKeyBinds: {
        keys4: {
          0: KeyCode.D,
          1: KeyCode.F,
          2: KeyCode.J,
          3: KeyCode.K,
        },
        keys5: {
          0: KeyCode.D,
          1: KeyCode.F,
          2: KeyCode.SPACE,
          3: KeyCode.J,
          4: KeyCode.K,
        },
        keys6: {
          0: KeyCode.S,
          1: KeyCode.D,
          2: KeyCode.F,
          3: KeyCode.J,
          4: KeyCode.K,
          5: KeyCode.L,
        },
        keys7: {
          0: KeyCode.S,
          1: KeyCode.D,
          2: KeyCode.F,
          3: KeyCode.SPACE,
          4: KeyCode.J,
          5: KeyCode.K,
          6: KeyCode.L,
        },
        keys8: {
          0: KeyCode.S,
          1: KeyCode.D,
          2: KeyCode.F,
          3: KeyCode.SPACE,
          4: KeyCode.J,
          5: KeyCode.K,
          6: KeyCode.L,
          7: KeyCode.Semicolon,
        },
      },
    }
  }

  /**
   * @template {keyof SettingsValue} T
   * @param {T} key
   * @returns {SettingsValue[T]}
   */
  get (key) {
    return this.#value[key]
  }

  /**
   * @template {keyof SettingsValue} T
   * @param {T} key
   * @param {SettingsValue[T]} value
   */
  set (key, value) {
    this.#value[key] = value
  }
}
