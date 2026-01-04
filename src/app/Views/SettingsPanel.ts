import { RenderObject } from '../Core/RenderObject';
import { Settings, SettingsKey, SettingsValue } from '../Configs/Settings';
import type { ISettingItem } from '../Interfaces/ISettingItem';
import { Skin } from '../Configs/Skin';
import { rgba } from '../_common/utils';
import { CANVAS, px, py } from '../Configs/Config';
import { SliderSetting } from '../Components/SliderSetting';
import { FrameSnapshot } from '../Core/FrameSnapshot';
import { debounce } from '../_common/debounce';
import { throttle } from '../_common/throttle';

const TRANSITION_DURATION = 500
const OFFSET_X = 120

interface InnerStyle {
  width: number;
  maxWidth: number;
  leftBackground: string;
}

export class SettingsPanel extends RenderObject {
  private _isEditing = false

  private readonly _settings = Settings.getInstance()

  private readonly _container: HTMLCanvasElement

  private readonly _settingsItem: Array<{ name: SettingsKey; item: ISettingItem<string | number> }>

  private readonly _innerStyle: InnerStyle = {
    width: 0,
    maxWidth: Skin.config.settingsPanel.width,
    leftBackground: rgba.format([0, 0, 0, 0]),
  }

  constructor(container: HTMLCanvasElement) {
    super()
    this._container = container
    let offsetY = py(360)
    const ITEM_HEIGHT = py(60);
    const offsetX = px(OFFSET_X)
    const width = this._innerStyle.maxWidth - offsetX
    const judgementDelaySetting = new SliderSetting(container, {
      label: 'Judgement Delay:',
      min: -160,
      max: 160,
      value: this._settings.get('judgementDelay'),
      unit: 'ms',
      layout: {
        offsetX,
        offsetY,
        width,
        height: ITEM_HEIGHT,
      },
    })
    offsetY += ITEM_HEIGHT
    const backgroundDarkSetting = new SliderSetting(container, {
      label: 'Background dim:',
      min: 0,
      max: 100,
      value: this._settings.get('backgroundDark'),
      unit: '%',
      layout: {
        offsetX,
        offsetY,
        width,
        height: ITEM_HEIGHT,
      },
    })
    offsetY += ITEM_HEIGHT
    const offsetSetting = new SliderSetting(container, {
      label: 'Offset:',
      min: -160,
      max: 160,
      value: this._settings.get('offset'),
      unit: 'ms',
      layout: {
        offsetX,
        offsetY,
        width,
        height: ITEM_HEIGHT,
      },
    })
    offsetY += ITEM_HEIGHT
    const masterVolumeSetting = new SliderSetting(container, {
      label: 'Master Volume:',
      min: 0,
      max: 100,
      value: this._settings.get('masterVolume') ,
      unit: '%',
      layout: {
        offsetX,
        offsetY,
        width,
        height: ITEM_HEIGHT,
      },
    })
    this._settingsItem = [
      { name: 'judgementDelay', item: judgementDelaySetting },
      { name: 'backgroundDark', item: backgroundDarkSetting },
      { name: 'offset', item: offsetSetting },
      { name: 'masterVolume', item: masterVolumeSetting },
    ]
    const setSetting = throttle((name: SettingsKey, value: string | number) => {
      this._settings.change(name, value as SettingsValue[SettingsKey])
    }, 100)
    this._settingsItem.forEach(({ item, name }) => {
      item.onChange(value => {
        setSetting(name, value)
      })
      item.onMouseEnter(() => {
        this._isEditing = true
      })
      item.onMouseLeave(() => {
        this._isEditing = false
      })
    })
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

  private _loadValue() {
    this._settingsItem.forEach(({ item, name }) => {
      item.value = this._settings.get(name) as string | number
    })
  }

  get width(): number {
    return this._innerStyle.width
  }

  get editing(): boolean {
    return this._isEditing
  }

  async show() {
    if (this.display) {
      return Promise.resolve()
    }
    this._loadValue()
    this.display = true
    this.cancelTransitions()
    await Promise.all([
      this.createTransition(this._innerStyle.width, this._innerStyle.maxWidth, TRANSITION_DURATION, 'easeOut', value => this._innerStyle.width = value),
      this.createTransition(this._innerStyle.leftBackground, rgba.format([0, 0, 0, 1]), TRANSITION_DURATION, 'easeOut', value => this._innerStyle.leftBackground = value)
    ])
  }

  async hide() {
    if (!this.display) {
      return Promise.resolve()
    }
    this.cancelTransitions()
    await Promise.all([
      this.createTransition(this._innerStyle.width, 0, TRANSITION_DURATION, 'easeOut', value => this._innerStyle.width = value),
      this.createTransition(this._innerStyle.leftBackground, rgba.format([0, 0, 0, 0]), TRANSITION_DURATION, 'easeOut', value => this._innerStyle.leftBackground = value)
    ])
    this.display = false
  }

  render(context: CanvasRenderingContext2D) {
    const { background } = Skin.config.settingsPanel

    const maxWidth = this._innerStyle.maxWidth;
    const height = CANVAS.HEIGHT;

    const settingsPanel = FrameSnapshot.createOffscreenCanvas(context => {
      context.fillStyle = background
      context.fillRect(0, 0, maxWidth, height)

      context.fillStyle = this._innerStyle.leftBackground
      context.fillRect(0, 0, px(OFFSET_X), height)

      this._settingsItem.forEach(({ item }) => item.render(context))
    }, maxWidth, height)

    context.drawImage(settingsPanel, 0, 0, this.width, height, 0, 0, this.width, height)
  }
}
