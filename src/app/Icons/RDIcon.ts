import { createModIcon, MOD_HEIGHT, MOD_WIDTH } from './_factory'

export const RDIcon = createModIcon({
  baseFill: 'rgb(2, 96, 42)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Random',
  bottom: 2,
  draw: context => {
    const centerX = 128
    const centerY = 104
    const rhombusSize = 88
    const halfCornWidth = Math.sin(Math.PI / 3) * rhombusSize
    const halfCornHeight = Math.cos(Math.PI / 3) * rhombusSize
    const extra = 6
    const extraWidth = Math.sin(Math.PI / 3) * extra
    const extraHeight = Math.cos(Math.PI / 3) * extra
    const baseEllipseWidth = 20
    const baseEllipseRatio = 0.5
    const rotationAngle = Math.PI / 9

    context.shadowBlur = 10

    // 保存当前状态并设置旋转变换
    context.save()
    context.translate(centerX, centerY)
    context.rotate(rotationAngle)
    context.translate(-centerX, -centerY)

    // 从中心点顺时针
    const topRhombusPoints = [
      [centerX, centerY],
      [centerX - halfCornWidth, centerY - halfCornHeight],
      [centerX, centerY - 2 * halfCornHeight + extraHeight + extra],
      [centerX + halfCornWidth, centerY - halfCornHeight],
    ]

    const leftRhombusPoints = [
      [centerX, centerY],
      [centerX, centerY + rhombusSize],
      [centerX - halfCornWidth + extraWidth, centerY + halfCornHeight - extraHeight],
      [centerX - halfCornWidth, centerY - halfCornHeight],
    ]

    const rightRhombusPoints = [
      [centerX, centerY],
      [centerX + halfCornWidth, centerY - halfCornHeight],
      [centerX + halfCornWidth - extraWidth, centerY + halfCornHeight - extraHeight],
      [centerX, centerY + rhombusSize],
    ]

    // 根据上面三个点阵，stroke 三个四边形，白色，线宽 6
    context.strokeStyle = '#fff'
    context.lineWidth = 6
    context.lineJoin = 'round'

    // 绘制顶部菱形
    context.beginPath()
    context.moveTo(topRhombusPoints[0][0], topRhombusPoints[0][1])
    context.lineTo(topRhombusPoints[1][0], topRhombusPoints[1][1])
    context.lineTo(topRhombusPoints[2][0], topRhombusPoints[2][1])
    context.lineTo(topRhombusPoints[3][0], topRhombusPoints[3][1])
    context.closePath()
    context.stroke()

    // 绘制左侧菱形
    context.beginPath()
    context.moveTo(leftRhombusPoints[0][0], leftRhombusPoints[0][1])
    context.lineTo(leftRhombusPoints[1][0], leftRhombusPoints[1][1])
    context.lineTo(leftRhombusPoints[2][0], leftRhombusPoints[2][1])
    context.lineTo(leftRhombusPoints[3][0], leftRhombusPoints[3][1])
    context.closePath()
    context.stroke()

    // 绘制右侧菱形
    context.beginPath()
    context.moveTo(rightRhombusPoints[0][0], rightRhombusPoints[0][1])
    context.lineTo(rightRhombusPoints[1][0], rightRhombusPoints[1][1])
    context.lineTo(rightRhombusPoints[2][0], rightRhombusPoints[2][1])
    context.lineTo(rightRhombusPoints[3][0], rightRhombusPoints[3][1])
    context.closePath()
    context.stroke()

    // [x, y, width, rotate]
    const dots = [
      [centerX, centerY - halfCornHeight, baseEllipseWidth, 0],
      [centerX - halfCornWidth / 3, centerY + halfCornHeight / 3, baseEllipseWidth - 4, Math.PI / 3],
      [centerX - halfCornWidth / 3 * 2, centerY + halfCornHeight / 3 * 2, baseEllipseWidth - 6, Math.PI / 3],
      [centerX + halfCornWidth / 3, centerY + halfCornHeight / 4, baseEllipseWidth - 6, -Math.PI / 3],
      [centerX + halfCornWidth / 2, centerY + halfCornHeight / 2, baseEllipseWidth - 7, -Math.PI / 3],
      [centerX + halfCornWidth / 3 * 2, centerY + halfCornHeight / 4 * 3, baseEllipseWidth - 9, -Math.PI / 3],
    ]

    // 根据上面的点阵填充白色椭圆，其中每一项表示 [x, y, radiusX, rotation]
    // 其中 radiusY = radiusX * baseEllipseRatio;
    // startAngle = 0, endAngle = Math.PI * 2
    context.fillStyle = '#fff'
    context.shadowBlur = 10
    context.shadowColor = '#fff'

    dots.forEach(([x, y, radiusX, rotation]) => {
      const radiusY = radiusX * baseEllipseRatio
      context.beginPath()
      context.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2)
      context.fill()
    })

    // 恢复原始状态
    context.restore()
  },
})
