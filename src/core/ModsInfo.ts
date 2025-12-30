import { RenderObject } from './RenderObject'
import { CANVAS, px, py } from './Config'
import { Mod } from './ModsPanel'

const TOP = 162
const LEFT = 160
const FONT = 64
const MAX_TRANSLATE_Y = 228

export const ModNameMap: Record<Mod, string> = {
  [Mod.DT]: 'DoubleTime',
  [Mod.RD]: 'Random',
  [Mod.SD]: 'SuddenDeath',
  [Mod.NF]: 'NoFail',
  [Mod.EZ]: 'Easy',
  [Mod.HT]: 'HalfTime',
  [Mod.NC]: 'Nightcore',
  [Mod.FL]: 'Flashlight',
  [Mod.AT]: 'Auto',
  [Mod.HD]: 'Hidden',
  [Mod.HR]: 'HardRock',
  [Mod.MR]: 'Mirror',
  [Mod.PF]: 'Perfect',
  [Mod.FD]: 'FadeIn',
}

export class ModsInfoEffect extends RenderObject {
  #mods: Mod[] = []

  #translateY = 0

  constructor () {
    super()
    this.display = false
  }

  async hide (): Promise<void> {
    if (this.display) {
      this.cancelTransitions()
      await this.createTransition(this.#translateY, py(MAX_TRANSLATE_Y), 100, 'easeOut', value => this.#translateY = value)
    } else {
      return Promise.resolve()
    }
  }

  async show (): Promise<void> {
    if (this.display) {
      this.cancelTransitions()
      await this.createTransition(this.#translateY, 0, 100, 'easeOut', value => this.#translateY = value)
    } else {
      return Promise.resolve()
    }
  }

  set mods (mods: Mod[]) {
    this.#mods = mods
    this.display = !!mods.length
  }

  render (context: CanvasRenderingContext2D): void {
    const top = CANVAS.HEIGHT - py(TOP) + this.#translateY
    const left = px(LEFT)
    const text = this.#mods.map(mod => ModNameMap[mod]).join(',')
    context.save()
    context.font = `${py(FONT)}px 微软雅黑`
    context.fillStyle = 'rgba(255, 255, 255, 0.4)'
    context.textBaseline = 'bottom'
    context.fillText(text, left, top)
    context.restore()
  }
}
