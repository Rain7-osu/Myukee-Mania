import { RenderEngine } from './RenderEngine'
import { CANVAS } from './Config'

export class LayoutRenderEngine extends RenderEngine {
  /**
   * @public
   * @constructor
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    super(canvas)
  }

  /**
   * @param image {HTMLImageElement}
   */
  renderBackgroundImage (image) {
    this.context.drawImage(image, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  /**
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   * @param color {string}
   */
  renderRect (x, y, width, height, color) {
    this.context.fillStyle = color
    this.context.fillRect(x, y, width, height)
  }

  renderPositionLine () {
    this.context.fillStyle = 'red'
    this.context.fillRect(CANVAS.WIDTH / 2 - 1, 0, 2, CANVAS.HEIGHT)
    this.context.fillRect(0, CANVAS.HEIGHT / 2 - 1, CANVAS.WIDTH, 2)
  }

  renderVerticalLine (x) {
    this.context.fillStyle = 'red'
    this.context.fillRect(x, 0, 2, CANVAS.HEIGHT)
  }

  renderHorizontalLine (y) {
    this.context.fillStyle = 'red'
    this.context.fillRect(0, y, CANVAS.WIDTH, 2)
  }

  renderGridLine () {
    for (let i = 0; i < CANVAS.WIDTH; i += 100) {
      this.renderVerticalLine(i)
    }
    for (let i = 0; i < CANVAS.HEIGHT; i += 100) {
      this.renderHorizontalLine(i)
    }
  }
}
