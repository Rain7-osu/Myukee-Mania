import { Shape } from './Shape'
import { CANVAS } from './Config'

export class BackgroundEffect extends Shape {
  /**
   * @type {HTMLImageElement | null}
   */
  #lastImage = null
  /**
   * @type {HTMLImageElement | null}
   */
  #currentImage = null

  #alpha = 100

  constructor () {
    super()
  }

  /**
   * @param image {HTMLImageElement}
   */
  async setImage (image) {
    if (!this.#lastImage) {
      this.#lastImage = image
    } else {
      this.#lastImage = this.#currentImage
    }
    this.#currentImage = image
    this.cancelTransitions()
    await this.createTransitionPromisify(0, 100, 300, 'easeOut', (value) => this.#alpha = value)
    this.#lastImage = this.#currentImage
  }

  render (context) {
    if (this.#lastImage !== this.#currentImage && this.#lastImage) {
      context.drawImage(this.#lastImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    }
    if (this.#currentImage) {
      context.globalAlpha = this.#alpha / 100
      context.drawImage(this.#currentImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
      context.globalAlpha = 1
    }
  }
}
