import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH, DEFAULT_SPEED,
  NOTE_GAP,
  NOTE_HEIGHT,
  NOTE_WIDTH,
  SECTION_LINE_COLOR,
  SECTION_LINE_HEIGHT,
} from './Config'
import { NoteType } from './NoteType'

export class RenderEngine {
  /**
   * @type {HTMLCanvasElement}
   */
  #canvas

  /**
   * @type {CanvasRenderingContext2D}
   */
  #context

  /**
   * @type {number}
   */
  #startTime

  /**
   * render frame of now basic on startTime
   * @type {number}
   */
  #now

  /** @type {number} */
  #speed = DEFAULT_SPEED

  /**
   * @public
   * @constructor
   * @param canvas {HTMLCanvasElement}
   */
  constructor (canvas) {
    this.#canvas = canvas
    this.#context = canvas.getContext('2d')
  }

  /**
   * @param value {number}
   */
  setNow(value) {
    this.#now = value
  }

  /**
   * @param value {number}
   */
  set speed(value) {
    this.#speed = value
  }

  get speed() {
    return this.#speed
  }

  /**
   * renderStartTime
   * @param value {number}
   */
  setStartTime(value) {
    this.#startTime = value
  }

  /**
   * @param offset {number}
   */
  convertOffsetToY(offset) {
    const timeDelta = this.#now - this.#startTime
    // per frame fall (10 * speed) px
    return (timeDelta - offset) / 10 * this.#speed + CANVAS_HEIGHT
  }

  /**
   * @public
   * @param shape {Shape}
   */
  renderShape(shape) {
    shape.render(this.#context)
  }

  /**
   * @public
   * @param shape {OffsetShape}
   */
  renderOffsetShape(shape) {
    const offsetY = this.convertOffsetToY(shape.offset)
    const endY = shape.end ? this.convertOffsetToY(shape.end) : undefined
    shape.render(this.#context, offsetY, endY)
  }

  renderBackground() {
    this.#context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }
}
