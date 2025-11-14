export class Container {
  constructor ({
    x,
    y,
    w,
    h,
  }) {}

  scroll(delta) {
    this.y = delta
  }
}
