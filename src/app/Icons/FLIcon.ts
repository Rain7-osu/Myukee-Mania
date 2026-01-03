import { createModIcon, MOD_HEIGHT, MOD_WIDTH } from './_factory'

export const FLIcon = createModIcon({
  baseFill: 'rgb(26, 26, 26)',
  fontSize: MOD_HEIGHT / 4.2,
  text: 'Flashlight',
  bottom: 2,
  draw: context => {
    const centerX = 128
    const centerY = 96
    const leftCircleRadius = 64
    const rightCircleRadius = 48 // 右侧圆更小
    const circleDistance = 52 // 圆心距离
    const leftCircleColor = '#4b4b4b' // 左侧圆颜色
    const rightCircleColor = '#000000' // 右侧圆颜色（纯黑色）
    const ringColor = '#000000' // 圆环颜色（纯黑色）
    const whiteColor = '#ffffff' // 相交部分颜色（白色）
    const ringWidth = 6 // 圆环宽度

    // 保存初始上下文状态
    context.save()

    context.shadowBlur = 15
    context.shadowColor = '#4b4b4b'

    // 计算圆心坐标
    const leftCircleX = centerX - circleDistance / 2
    const leftCircleY = centerY
    const rightCircleX = centerX + circleDistance / 2
    const rightCircleY = centerY

    // 圆环参数
    const ringOuterRadius = leftCircleRadius
    const ringInnerRadius = ringOuterRadius - ringWidth

    // 1. 绘制左侧圆 (#4b4b4b)
    context.fillStyle = leftCircleColor
    context.beginPath()
    context.arc(leftCircleX, leftCircleY, leftCircleRadius, 0, Math.PI * 2)
    context.fill()

    // 2. 绘制黑色圆环
    context.fillStyle = ringColor
    context.beginPath()
    context.arc(rightCircleX, rightCircleY, ringOuterRadius, 0, Math.PI * 2) // 外圆
    context.arc(rightCircleX, rightCircleY, ringInnerRadius, 0, Math.PI * 2, true) // 内圆（逆时针绘制表示减去）
    context.fill()

    // 3. 绘制右侧小圆 (#000000)
    context.fillStyle = rightCircleColor
    context.beginPath()
    context.arc(rightCircleX, rightCircleY, rightCircleRadius, 0, Math.PI * 2)
    context.fill()

    // 4. 填充左侧圆与右侧小圆的相交部分为白色
    context.save() // 保存当前上下文状态（包含所有基础图形）

    context.fillStyle = whiteColor
    context.beginPath()
    // 裁剪到左侧圆区域
    context.arc(leftCircleX, leftCircleY, leftCircleRadius, 0, Math.PI * 2)
    context.clip()

    // 在裁剪区域内绘制右侧小圆（填充白色）
    context.beginPath()
    context.arc(rightCircleX, rightCircleY, rightCircleRadius, 0, Math.PI * 2)
    context.fill()

    context.restore() // 恢复上下文状态，回到基础图形绘制后的状态

    // 5. 填充左侧圆与圆环的相交部分为白色
    context.save() // 再次保存上下文状态

    context.fillStyle = whiteColor
    context.beginPath()
    // 裁剪到左侧圆区域
    context.arc(leftCircleX, leftCircleY, leftCircleRadius, 0, Math.PI * 2)
    context.clip()

    // 在裁剪区域内绘制圆环路径（填充白色）
    context.beginPath()
    context.arc(rightCircleX, rightCircleY, ringOuterRadius, 0, Math.PI * 2)
    context.arc(rightCircleX, rightCircleY, ringInnerRadius, 0, Math.PI * 2, true)
    context.fill()

    context.restore() // 恢复上下文状态

    // 恢复初始上下文状态
    context.restore()
  },
})
