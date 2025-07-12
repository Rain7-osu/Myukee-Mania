import { DEFAULT_DELAY_TIME, DEFAULT_SPEED, MAX_SPEED, MIN_SPEED } from './Config'
import { KeyboardEventManager } from './KeyboardEventManager'
import { RenderEngine } from './RenderEngine'
import { HitEffectManager } from './HitEffectManager'
import { FPS } from './FPS'
import { SectionLine } from './SectionLine'

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
   * @type {HitEffectManager}
   */
  #hitEffects

  /**
   * @constructor
   * @param root {string} canvas node name
   */
  constructor (root) {
    const canvas = document.getElementById(root)
    this.#renderEngine = new RenderEngine(canvas)
    this.#keyboardEventManager = new KeyboardEventManager()
    this.#hitEffects = new HitEffectManager()
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
  }

  initSectionLines () {
    // init section line
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
    this.#keyboardEventManager.registerStageEvent({
      keypressEventList: [],
      keyupEventList: [
        (e) => {
          this.#hitEffects.releaseKey(e.key.toLowerCase())
        },
      ],
      keydownEventList: [
        (e) => {
          this.#hitEffects.pressKey(e.key.toLowerCase())
        },
      ],
    })
  }

  /**
   * @return void
   */
  start () {
    this.#startTime = Date.now() + DEFAULT_DELAY_TIME
    this.#renderEngine.setStartTime(this.#startTime)
    this.run(false)
    this.registerStageEvent()
  }

  /**
   * @return void
   */
  pause () {
    this.#pauseTime = Date.now()
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
      this.#resumeTime = Date.now()
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
  }

  nextFrame () {
    this.#renderEngine.setNow(Date.now())
    this.renderFrame()
    const animation = () => this.nextFrame()
    this.#requestAnimationFrameHandle = window.requestAnimationFrame(animation)
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
    const now = Date.now()
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
}

