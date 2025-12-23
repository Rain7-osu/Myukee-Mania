import { CANVAS, MAX_SPEED, MIN_SPEED, py } from './Config'

// TODO Move stage render method out
export class RenderEngine {
  /**
   * @protected
   * @type {CanvasRenderingContext2D}
   */
  context

  /**
   * render frame of now basic on startTime
   * @type {number}
   */
  timing

  /** @type {number} */
  #speed

  /**
   * @public
   * @constructor
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    this.context = canvas.getContext('2d')
  }

  /**
   * @param value {number}
   */
  setTiming (value) {
    this.timing = value
  }

  /**
   * @param speed {number}
   */
  set speed (speed) {
    if (speed > MAX_SPEED || speed < MIN_SPEED) {
      return
    }
    this.#speed = speed
  }

  get speed () {
    return this.#speed
  }

  /**
   * @param offset {number}
   */
  convertOffsetToY (offset) {
    const timing = this.timing
    // per frame fall (10 * speed) px
    return Math.floor(py((timing - offset) / 10 * this.#speed) + CANVAS.HEIGHT)
  }

  /**
   * @public
   * @param object {RenderObject}
   */
  renderObject (object) {
    if (object.display) {
      object.render(this.context)
    }
  }

  /**
   * @public
   * @param shape {OffsetShape}
   */
  renderOffsetObject (shape) {
    const offsetY = this.convertOffsetToY(shape.offset)
    const endY = shape.end ? this.convertOffsetToY(shape.end) : undefined
    shape.render(this.context, offsetY, endY)
  }

  clearBackground () {
    this.context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
