import { CANVAS, DEFAULT_SPEED } from './Config.js'

// TODO Move stage render method out
export class RenderEngine {
  /**
   * @type {CanvasRenderingContext2D}
   */
  #context

  /**
   * render frame of now basic on startTime
   * @type {number}
   */
  timing

  /** @type {number} */
  #speed = DEFAULT_SPEED

  /**
   * @public
   * @constructor
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    this.#context = canvas.getContext('2d')
  }

  /**
   * @param value {number}
   */
  setTiming (value) {
    this.timing = value
  }

  /**
   * @param value {number}
   */
  set speed (value) {
    this.#speed = value
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
    return (timing - offset) / 10 * this.#speed + CANVAS.HEIGHT
  }

  /**
   * @public
   * @param shape {Shape}
   */
  renderShape (shape) {
    shape.render(this.#context)
  }

  /**
   * @public
   * @param shape {OffsetShape}
   */
  renderOffsetShape (shape) {
    const offsetY = this.convertOffsetToY(shape.offset)
    const endY = shape.end ? this.convertOffsetToY(shape.end) : undefined
    shape.render(this.#context, offsetY, endY)
  }

  clearBackground () {
    this.#context.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }

  /**
   * @param image {HTMLImageElement}
   */
  renderBackgroundImage (image) {
    this.#context.drawImage(image, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  }
}
