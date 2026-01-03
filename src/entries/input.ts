import { RenderInput } from '../app/Components/RenderInput';

const canvas = document.getElementById('input') as HTMLCanvasElement
const width = document.documentElement.clientWidth;
canvas.width = width
const height = document.documentElement.clientHeight;
canvas.height = height
const ctx = canvas.getContext('2d')!

const input = new RenderInput(canvas, {
  width: 200,
  height: 50,
  offsetX: 10,
  offsetY: 10,
  translateX: 0,
  translateY: 0,
  placeholder: 'Please input',
  style: {
    placeholderColor: 'rgb(100, 100, 100)',
    fontSize: 24,
    color: 'rgb(10, 10, 10)',
    borderColor: 'rgb(200, 0, 0)',
    borderWidth: 2,
  },
})

input.registerEvents()
input.focus()

canvas.addEventListener('compositionstart', e => {
  console.log('cs', e)
})

canvas.addEventListener('compositionupdate', e => {
  console.log('cu', e)
})


canvas.addEventListener('compositionend', e => {
  console.log('ce', e)
})


const raf = () => {
  requestAnimationFrame(() => {
    ctx.clearRect(0, 0, width, height)
    input.render(ctx)
    raf()
  })
}

raf()


