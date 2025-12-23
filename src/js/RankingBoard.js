import { RenderObject } from './RenderObject'
import { Skin } from './Skin'
import { formatTime } from './utils'
import { CANVAS } from './Config'
import { ScoreEffect } from './ScoreEffect'
import { JudgementType } from './Judgement'
import { JudgementAssets } from './JudgementEffect'
import { AccuracyEffect } from './AccuracyEffect'
import { RankingEffect } from './RankingEffect'
import { BaseButton } from './BaseButton'
import { BackButton } from './BackButton'

/**
 * @typedef RankingResult
 * @property {number} accuracy
 * @property {Beatmap} beatmap
 * @property {number} score
 * @property {number} maxCombo
 * @property {boolean} fullCombo
 * @property {JudgementRecord} judgementRecord
 * @property {number} finishTime
 */

export class RankingBoard extends RenderObject {
  /**
   * @type {RankingResult}
   */
  #rankingResult

  /**
   * @type {Omit<RankingResult, 'beatmap'>}
   */
  #status

  /**
   * @type {ScoreEffect}
   */
  #scoreEffect

  /**
   * @type {RankingEffect}
   */
  #rankingEffect

  /**
   * @type {BaseButton}
   */
  #retryButton
  /**
   * @type {BaseButton}
   */
  #watchReplayButton
  /**
   * @type {boolean}
   */
  #hasRegistered = false

  /**
   * @type {MainController}
   */
  #mainController

  /**
   * @param container {HTMLCanvasElement}
   * @param mainController {MainController}
   */
  constructor (container, mainController) {
    super()
    this.#mainController = mainController
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
    this.#scoreEffect = new ScoreEffect({
      left: left + valueLeft,
      top: top + valueTop,
    })
    this.#rankingEffect = new RankingEffect(0, 'large', {
      right: rankingRight,
      top: rankingTop,
      scale: rankingScale,
    })
    this.#retryButton = new BaseButton(container, {
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
    this.#watchReplayButton = new BaseButton(container, {
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

  #alpha = 0

  #shown = false

  async show () {
    if (this.#alpha === 100) {
      return
    }
    this.cancelTransitions()
    await this.createTransition(this.#alpha, 100, 500, 'easeOut', value => this.#alpha = value)
    this.#shown = true
    const { accuracy, score } = this.#rankingResult
    await Promise.all([
      this.#scoreEffect.setScore(score, score / 200),
      this.#rankingEffect.setAccuracy(accuracy),
    ])
  }

  hide () {
    this.#alpha = 0
  }

  /**
   * @param rankingResult {RankingResult}
   */
  setResult (rankingResult) {
    this.#rankingResult = rankingResult
  }

  /**
   * @param now {number}
   */
  updateEffect (now) {
    super.updateEffect(now)
    this.#rankingEffect.updateEffect(now)
    this.#watchReplayButton.updateEffect(now)
    this.#retryButton.updateEffect(now)
    this.#scoreEffect.updateEffect(now)
  }

  registerEvents () {
    if (this.#hasRegistered) {
      return
    }
    this.#retryButton.registerEvents({
      onClick: async () => {
        await this.#mainController.fadeOut()
        this.hide()
        await this.#mainController.retry()
      },
    })
    this.#watchReplayButton.registerEvents({
      onClick: async () => {
        console.log('Not implements')
      },
    })
  }

  removeEvents () {
    if (!this.#hasRegistered) {
      return
    }
    this.#retryButton.removeEvents()
    this.#watchReplayButton.removeEvents()
  }

  render (context) {
    context.save()
    context.globalAlpha = this.#alpha / 100
    const {
      accuracy,
      judgementRecord,
      fullCombo,
      maxCombo,
      beatmap,
      finishTime,
    } = this.#rankingResult

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
      this.roundRect({
        context,
        x: left,
        y: top,
        width,
        height,
        radius,
        fill: true,
        stroke: false,
      })

      this.#scoreEffect.render(context)
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
        this.roundRect({
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

      /**
       * @param offsetX {number}
       * @param offsetY {number}
       * @param type {JudgementType}
       */
      const renderJudgement = (offsetX, offsetY, type) => {

        const value = judgementRecord[type] + 'x'
        const { image } = JudgementAssets[type]
        const { width, height } = image

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
      this.#rankingEffect.render(context)
    }

    const renderButtons = () => {
      this.#retryButton.render(context)
      this.#watchReplayButton.render(context)
    }

    renderHeader()
    renderScore()
    renderResults()
    if (this.#shown) {
      renderRanking()
    }
    renderButtons()
  }
}
