import type { LayoutProps } from '../Core/LayoutObject';
import { ElementEvent, RenderElement } from '../Core/RenderElement';
import { MouseTip } from './MouseTip';
import { KeyboardEventManager } from '../Managers/KeyboardEventManager';
import { KeyCode } from '../Enums/KeyCode';
import { safeValue } from '../_common/safe-value';
import type { IEditable } from '../Interfaces/IEditable';

const PREV_COLOR = 'rgb(225, 126, 145)'
const REMAIN_COLOR = 'rgb(116, 64, 76)'
const RADIO_COLOR = 'rgb(218, 125, 144)'
const RADIO_RADIUS = 12;

export interface SliderSelectorProps {
  max?: number
  min?: number
  value?: number
  unit?: string
  processValue?: (value: number) => number
  layout?: Partial<LayoutProps>
}

interface Status {
  dragging: boolean
}

export class SliderSelector extends RenderElement implements IEditable<number>{
  private _value: number

  private _max: number

  private _min: number

  private _status: Status = {
    dragging: false,
  }

  private _tip: MouseTip

  private _unit: string

  private readonly _processValue: (value: number) => number

  private _isHoverIn: boolean = false;

  private _keyboardEventManager = new KeyboardEventManager()

  protected _onChange: (value: number) => void

  protected _onMouseEnter: (value: number) => void

  protected _onMouseLeave: (value: number) => void;

  constructor(container: HTMLCanvasElement, props?: SliderSelectorProps) {
    super(container)
    this.container = container
    this._tip = MouseTip.getInstance()!
    this._onChange = () => {}
    this._onMouseEnter = () => {}
    this._onMouseLeave = () => {}
    if (props) {
      const { max = 100, value = 0, processValue = (value: number) => value, unit = '', min = 0, layout } = props;
      this._max = max ?? 100
      this._min = min ?? 0
      this._unit = unit ?? ''
      this._processValue = processValue
      this._value = Math.max(Math.min(value, max), min)
      layout && (this.layout = { ...this.layout, ...layout })
    }
  }

  private get _prevWidth(): number {
    return Math.round(this.layout.width * (this._value - this._min) / (this._max - this._min))
  }

  onChange(callback: (value: number) => void) {
    this._onChange = callback
  }

  onMouseEnter(callback: (value: number) => void) {
    this._onMouseEnter = callback
  }

  onMouseLeave(callback: (value: number) => void) {
    this._onMouseLeave = callback
  }

  registerEvents() {
    const tipOffsetX = 20
    const tipOffsetY = 20;

    const resetTipText = () => {
      this._tip.text = `${Math.round(this._value)}${this._unit}`
    };

    const resetTipByEvent = (e: ElementEvent) => {
      resetTipText()
      this._tip.layout.translateX = e.clientX + tipOffsetX
      this._tip.layout.translateY = e.clientY + tipOffsetY
    }

    this.addEventListener('mousedown', () => {
      this._status.dragging = true
    })
    this.addEventListener('globalMouseup', () => {
      this._status.dragging = false
    })
    this.addEventListener('globalMousemove', e => {
      if (this._status.dragging) {
        this.value = Math.round((e.offsetX / this.width) * (this._max - this._min)) + this._min;
      }
    })
    this.addEventListener('mousemove', e => {
      resetTipByEvent(e)
    })
    this.addEventListener('mouseenter', e => {
      resetTipByEvent(e)
      this._onMouseEnter(this._processValue(this.value))
      this._isHoverIn = true
      this._tip.show()
    })
    this.addEventListener('mouseleave', e => {
      resetTipByEvent(e)
      this._onMouseLeave(this._processValue(this.value))
      this._isHoverIn = false
      this._tip.hide()
    })
    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ARROW_LEFT]: () => {
          if (this._isHoverIn) {
            this.value -= 1
            resetTipText()
          }
        },
        [KeyCode.ARROW_RIGHT]: () => {
          if (this._isHoverIn) {
            this.value += 1
            resetTipText()
          }
        },
      },
    })
  }

  removeEvents() {
    this.removeAllEventsListeners()
    this._keyboardEventManager.removeEvents()
  }

  render(context: CanvasRenderingContext2D): void {
    const [x, y, w, h] = this.rect()
    context.save()
    const prevWidth = this._prevWidth

    context.lineWidth = 3

    const prevRight = x + prevWidth - RADIO_RADIUS * 2;
    const centerY = y + h / 2;

    if (prevRight > x) {
      // draw prev
      context.strokeStyle = PREV_COLOR
      context.beginPath()
      context.moveTo(x, centerY)
      context.lineTo(prevRight, centerY)
      context.stroke()
    }

    // draw remain
    context.strokeStyle = REMAIN_COLOR
    context.beginPath()
    context.moveTo(x + prevWidth, centerY)
    context.lineTo(x + w, centerY)
    context.stroke()

    // draw radio
    context.strokeStyle = RADIO_COLOR
    context.beginPath()
    context.arc(x + prevWidth - RADIO_RADIUS, centerY, RADIO_RADIUS, 0, Math.PI * 2)
    context.closePath()
    context.stroke()

    context.restore()
  }

  get value(): number {
    return this._value
  }

  set value(value: number) {
    this._value = safeValue(value, this._min, this._max)
    this._onChange(this._processValue(value))
  }

  set min(value: number) {
    this._min = value
  }

  get min(): number {
    return this._min
  }

  set max(value: number) {
    this._max = value
  }

  get max(): number {
    return this._max
  }

  set unit(value: string) {
    this._unit = value
  }

  get unit(): string {
    return this._unit
  }
}
