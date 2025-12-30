import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

const DURATION = 600

export class BackgroundEffect extends RenderObject {
  #lastImage: HTMLImageElement | null = null
  #currentImage: HTMLImageElement | null = null

  #alpha: number = 100

  constructor () {
    super()
  }

  async setImage(image: HTMLImageElement): Promise<void> {
    if (!this.#lastImage) {
      this.#lastImage = image
    } else {
      this.#lastImage = this.#currentImage
    }
    this.#currentImage = image
    this.cancelTransitions()
    await this.createTransition(0, 100, DURATION, 'easeOut', (value: number) => this.#alpha = value)
    this.#lastImage = this.#currentImage
  }

  render(context: CanvasRenderingContext2D): void {
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
