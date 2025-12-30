import { BaseButton } from './BaseButton'

export interface ModButtonConfig {
  mod: Mod | Mod[]
  description: string | string[]
  backgroundImage: CanvasImageSource | CanvasImageSource[]
  keyBind: KeyCode
  left: number
  top: number
  width: number
  height: number
}

export class ModButton extends BaseButton {
  private readonly _mod: Mod | Mod[]

  private _description: string | string[]

  private readonly _backgroundImage: CanvasImageSource | CanvasImageSource[]

  private _currentValue: null | Mod

  private _currentIndex = 0

  private readonly _keyBind: KeyCode

  get keyBind(): KeyCode { return this._keyBind }

  constructor(container: HTMLCanvasElement, config: ModButtonConfig) {
    const { mod, description, backgroundImage, keyBind, ...style } = config
    super(container, style)
    this._description = description
    this._mod = mod
    this._backgroundImage = backgroundImage
    this._currentValue = null
    this._keyBind = keyBind
    this.style.backgroundImage = Array.isArray(backgroundImage) ? backgroundImage[0] : backgroundImage
  }

  click(): void {
    const valueList = [null, ...(Array.isArray(this._mod) ? this._mod : [this._mod])]
    this._currentIndex += 1
    this._currentIndex %= valueList.length
    this._currentValue = valueList[this._currentIndex]

    this._updateState()
  }

  _updateState(): void {
    const bg: CanvasImageSource[] = Array.isArray(this._backgroundImage) ? this._backgroundImage : [this._backgroundImage]
    const bgList = [bg[0], ...bg]
    this.style.backgroundImage = bgList[this._currentIndex]
    if (this._currentValue) {
      this.style.rotate = Math.PI / 24
    } else {
      this.style.rotate = 0
    }
  }

  registerEvents(eventMap: { onClick?: () => void }): void {
    super.registerEvents({
      onClick: () => {
        this.click()
        eventMap.onClick?.()
      },
    })
  }

  setValue(mod: Mod | null): void {
    const valueList: (Mod | null)[] = [null, ...(Array.isArray(this._mod) ? this._mod : [this._mod])]
    let index = valueList.indexOf(mod)
    index = index < 0 ? index + valueList.length : index
    index %= valueList.length
    this._currentValue = mod
    this._currentIndex = index
    this._updateState()
  }

  get value(): Mod | null {
    return this._currentValue
  }

  get mod(): Mod | Mod[] {
    return this._mod
  }
}
