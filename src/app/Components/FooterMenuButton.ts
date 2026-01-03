import { rgba } from '../_common/utils'
import { CANVAS, vw, vh } from '../Configs/Config'
import { Skin } from '../Configs/Skin'
import { RenderObject } from '../Core/RenderObject'
import { RenderButton } from './RenderButton'
import type { MainFooter } from '../Views/MainFooter';

const TRANSITION_DURATION = 300

export interface FooterMenuConfig {
  text: string
  key: string
  borderColor: string
  hoverStartColor: string
  hoverEndColor: string
  index: number
  widthScale?: number
  id: string
}

export class FooterMenuButton extends RenderButton {
  private readonly _config: FooterMenuConfig

  private _currentBorderColor: string

  private _currentBgStartColor: string

  private _currentBgEndColor: string

  private _hoverPercent: number = 0

  private _translateY: number = 0

  private _mainFooter: MainFooter

  set translateY(y: number) { this._translateY = y}

  constructor(container: HTMLCanvasElement, config: FooterMenuConfig, mainFooter: MainFooter) {
    const {
      menus: {
        left: LEFT,
        button: {
          width: BUTTON_WIDTH,
          gap: BUTTON_GAP,
          defaultBgStartColor: DEFAULT_BG_START_COLOR,
          defaultBgEndColor: DEFAULT_BG_END_COLOR,
        },
      },
      height: FOOTER_HEIGHT,
    } = Skin.config.main.footer
    super(container, {
      left: LEFT + config.index * BUTTON_WIDTH + config.index * BUTTON_GAP,
      top: CANVAS.HEIGHT - FOOTER_HEIGHT,
      width: BUTTON_WIDTH * (config.widthScale || 1),
      height: FOOTER_HEIGHT,
    })
    this._mainFooter = mainFooter
    this._config = config
    this._currentBgStartColor = DEFAULT_BG_START_COLOR
    this._currentBgEndColor = DEFAULT_BG_END_COLOR
    this._currentBorderColor = config.borderColor
  }

  async hover() {
    const { menus: { button: { hoverBorderColor: HOVER_BORDER_COLOR } } } = Skin.config.main.footer
    this.hovered = true
    this.cancelTransitions()
    const [sr, sg, sb, sa] = rgba.toValues(this._currentBgStartColor)
    const [er, eg, eb, ea] = rgba.toValues(this._currentBgEndColor)
    const [hsr, hsg, hsb, hsa] = rgba.toValues(this._config.hoverStartColor)
    const [her, heg, heb, hea] = rgba.toValues(this._config.hoverEndColor)
    const [bcr, bcg, bcb, bca] = rgba.toValues(this._currentBorderColor)
    const [hbcr, hbcg, hbcb, hbca] = rgba.toValues(HOVER_BORDER_COLOR)
    await this.createTransition(this._hoverPercent, 100, TRANSITION_DURATION, 'easeOut', value => {
      const progress = value / 100
      this._hoverPercent = value
      this._currentBgStartColor = rgba.format([
        sr + (hsr - sr) * progress,
        sg + (hsg - sg) * progress,
        sb + (hsb - sb) * progress,
        sa + (hsa - sa) * progress,
      ])
      this._currentBgEndColor = rgba.format([
        er + (her - er) * progress,
        eg + (heg - eg) * progress,
        eb + (heb - eb) * progress,
        ea + (hea - ea) * progress,
      ])
      this._currentBorderColor = rgba.format([
        bcr + (hbcr - bcr) * progress,
        bcg + (hbcg - bcg) * progress,
        bcb + (hbcb - bcb) * progress,
        bca + (hbca - bca) * progress,
      ])
    })
  }

  async hoverOut() {
    const {
      menus: {
        button: {
          defaultBgStartColor: DEFAULT_BG_START_COLOR,
          defaultBgEndColor: DEFAULT_BG_END_COLOR,
        },
      },
    } = Skin.config.main.footer
    this.hovered = false
    this.cancelTransitions()
    const [sr, sg, sb, sa] = rgba.toValues(this._currentBgStartColor)
    const [er, eg, eb, ea] = rgba.toValues(this._currentBgEndColor)
    const [dsr, dsg, dsb, dsa] = rgba.toValues(DEFAULT_BG_START_COLOR)
    const [der, deg, deb, dea] = rgba.toValues(DEFAULT_BG_END_COLOR)
    const [bcr, bcg, bcb, bca] = rgba.toValues(this._currentBorderColor)
    const [dbcr, dbcg, dbcb, dbca] = rgba.toValues(this._config.borderColor)
    await this.createTransition(this._hoverPercent, 0, TRANSITION_DURATION, 'easeOut', value => {
      this._hoverPercent = value
      const progress = 1 - value / 100
      this._currentBgStartColor = rgba.format([
        sr + (dsr - sr) * progress,
        sg + (dsg - sg) * progress,
        sb + (dsb - sb) * progress,
        sa + (dsa - sa) * progress,
      ])
      this._currentBgEndColor = rgba.format([
        er + (der - er) * progress,
        eg + (deg - eg) * progress,
        eb + (deb - eb) * progress,
        ea + (dea - ea) * progress,
      ])
      this._currentBorderColor = rgba.format([
        bcr + (dbcr - bcr) * progress,
        bcg + (dbcg - bcg) * progress,
        bcb + (dbcb - bcb) * progress,
        bca + (dbca - bca) * progress,
      ])
    })
  }

  protected override onClick() {
    this._mainFooter.clickFooter(this._config.id)
  }

  rect(): [number, number, number, number] {
    const [x, y, w, h] = super.rect()
    return [x, y + this._translateY, w, h]
  }

  render(context: CanvasRenderingContext2D) {
    const [x, y, w, h] = this.rect()
    const { text, key } = this._config
    const lines = text.split('\n')

    const renderBg = () => {
      context.save()
      const gradient = context.createLinearGradient(x, y, x, y + h)
      gradient.addColorStop(0, this._currentBgStartColor)
      gradient.addColorStop(0.2, this._currentBgStartColor)
      gradient.addColorStop(0.8, this._currentBgEndColor)
      gradient.addColorStop(1, this._currentBgEndColor)
      context.fillStyle = gradient
      context.fillRect(x, y, w, h)
      context.restore()
    }

    const renderText = () => {
      const { menus: { button: { color: BUTTON_TEXT_COLOR } } } = Skin.config.main.footer

      context.save()
      const FONT_SIZE = Math.min(vw(32 / 2560), vh(32 / 1440))
      const LINE_HEIGHT = Math.min(vw(36 / 2560), vh(36 / 1440))

      context.shadowColor = BUTTON_TEXT_COLOR
      context.shadowBlur = 5
      if (lines.length === 1) {
        RenderObject.drawText({
          context,
          text,
          width: w,
          height: h,
          x,
          y,
          font: `${FONT_SIZE}px 等线 Light`,
          color: BUTTON_TEXT_COLOR,
          stroke: false,
        })
      } else {
        const top = y + h / 2 - LINE_HEIGHT

        RenderObject.drawText({
          context,
          text: lines[0],
          width: w,
          height: LINE_HEIGHT,
          x,
          y: top,
          font: `${FONT_SIZE}px 等线 Light`,
          color: BUTTON_TEXT_COLOR,
          stroke: false,
        })
        RenderObject.drawText({
          context,
          text: lines[1],
          width: w,
          height: LINE_HEIGHT,
          x,
          y: top + LINE_HEIGHT,
          font: `${FONT_SIZE}px 等线 Light`,
          color: BUTTON_TEXT_COLOR,
          stroke: false,
        })
      }
      context.restore()
    }

    const renderOutline = () => {
      const {
        menus: {
          button: {
            outlineColor: BUTTON_OUTLINE_COLOR,
            outlineShadowColor: BUTTON_OUTLINE_SHADOW_COLOR,
          },
        },
      } = Skin.config.main.footer
      context.save()
      if (this.hovered) {
        context.fillStyle = this._config.hoverStartColor
        context.shadowColor = BUTTON_OUTLINE_SHADOW_COLOR
        context.shadowBlur = 4
      } else {
        context.fillStyle = BUTTON_OUTLINE_COLOR
        context.shadowColor = BUTTON_OUTLINE_SHADOW_COLOR
        context.shadowBlur = 2
      }
      context.fillRect(x, y, 1, h)
      context.fillRect(x + w, y, -1, h)
      context.restore()
    }

    const renderBorder = () => {
      const { borderWidth: BORDER_WIDTH } = Skin.config.main.footer
      context.save()
      context.fillStyle = this._currentBorderColor
      context.fillRect(x - 1, y, w + 2, -BORDER_WIDTH)
      context.restore()
    }

    const renderKey = () => {
      const { menus: { button: { color: BUTTON_TEXT_COLOR } } } = Skin.config.main.footer

      if (key) {
        const FONT_SIZE = Math.min(vw(28 / 2560), vh(32 / 1440))
        context.save()
        RenderObject.drawText({
          context,
          text: key,
          width: 0,
          height: 0,
          x: Math.round(x + w - 4),
          y: Math.round(y + h),
          font: `${FONT_SIZE}px 微软雅黑`,
          color: BUTTON_TEXT_COLOR,
          stroke: false,
          textAlign: 'right',
          textBaseline: 'bottom',
        })
        context.restore()
      }
    }

    renderBg()
    renderOutline()
    renderBorder()
    renderText()
    renderKey()
  }
}
