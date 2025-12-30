import { NoteType } from './NoteType'
import { OffsetRenderObject } from './RenderObject'
import { Skin } from './Skin'
import { Judgement } from './Judgement'

export class Note extends OffsetRenderObject {
  private readonly _color: string

  private _col: number
  private _keys: number

  get keys () { return this._keys}

  get col () { return this._col }

  set col (c: number) { this._col = c }

  private readonly _type: NoteType
  get type () { return this._type }

  private _isHit: boolean = false
  get isHit () { return this._isHit }

  private _judgement: Judgement | null = null
  set judgement (value: Judgement | null) { this._judgement = value }

  get judgement (): Judgement | null { return this._judgement }

  private _score: number | null = null

  get score () { return this._score }

  set score (value: number | null) { this._score = value }

  private _bonus: number = 100
  get bonus (): number { return this._bonus }

  set bonus (value: number) { this._bonus = value }

  private _isHeld: boolean = false
  get isHeld (): boolean { return this._isHeld }

  set isHeld (value: boolean) { this._isHeld = value }

  private _hitTiming: number | null = null
  get hitTiming (): number | null { return this._hitTiming }

  set hitTiming (value: number | null) { this._hitTiming = value }

  private _releaseTiming: number | null = null
  get releaseTiming (): number | null { return this._releaseTiming }

  set releaseTiming (value: number) { this._releaseTiming = value }

  private _grayed: boolean = false
  set grayed (value: boolean) { this._grayed = value }

  get grayed (): boolean { return this._grayed }

  constructor (col: number, type: NoteType, offset: number, end: number, keys: number) {
    super(offset, end)
    this._col = col
    this._type = type
    this._keys = keys
    const {
      color,
    } = Skin.config.stage.keys[`keys${keys}`].note
    this._color = color[col]
  }

  set keys (keys: number) { this._keys = keys}

  /**
   * 当前 note 已被打击处理过，无需再处理
   */
  hit () { this._isHit = true }

  reset () {
    this._grayed = false
    this._hitTiming = null
    this._releaseTiming = null
    this._isHeld = false
    this._bonus = 100
    this._score = 0
    this._judgement = null
    this._isHit = false
  }

  render (context: CanvasRenderingContext2D, offsetY: number, endY?: number) {
    const { columnCenter, keys } = Skin.config.stage
    const {
      note: {
        width: NOTE_WIDTH, height: NOTE_HEIGHT, gap: NOTE_GAP,
      },
    } = keys[`keys${this._keys}`]
    const halfWidth = this._keys * NOTE_WIDTH / 2
    const columnStart = columnCenter - halfWidth
    const LEFT = this._col * NOTE_WIDTH + (this._col + 1) * NOTE_GAP / 2 + columnStart

    if (this._type === NoteType.TAP) {
      if (offsetY > 0 && !this._isHit) {
        context.fillStyle = this._color
        // y - NOTE_HEIGHT: judgement on the bottom of note
        context.fillRect(LEFT, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    } else if (this._type === NoteType.HOLD) {
      if (offsetY > 0) {
        const height = offsetY - endY
        context.fillStyle = 'rgb(186, 191, 195)'
        if (this._grayed) {
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

        context.fillStyle = this._color
        context.fillRect(LEFT, offsetY - NOTE_HEIGHT, NOTE_WIDTH - NOTE_GAP, NOTE_HEIGHT)
      }
    }
  }
}
