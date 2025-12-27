import { RenderObject } from './RenderObject'

export class FrameSnapshot extends RenderObject {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  static WIDTH = 0
  static HEIGHT = 0

  /**
   * @param width {number}
   * @param height {number}
   */
  static init (width, height) {
    FrameSnapshot.WIDTH = width
    FrameSnapshot.HEIGHT = height
  }

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
    offscreenCanvas.width = FrameSnapshot.WIDTH
    offscreenCanvas.height = FrameSnapshot.HEIGHT
    const context = offscreenCanvas.getContext('2d')
    context.drawImage(canvas, 0, 0, FrameSnapshot.WIDTH, FrameSnapshot.HEIGHT)
    return new FrameSnapshot(canvas)
  }

  /**
   * @param render {(context: CanvasRenderingContext2D) => void}
   * @param width {number}
   * @param height {number}
   * @return FrameSnapshot
   */
  static createSnapshot (render, width = FrameSnapshot.WIDTH, height = FrameSnapshot.HEIGHT) {
    const offscreenCanvas = FrameSnapshot.createOffscreenCanvas(render, width, height)
    return new FrameSnapshot(offscreenCanvas)
  }

  /**
   * @param render {(context: CanvasRenderingContext2D) => void}
   * @param width {number}
   * @param height {number}
   * @return {HTMLCanvasElement}
   */
  static createOffscreenCanvas (render, width, height) {
    const offscreenCanvas = document.createElement('canvas')
    const context = offscreenCanvas.getContext('2d')
    offscreenCanvas.width = width
    offscreenCanvas.height = height
    render(context)
    return offscreenCanvas
  }

  #style = {
    dx: 0,
    dy: 0,
    dw: FrameSnapshot.WIDTH,
    dh: FrameSnapshot.HEIGHT,
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
