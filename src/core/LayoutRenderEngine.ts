import { RenderEngine } from './RenderEngine'
import { CANVAS } from './Config'

export class LayoutRenderEngine extends RenderEngine {
  constructor(canvas: HTMLCanvasElement) {
    super(canvas)
  }

  renderBackgroundImage(image: HTMLImageElement) {
    this.context.drawImage(image, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  renderRect(x: number, y: number, width: number, height: number, color: string) {
    this.context.fillStyle = color
    this.context.fillRect(x, y, width, height)
  }

  renderPositionLine() {
    this.context.fillStyle = 'red'
    this.context.fillRect(CANVAS.WIDTH / 2 - 1, 0, 2, CANVAS.HEIGHT)
    this.context.fillRect(0, CANVAS.HEIGHT / 2 - 1, CANVAS.WIDTH, 2)
  }

  renderVerticalLine(x) {
    this.context.fillStyle = 'red'
    this.context.fillRect(x - 1, 0, 2, CANVAS.HEIGHT)
  }

  renderHorizontalLine(y) {
    this.context.fillStyle = 'red'
    this.context.fillRect(0, y - 1, CANVAS.WIDTH, 2)
  }

  renderGridLine() {
    for (let i = 0; i < CANVAS.WIDTH; i += 100) {
      this.renderVerticalLine(i)
    }
    for (let i = 0; i < CANVAS.HEIGHT; i += 100) {
      this.renderHorizontalLine(i)
    }
  }
}
