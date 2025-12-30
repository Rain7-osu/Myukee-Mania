import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

export class MainLoadingEffect extends RenderObject {
  private _rotate = 0

  private _lastTiming = 0

  render (context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    context.font = '28px Torus'
    context.fillText('Loading...', 0, 0)
  }

  update() {
    const now = performance.now()
  }

  reset() {

  }
}
