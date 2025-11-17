import { Shape } from './Shape'
import { CANVAS } from './Config'

export class MainLoadingEffect extends Shape {
  #rotate = 0

  #lastTiming = 0

  render (context) {
    context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
    context.font = '28px 微软雅黑'
    context.fillText('Loading...', 0, 0)
  }

  update() {
    const now = performance.now()
  }

  reset() {

  }
}
