export interface IAudioManager {
  set volume(volume: number): void

  get volume(): number

  pause(): void

  resume(): Promise<void>

  play(): Promise<void>

  abort(): void
}
