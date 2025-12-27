import { RenderObject } from './RenderObject'
import { CANVAS, px, py } from './Config'

export class SkipHeadEffect extends RenderObject {
  constructor () {
    super()
    this.clickArea = [CANVAS.WIDTH - px(500), CANVAS.HEIGHT - py(300), px(500), py(300)]
  }

  render (context) {
    context.save()
    context.beginPath()
    context.moveTo(CANVAS.WIDTH, CANVAS.HEIGHT - py(300))
    context.lineTo(CANVAS.WIDTH, CANVAS.HEIGHT)
    context.lineTo(CANVAS.WIDTH - px(500), CANVAS.HEIGHT)
    context.closePath()
    context.fillStyle = 'rgba(173, 125, 21, 0.6)'
    context.fill()
    context.font = `${py(64)}px 微软雅黑`
    context.fillStyle = 'rgb(255,255,255)'
    context.textBaseline = 'bottom'
    context.textAlign = 'right'
    context.fillText('Skip', CANVAS.WIDTH - px(60), CANVAS.HEIGHT - py(60))
    context.restore()
  }
}
