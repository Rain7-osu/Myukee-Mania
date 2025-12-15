import { RenderObject } from './RenderObject'
import { CANVAS } from './Config'

export class SkipHeadEffect extends RenderObject {
  constructor () {
    super()
    this.clickArea = [CANVAS.WIDTH - 500, CANVAS.HEIGHT - 300, 500, 300]
  }

  render (context) {
    context.save()
    context.beginPath()
    context.moveTo(CANVAS.WIDTH, CANVAS.HEIGHT - 300)
    context.lineTo(CANVAS.WIDTH, CANVAS.HEIGHT)
    context.lineTo(CANVAS.WIDTH - 500, CANVAS.HEIGHT)
    context.closePath()
    context.fillStyle = 'rgba(173, 125, 21, 0.6)'
    context.fill()
    context.font = '64px 微软雅黑'
    context.fillStyle = '#fff'
    context.textBaseline = 'bottom'
    context.textAlign = 'right'
    context.fillText('Skip', CANVAS.WIDTH - 60, CANVAS.HEIGHT - 60)
    context.restore()
  }
}
