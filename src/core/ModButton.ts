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
  #mod: Mod | Mod[]

  #description: string | string[]

  #backgroundImage: CanvasImageSource | CanvasImageSource[]

  #currentValue: null | Mod

  #currentIndex = 0

  #keyBind: KeyCode

  get keyBind (): KeyCode { return this.#keyBind }

  constructor (container: HTMLCanvasElement, config: ModButtonConfig) {
    const { mod, description, backgroundImage, keyBind, ...style } = config
    super(container, style)
    this.#description = description
    this.#mod = mod
    this.#backgroundImage = backgroundImage
    this.#currentValue = null
    this.#keyBind = keyBind
    this.style.backgroundImage = Array.isArray(backgroundImage) ? backgroundImage[0] : backgroundImage
  }

  click (): void {
    const valueList = [null, ...(Array.isArray(this.#mod) ? this.#mod : [this.#mod])]
    this.#currentIndex += 1
    this.#currentIndex %= valueList.length
    this.#currentValue = valueList[this.#currentIndex]

    this._updateState()
  }

  _updateState (): void {
    const bg: CanvasImageSource[] = Array.isArray(this.#backgroundImage) ? this.#backgroundImage : [this.#backgroundImage]
    const bgList = [bg[0], ...bg]
    this.style.backgroundImage = bgList[this.#currentIndex]
    if (this.#currentValue) {
      this.style.rotate = Math.PI / 24
    } else {
      this.style.rotate = 0
    }
  }

  registerEvents (eventMap: { onClick?: () => void }): void {
    super.registerEvents({
      onClick: () => {
        this.click()
        eventMap.onClick?.()
      },
    })
  }

  setValue (mod: Mod | null): void {
    const valueList: (Mod | null)[] = [null, ...(Array.isArray(this.#mod) ? this.#mod : [this.#mod])]
    let index = valueList.indexOf(mod)
    index = index < 0 ? index + valueList.length : index
    index %= valueList.length
    this.#currentValue = mod
    this.#currentIndex = index
    this._updateState()
  }

  get value (): Mod | null {
    return this.#currentValue
  }

  get mod (): Mod | Mod[] {
    return this.#mod
  }
}
