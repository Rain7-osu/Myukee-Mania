import { VolumeEffect } from '../Effects/VolumeEffect';
import { Settings } from '../Configs/Settings';
import type { IAudioManager } from '../Interfaces/IAudioManager';
import { KeyboardEventManager } from './KeyboardEventManager';
import { MouseEventManager } from './MouseEventManager';
import { KeyCode } from '../Enums/KeyCode';

export class VolumeManager {
  private readonly _masterEffect: VolumeEffect

  private readonly _settings: Settings

  private readonly _audioManager: IAudioManager

  private readonly _container: HTMLElement

  private readonly _keyboardEventManager: KeyboardEventManager

  private readonly _mouseEventManager: MouseEventManager

  private _display = false

  constructor(container: HTMLElement, audioManager: IAudioManager) {
    this._settings = Settings.getInstance()
    this._audioManager = audioManager
    this._masterEffect = new VolumeEffect(audioManager.volume)
    this._container = container
    this._keyboardEventManager = new KeyboardEventManager()
    this._mouseEventManager = new MouseEventManager(this._container, 'volume')
  }

  public set masterVolume(value: number) {
    this._audioManager.volume = value
    this._settings.set('masterVolume', value)
    this._masterEffect.updateTo(this._audioManager.volume)
  }

  public get masterVolume(): number {
    return this._audioManager.volume
  }

  public init(): void {
    this._settings.use('masterVolume', (key, value) => {
      this._masterEffect.show()
      this._masterEffect.updateTo(value)
      this._audioManager.volume = value
      return value
    })
    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        [KeyCode.ARROW_UP]: e => {
          if (e.altKey) {
            if (this._masterEffect.display) {
              this.masterVolume += 5
            }
            this._masterEffect.show()
          }
        },
        [KeyCode.ARROW_DOWN]: e => {
          if (e.altKey) {
            if (this._masterEffect.display) {
              this.masterVolume -= 5
            }
            this._masterEffect.show()
          }
        },
      },
    })
  }

  public update(now: number) {
    this._masterEffect.updateEffect(now)
  }

  get effects() {
    return [this._masterEffect]
  }

  get masterEffect() {
    return this._masterEffect
  }
}
