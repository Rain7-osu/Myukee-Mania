import { BaseButton } from './BaseButton'

/**
 * @typedef {Pick<ButtonStyle, 'left' | 'top' | 'width' | 'height'>} ModButtonConfig
 * @property {Mod | Mod[]} mod
 * @property {string | string[]} description
 * @property {CanvasImageSource | CanvasImageSource[]} backgroundImage
 */

export class ModButton extends BaseButton {
  /**
   * @type {Mod | Mod[]}
   */
  #mod

  /**
   * @type {string | string[]}
   */
  #description

  /**
   * @type {CanvasImageSource | CanvasImageSource[]}
   */
  #backgroundImage

  /**
   * @type {null | Mod}
   */
  #currentValue

  #currentIndex = 0

  /**
   * @param container {HTMLCanvasElement}
   * @param config {ModButtonConfig}
   */
  constructor (container, config) {
    const { mod, description, backgroundImage, ...style } = config
    super(container, style)
    this.#description = description
    this.#mod = mod
    this.#backgroundImage = backgroundImage
    this.#currentValue = null
    this.setStyle({
      backgroundImage: Array.isArray(backgroundImage) ? backgroundImage[0] : backgroundImage,
    })
  }

  registerEvents (eventMap) {
    const valueList = [null, ...(Array.isArray(this.#mod) ? this.#mod : [this.#mod])]
    super.registerEvents({
      onClick: () => {
        this.#currentIndex += 1
        this.#currentIndex %= valueList.length
        this.#currentValue = valueList[this.#currentIndex]
        this._updateState()
        eventMap.onClick?.()
      },
    })
  }

  _updateState () {
    /** @type {CanvasImageSource[]} */
    const bg = Array.isArray(this.#backgroundImage) ? this.#backgroundImage : [this.#backgroundImage]
    const bgList = [bg[0], ...bg]
    this.setStyle({
      backgroundImage: bgList[this.#currentIndex],
    })
    if (this.#currentValue) {
      this.setStyle({
        rotate: Math.PI / 24,
      })
    } else {
      this.setStyle({ rotate: 0 })
    }
  }

  /**
   * @param {Mod | null} mod
   */
  setValue (mod) {
    /** @type {Mod[]} */
    const valueList = [null, ...(Array.isArray(this.#mod) ? this.#mod : [this.#mod])]
    let index = valueList.indexOf(mod)
    index = index < 0 ? index + valueList.length : index
    index %= valueList.length
    this.#currentValue = mod
    this.#currentIndex = index
    this._updateState()
  }

  /**
   * @return {Mod|null}
   */
  get value () {
    return this.#currentValue
  }

  get mod () {
    return this.#mod
  }
}
