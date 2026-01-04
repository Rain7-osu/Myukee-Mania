export interface IEditable<T extends number | string | boolean> {
  onChange(callback: (value: T) => void): void

  onMouseEnter(callback: (value: T) => void): void

  onMouseLeave(callback: (value: T) => void): void

  get value(): T

  set value(value: T): void
}
