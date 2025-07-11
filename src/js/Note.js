import { BLUE_NOTE_COLOR, NOTE_HEIGHT, WHITE_NOTE_COLOR } from './Config'
import { NoteCol } from './NoteType'
import { Shape } from './Shape'

/**
 * @typedef {number} Offset
 * @description 0 - 480
 */
export class Note extends Shape {
  /**
   * @type {Offset}
   */
  #offset

  /**
   * @type {Offset}
   */
  #end

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
   * @type {number}
   */
  #height = NOTE_HEIGHT

  /**
   *
   */

  /**
   * @public
   * @param col {NoteCol}
   * @param type {NoteType}
   * @param offset {Offset}
   * @param end {Offset}
   */
  constructor (col, type, offset, end) {
    super()
    this.#col = col
    this.#offset = offset
    this.#type = type
    this.#end = end
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

  /**
   * @param val {NoteCol}
   */
  set col (val) {
    this.#col = val
  }

  /**
   * @return {Offset}
   */
  get offset () {
    return this.#offset
  }

  /**
   * @param val {Offset}
   */
  set offset (val) {
    this.#offset = val
  }

  get end () {
    return this.#end
  }

  set end (val) {
    this.#end = val
  }

  get type () {
    return this.#type
  }

  set type (val) {
    this.#type = val
  }

  render (context) {

  }
}
