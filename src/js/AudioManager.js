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
    if (this.#filename === filename) {
      return Promise.resolve()
    }

    this.#filename = filename
    const res = await fetch(filename)
    const blob = await res.blob()
    const urlObj = URL.createObjectURL(blob)

    return new Promise((resolve) => {
      this.#audio.src = urlObj
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
