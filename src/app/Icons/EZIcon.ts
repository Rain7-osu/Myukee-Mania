import { createModIcon, MOD_WIDTH, MOD_HEIGHT } from './_factory'

export const EZIcon = createModIcon({
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
      { x: basePoint.x + 60, y: basePoint.y + 42 },  // P3
    ]

    // 第二条贝塞尔曲线的控制点（相对于basePoint的偏移）
    const curve2Points = [
      { x: basePoint.x, y: basePoint.y + 30 }, // P0
      { x: basePoint.x + 15, y: basePoint.y + 39 }, // P1
      { x: basePoint.x + 45, y: basePoint.y + 21 }, // P2
      { x: basePoint.x + 60, y: basePoint.y + 42 },  // P3 (与第一条曲线终点相同)
    ]

    // 绘制闭合的符尾路径
    context.beginPath()

    // 第一条贝塞尔曲线：从符干顶部到曲线1终点
    context.moveTo(curve1Points[0].x, curve1Points[0].y)
    context.bezierCurveTo(
      curve1Points[1].x, curve1Points[1].y,
      curve1Points[2].x, curve1Points[2].y,
      curve1Points[3].x, curve1Points[3].y,
    )

    // 第二条贝塞尔曲线：从曲线1终点到曲线2终点
    context.bezierCurveTo(
      curve2Points[2].x, curve2Points[2].y,
      curve2Points[1].x, curve2Points[1].y,
      curve2Points[0].x, curve2Points[0].y,
    )

    // 闭合路径：从曲线2起点回到符干顶部
    context.lineTo(curve1Points[0].x, curve1Points[0].y)

    context.fill()

    // 恢复上下文状态
    context.restore()
  },
})
