/**
 * @typedef {Object} SettingsValue
 * @property {number} backgroundDark
 * @property {number} speed
 * @property {boolean} hideObjects
 */

export class Settings {
  /**
   * @private
   * @type {SettingsValue}
   */
  #value;

  constructor() {
    this.#value = {
      backgroundDark: 80,
      speed: 32,
      hideObjects: false,
    };
  }

  /**
   * @template {keyof SettingsValue} T
   * @param {T} key
   * @returns {SettingsValue[T]}
   */
  get(key) {
    return this.#value[key];
  }

  /**
   * @template {keyof SettingsValue} T
   * @param {T} key
   * @param {SettingsValue[T]} value
   */
  set(key, value) {
    this.#value[key] = value;
  }
}
