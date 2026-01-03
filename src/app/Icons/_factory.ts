import { rgba } from '../_common/utils';
import { FrameSnapshot } from '../Core/FrameSnapshot';

const BUTTON_TEXT_COLOR = '#fff'
export const MOD_WIDTH = 256
export const MOD_HEIGHT = 256

interface CreateModIconRenderOptions {
  baseFill: string
  fontSize: number
  text: string
  bottom?: number
  draw?: (context: CanvasRenderingContext2D) => void
}

const createModIconRender = ({
  baseFill,
  fontSize,
  text,
  bottom = 6,
  draw,
}: CreateModIconRenderOptions): (context: CanvasRenderingContext2D) => void => {
  return context => {
    const [r, g, b, a] = rgba.toValues(baseFill)
    context.fillStyle = 'rgb(0, 0, 0)'
    context.roundRect(0, 0, MOD_WIDTH, MOD_HEIGHT, [8])
    context.fill()
    const calc = (v, s) => Math.round((255 - v) * s + v)
    const gradient = context.createLinearGradient(0, 0, 0, MOD_HEIGHT)
    gradient.addColorStop(0, rgba.format([calc(r, 0.1), calc(g, 0.1), calc(b, 0.1), a]))
    gradient.addColorStop(0.5, rgba.format([r, g, b, a]))
    gradient.addColorStop(0.8, rgba.format([r, g, b, a]))
    gradient.addColorStop(1, rgba.format([calc(r, -0.15), calc(g, -0.15), calc(b, -0.15), a]))
    context.fillStyle = gradient
    context.beginPath()
    context.roundRect(0, 0, MOD_WIDTH, MOD_HEIGHT, [8])
    context.fill()
    context.fillStyle = BUTTON_TEXT_COLOR
    context.font = `${fontSize}px 等线 Light`
    const lines = text.split('\n')
    if (lines.length === 1) {
      context.textBaseline = 'bottom'
      context.textAlign = 'center'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 6
      context.fillText(text, MOD_WIDTH / 2, MOD_HEIGHT - bottom)
    } else {
      context.textBaseline = 'bottom'
      context.textAlign = 'left'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 6
      context.fillText(lines[0], 2, MOD_HEIGHT - bottom - fontSize)
      context.textBaseline = 'bottom'
      context.textAlign = 'right'
      context.fillText(lines[1], MOD_WIDTH - 2, MOD_HEIGHT - bottom)
    }

    draw?.(context)
  }
}

interface CreateModIconOptions {
  bottom?: number
  fontSize: number
  text: string
  baseFill: string
  draw?: (context: CanvasRenderingContext2D) => void
}

export const createModIcon = ({
  bottom,
  fontSize,
  text,
  baseFill,
  draw,
}: CreateModIconOptions): () => HTMLCanvasElement => {
  return () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
    baseFill,
    fontSize,
    text,
    bottom,
    draw,
  }), MOD_WIDTH, MOD_HEIGHT)
}
