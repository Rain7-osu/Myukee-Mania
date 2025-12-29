import { Mod } from './ModsPanel'
import { shuffleArray } from './utils'

export class AudioManager {
  /**
   * @type {HTMLAudioElement}
   */
  #audio
  /**
   * the length of the audio
   * @type {number} Units/millisecond
   */
  #duration = 0

  #filename = ''

  #playing = false

  #startTime = 0

  constructor () {
    this.#audio = new Audio()
    document.body.appendChild(this.#audio)
    this.#audio.style.position = 'fixed'
    this.#audio.style.top = '50%'
    this.#audio.style.zIndex = '999'
    this.#audio.id = 'test'
  }

  /**
   * load maps file
   * @param filename {string} filename
   * @param startTime {number?}
   * @return Promise<void>
   */
  async load (filename, startTime = 0) {
    this.#startTime = startTime
    if (this.#filename === filename) {
      return Promise.resolve()
    }

    this.#filename = filename
    const res = await fetch(filename)
    const blob = await res.blob()
    const src = URL.createObjectURL(blob)

    return new Promise((resolve) => {
      this.#audio.src = src
      this.#audio.controls = false
      this.#audio.autoplay = false
      this.#audio.currentTime = startTime / 1000

      const onLoad = () => {
        if (this.#audio.duration) {
          this.#duration = this.#audio.duration * 1000
          this.#audio.removeEventListener('canplaythrough', onLoad)
          resolve()
        }
      }

      this.#audio.addEventListener('canplaythrough', onLoad)
    })
  }

  /**
   * @param value {boolean}
   */
  set repeat (value) {
    if (value) {
      this.#audio.onended = () => {
        this.#audio.currentTime = this.#startTime / 1000
        setTimeout(() => {
          this.play()
        }, 1000)
      }
    } else {
      this.#audio.onended = undefined
    }
  }

  /**
   * @return {string}
   */
  get filename () { return this.#filename}

  /**
   * @param time {number}
   */
  setCurrentTime (time) {
    this.#audio.currentTime = time
  }

  /**
   * @param value {number}
   */
  setRate (value) {
    this.#audio.playbackRate = value
    this.#audio.preservesPitch = false
  }

  /**
   * @param value {boolean}
   */
  set preservesPitch (value) {
    this.#audio.preservesPitch = value
  }

  async play () {
    await this.#audio.play()
    this.#playing = true
  }

  abort () {
    this.#audio.pause()
    this.#playing = false
    this.#audio.currentTime = 0
  }

  pause () {
    this.#audio.pause()
    this.#playing = false
  }

  /**
   * @param mod {Mod}
   */
  applyMod (mod) {
    if (mod === Mod.HT) {
      this.setRate(0.75)
    } else if (mod === Mod.DT) {
      this.setRate(1.5)
    } else if (mod === Mod.NC) {
      this.setRate(1.5)
      this.preservesPitch = false
    }
  }

  async resume () {
    await this.#audio.play()
    this.#playing = true
  }

  /**
   * @return {number}
   */
  get duration () {
    return this.#duration
  }

  /**
   * @return {boolean}
   */
  get playing () { return this.#playing }

}
