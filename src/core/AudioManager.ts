import { Mod } from './ModsPanel'

export class AudioManager {
  #audio: HTMLAudioElement
  /**
   * the length of the audio
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

  async load (filename: string, startTime: number = 0): Promise<void> {
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

  set repeat (value: boolean) {
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

  get filename (): string { return this.#filename}

  setCurrentTime (time: number): void {
    this.#audio.currentTime = time
  }

  setRate (value: number): void {
    this.#audio.playbackRate = value
    this.#audio.preservesPitch = false
  }

  set preservesPitch (value: boolean) {
    this.#audio.preservesPitch = value
  }

  async play (): Promise<void> {
    await this.#audio.play()
    this.#playing = true
  }

  abort (): void {
    this.#audio.pause()
    this.#playing = false
    this.#audio.currentTime = 0
  }

  pause (): void {
    this.#audio.pause()
    this.#playing = false
  }

  applyMod (mod: Mod): void {
    if (mod === Mod.HT) {
      this.setRate(0.75)
    } else if (mod === Mod.DT) {
      this.setRate(1.5)
    } else if (mod === Mod.NC) {
      this.setRate(1.5)
      this.preservesPitch = false
    }
  }

  async resume (): Promise<void> {
    await this.#audio.play()
    this.#playing = true
  }

  get duration (): number {
    return this.#duration
  }

  get playing (): boolean { return this.#playing }

}
