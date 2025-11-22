import { Shape } from './Shape'
import { CANVAS } from './Config'

export class FrameSnapshot extends Shape {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    super()
    this.#canvas = document.createElement('canvas')
    this.#canvas.width = CANVAS.WIDTH
    this.#canvas.height = CANVAS.HEIGHT
    const context = this.#canvas.getContext('2d')
    context.drawImage(canvas, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  /**
   * @param canvas {HTMLCanvasElement}
   * @return {FrameSnapshot}
   */
  static saveSnapshot (canvas) {
    return new FrameSnapshot(canvas)
  }

  render (context) {
    context.drawImage(this.#canvas, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
