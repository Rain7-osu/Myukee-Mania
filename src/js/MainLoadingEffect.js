import { Shape } from './Shape.js'
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './Config.js'

export class MainLoadingEffect extends Shape {
  #rotate = 0

  #lastTiming = 0

  render (context) {
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    context.font = '28px'
    context.fillText('Loading...', 0, 0)
  }

  update() {
    const now = performance.now()
  }

  reset() {

  }
}
