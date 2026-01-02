import { Element } from './Element';
import { py } from '../Config';

export class MouseTip extends Element {
  private static instance: MouseTip | null

  public static createInstance(container: HTMLCanvasElement): MouseTip {
    return this.instance || (this.instance = new MouseTip(container))
  }

  public static getInstance(): MouseTip | null {
    return this.instance
  }

  constructor(container: HTMLCanvasElement) {
    super(container, {
      width: 0,
      height: 12,
      offsetX: 0,
      offsetY: 0,
      translateX: 0,
      translateY: 0,
    });
    this.display = false
  }

  private _text: string = ''

  get text(): string {
    return this._text
  }

  set text(text: string) {
    this._text = text
  }

  private _opacity = 0

  private _innerStyle = {
    font: `14px 等线 Light`,
    fontSize: 14,
    paddingLeft: 3,
    paddingTop: 3,
    borderRadius: 3,
  }

  async show() {
    this.display = true
    this.cancelTransitions()
    await this.createTransition(this._opacity, 1, 300, 'easeOut', value => this._opacity = value)
  }

  async hide() {
    this.cancelTransitions()
    await this.createTransition(this._opacity, 0, 300, 'easeOut', value => this._opacity = value)
    this.display = false
  }

  override render(context: CanvasRenderingContext2D) {
    const [x, y, _, h] = this.rect();
    context.font = this._innerStyle.font;

    const width = context.measureText(this._text).width;
    const realWidth = width + this._innerStyle.paddingLeft * 2;
    const realHeight = h + this._innerStyle.paddingTop * 2;

    context.save()

    context.globalAlpha = this._opacity;
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.strokeStyle = 'rgb(160, 160, 160)';
    context.lineWidth = 1;
    context.beginPath();
    context.roundRect(x, y, realWidth, realHeight, this._innerStyle.borderRadius);
    context.fill();
    context.stroke();

    context.fillStyle = 'rgb(255, 255, 255)';
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(this._text, x + realWidth / 2, y + realHeight / 2);

    context.restore()
  }
}
