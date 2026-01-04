import { RenderObject } from '../Core/RenderObject';
import { CANVAS, px, py } from '../Configs/Config';
import { safeValue } from '../_common/safe-value';
import { ActiveEffect } from '../Core/ActiveEffect';

const CENTER_RIGHT = 300
const CENTER_BOTTOM = 300
const BACKGROUND_COLOR = 'rgb(0, 0, 0, 0.3)'
const SHADOW_BLUR = 15
const BORDER_COLOR = 'rgba(159,237,255,0.5)'
const SHADOW_COLOR = 'rgba(82,190,255,0.75)'
const POSITIVE_COLOR = 'rgb(255, 255, 255, 1)'
const NEGATIVE_COLOR = 'rgb(255, 255, 255, 0.25)'
const FONT_SIZE = 28
const MASTER_RADIUS = 120
const RING_WIDTH = 12
const RING_OUTER_RADIUS = MASTER_RADIUS - RING_WIDTH * 2
const HIDE_AFTER_DELAY = 800
const TRANSITION_TIME = 300

interface VolumeStyle {
  centerX: number
  centerY: number
  radius: number
  ringRadius: number
  font: string
}

const MIN_VOLUME = 0
const MAX_VOLUME = 100

export class VolumeEffect extends RenderObject {
  private readonly _style: VolumeStyle = {
    centerX: CANVAS.WIDTH - px(CENTER_RIGHT),
    centerY: CANVAS.HEIGHT - px(CENTER_BOTTOM),
    radius: py(MASTER_RADIUS),
    ringRadius: py(RING_OUTER_RADIUS),
    font: `${py(FONT_SIZE)}px 微软雅黑`,
  }

  private _valueChangeEffect = new ActiveEffect()

  private _opacity = 0

  private _value: number

  set value(value: number) {
    this._value = safeValue(value, MIN_VOLUME, MAX_VOLUME)
  }

  get value(): number { return this._value }

  constructor(value: number, style?: Partial<VolumeStyle>) {
    super()
    this._value = value
    this.display = false
    style && Object.assign(this._style, style)
  }

  updateEffect(now: number) {
    super.updateEffect(now);
    this._valueChangeEffect.updateEffect(now)
  }

  async updateTo(value: number) {
    const target = safeValue(value, MIN_VOLUME, MAX_VOLUME)
    this._valueChangeEffect.cancelTransitions()
    await this._valueChangeEffect.createTransition(this._value, target, TRANSITION_TIME, 'easeOut', v => this._value = v)
  }

  private _hideTimer: number = -1

  async show() {
    if (!this.display) {
      this.display = true
    } else {
      this.cancelTimeout(this._hideTimer)
    }
    if (this._opacity !== 1) {
      this.cancelTransitions()
      await this.createTransition(this._opacity, 1, TRANSITION_TIME, 'easeOut', value => this._opacity = value)
    }
    const [task, timer] = this.createTimeout(HIDE_AFTER_DELAY)
    this._hideTimer = timer
    task.then(() => this.hide()).catch(() => {})
  }

  async hide() {
    this.cancelTransitions()
    await this.createTransition(this._opacity, 0, TRANSITION_TIME, 'easeOut', value => this._opacity = value)
    this.display = false
  }

  render(context: CanvasRenderingContext2D): void {
    const { centerX, centerY, radius, font, ringRadius } = this._style

    context.save()
    context.globalAlpha = this._opacity

    // draw shadow
    context.save()
    const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)')
    gradient.addColorStop(0.25, 'rgba(0, 0, 0, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = gradient
    context.beginPath()
    context.arc(centerX, centerY, radius * 3, 0, Math.PI * 2)
    context.closePath()
    context.fill()
    context.restore()

    // draw background
    context.save()
    context.fillStyle = BACKGROUND_COLOR
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.closePath()
    context.fill()
    context.restore()

    // draw border
    context.save()
    context.shadowBlur = SHADOW_BLUR
    context.shadowColor = BORDER_COLOR
    context.strokeStyle = BORDER_COLOR
    context.lineWidth = 3
    context.beginPath()
    context.arc(centerX, centerY, radius, 0, Math.PI * 2)
    context.closePath()
    context.stroke()
    context.restore()

    // draw negative
    context.save()
    context.shadowBlur = SHADOW_BLUR
    context.shadowColor = SHADOW_COLOR
    context.strokeStyle = NEGATIVE_COLOR
    context.lineWidth = RING_WIDTH
    context.beginPath()
    context.arc(centerX, centerY, ringRadius, -Math.PI * 0.5, Math.PI * 1.5)
    context.stroke()
    context.restore()

    // draw positive
    context.save()
    context.shadowBlur = SHADOW_BLUR
    context.shadowColor = SHADOW_COLOR
    context.strokeStyle = POSITIVE_COLOR
    context.lineWidth = RING_WIDTH
    context.beginPath()
    context.arc(centerX, centerY, ringRadius, -Math.PI * 0.5, Math.PI * 0.02 * this.value - Math.PI * 0.5)
    context.stroke()
    context.restore()

    context.save()
    context.fillStyle = POSITIVE_COLOR
    context.font = font
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(`${Math.round(this.value)}%`, centerX, centerY)
    context.restore()

    context.restore()
  }
}
