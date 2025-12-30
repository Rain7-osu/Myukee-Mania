import { RenderObject } from './RenderObject'

export class FrameSnapshot extends RenderObject {
  #canvas: HTMLCanvasElement

  static WIDTH: number = 0
  static HEIGHT: number = 0

  static init (width: number, height: number): void {
    FrameSnapshot.WIDTH = width
    FrameSnapshot.HEIGHT = height
  }

  constructor (canvas?: HTMLCanvasElement) {
    super()
    this.#canvas = canvas
  }

  static saveSnapshot (canvas: HTMLCanvasElement | OffscreenCanvas): FrameSnapshot {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = FrameSnapshot.WIDTH
    offscreenCanvas.height = FrameSnapshot.HEIGHT
    const context = offscreenCanvas.getContext('2d')
    context.drawImage(canvas, 0, 0, FrameSnapshot.WIDTH, FrameSnapshot.HEIGHT)
    return new FrameSnapshot(canvas)
  }

  static createSnapshot (render: (context: CanvasRenderingContext2D) => void, width: number = FrameSnapshot.WIDTH, height: number = FrameSnapshot.HEIGHT): FrameSnapshot {
    const offscreenCanvas = FrameSnapshot.createOffscreenCanvas(render, width, height)
    return new FrameSnapshot(offscreenCanvas)
  }

  static createOffscreenCanvas (render: (context: CanvasRenderingContext2D) => void, width: number, height: number): HTMLCanvasElement {
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

  setStyle (dx: number, dy: number, dw: number, dh: number): void {
    this.#style = { dx, dy, dw, dh }
  }

  render (context: CanvasRenderingContext2D): void {
    const { dx, dy, dw, dh } = this.#style
    context.drawImage(this.#canvas, dx, dy, dw, dh)
  }
}
