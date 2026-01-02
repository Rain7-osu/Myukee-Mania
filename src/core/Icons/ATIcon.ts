import { createModIcon, MOD_HEIGHT, MOD_WIDTH } from './_factory'

export const ATIcon = createModIcon({
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
})
