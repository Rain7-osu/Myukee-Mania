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
    if (this.#filename === filename) {
      return Promise.resolve()
    }

    this.#filename = filename

    return new Promise((resolve) => {
      this.#audio.src = filename
      this.#audio.controls = true
      this.#audio.autoplay = false

      const onLoad = () => {
        if (this.#audio.duration) {
          if (startTime) {
            this.#audio.currentTime = startTime / 100.0
          }

          this.#duration = this.#audio.duration * 1000
          this.#audio.removeEventListener('loadedmetadata', onLoad)
          resolve()
        }
      }

      this.#audio.addEventListener('loadedmetadata', onLoad)
    })
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
  get playing () { return this.#playing}
}
