import { rgba } from './utils'
import { px, py } from './Config'
import { FrameSnapshot } from './FrameSnapshot'

const BUTTON_TEXT_COLOR = '#fff'
const MOD_WIDTH = 120
const MOD_HEIGHT = 120

/**
 * @return {(function(context: CanvasRenderingContext2D): void)}
 */
const createModIconRender = ({
  baseFill,
  fontSize,
  text,
  bottom = 6,
}) => {
  return context => {
    const [r, g, b, a] = rgba.toValues(baseFill)
    const calc = (v, s) => Math.round((255 - v) * s + v)
    const gradient = context.createLinearGradient(0, 0, 0, py(MOD_HEIGHT))
    gradient.addColorStop(0, rgba.format([calc(r, 0.1), calc(g, 0.1), calc(b, 0.1), a]))
    gradient.addColorStop(0.5, rgba.format([r, g, b, a]))
    gradient.addColorStop(0.8, rgba.format([r, g, b, a]))
    gradient.addColorStop(1, rgba.format([calc(r, -0.15), calc(g, -0.15), calc(b, -0.15), a]))
    context.fillStyle = gradient
    context.beginPath()
    context.roundRect(0, 0, px(MOD_WIDTH), py(MOD_HEIGHT), [8])
    context.fill()
    context.fillStyle = BUTTON_TEXT_COLOR
    context.font = `${fontSize}px 等线 Light`
    const lines = text.split('\n')
    if (lines.length === 1) {
      context.textBaseline = 'bottom'
      context.textAlign = 'center'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 6
      context.fillText(text, px(MOD_WIDTH / 2), py(MOD_HEIGHT) - bottom)
    } else {
      context.textBaseline = 'bottom'
      context.textAlign = 'left'
      context.shadowColor = 'rgb(255, 255, 255)'
      context.shadowBlur = 6
      context.fillText(lines[0], 2, py(MOD_HEIGHT) - bottom - fontSize)
      context.textBaseline = 'bottom'
      context.textAlign = 'right'
      context.fillText(lines[1], px(MOD_WIDTH) - 2, py(MOD_HEIGHT) - bottom)
    }
  }
}

export const EZIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(68, 102, 28)',
  fontSize: py(MOD_HEIGHT / 4),
  text: 'Easy',
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const NFIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(29, 34, 74)',
  fontSize: py(MOD_HEIGHT / 5),
  text: 'No-Fail',
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const HTIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(49, 43, 53)',
  fontSize: py(MOD_HEIGHT / 4),
  text: 'Half',
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const HRIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(108, 2, 32)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Hard\nRock',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const SDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(95, 44, 1)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Sudden\nDeath',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const PFIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(113, 64, 22)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Perfect',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const DTIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(91, 51, 130)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Double',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const NCIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(57, 28, 154)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Nightcore',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const FDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(107, 68, 0)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Fade',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const HDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(152, 116, 30)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Hidden',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const FLIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(26, 26, 26)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Flashlight',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const MRIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(38,77,51)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Mirror',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const RDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(2, 96, 42)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Random',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))

export const ATIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(0, 60, 125)',
  fontSize: py(MOD_HEIGHT / 4.2),
  text: 'Auto',
  bottom: 2,
}), px(MOD_WIDTH), py(MOD_HEIGHT))
