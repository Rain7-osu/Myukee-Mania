import type { IEditable } from './IEditable';

export interface ISettingItem<T extends number | string | boolean> extends IEditable<T>{
  registerEvents(): void

  removeEvents(): void

  render(context: CanvasRenderingContext2D): void

  updateEffect(now: number): void;
}
