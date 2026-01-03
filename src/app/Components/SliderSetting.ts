import type { SliderSelectorProps } from './SliderSelector';
import { px, py } from '../Configs/Config';
import type { SettingItem } from '../Interfaces/SettingItem';
import { SliderSelector } from './SliderSelector';
import { RenderElement } from '../Core/RenderElement';

const LABEL_COLOR = 'rgb(255, 255, 255)';
const FONT_SIZE = py(32);

const  TRANSITION_DURATION = 300;

export interface SliderSettingProps extends SliderSelectorProps {
  label?: string
}

export class SliderSetting extends RenderElement implements SettingItem<number> {
  private _selector: SliderSelector

  private readonly _label: string

  private _innerStyle = {
    font: `${py(FONT_SIZE)}px 等线 Light`,
    fontSize: py(FONT_SIZE),
  }

  private _isFirstRender = true

  private _currentBackgroundAlpha = 0

  constructor(container, props?: SliderSettingProps) {
    super(container)
    this._selector = new SliderSelector(container, {
      value: props?.value,
      unit: props?.unit,
      max: props?.max,
      min: props?.min,
    })
    this._label = props?.label ?? ''
    this.layout = { ...this.layout, ...props?.layout }
  }

  onChange(callback: (value: number) => void) {
    this._selector.onChange(callback)
  }

  registerEvents() {
    this._selector.registerEvents()
    this.addEventListener('mouseenter', () => {
      this.hover()
    })
    this.addEventListener('mouseleave', () => {
      this.hoverOut()
    })
  }

  removeEvents() {
    this._selector.removeEvents()
  }

  async hover() {
    this.cancelTransitions()
    await this.createTransition(this._currentBackgroundAlpha, 0.8, TRANSITION_DURATION, 'easeOut', value => this._currentBackgroundAlpha = value)
  }

  async hoverOut() {
    this.cancelTransitions()
    await this.createTransition(this._currentBackgroundAlpha, 0, TRANSITION_DURATION, 'easeOut', value => this._currentBackgroundAlpha = value)
  }

  override render(context: CanvasRenderingContext2D): void {
    const [x, y, w, h] = this.rect()
    const left = x + px(40)
    const width = w - px(80)
    context.font = this._innerStyle.font
    if (this._isFirstRender) {
      context.fillStyle = 'rgb(255, 255, 255)'
      const textWidth = context.measureText(this._label).width
      this._selector.offsetX = left + textWidth + 32
      this._selector.offsetY = y
      this._selector.width = width - textWidth - 32
      this._selector.height = h
      this._isFirstRender = false
    }

    context.fillStyle = `rgba(0, 0, 0, ${this._currentBackgroundAlpha})`
    context.fillRect(x, y, w, h)

    context.fillStyle = LABEL_COLOR
    context.textBaseline = 'middle'
    context.fillText(this._label, left, y + h / 2)

    this._selector.render(context)
  }
}
