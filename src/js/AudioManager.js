export class AudioManager {
  #el = document.createElement('audio')

  /**
   * the length of the audio
   * @type {number} Units/millisecond
   */
  #duration = 0

  /**
   * @param file {File | undefined}
   */
  constructor (file) {
    if (!file) {
      return;
    }
    const urlObj = URL.createObjectURL(file)
    this.#el.addEventListener('load', () => {
      this.#duration = this.#el.duration * 1000
      URL.revokeObjectURL(urlObj)
    })
    document.body.appendChild(this.#el)
    this.#el.controls = true
    this.#el.src = urlObj
  }

  /**
   * load resources file
   * @param filename {string} filename
   * @return Promise<void>
   */
  load(filename) {
    return new Promise((resolve) => {
      this.#el.src = `./resources/${filename}`
      this.#el.controls = true
      document.getElementById('audio-control').append(this.#el)

      const onLoad = () => {
        this.#duration = this.#el.duration * 1000
        this.#el.removeEventListener('canplaythrough', onLoad)
        resolve()
      }

      this.#el.addEventListener('canplaythrough', onLoad)
    })
  }

  async play() {
    await this.#el.play()
  }

  abort() {
    this.#el.pause()
    this.#el.currentTime = 0
  }

  pause() {
    this.#el.pause()
  }

  get duration() {
    return this.#duration
  }
}
