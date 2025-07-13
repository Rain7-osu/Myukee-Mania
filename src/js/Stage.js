import { DEFAULT_DELAY_TIME, MAX_SPEED, MIN_SPEED } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { FPS } from './FPS'
import { SectionLine } from './SectionLine'
import { ComboEffect } from './ComboEffect'
import { JudgementManager } from './JudgementManager'
import { JudgementEffect } from './JudgementEffect'
import { Judgement, JudgementType } from './Judgement'
import { KeyCode } from './KeyCode'
import { ScoreEffect } from './ScoreEffect'
import { ScoreManager } from './ScoreManager'

export class Stage {
  /**
   * @type {RenderEngine}
   */
  #renderEngine

  /**
   * @type {number}
   */
  #requestAnimationFrameHandle

  /**
   * @type {PlayMap}
   */
  #playingMap

  /**
   * @type {AudioManager}
   */
  #playingAudio

  /**
   * every section line offset
   * @type {number[]}
   */
  #sectionLines = []

  /**
   * start rendered time
   * @type {number}
   */
  #startTime = -1

  /**
   * pause game time
   * @type {number}
   */
  #pauseTime = -1

  /**
   * resume game time
   * @type {number}
   */
  #resumeTime = -1

  #frameTimeList = []

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @type {JudgementManager}
   */
  #judgementManager

  /** @type {ScoreManager} */
  #scoreManager

  /**
   * @type {HitEffectManager}
   */
  #hitEffects

  /**
   * @type {{ [key: KeyCode]: boolean }}
   */
  #keyStatus = {}

  /**
   * @constructor
   * @param root {string} canvas node name
   */
  constructor (root) {
    const canvas = document.getElementById(root)
    this.#renderEngine = new RenderEngine(canvas)
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#hitEffects = new HitEffectManager()
    this.#judgementManager = new JudgementManager()
    this.#scoreManager = new ScoreManager()
  }

  /**
   * @param map {PlayMap}
   * @param audio {AudioManager}
   * @return void
   */
  init (map, audio) {
    this.reset()
    this.#playingMap = map
    this.#playingAudio = audio
    this.initSectionLines()
    this.#judgementManager.init(this.#playingMap.notes)
    this.#scoreManager.init(this.playingMap.notes)
  }

  initSectionLines () {
    const timingList = this.#playingMap.timingList
    const duration = this.#playingAudio.duration

    let currentSection = -1
    for (let i = 0; i < timingList.length; i++) {
      const currentTiming = timingList[i]
      const startOffset = currentTiming.offset
      const sectionLen = currentTiming.beatLen * 4
      const endOffset = i + 1 >= timingList.length ? duration : timingList[i + 1].offset

      for (let j = 0; j + startOffset < endOffset; j += sectionLen) {
        currentSection = startOffset + j
        this.#sectionLines.push(currentSection)
      }
    }
  }

  /**
   * @return void
   */
  reset () {
    this.#startTime = -1
    this.#pauseTime = -1
    this.#resumeTime = -1
    this.#frameTimeList = []
    this.#judgementManager.reset()
  }

  /**
   * @param flag {boolean} true: run in resume
   * @return void
   */
  run (flag) {
    if (flag) {
      this.#playingAudio.play()
    } else {
      setTimeout(() => {
        this.#playingAudio.play()
      }, DEFAULT_DELAY_TIME)
    }
    this.nextFrame()
  }

  registerStageEvent () {
    const hitObjectKeys = [KeyCode.D, KeyCode.F, KeyCode.J, KeyCode.K]

    // { d: func, f: func, j: func, k: func}
    const hitObjectsUpEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          this.#hitEffects.releaseKey(key)
          this.#keyStatus[key] = false
        },
      }
    }, {})

    const hitObjectsDownEvents = hitObjectKeys.reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          this.#hitEffects.pressKey(key)
          this.#judgementManager.checkHit(performance.now() - this.#startTime)
          this.#keyStatus[key] = true
        }
      }
    }, {})

    this.#keyboardEventManager.registerStageEvent({
      keypressEventList: [],
      keyupEventList: {
        ...hitObjectsUpEvents,
      },
      keydownEventList: {
        ...hitObjectsDownEvents,
      },
    })
  }

  /**
   * @return void
   */
  start () {
    this.#startTime = performance.now() + DEFAULT_DELAY_TIME
    this.#renderEngine.setStartTime(this.#startTime)
    this.run(false)
    this.registerStageEvent()
  }

  /**
   * @return void
   */
  pause () {
    this.#pauseTime = performance.now()
    if (this.#requestAnimationFrameHandle) {
      window.cancelAnimationFrame(this.#requestAnimationFrameHandle)
    }
    this.#playingAudio.pause()
    this.#keyboardEventManager.removeStageEvent()
  }

  /**
   * @return void
   */
  resume () {
    setTimeout(() => {
      this.#resumeTime = performance.now()
      this.#startTime += this.#resumeTime - this.#pauseTime
      this.#renderEngine.setStartTime(this.#startTime)
      this.run(true)
    }, DEFAULT_DELAY_TIME)

    this.registerStageEvent()
  }

  retry () {
    this.#playingAudio.abort()
    this.reset()
    this.start()
  }

  renderFrame () {
    this.#renderEngine.renderBackground()
    this.renderSectionLine()
    this.renderNotes()
    this.renderFps()
    this.renderHitEffects()
    this.renderJudgementEffects()
    this.renderComboEffect()
    this.renderScoreEffect()
  }

  nextFrame () {
    const now = performance.now()
    this.#renderEngine.setNow(now)
    this.#judgementManager.update(now - this.#startTime)
    this.#scoreManager.calcScore()

    this.renderFrame()
    const animation = () => this.nextFrame()
    this.#requestAnimationFrameHandle = window.requestAnimationFrame(animation)
  }

  renderScoreEffect() {
    this.#renderEngine.renderShape(new ScoreEffect(this.#scoreManager.score))
  }

  renderJudgementEffects () {
    this.#judgementManager.activeEffects.forEach((e) => {
      this.#renderEngine.renderShape(e)
    })
  }

  renderComboEffect () {
    const combo = new ComboEffect(this.#judgementManager.combo)
    this.#renderEngine.renderShape(combo)
  }

  renderHitEffects () {
    this.#renderEngine.renderShape(this.#hitEffects)
  }

  renderNotes () {
    this.#playingMap.notes.forEach((note) => {
      this.#renderEngine.renderOffsetShape(note)
    })
  }

  renderSectionLine () {
    this.#sectionLines.forEach((offset) => {
      this.#renderEngine.renderOffsetShape(new SectionLine(offset))
    })
  }

  renderFps () {
    const now = performance.now()
    this.#frameTimeList.push(now)

    const first = this.#frameTimeList[0]
    const last = this.#frameTimeList[this.#frameTimeList.length - 1]

    const fpsValue = (1000.0 * this.#frameTimeList.length / (last - first)).toFixed(0)

    if (this.#frameTimeList.length > 200) {
      this.#frameTimeList.shift()
    }

    this.#renderEngine.renderShape(new FPS(fpsValue))
  }

  increaseSpeed () {
    if (this.#renderEngine.speed >= MAX_SPEED) {
      return
    }
    this.#renderEngine.speed++
  }

  decreaseSpeed () {
    if (this.#renderEngine.speed <= MIN_SPEED) {
      return
    }
    this.#renderEngine.speed--
  }

  get playingMap () {
    return this.#playingMap
  }

  get audio () {
    return this.#playingAudio
  }

  /**
   * @param timing {number}
   */
  renderSpecialTiming (timing) {
    this.#renderEngine.setStartTime(timing)
    this.renderFrame()
  }

  dispose () {
    this.#keyboardEventManager.removeStageEvent()
  }

  testRender () {
    this.#renderEngine.renderShape(new ScoreEffect(990133))
  }
}

