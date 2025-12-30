import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

const DURATION = 600

export class BackgroundEffect extends RenderObject {
  private _lastImage: HTMLImageElement | null = null
  private _currentImage: HTMLImageElement | null = null

  private _alpha: number = 100

  constructor() {
    super()
  }

  async setImage(image: HTMLImageElement): Promise<void> {
    if (!this._lastImage) {
      this._lastImage = image
    } else {
      this._lastImage = this._currentImage
    }
    this._currentImage = image
    this.cancelTransitions()
    await this.createTransition<number>(0, 100, DURATION, 'easeOut', (value: number) => this._alpha = value)
    this._lastImage = this._currentImage
  }

  render(context: CanvasRenderingContext2D): void {
    if (this._lastImage !== this._currentImage && this._lastImage) {
      context.drawImage(this._lastImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    }
    if (this._currentImage) {
      context.globalAlpha = this._alpha / 100
      context.drawImage(this._currentImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
      context.globalAlpha = 1
    }
  }
}
