export class AudioManager {
  static #el = document.createElement('audio')
  static #container = document.getElementById('audio-control')
  static #instance = new AudioManager()

  static getInstance () {
    return AudioManager.#instance
  }

  /**
   * the length of the audio
   * @type {number} Units/millisecond
   */
  #duration = 0

  #playingFilename = ''

  /**
   * @param file {File?}
   */
  constructor (file) {
    if (!file) {
      return
    }
    AudioManager.#el.id = 'audio'
    const urlObj = URL.createObjectURL(file)
    AudioManager.#el.addEventListener('load', () => {
      this.#duration = AudioManager.#el.duration * 1000
      URL.revokeObjectURL(urlObj)
    })
    AudioManager.#el.src = urlObj
  }

  /**
   * load maps file
   * @param filename {string} filename
   * @param startTime {number?}
   * @return Promise<void>
   */
  load (filename, startTime) {
    return new Promise((resolve) => {
      AudioManager.#el.src = filename
      if (startTime) {
        AudioManager.#el.currentTime = startTime / 100.0
      }
      AudioManager.#el.controls = true
      AudioManager.#el.autoplay = false

      const onLoad = () => {
        if (AudioManager.#el.duration) {
          this.#duration = AudioManager.#el.duration * 1000
          AudioManager.#el.removeEventListener('loadedmetadata', onLoad)
          this.#playingFilename = filename
          resolve()
        }
      }

      AudioManager.#el.addEventListener('loadedmetadata', onLoad)
    })
  }

  /**
   * @param time {number}
   */
  setCurrentTime (time) {
    AudioManager.#el.currentTime = time
  }

  async play () {
    await AudioManager.#el.play()
  }

  abort () {
    AudioManager.#el.pause()
    AudioManager.#el.currentTime = 0
  }

  pause () {
    AudioManager.#el.pause()
  }

  get duration () {
    return this.#duration
  }
}
