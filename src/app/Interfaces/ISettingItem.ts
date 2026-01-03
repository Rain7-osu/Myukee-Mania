export interface ISettingItem<T extends number | string> {
  onChange(callback: (value: T) => void): void

  registerEvents(): void

  removeEvents(): void

  render(context: CanvasRenderingContext2D): void

  updateEffect(now: number): void;
}
