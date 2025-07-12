import { BLUE_NOTE_COLOR, NOTE_GAP, NOTE_HEIGHT, NOTE_WIDTH, WHITE_NOTE_COLOR } from './Config'
import { NoteCol, NoteType } from './NoteType'
import { OffsetShape } from './Shape'

/**
 * @description 0 - 480
 */
export class Note extends OffsetShape {
  /**
   * @type {string}
   */
  #color

  /**
   * @type {NoteCol}
   */
  #col

  /**
   * @type {NoteType}
   */
  #type

  /**
   * @type {number}
   */
  #y = Number.MIN_VALUE

  /**
   *
   */

  /**
   * @public
   * @param col {NoteCol}
   * @param type {NoteType}
   * @param offset {number}
   * @param [end] {number}
   */
  constructor (col, type, offset, end) {
    super(offset, end)
    this.#col = col
    this.#type = type
    if (col === NoteCol.FIRST || col === NoteCol.FORTH) {
      this.#color = BLUE_NOTE_COLOR
    } else {
      this.#color = WHITE_NOTE_COLOR
    }
  }

  /**
   * @returns {string}
   */
  get color () {
    return this.#color
  }

  /**
   * @param val {string}
   */
  set color (val) {
    this.#color = val
  }

  /**
   * @returns {NoteCol}
   */
  get col () {
    return this.#col
  }

  get type () {
    return this.#type
  }

  render (context, offsetY, endY) {
    context.fillStyle = this.#color
    if (this.#type === NoteType.Rice) {
      if (offsetY > 0) {
        // y - NOTE_HEIGHT: judgement on the bottom of note
        context.fillRect(this.#col * NOTE_WIDTH + NOTE_GAP / 2, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    } else if (this.#type === NoteType.LN) {
      const height = offsetY - endY
      if (offsetY > 0) {
        context.fillRect(this.#col * NOTE_WIDTH, endY, NOTE_WIDTH - 2, height)
      }
    }
  }
}
