import { NoteType } from './NoteType'
import { OffsetShape } from './Shape'
import { Skin } from './Skin'

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
  /**
   * @type {number}
   */
  #keys

  get keys () { return this.#keys}

  get col () { return this.#col }

  /**
   * @param c {number}
   */
  set col (c) { this.#col = c }

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

  /**
   * @return {Judgement|null}
   */
  get judgement () { return this.#judgement }

  /** @type {number} */
  #score = 0
  get score () { return this.#score }

  set score (value) { this.#score = value }

  /** @type {number} */
  #bonus = 100
  /**
   * @return {number}
   */
  get bonus () { return this.#bonus }

  /**
   * @param value {number}
   */
  set bonus (value) { this.#bonus = value }

  /** @type {boolean} */
  #isHeld = false
  /**
   * @return {boolean}
   */
  get isHeld () { return this.#isHeld }

  /**
   * @param value {boolean}
   */
  set isHeld (value) { this.#isHeld = value }

  /** @type {boolean} */
  #combo

  /** @type {number | null} */
  #hitTiming = null
  /**
   * @return {number|null}
   */
  get hitTiming () { return this.#hitTiming }

  /**
   * @param value {number | null}
   */
  set hitTiming (value) { this.#hitTiming = value }

  /** @type {number | null} */
  #releaseTiming = null
  /**
   * @return {number|null}
   */
  get releaseTiming () { return this.#releaseTiming }

  /**
   * @param value {number}
   */
  set releaseTiming (value) { this.#releaseTiming = value }

  /** @type {boolean} */
  #grayed = false
  /**
   * @param value {boolean}
   */
  set grayed (value) { this.#grayed = value }

  /**
   * @return {boolean}
   */
  get grayed () { return this.#grayed }

  /**
   * @public
   * @param col {number}
   * @param type {NoteType}
   * @param offset {number}
   * @param end {number}
   * @param keys {number}
   */
  constructor (col, type, offset, end, keys) {
    super(offset, end)
    this.#col = col
    this.#type = type
    this.#keys = keys
    const {
      color,
    } = Skin.config.stage.keys[`keys${keys}`].note
    this.#color = color[col]
  }

  /**
   * @param keys {number}
   */
  set keys (keys) { this.#keys = keys}

  /**
   * 当前 note 已被打击处理过，无需再处理
   */
  hit () { this.#isHit = true }

  reset () {
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
    const { columnCenter, keys } = Skin.config.stage
    const {
      note: {
        width: NOTE_WIDTH, height: NOTE_HEIGHT, gap: NOTE_GAP,
      },
    } = keys[`keys${this.#keys}`]
    const halfWidth = this.#keys * NOTE_WIDTH / 2
    const columnStart = columnCenter - halfWidth
    const LEFT = this.#col * NOTE_WIDTH + (this.#col + 1) * NOTE_GAP / 2 + columnStart

    if (this.#type === NoteType.TAP) {
      if (offsetY > 0 && !this.#isHit) {
        context.fillStyle = this.#color
        // y - NOTE_HEIGHT: judgement on the bottom of note
        context.fillRect(LEFT, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    } else if (this.#type === NoteType.HOLD) {
      if (offsetY > 0) {
        const height = offsetY - endY
        context.fillStyle = 'rgb(186, 191, 195)'
        if (this.#grayed) {
          context.fillStyle = 'rgba(186, 191, 195, 0.5)'
        }

        const BODY_WIDTH = NOTE_WIDTH * 0.8
        const HIDE_LENGTH = NOTE_HEIGHT * 4
        const TAIL_HEIGHT = BODY_WIDTH / 2 * 1.732

        // draw Tail
        const tailBottom = endY + HIDE_LENGTH
        const tailTop = tailBottom - TAIL_HEIGHT
        if (tailTop < offsetY - NOTE_HEIGHT) {
          context.beginPath()
          context.moveTo(LEFT + NOTE_WIDTH / 2, tailTop)
          const tailY = tailBottom <= offsetY ? tailBottom : offsetY
          context.lineTo(LEFT + NOTE_WIDTH / 2 + BODY_WIDTH / 2, tailY)
          context.lineTo(LEFT + NOTE_WIDTH / 2 - BODY_WIDTH / 2, tailY)
          context.closePath()
          context.fill()

          // draw body
          const h = height - HIDE_LENGTH - NOTE_HEIGHT
          if (h > 0) {
            context.fillRect(LEFT + NOTE_WIDTH / 2 - BODY_WIDTH / 2, tailY, BODY_WIDTH, h)
          }
        }

        context.fillStyle = this.#color
        context.fillRect(LEFT, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    }
  }
}
