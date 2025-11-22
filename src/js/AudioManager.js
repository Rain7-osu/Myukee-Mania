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

  constructor () {
    this.#audio = new Audio()
  }

  /**
   * load maps file
   * @param filename {string} filename
   * @param startTime {number?}
   * @return Promise<void>
   */
  load (filename, startTime) {
    return new Promise((resolve) => {
      this.#audio.src = filename
      if (startTime) {
        this.#audio.currentTime = startTime / 100.0
      }
      this.#audio.controls = true
      this.#audio.autoplay = false

      const onLoad = () => {
        if (this.#audio.duration) {
          this.#duration = this.#audio.duration * 1000
          this.#audio.removeEventListener('loadedmetadata', onLoad)
          resolve()
        }
      }

      this.#audio.addEventListener('loadedmetadata', onLoad)
    })
  }

  /**
   * @param time {number}
   */
  setCurrentTime (time) {
    this.#audio.currentTime = time
  }

  async play () {
    await this.#audio.play()
  }

  abort () {
    this.#audio.pause()
    this.#audio.currentTime = 0
  }

  pause () {
    this.#audio.pause()
  }

  async resume () {
    await this.#audio.play()
  }

  get duration () {
    return this.#duration
  }
}
