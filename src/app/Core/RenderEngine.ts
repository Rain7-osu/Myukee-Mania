import { CANVAS, MAX_SPEED, MIN_SPEED, py } from '../Configs/Config';
import type { RenderObject } from './RenderObject';
import { OffsetRenderObject } from './RenderObject';

export class RenderEngine {
  protected context: CanvasRenderingContext2D

  timing: number

  private _speed: number

  constructor (canvas: HTMLCanvasElement) {
    this.context = canvas.getContext('2d')
  }

  setTiming (value: number): void {
    this.timing = value
  }

  set speed (speed: number) {
    if (speed > MAX_SPEED || speed < MIN_SPEED) {
      return
    }
    this._speed = speed
  }

  get speed (): number {
    return this._speed
  }

  convertOffsetToY (offset: number): number {
    const timing = this.timing
    // per frame fall (10 * speed) px
    return Math.floor(py((timing - offset) / 10 * this._speed) + CANVAS.HEIGHT)
  }

  renderObject (object: RenderObject): void {
    if (object.display) {
      object.render(this.context)
    }
  }

  renderObjects (objects: RenderObject[]): void {
    objects.forEach(object => this.renderObject(object))
  }

  renderOffsetObject (shape: OffsetRenderObject): void {
    const offsetY = this.convertOffsetToY(shape.offset)
    const endY = shape.end ? this.convertOffsetToY(shape.end) : undefined
    shape.render(this.context, offsetY, endY)
  }

  clearBackground (): void {
    this.context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
