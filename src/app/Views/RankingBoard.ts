import { RenderObject } from '../Core/RenderObject';
import { ScoreEffect } from '../Effects/ScoreEffect';
import { RankingEffect } from '../Effects/RankingEffect';
import { BaseButton } from '../Components/BaseButton';
import { KeyboardEventManager } from '../Managers/KeyboardEventManager';
import { Skin } from '../Configs/Skin';
import { KeyCode } from '../Enums/KeyCode';
import { formatTime } from '../_common/utils';
import { CANVAS } from '../Configs/Config';
import { JudgementAssets } from '../Effects/JudgementEffect';
import { AccuracyEffect } from '../Effects/AccuracyEffect';
import { JudgementType } from '../Enums/JudgementType';

export interface RankingResult {
  accuracy: number
  beatmap: any
  score: number
  maxCombo: number
  fullCombo: boolean
  judgementRecord: any
  finishTime: number
}

export class RankingBoard extends RenderObject {
  private _rankingResult: RankingResult

  private _status: Omit<RankingResult, 'beatmap'>

  private _scoreEffect: ScoreEffect

  private _rankingEffect: RankingEffect

  private _retryButton: BaseButton
  private _watchReplayButton: BaseButton
  private _hasRegistered: boolean = false

  private _mainController: any

  private _keyboardEventManager = new KeyboardEventManager()

  constructor(container: HTMLCanvasElement, mainController: any) {
    super()
    this._mainController = mainController
    const {
      score: {
        left,
        top,
        value: { left: valueLeft, top: valueTop },
      },
      ranking: {
        right: rankingRight,
        top: rankingTop,
        scale: rankingScale,
      },
      buttons: {
        retry,
        watchReplay,
        back,
      },
    } = Skin.config.rankingBoard
    this._scoreEffect = new ScoreEffect({
      left: left + valueLeft,
      top: top + valueTop,
      width: 0,
      height: 0,
    })
    this._rankingEffect = new RankingEffect(0, 'large', {
      right: rankingRight,
      top: rankingTop,
      scale: rankingScale,
    })
    this._retryButton = new BaseButton(container, {
      width: retry.width,
      height: retry.height,
      text: retry.text,
      left: retry.left,
      top: retry.top,
      background: retry.background,
      hoverBackground: retry.hoverBackground,
      color: retry.color,
      font: retry.font,
      fontSize: retry.fontSize,
      hoverScale: 100,
    })
    this._watchReplayButton = new BaseButton(container, {
      width: watchReplay.width,
      height: watchReplay.height,
      left: watchReplay.left,
      top: watchReplay.top,
      text: watchReplay.text,
      background: watchReplay.background,
      hoverBackground: watchReplay.hoverBackground,
      color: watchReplay.color,
      font: watchReplay.font,
      fontSize: watchReplay.fontSize,
      hoverScale: 100,
    })
  }

  private _alpha: number = 0

  private _shown: boolean = false

  async show(): Promise<void> {
    if (this._alpha === 100) {
      return
    }
    this.cancelTransitions()
    await this.createTransition(this._alpha, 100, 500, 'easeOut', value => this._alpha = value)
    this._shown = true
    const { accuracy, score } = this._rankingResult
    await Promise.all([
      this._scoreEffect.setScore(score, score / 200),
      this._rankingEffect.setAccuracy(accuracy),
    ])
  }

  hide(): void {
    this._alpha = 0
  }

  setResult(rankingResult: RankingResult): void {
    this._rankingResult = rankingResult
  }

  updateEffect(now: number): void {
    super.updateEffect(now)
    this._rankingEffect.updateEffect(now)
    this._watchReplayButton.updateEffect(now)
    this._retryButton.updateEffect(now)
    this._scoreEffect.updateEffect(now)
  }

  registerEvents(): void {
    if (this._hasRegistered) {
      return
    }
    this._retryButton.registerEvents({
      onClick: async () => {
        await this._mainController.fadeOut()
        this.hide()
        await this._mainController.retry()
      },
    })
    this._watchReplayButton.registerEvents({
      onClick: async () => {
        console.log('Not implements')
      },
    })
    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ESCAPE]: () => {
          this._mainController.backMain()
        },
      },
    })
  }

  removeEvents(): void {
    if (!this._hasRegistered) {
      return
    }
    this._retryButton.removeEvents()
    this._watchReplayButton.removeEvents()
    this._keyboardEventManager.removeEvents()
  }

  render(context: CanvasRenderingContext2D): void {
    context.save()
    context.globalAlpha = this._alpha / 100
    const {
      accuracy,
      judgementRecord,
      fullCombo,
      maxCombo,
      beatmap,
      finishTime,
    } = this._rankingResult

    const {
      header: HEADER_CONFIG,
      results: RESULTS_CONFIG,
      score: SCORE_CONFIG,
    } = Skin.config.rankingBoard

    const renderHeader = () => {
      const { title: beatmapTitle, creator } = beatmap
      const {
        info: { title, subtitle, description, left, top: INFO_TOP },
        label,
        left: HEADER_LEFT,
        top: HEADER_TOP,
        background: HEADER_BACKGROUND,
        width: HEADER_WIDTH,
        height: HEADER_HEIGHT,
      } = HEADER_CONFIG

      const x = left + HEADER_LEFT
      let offsetY = HEADER_TOP + INFO_TOP

      context.fillStyle = HEADER_BACKGROUND
      context.fillRect(HEADER_LEFT, HEADER_TOP, HEADER_WIDTH, HEADER_HEIGHT)

      // 设置文本对齐方式为居中
      context.textAlign = 'left'
      context.textBaseline = 'middle'

      const renderTitle = () => {
        const { color, font, fontSize, lineHeight } = title
        context.fillStyle = color
        context.font = `${fontSize}px ${font}`
        context.fillText(beatmapTitle, x, offsetY + lineHeight / 2)
        offsetY += lineHeight
      }

      const renderSubtitle = () => {
        const { color, font, fontSize, lineHeight } = subtitle
        context.fillStyle = color
        context.font = `${fontSize}px ${font}`
        context.fillText(`Beatmap by ${creator}`, x, offsetY + lineHeight / 2)
        offsetY += lineHeight
      }

      const renderDescription = () => {
        const { color, font, fontSize, lineHeight } = description
        context.fillStyle = color
        context.font = `${fontSize}px ${font}`
        context.fillText(`Played on ${formatTime(finishTime)}`, x, offsetY + lineHeight / 2)
      }

      const renderLabel = () => {
        const { right, color, font, fontSize, lineHeight, top } = label
        const HEADER_RIGHT = CANVAS.WIDTH - HEADER_WIDTH
        context.fillStyle = color
        context.font = `${fontSize}px ${font}`
        const { width } = context.measureText('Ranking')
        const x = CANVAS.WIDTH - width - right - HEADER_RIGHT
        const y = HEADER_TOP + top + lineHeight / 2
        context.fillText('Ranking', x, y)
      }

      renderTitle()
      renderSubtitle()
      renderDescription()
      renderLabel()
    }

    const renderScore = () => {
      const { top, left, background, height, width, radius } = SCORE_CONFIG

      context.fillStyle = background
      RenderObject.roundRect({
        context,
        x: left,
        y: top,
        width,
        height,
        radius,
        fill: true,
        stroke: false,
      })

      this._scoreEffect.render(context)
    }

    const renderResults = () => {
      const {
        judgement: JUDGEMENT_CONFIG,
        combo: COMBO_CONFIG,
        accuracy: ACCURACY_CONFIG,
        background,
        left: RESULTS_LEFT,
        radius,
        top: RESULTS_TOP,
        width: RESULTS_WIDTH,
        height: RESULTS_HEIGHT,
      } = RESULTS_CONFIG

      const {
        font,
        fontSize,
        fontWeight,
        color,
        strokeColor,
        itemLeft,
        itemValueLeft,
        itemTop,
        itemHeight,
      } = JUDGEMENT_CONFIG

      const halfItemLeft = itemLeft + RESULTS_WIDTH / 2

      const renderResultsBg = () => {
        context.fillStyle = background
        RenderObject.roundRect({
          context,
          x: RESULTS_LEFT,
          y: RESULTS_TOP,
          width: RESULTS_WIDTH,
          height: RESULTS_HEIGHT,
          radius,
          fill: true,
          stroke: false,
        })
      }

      const renderJudgement = (offsetX: number, offsetY: number, type: number): void => {
        const { scale } = Skin.config.rankingBoard.results.judgement
        const value = judgementRecord[type] + 'x'
        const { image } = JudgementAssets[type]
        const { width, height } = { width: image.width * scale, height: image.height * scale }

        context.drawImage(image, offsetX + (itemValueLeft - itemLeft - width) / 2, offsetY + (itemHeight - height) / 2, width, height)
        context.fillStyle = color
        context.strokeStyle = strokeColor
        context.lineWidth = 2
        context.font = `${fontWeight} ${fontSize}px ${font}`
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillText(value, offsetX + itemValueLeft, offsetY + itemHeight / 2 + fontSize / 10)
        context.strokeText(value, offsetX + itemValueLeft, offsetY + itemHeight / 2 + fontSize / 10)
      }

      const renderCombo = () => {
        const { itemLeft, top, color, font, fontSize, fontWeight, itemHeight, lineHeight, strokeColor } = COMBO_CONFIG

        context.fillStyle = color
        context.strokeStyle = strokeColor
        context.lineWidth = 2
        context.font = `${fontWeight} ${fontSize}px ${font}`
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillText(maxCombo + 'x', itemLeft, top + RESULTS_TOP + +itemHeight / 2 + fontSize / 10)
        context.strokeText(maxCombo + 'x', itemLeft, top + RESULTS_TOP + +itemHeight / 2 + fontSize / 10)
      }

      const renderAccuracy = () => {
        const acc = AccuracyEffect.format(accuracy)
        const {
          itemLeft,
          top,
          color,
          font,
          fontSize,
          fontWeight,
          itemHeight,
          strokeColor,
        } = ACCURACY_CONFIG

        context.fillStyle = color
        context.strokeStyle = strokeColor
        context.lineWidth = 2
        context.font = `${fontWeight} ${fontSize}px ${font}`
        context.textAlign = 'left'
        context.textBaseline = 'middle'
        context.fillText(acc, itemLeft, top + RESULTS_TOP + itemHeight / 2 + fontSize / 10)
        context.strokeText(acc, itemLeft, top + RESULTS_TOP + itemHeight / 2 + fontSize / 10)
      }

      renderResultsBg()

      let offsetY = itemTop + RESULTS_TOP
      renderJudgement(itemLeft, offsetY, JudgementType.GREAT)
      renderJudgement(halfItemLeft, offsetY, JudgementType.PERFECT)
      offsetY += itemHeight + itemTop
      renderJudgement(itemLeft, offsetY, JudgementType.GOOD)
      renderJudgement(halfItemLeft, offsetY, JudgementType.OK)
      offsetY += itemHeight + itemTop
      renderJudgement(itemLeft, offsetY, JudgementType.MEH)
      renderJudgement(halfItemLeft, offsetY, JudgementType.MISS)

      renderCombo()
      renderAccuracy()
    }

    const renderRanking = () => {
      this._rankingEffect.render(context)
    }

    const renderButtons = () => {
      this._retryButton.render(context)
      this._watchReplayButton.render(context)
    }

    renderHeader()
    renderScore()
    renderResults()
    if (this._shown) {
      renderRanking()
    }
    renderButtons()
    context.restore()
  }
}
