import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { CANVAS } from './Config'
import { SliderSetting } from './components/SliderSetting';
import { FrameSnapshot } from './FrameSnapshot';
import { Settings, SettingsKey, SettingsValue } from './Settings';

const TRANSITION_DURATION = 500

export interface SettingItem<T extends number | string> {
  onChange(callback: (value: T) => void): void

  registerEvents(): void

  removeEvents(): void

  render(context: CanvasRenderingContext2D): void

  updateEffect(now: number): void;
}

interface InnerStyle {
  width: number;
  maxWidth: number;
}

export class SettingsPanel extends RenderObject {
  private readonly _settings = Settings.getInstance()

  private readonly _container: HTMLCanvasElement

  private readonly _settingsItem: Array<{ name: SettingsKey; item: SettingItem<string | number> }>

  private readonly _innerStyle: InnerStyle = {
    width: 0,
    maxWidth: Skin.config.settingsPanel.width,
  }

  constructor(container: HTMLCanvasElement) {
    super()
    this._container = container
    let offsetY = 200
    const ITEM_HEIGHT = 64;
    const judgementDelaySetting = new SliderSetting(container, {
      label: 'Judgement Delay',
      min: -160,
      max: 160,
      value: this._settings.get('judgementDelay'),
      unit: 'ms',
      layout: {
        offsetX: 0,
        offsetY,
        width: this._innerStyle.maxWidth,
        height: ITEM_HEIGHT,
      },
    })
    offsetY += ITEM_HEIGHT
    const backgroundDarkSetting = new SliderSetting(container, {
      label: 'Background dim',
      min: 0,
      max: 100,
      value: this._settings.get('backgroundDark'),
      unit: '%',
      layout: {
        offsetX: 0,
        offsetY,
        width: this._innerStyle.maxWidth,
        height: ITEM_HEIGHT,
      },
    })
    offsetY += ITEM_HEIGHT
    const offsetSetting = new SliderSetting(container, {
      label: 'Offset',
      min: -160,
      max: 160,
      value: this._settings.get('offset'),
      unit: 'ms',
      layout: {
        offsetX: 0,
        offsetY,
        width: this._innerStyle.maxWidth,
        height: ITEM_HEIGHT,
      },
    })
    this._settingsItem = [
      { name: 'judgementDelay', item: judgementDelaySetting },
      { name: 'backgroundDark', item: backgroundDarkSetting },
      { name: 'offset', item: offsetSetting },
    ]
    this._settingsItem.forEach(({ item, name }) => item.onChange(value => this._settings.set(name, value as SettingsValue[SettingsKey])))
  }

  registerEvents() {
    this._settingsItem.forEach(({ item }) => item.registerEvents())
  }

  removeEvents() {
    this._settingsItem.forEach(({ item }) => item.removeEvents())
  }

  updateEffect(now: number) {
    super.updateEffect(now);
    this._settingsItem.forEach(({ item }) => item.updateEffect(now))
  }

  get width(): number {
    return this._innerStyle.width
  }

  async show() {
    if (this.display) {
      return Promise.resolve()
    }
    this.display = true
    this.cancelTransitions()
    await this.createTransition(this._innerStyle.width, this._innerStyle.maxWidth, TRANSITION_DURATION, 'easeOut', value => this._innerStyle.width = value)
  }

  async hide() {
    if (!this.display) {
      return Promise.resolve()
    }
    this.cancelTransitions()
    await this.createTransition(this._innerStyle.width, 0, TRANSITION_DURATION, 'easeOut', value => this._innerStyle.width = value)
    this.display = false
  }

  render(context: CanvasRenderingContext2D) {
    const { background } = Skin.config.settingsPanel

    const maxWidth = this._innerStyle.maxWidth;
    const height = CANVAS.HEIGHT;

    const settingsPanel = FrameSnapshot.createOffscreenCanvas(context => {
      context.fillStyle = background
      context.fillRect(0, 0, maxWidth, height)
      this._settingsItem.forEach(({ item }) => item.render(context))
    }, maxWidth, height)

    context.drawImage(settingsPanel, 0, 0, this.width, height, 0, 0, this.width, height)
  }
}
