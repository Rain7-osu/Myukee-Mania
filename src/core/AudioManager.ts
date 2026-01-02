import { Mod } from './ModsPanel'
import { DEFAULT_DELAY_TIME } from './Config'

export class AudioManager {
  private _audio: HTMLAudioElement
  /**
   * the length of the audio
   */
  private _duration = 0
  private _filename = ''
  private _playing = false
  private _startTime = 0

  constructor() {
    this._audio = new Audio()
    document.body.appendChild(this._audio)
    this._audio.style.position = 'fixed'
    this._audio.style.top = '50%'
    this._audio.style.zIndex = '999'
    this._audio.id = 'test'
  }

  async load(filename: string, startTime: number = 0): Promise<void> {
    this._startTime = startTime
    if (this._filename === filename) {
      return Promise.resolve()
    }

    this._filename = filename
    const res = await fetch(filename)
    const blob = await res.blob()
    const src = URL.createObjectURL(blob)

    return new Promise<void>(resolve => {
      this._audio.src = src
      this._audio.controls = false
      this._audio.autoplay = false
      this._audio.currentTime = startTime / 1000

      const onLoad = () => {
        if (this._audio.duration) {
          this._duration = this._audio.duration * 1000
          this._audio.removeEventListener('canplaythrough', onLoad)
          resolve()
        }
      }

      this._audio.addEventListener('canplaythrough', onLoad)
    })
  }

  private _repeatPlay = () => {
    this._audio.currentTime = this._startTime / 1000
    setTimeout(() => {
      this.play()
    }, DEFAULT_DELAY_TIME)
  }

  set repeat(value: boolean) {
    if (value) {
      this._audio.addEventListener('ended', this._repeatPlay)
    } else {
      this._audio.removeEventListener('ended', this._repeatPlay)
    }
  }

  get filename(): string { return this._filename}

  setCurrentTime(time: number): void {
    this._audio.currentTime = time
  }

  setRate(value: number): void {
    this._audio.playbackRate = value
    this._audio.preservesPitch = false
  }

  set preservesPitch(value: boolean) {
    this._audio.preservesPitch = value
  }

  async play(): Promise<void> {
    await this._audio.play()
    this._playing = true
  }

  abort(): void {
    this._audio.pause()
    this._playing = false
    this._audio.currentTime = 0
  }

  pause(): void {
    this._audio.pause()
    this._playing = false
  }

  applyMod(mod: Mod): void {
    if (mod === Mod.HT) {
      this.setRate(0.75)
      this.preservesPitch = true
    } else if (mod === Mod.DT) {
      this.setRate(1.5)
      this.preservesPitch = true
    } else if (mod === Mod.NC) {
      this.setRate(1.5)
      this.preservesPitch = false
    }
  }

  async resume(): Promise<void> {
    await this._audio.play()
    this._playing = true
  }

  get duration(): number {
    return this._duration
  }

  get playing(): boolean { return this._playing }

}
