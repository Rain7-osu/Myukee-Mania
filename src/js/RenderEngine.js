import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
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
   * renderStartTime
   * @param value {number}
   */
  setTime(value) {
    this.#startTime = value
  }

  /**
   * @param offset {number}
   * @param speed {number}
   */
  convertOffsetToY(offset, speed) {
    const timeDelta = this.#now - this.#startTime
    return (timeDelta - offset) / 10 * speed
  }

  /**
   * @public
   * @param shape {Shape}
   */
  renderShape(shape) {
    shape.render(this.#context)
  }

  /**
   * @param note {Note}
   * @param speed {number}
   */
  renderNote(note, speed) {
    const context = this.#context
    context.fillStyle = note.color
    const calcY = (offset) => this.convertOffsetToY(offset, speed) + CANVAS_HEIGHT

    const noteOffset = note.offset
    if (note.type === NoteType.Rice) {
      const y = calcY(noteOffset)
      if (y > 0) {
        // y - NOTE_HEIGHT: judgement on the bottom of note
        context.fillRect(note.col * NOTE_WIDTH + NOTE_GAP / 2, y - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    } else if (note.type === NoteType.LN) {
      const y = calcY(noteOffset)
      const headY = calcY(note.end)
      const height = y - headY
      if (y > 0) {
        context.fillRect(note.col * NOTE_WIDTH, headY, NOTE_WIDTH - 2, height)
      }
    }
  }

  renderBackground() {
    this.#context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }

  /**
   * render section line
   * @param offset {number}
   * @param speed {number}
   */
  renderSectionLine(offset, speed) {
    const y = this.convertOffsetToY(offset, speed) + CANVAS_HEIGHT

    if (y < 0) {
      return
    }

    const context = this.#context
    context.fillStyle = SECTION_LINE_COLOR
    context.fillRect(0, y, CANVAS_WIDTH, SECTION_LINE_HEIGHT)
  }

  /**
   * @param value {number}
   */
  renderFps(value) {
    const context = this.#context
    context.fillStyle = '#f00'
    const x = 10
    const y = 10
    context.fillText(`FPS:${value}`, x, y, 60)
  }
}
