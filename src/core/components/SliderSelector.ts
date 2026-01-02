import { Element, ElementEvent } from './Element';
import type { LayoutStyle } from './LayoutObject';
import { MouseTip } from './MouseTip';
import { KeyboardEventManager } from '../KeyboardEventManager';
import { KeyCode } from '../KeyCode';

const PREV_COLOR = 'rgb(225, 126, 145)'
const REMAIN_COLOR = 'rgb(116, 64, 76)'
const RADIO_COLOR = 'rgb(218, 125, 144)'
const RADIO_RADIUS = 10;

export interface SliderSelectorProps {
  max?: number
  min?: number
  value?: number
  unit?: string
  layout?: Partial<LayoutStyle>
}

interface Status {
  dragging: boolean
}

export class SliderSelector extends Element {
  private _value: number

  private _max: number

  private _min: number

  private _status: Status = {
    dragging: false,
  }

  private _tip: MouseTip

  private _unit: string

  private _isHoverIn: boolean = false;

  private _keyboardEventManager = new KeyboardEventManager()

  private _onChange: (value: number) => void

  constructor(container: HTMLCanvasElement, props?: SliderSelectorProps) {
    super(container)
    this.container = container
    this._tip = MouseTip.getInstance()!
    this._onChange = () => {}
    if (props) {
      this._value = props.value ?? 0
      this._max = props.max ?? 100
      this._min = props.min ?? 0
      this._unit = props.unit ?? ''
      props.layout && (this.layout = { ...this.layout, ...props.layout })
    }
  }

  private get _prevWidth(): number {
    return Math.round(this.layout.width * (this._value - this._min) / (this._max - this._min))
  }

  onChange(callback: (value: number) => void) {
    this._onChange = callback
  }

  registerEvents() {
    const tipOffsetX = 20
    const tipOffsetY = 20;

    const resetTipText = () => {
      this._tip.text = `${this._value}${this._unit}`
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
      this._isHoverIn = true
      this._tip.show()
    })
    this.addEventListener('mouseleave', e => {
      resetTipByEvent(e)
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
    this._value = Math.max(Math.min(value, this._max), this._min)
    this._onChange(this._value)
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
