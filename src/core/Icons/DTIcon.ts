import { createModIcon, MOD_HEIGHT, MOD_WIDTH } from './_factory'

export const DTIcon = createModIcon({
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
})
