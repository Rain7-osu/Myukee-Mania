import { RenderObject } from './RenderObject.js'
import { Skin } from './Skin.js'
import { CANVAS } from './Config.js'

const TRANSITION_DURATION = 500

/**
 * @typedef {Object} InnerStyle
 * @property {number} width
 * @property {number} maxWidth
 */

export class SettingsPanel extends RenderObject {
  /**
   * @param container {HTMLCanvasElement}
   */
  constructor (container) {
    super()
    this.#container = container
  }

  /**
   * @type {HTMLCanvasElement}
   */
  #container

  /**
   * @type {InnerStyle}
   */
  #innerStyle = {
    width: 0,
    maxWidth: Skin.config.settingsPanel.width,
  }

  /**
   * @return {number}
   */
  get width () {
    return this.#innerStyle.width
  }

  async show () {
    this.display = true
    this.cancelTransitions()
    await this.createTransition(this.#innerStyle.width, this.#innerStyle.maxWidth, TRANSITION_DURATION, 'easeOut', value => this.#innerStyle.width = value)
  }

  async hide () {
    if (!this.display) {
      return Promise.resolve()
    }
    this.cancelTransitions()
    await this.createTransition(this.#innerStyle.width, 0, TRANSITION_DURATION, 'easeOut', value => this.#innerStyle.width = value)
    this.display = false
  }

  render (context) {
    const { background } = Skin.config.settingsPanel
    context.fillStyle = background
    context.fillRect(0, 0, this.width, CANVAS.HEIGHT)
  }
}
