import { Shape } from './Shape'
import { CANVAS } from './Config'

export class FrameSnapshot extends Shape {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  /**
   * @param canvas {HTMLCanvasElement?}
   */
  constructor (canvas) {
    super()
    this.#canvas = canvas
  }

  /**
   * @param canvas {HTMLCanvasElement | OffscreenCanvas}
   * @return {FrameSnapshot}
   */
  static saveSnapshot (canvas) {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = CANVAS.WIDTH
    offscreenCanvas.height = CANVAS.HEIGHT
    const context = offscreenCanvas.getContext('2d')
    context.drawImage(canvas, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    return new FrameSnapshot(canvas)
  }

  /**
   * @param render {(context: CanvasRenderingContext2D) => void}
   * @return FrameSnapshot
   */
  static createSnapshot (render) {
    const offscreenCanvas = document.createElement('canvas')
    const context = offscreenCanvas.getContext('2d')
    offscreenCanvas.width = CANVAS.WIDTH
    offscreenCanvas.height = CANVAS.HEIGHT
    render(context)
    return new FrameSnapshot(offscreenCanvas)
  }

  #style = {
    dx: 0,
    dy: 0,
    dw: CANVAS.WIDTH,
    dh: CANVAS.HEIGHT,
  }

  /**
   * @param dx {number}
   * @param dy {number}
   * @param dw {number}
   * @param dh {number}
   */
  setStyle (dx, dy, dw, dh) {
    this.#style = { dx, dy, dw, dh }
  }

  render (context) {
    const { dx, dy, dw, dh } = this.#style
    context.drawImage(this.#canvas, dx, dy, dw, dh)
  }
}
