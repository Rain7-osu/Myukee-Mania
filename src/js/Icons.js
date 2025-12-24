import { rgba } from './utils'
import { FrameSnapshot } from './FrameSnapshot'

const BUTTON_TEXT_COLOR = '#fff'
const MOD_WIDTH = 256
const MOD_HEIGHT = 256

/**
 * @param baseFill {string}
 * @param fontSize {number}
 * @param text {string}
 * @param bottom {number}
 * @param [draw] {(context: CanvasRenderingContext2D) => void}
 * @return {function(context: CanvasRenderingContext2D): void}
 */
const createModIconRender = ({
  baseFill,
  fontSize,
  text,
  bottom = 6,
  draw,
}) => {
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

export const EZIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(68, 102, 28)',
  fontSize: MOD_HEIGHT / 4,
  text: 'Easy',
  draw: context => {
    // 绘制白色音符
    const centerX = 108
    const centerY = 150
    const noteHeadWidth = 64
    const noteHeadHeight = 48
    const stemLength = 80

    context.fillStyle = '#fff'
    context.strokeStyle = '#fff'
    context.lineWidth = 8
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.shadowColor = '#fff'
    context.shadowBlur = 15

    // 保存当前上下文状态
    context.save()

    // 以图标中心为原点进行旋转
    const iconCenterX = MOD_WIDTH / 2 // 128
    const iconCenterY = MOD_HEIGHT / 2 // 128
    const rotationAngle = Math.PI * 10 / 180 // 15度转弧度

    // 平移到图标中心
    context.translate(iconCenterX, iconCenterY)
    // 顺时针旋转15度
    context.rotate(rotationAngle)
    // 平移回音符的原始位置
    context.translate(-iconCenterX, -iconCenterY)

    // 绘制音符符头（椭圆形状）
    context.beginPath()
    context.ellipse(centerX, centerY, noteHeadWidth / 2, noteHeadHeight / 2, 0, 0, Math.PI * 2)
    context.fill()

    // 绘制符干（从椭圆右边垂直向上）
    const stemX = centerX + noteHeadWidth / 2 - 4
    const stemTopY = centerY - noteHeadHeight - stemLength
    const stemBottomY = centerY

    context.beginPath()
    context.moveTo(stemX, stemBottomY)
    context.lineTo(stemX, stemTopY)
    context.stroke()

    // 绘制符尾（使用贝塞尔曲线）
    // 符干最上方点作为基准点
    const basePoint = { x: stemX + 4, y: stemTopY }

    // 第一条贝塞尔曲线的控制点（相对于basePoint的偏移）
    const curve1Points = [
      { x: basePoint.x, y: basePoint.y }, // P0: 符干最上方点
      { x: basePoint.x + 12, y: basePoint.y + 30 }, // P1
      { x: basePoint.x + 45, y: basePoint.y + 7.2 }, // P2
      { x: basePoint.x + 60, y: basePoint.y + 42 }  // P3
    ]

    // 第二条贝塞尔曲线的控制点（相对于basePoint的偏移）
    const curve2Points = [
      { x: basePoint.x, y: basePoint.y + 30 }, // P0
      { x: basePoint.x + 15, y: basePoint.y + 39 }, // P1
      { x: basePoint.x + 45, y: basePoint.y + 21 }, // P2
      { x: basePoint.x + 60, y: basePoint.y + 42 }  // P3 (与第一条曲线终点相同)
    ]

    // 绘制闭合的符尾路径
    context.beginPath()

    // 第一条贝塞尔曲线：从符干顶部到曲线1终点
    context.moveTo(curve1Points[0].x, curve1Points[0].y)
    context.bezierCurveTo(
      curve1Points[1].x, curve1Points[1].y,
      curve1Points[2].x, curve1Points[2].y,
      curve1Points[3].x, curve1Points[3].y
    )

    // 第二条贝塞尔曲线：从曲线1终点到曲线2终点
    context.bezierCurveTo(
      curve2Points[2].x, curve2Points[2].y,
      curve2Points[1].x, curve2Points[1].y,
      curve2Points[0].x, curve2Points[0].y
    )

    // 闭合路径：从曲线2起点回到符干顶部
    context.lineTo(curve1Points[0].x, curve1Points[0].y)

    context.fill()

    // 恢复上下文状态
    context.restore()
  }
}), MOD_WIDTH, MOD_HEIGHT)

export const NFIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(29, 34, 74)',
  fontSize: MOD_HEIGHT / 5,
  text: 'No-Fail',
}), MOD_WIDTH, MOD_HEIGHT)

export const HTIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(49, 43, 53)',
  fontSize: MOD_HEIGHT / 4,
  text: 'Half',
}), MOD_WIDTH, MOD_HEIGHT)

export const HRIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(108, 2, 32)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Hard\nRock',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const SDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(95, 44, 1)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Sudden\nDeath',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const PFIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(113, 64, 22)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Perfect',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const DTIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(91, 51, 130)',
  fontSize: MOD_HEIGHT / 4,
  text: 'Double',
  bottom: 2,
  draw: context => {
    // 绘制白色钟表
    const centerX = 128
    const centerY = 104
    const clockRadius = 80
    const tickLength = 24
    const tickWidth = 6
    const handWidth = 14

    context.shadowColor = '#fff'
    context.shadowBlur = 15
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.lineWidth = tickWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'

    // 绘制12个竖线刻度
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12
      const startX = centerX + Math.cos(angle) * (clockRadius - tickLength)
      const startY = centerY + Math.sin(angle) * (clockRadius - tickLength)
      const endX = centerX + Math.cos(angle) * clockRadius
      const endY = centerY + Math.sin(angle) * clockRadius

      context.beginPath()
      context.moveTo(startX, startY)
      context.lineTo(endX, endY)
      context.stroke()
    }

    // 计算12点17分的角度
    const hour = 12
    const minute = 17
    const hourAngle = Math.PI / 2 - Math.PI * 2 * (hour + minute / 60) / 12
    const minuteAngle = Math.PI / 2 - Math.PI * 2 * minute / 60

    // 绘制时针（长的瘦等腰三角形）
    const hourHandLength = 56
    const hourHandHalfWidth = handWidth / 2

    context.beginPath()
    context.moveTo(centerX, centerY)
    context.lineTo(centerX + Math.cos(hourAngle - Math.PI / 2) * hourHandHalfWidth, centerY + Math.sin(hourAngle - Math.PI / 2) * hourHandHalfWidth)
    context.lineTo(centerX + Math.cos(hourAngle) * hourHandLength, centerY - Math.sin(hourAngle) * hourHandLength)
    context.lineTo(centerX + Math.cos(hourAngle + Math.PI / 2) * hourHandHalfWidth, centerY + Math.sin(hourAngle + Math.PI / 2) * hourHandHalfWidth)
    context.closePath()
    context.fill()

    // 绘制分针（长的瘦等腰三角形）
    const minuteHandLength = 72
    const minuteHandHalfWidth = handWidth / 2

    context.beginPath()
    context.moveTo(centerX, centerY)
    context.lineTo(centerX + Math.cos(minuteAngle - Math.PI / 2) * minuteHandHalfWidth, centerY + Math.sin(minuteAngle - Math.PI / 2) * minuteHandHalfWidth)
    context.lineTo(centerX + Math.cos(minuteAngle) * minuteHandLength, centerY - Math.sin(minuteAngle) * minuteHandLength)
    context.lineTo(centerX + Math.cos(minuteAngle + Math.PI / 2) * minuteHandHalfWidth, centerY + Math.sin(minuteAngle + Math.PI / 2) * minuteHandHalfWidth)
    context.closePath()
    context.fill()

    context.beginPath()
    context.arc(centerX, centerY, handWidth / 2 - 1, 0, Math.PI * 2)
    context.closePath()
    context.fill()
  },
}), MOD_WIDTH, MOD_HEIGHT)

export const NCIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(57, 28, 154)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Nightcore',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const FDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(107, 68, 0)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Fade',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const HDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(152, 116, 30)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Hidden',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const FLIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(26, 26, 26)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Flashlight',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const MRIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(38,77,51)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Mirror',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const RDIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(2, 96, 42)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Random',
  bottom: 2,
}), MOD_WIDTH, MOD_HEIGHT)

export const ATIcon = () => FrameSnapshot.createOffscreenCanvas(createModIconRender({
  baseFill: 'rgb(0, 60, 125)',
  fontSize: MOD_HEIGHT / 3.75,
  text: 'Auto',
  bottom: 2,
  draw: context => {
    // 绘制白色齿轮
    const centerX = 128
    const centerY = 108
    const outerRadius = 72
    const innerRadius = 24
    const toothCount = 10
    const toothHeight = 16
    const rootRadius = outerRadius - toothHeight
    const rootGapAngle = Math.PI / 30 // 齿根间隙角度
    const flatTopAngle = Math.PI / toothCount * 0.4 // 齿顶平面角度

    context.shadowColor = '#fff'
    context.shadowBlur = 15
    context.fillStyle = 'white'
    context.strokeStyle = 'white'
    context.lineWidth = 2
    context.lineCap = 'round'
    context.lineJoin = 'round'

    // 绘制齿轮的齿和外圈
    context.beginPath()
    for (let i = 0; i < toothCount; i++) {
      // 计算当前齿的角度
      const baseAngle = (i * Math.PI * 2) / toothCount
      const nextBaseAngle = ((i + 1) * Math.PI * 2) / toothCount

      // 齿根位置（带间隙）
      const rootAngle1 = baseAngle + rootGapAngle
      const rootAngle2 = nextBaseAngle - rootGapAngle

      // 齿顶平面位置
      const topAngle1 = rootAngle2 - flatTopAngle
      const topAngle2 = rootAngle1 + flatTopAngle

      const root2X = centerX + Math.cos(rootAngle2) * rootRadius
      const root2Y = centerY + Math.sin(rootAngle2) * rootRadius

      const top1X = centerX + Math.cos(topAngle1) * outerRadius
      const top1Y = centerY + Math.sin(topAngle1) * outerRadius

      const top2X = centerX + Math.cos(topAngle2) * outerRadius
      const top2Y = centerY + Math.sin(topAngle2) * outerRadius

      // 绘制顺序：齿根圆弧 -> 右侧齿侧面 -> 齿顶平面 -> 左侧齿侧面

      // 1. 绘制齿根圆弧（连接到当前齿的起始点）
      context.arc(centerX, centerY, rootRadius, baseAngle, rootAngle1)

      // 2. 绘制左侧齿侧面（从齿根到齿顶）
      context.lineTo(top2X, top2Y)

      // 3. 绘制齿顶平面
      context.lineTo(top1X, top1Y)

      // 4. 绘制右侧齿侧面（从齿顶到齿根）
      context.lineTo(root2X, root2Y)

      // 5. 绘制齿根圆弧（连接到下一个齿的起始点）
      context.arc(centerX, centerY, rootRadius, rootAngle2, nextBaseAngle)
    }
    context.closePath()
    context.fill()

    // 绘制齿轮的内圈
    context.beginPath()
    context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    context.fillStyle = 'rgb(0, 60, 125)'
    context.fill()
    context.stroke()
  },
}), MOD_WIDTH, MOD_HEIGHT)
