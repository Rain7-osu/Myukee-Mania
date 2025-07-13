export class AudioManager {
  static #el = document.createElement('audio')
  static #container = document.getElementById('audio-control')

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
    AudioManager.#el.id = 'audio'
    const urlObj = URL.createObjectURL(file)
    AudioManager.#el.addEventListener('load', () => {
      this.#duration = AudioManager.#el.duration * 1000
      URL.revokeObjectURL(urlObj)
    })
    if (!AudioManager.#container.contains(AudioManager.#el)) {
      AudioManager.#container.appendChild(AudioManager.#el)
    }
    AudioManager.#el.controls = true
    AudioManager.#el.src = urlObj
  }

  /**
   * load resources file
   * @param filename {string} filename
   * @return Promise<void>
   */
  load(filename) {
    return new Promise((resolve) => {
      AudioManager.#el.src = `./resources/${filename}`
      AudioManager.#el.controls = true
      if (!AudioManager.#container.contains(AudioManager.#el)) {
        AudioManager.#container.appendChild(AudioManager.#el)
      }

      const onLoad = () => {
        this.#duration = AudioManager.#el.duration * 1000
        AudioManager.#el.removeEventListener('canplaythrough', onLoad)
        resolve()
      }

      AudioManager.#el.addEventListener('canplaythrough', onLoad)
    })
  }

  async play() {
    await AudioManager.#el.play()
  }

  abort() {
    AudioManager.#el.pause()
    AudioManager.#el.currentTime = 0
  }

  pause() {
    AudioManager.#el.pause()
  }

  get duration() {
    return this.#duration
  }
}
