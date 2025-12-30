import { NoteType } from './NoteType'
import { OffsetRenderObject } from './RenderObject'
import { Skin } from './Skin'
import { Judgement } from './Judgement'

/**
 * @description 0 - 480
 */
export class Note extends OffsetRenderObject {
  #color: string

  #col: number
  #keys: number

  get keys () { return this.#keys}

  get col () { return this.#col }

  set col (c: number) { this.#col = c }

  #type: NoteType
  get type () { return this.#type }

  #isHit: boolean = false
  get isHit () { return this.#isHit }

  #judgement: Judgement | null = null
  set judgement (value: Judgement | null) { this.#judgement = value }

  get judgement (): Judgement | null { return this.#judgement }

  #score: number | null = null

  get score () { return this.#score }

  set score (value: number | null) { this.#score = value }

  #bonus: number = 100
  get bonus (): number { return this.#bonus }

  set bonus (value: number) { this.#bonus = value }

  #isHeld: boolean = false
  get isHeld (): boolean { return this.#isHeld }

  set isHeld (value: boolean) { this.#isHeld = value }

  #combo: boolean

  #hitTiming: number | null = null
  get hitTiming (): number | null { return this.#hitTiming }

  set hitTiming (value: number | null) { this.#hitTiming = value }

  #releaseTiming: number | null = null
  get releaseTiming (): number | null { return this.#releaseTiming }

  set releaseTiming (value: number) { this.#releaseTiming = value }

  #grayed: boolean = false
  set grayed (value: boolean) { this.#grayed = value }

  get grayed (): boolean { return this.#grayed }

  constructor (col: number, type: NoteType, offset: number, end: number, keys: number) {
    super(offset, end)
    this.#col = col
    this.#type = type
    this.#keys = keys
    const {
      color,
    } = Skin.config.stage.keys[`keys${keys}`].note
    this.#color = color[col]
  }

  set keys (keys: number) { this.#keys = keys}

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

  render (context: CanvasRenderingContext2D, offsetY: number, endY?: number) {
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
