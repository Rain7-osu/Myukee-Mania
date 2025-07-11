import { DEFAULT_DELAY_TIME, MAX_SPEED, MIN_SPEED } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'

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
   * @type {Map}
   */
  #playingMap

  /**
   * @type {AudioManager}
   */
  #playingAudio

  /**
   * drop flow speed
   * @type {number}
   */
  #speed = 20

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

  /**
   * use to calc fps
   * @type {number}
   */
  #lastRenderFpsTime = -1

  /**
   * @type {number}
   */
  #lastFpsValue = -1

  #lastCalcFpsFrame = -1

  #frameTimeList = []

  /**
   * @type {KeyboardEventManager}
   */
  #keyboardEventManager

  /**
   * @constructor
   * @param root {string} canvas node name
   */
  constructor (root ) {
    const canvas = document.getElementById(root)
    this.#renderEngine = new RenderEngine(canvas)
    this.#keyboardEventManager = new KeyboardEventManager()
  }

  /**
   * @param map {Map}
   * @param audio {AudioManager}
   * @return void
   */
  init (map, audio) {
    this.reset()
    this.#playingMap = map
    this.#playingAudio = audio
    this.#keyboardEventManager.registerStageEvent()
    this.initSectionLines()
  }

  initSectionLines() {
    // init section line
    const firstLine = this.#playingMap.offset
    const sectionLen = this.#playingMap.sectionLen
    const duration = this.#playingAudio.duration

    for (let i = firstLine; i < duration; i += sectionLen) {
      this.#sectionLines.push(Math.round(i))
    }
  }

  /**
   * @return void
   */
  reset() {
    this.#startTime = -1
    this.#pauseTime = -1
    this.#resumeTime = -1
    this.#lastRenderFpsTime = -1
    this.#lastFpsValue = -1
    this.#lastCalcFpsFrame = -1
  }

  /**
   * @param flag {boolean} true: run in resume
   * @return void
   */
  run(flag) {
    if (flag) {
      this.#playingAudio.play()
    } else {
      setTimeout(() => {
        this.#playingAudio.play()
      }, DEFAULT_DELAY_TIME)
    }
    this.#requestAnimationFrameHandle = window.requestAnimationFrame(() => {
      this.nextFrame()
      this.renderFrame()
    })
  }

  /**
   * @return void
   */
  start () {
    this.#startTime = Date.now() + DEFAULT_DELAY_TIME
    this.#renderEngine.setTime(this.#startTime)
    this.run(false)
  }

  /**
   * @return void
   */
  pause() {
    this.#pauseTime = Date.now()
    if (this.#requestAnimationFrameHandle) {
      window.cancelAnimationFrame(this.#requestAnimationFrameHandle)
    }
    this.#playingAudio.pause()
  }

  /**
   * @return void
   */
  resume() {
    setTimeout(() => {
      this.#resumeTime = Date.now()
      this.#startTime += this.#resumeTime - this.#pauseTime
      this.#renderEngine.setTime(this.#startTime)
      this.run(true)
    }, DEFAULT_DELAY_TIME)
  }

  renderNotes () {
    this.#playingMap.notes.forEach((note) => {
      this.#renderEngine.renderNote(note, this.#speed)
    })
  }

  // TODO
  //  do not use generate sectionLines list method to render, should use
  //  calculate in every render frame
  renderSectionLine () {
    const speed = this.#speed
    this.#sectionLines.forEach((offset) => {
      this.#renderEngine.renderSectionLine(offset, speed)
    })
  }

  renderFps() {
    const now = Date.now()
    this.#frameTimeList.push(now)

    const first = this.#frameTimeList[0]
    const last = this.#frameTimeList[this.#frameTimeList.length - 1]

    const fpsValue = (1000.0 * this.#frameTimeList.length / (last - first)).toFixed(0)

    if (this.#frameTimeList.length > 100) {
      this.#frameTimeList.shift()
    }

    this.#renderEngine.renderFps(fpsValue)
  }

  renderFrame () {
    this.#renderEngine.renderBackground()
    this.renderSectionLine()
    this.renderNotes()
    this.renderFps()
  }

  nextFrame () {
    this.#renderEngine.setNow(Date.now())
    this.renderFrame()
    this.#requestAnimationFrameHandle = window.requestAnimationFrame(() => {
      this.nextFrame()
    })
  }

  increaseSpeed() {
    if (this.#speed >= MAX_SPEED) {
      return
    }
    this.#speed++
  }

  decreaseSpeed() {
    if (this.#speed <= MIN_SPEED) {
      return
    }
    this.#speed--
  }

  retry () {
    this.#playingAudio.abort()
    this.reset()
    this.start()
  }

  get playingMap() {
    return this.#playingMap
  }

  get audio() {
    return this.#playingAudio
  }

  /**
   * @param timing {number}
   */
  renderSpecialTiming(timing) {
    this.#renderEngine.setTime(timing)
    this.renderFrame()
  }

  dispose() {
    this.#keyboardEventManager.disposeStageEvent()
  }
}

