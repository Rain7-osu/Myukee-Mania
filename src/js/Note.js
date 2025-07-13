import { BLUE_NOTE_COLOR, NOTE_GAP, NOTE_HEIGHT, NOTE_WIDTH, WHITE_NOTE_COLOR } from './Config'
import { NoteCol, NoteType } from './NoteType'
import { OffsetShape } from './Shape'
import { JudgementType } from './Judgement'

/**
 * @description 0 - 480
 */
export class Note extends OffsetShape {
  /**
   * @type {string}
   */
  #color

  /**
   * @type {number}
   */
  #col
  get col () { return this.#col }

  /**
   * @type {NoteType}
   */
  #type
  get type () { return this.#type }

  /** @type {boolean} */
  #isHit = false
  get isHit () { return this.#isHit }

  /**  @type {Judgement | null} */
  #judgement = null
  set judgement (value) { this.#judgement = value }

  get judgement () { return this.#judgement }

  /** @type {number} */
  #score = 0
  get score () { return this.#score }

  set score (value) { this.#score = value }

  /** @type {number} */
  #bonus = 100
  get bonus () { return this.#bonus }

  set bonus (value) { this.#bonus = value }

  /** @type {boolean} */
  #isHeld = false
  get isHeld () { return this.#isHeld }

  set isHeld (value) { this.#isHeld = value }

  /** @type {boolean} */
  #combo

  /** @type {number | null} */
  #hitTiming = null
  get hitTiming () { return this.#hitTiming }

  set hitTiming (value) { this.#hitTiming = value }

  /** @type {number | null} */
  #releaseTiming = null
  get releaseTiming () { return this.#releaseTiming }

  set releaseTiming (value) { this.#releaseTiming = value }

  /** @type {boolean} */
  #grayed = false
  set grayed (value) { this.#grayed = value }
  get grayed () { return this.#grayed }

  /**
   * @public
   * @param col {number}
   * @param type {NoteType}
   * @param offset {number}
   * @param [end] {number}
   */
  constructor (col, type, offset, end) {
    super(offset, end)
    this.#col = col
    this.#type = type
    if (col === 0 || col === 3) {
      this.#color = BLUE_NOTE_COLOR
    } else {
      this.#color = WHITE_NOTE_COLOR
    }
  }

  /**
   * 当前 note 已被打击处理过，无需再处理
   */
  hit () { this.#isHit = true }

  reset() {
    this.#grayed = false
    this.#hitTiming = null
    this.#releaseTiming = null
    this.#isHeld = false
    this.#bonus = 100
    this.#score = 0
    this.#judgement = null
    this.#isHit = false
  }

  render (context, offsetY, endY) {
    context.fillStyle = this.#color
    if (this.#type === NoteType.TAP) {
      if (offsetY > 0) {
        // y - NOTE_HEIGHT: judgement on the bottom of note
        context.fillRect(this.#col * NOTE_WIDTH + NOTE_GAP / 2, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    } else if (this.#type === NoteType.HOLD) {
      const height = offsetY - endY
      if (this.#grayed) {
        // add 50 alpha
        context.fillStyle = this.#color + '50'
      }
      if (offsetY > 0) {
        context.fillRect(this.#col * NOTE_WIDTH, endY, NOTE_WIDTH - 2, height)
      }
    }
  }
}
