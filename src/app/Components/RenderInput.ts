import { RenderElement } from '../Core/RenderElement';
import type { LayoutProps } from '../Core/LayoutObject';
import { KeyboardEventManager } from '../Managers/KeyboardEventManager';
import { KeyCode } from '../Enums/KeyCode';
import { createHiddenInput } from '../_common/dom';

export interface InputStyle {
  placeholderColor: string
  color: string
  fontSize: number
  fontWeight: 'bold' | 'normal' | 'lighter' | 'bolder'
  lineHeight: number
  borderWidth: number
  borderColor: string
}

export interface InputProps extends LayoutProps {
  placeholder: string
  value?: string
  style?: Partial<InputStyle>
}

export interface InputEvent {
  value: string
}

export class RenderInput extends RenderElement {
  constructor(container: HTMLElement, props: InputProps) {
    const { placeholder, style = {}, value, ...layoutProps } = props

    super(container, layoutProps);

    this._value = value || ''
    this._placeholder = placeholder
    this._keyboardEventManager = new KeyboardEventManager()
    this._style = {
      placeholderColor: 'rgba(0, 0, 0, 0.5)',
      fontSize: 16,
      lineHeight: 32,
      color: 'rgb(255, 255, 255)',
      borderWidth: 0,
      borderColor: '',
      fontWeight: 'normal',
      ...style,
    }
    this._realInput = createHiddenInput()
  }

  private readonly _realInput: HTMLInputElement

  private _focused = false

  private readonly _placeholder: string

  private _isComposition = false

  private _compositionData = ''

  private readonly _keyboardEventManager: KeyboardEventManager

  private _style: InputStyle

  private _lines: string[] = []

  private _placeholderLines: string[] = []

  private _inputTimer: number | null = null;

  get placeholder(): string {
    return this._placeholder
  }

  private _value: string

  get value(): string {
    return this._value
  }

  set value(value: string) {
    this._value = value
  }

  get style(): InputStyle {
    return this._style
  }

  set style(style: Partial<InputStyle>) {
    this._style = {
      ...this._style,
      ...style,
    }
  }

  protected onInput(e: InputEvent): void {}

  protected onChange(e: InputEvent): void {}

  private _preChange(e: InputEvent) {
    if (this._inputTimer) {
      clearTimeout(this._inputTimer)
    }
    this._inputTimer = window.setTimeout(() => {
      this.onChange(e)
    }, 300)
  }

  private _insertText(text: string) {
    this._value += text
    const e = { value: this._value, };
    this.onInput(e)
    this._preChange(e)
    if (this._context) {
      this._measureValue()
    }
  }

  private _deleteText() {
    this._value = this._value.slice(0, -1)
    const e = { value: this._value, };
    this.onInput(e)
    this._preChange(e)
    if (this._context) {
      this._measureValue()
    }
  }

  private _clearText() {
    this._value = ''
    const e = { value: this._value, };
    this.onInput(e)
    this.onChange(e)
    if (this._context) {
      this._measureValue()
    }
  }

  private _inputEventHandler(e: KeyboardEvent) {
    e.preventDefault()
    if (!this._focused) {
      this.focus()
    }

    if (!e.altKey && !e.ctrlKey && !e.metaKey && !this._isComposition && e.key !== 'Process') {
      this._insertText(e.key)
    }
  }

  focus() {
    this._realInput.focus({ preventScroll: true })
    this._focused = true
  }

  blur() {
    this._realInput.blur()
    this._focused = false
  }

  _blurEventHandler: () => void

  registerEvents() {
    if (!this._blurEventHandler) {
      this._blurEventHandler = this.blur.bind(this)
    }
    const compositionEventMaps = {}
    InputKeyList.forEach(keyCode => {
      compositionEventMaps[keyCode] = this._inputEventHandler.bind(this)
    })
    this._realInput.addEventListener('blur', this._blurEventHandler)
    this._keyboardEventManager.registerEvents({
      keydownEventList: {
        ...compositionEventMaps,
        [KeyCode.BACKSPACE]: this._deleteText.bind(this),
        [KeyCode.ESCAPE]: this._clearText.bind(this),
      },
      compositionStart: (e: CompositionEvent) => {
        this._isComposition = true
        this._compositionData = e.data
      },
      compositionUpdate: (e: CompositionEvent) => {
        this._compositionData = e.data
      },
      compositionEnd: (e: CompositionEvent) => {
        this._isComposition = false
        this._compositionData = e.data
        this._insertText(this._compositionData)
        this.onChange({ value: this._value })
      },
    })
  }

  disableEvents() {
    this._keyboardEventManager.disableEvents()
    this._realInput.removeEventListener('blur', this._blurEventHandler)
  }

  enableEvents() {
    this._keyboardEventManager.enableEvents()
    this._realInput.addEventListener('blur', this._blurEventHandler)
  }

  removeEvents() {
    this.removeAllEventsListeners()
    this._keyboardEventManager.removeEvents()
    this._realInput.removeEventListener('blur', this._blurEventHandler)
  }

  _measureValue() {
    this._lines = this._measureText(this._value)
  }

  _measurePlaceholder() {
    this._placeholderLines = this._measureText(this._placeholder)
  }

  _measureText(value: string) {
    const context = this._context!
    // 测量 value 长度，当前文本框的宽度为 this.width, 如果超出则自动换行，计算每行的文本，存入 _lines 数组。带分词功能，如果单个单词长度超过一行宽度，则强行折行。
    if (!value) {
      this._lines = []
      return
    }

    // 设置字体样式以确保测量准确
    context.font = `${this._style.fontSize}px 微软雅黑`

    const lines: string[] = []
    const words = value.split(/\s+/)
    let currentLine = ''

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const testWidth = context.measureText(testLine).width

      if (testWidth <= this.width) {
        // 当前行可以容纳该单词
        currentLine = testLine
      } else {
        // 当前行不能容纳该单词
        if (currentLine) {
          // 先将当前行添加到结果
          lines.push(currentLine)
          currentLine = ''
        }

        // 检查单个单词是否超过一行宽度
        const wordWidth = context.measureText(word).width
        if (wordWidth > this.width) {
          // 单个单词超长，需要强行折行
          let remainingWord = word
          while (remainingWord) {
            let splitIndex = 1
            let splitWord = remainingWord[0]
            let splitWidth = context.measureText(splitWord).width

            // 找到最大可容纳的字符数
            while (splitIndex < remainingWord.length && splitWidth <= this.width) {
              splitWord += remainingWord[splitIndex]
              splitWidth = context.measureText(splitWord).width
              splitIndex++
            }

            // 如果不是第一个字符且超过宽度，回退一个字符
            if (splitWidth > this.width && splitIndex > 1) {
              splitWord = splitWord.slice(0, -1)
            }

            lines.push(splitWord)
            remainingWord = remainingWord.slice(splitWord.length)
          }
        } else {
          // 单个单词可以容纳在一行
          currentLine = word
        }
      }
    }

    // 添加最后一行
    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  private _context: CanvasRenderingContext2D | null = null

  render(context: CanvasRenderingContext2D) {
    if (!this._context) {
      this._context = context
      this._measurePlaceholder()
    }
    const [x, y, w, h] = this.rect()

    context.save()
    context.textAlign = 'left'
    context.textBaseline = 'top'
    context.font = `${this._style.fontWeight} ${this._style.fontSize}px 微软雅黑`
    let offsetY = y

    if (this._value) {
      context.fillStyle = this._style.color
      this._lines.forEach(line => {
        context.fillText(line, x, offsetY)
        offsetY += this._style.lineHeight
      })
    } else {
      context.fillStyle = this._style.placeholderColor
      this._placeholderLines.forEach(line => {
        context.fillText(line, x, offsetY)
        offsetY += this._style.lineHeight
      })
    }

    if (this._style.borderWidth > 0) {
      context.strokeStyle = this._style.borderColor
      context.lineWidth = this._style.borderWidth
      context.strokeRect(x, y, w, h)
    }
  }
}

const InputKeyList: KeyCode[] = [
  KeyCode.A,
  KeyCode.B,
  KeyCode.C,
  KeyCode.D,
  KeyCode.E,
  KeyCode.F,
  KeyCode.G,
  KeyCode.H,
  KeyCode.I,
  KeyCode.J,
  KeyCode.K,
  KeyCode.L,
  KeyCode.M,
  KeyCode.N,
  KeyCode.O,
  KeyCode.P,
  KeyCode.Q,
  KeyCode.R,
  KeyCode.S,
  KeyCode.T,
  KeyCode.U,
  KeyCode.V,
  KeyCode.W,
  KeyCode.X,
  KeyCode.Y,
  KeyCode.Z,
  KeyCode.SPACE,
  KeyCode.DIGIT0,
  KeyCode.DIGIT1,
  KeyCode.DIGIT2,
  KeyCode.DIGIT3,
  KeyCode.DIGIT4,
  KeyCode.DIGIT5,
  KeyCode.DIGIT6,
  KeyCode.DIGIT7,
  KeyCode.DIGIT8,
  KeyCode.DIGIT9,
  KeyCode.MINUS,
  KeyCode.EQUAL,
  KeyCode.BACKQUOTE,
  KeyCode.TILED,
  KeyCode.MINUS,
  KeyCode.EQUAL,
  KeyCode.BRACKET_LEFT,
  KeyCode.BRACKET_RIGHT,
  KeyCode.BACKSLASH,
  KeyCode.SEMICOLON,
  KeyCode.APOSTROPHE,
  KeyCode.COMMA,
  KeyCode.PERIOD,
  KeyCode.SLASH,
  // numpad 0 -> 9
  KeyCode.NUMPAD_0,
  KeyCode.NUMPAD_1,
  KeyCode.NUMPAD_2,
  KeyCode.NUMPAD_3,
  KeyCode.NUMPAD_4,
  KeyCode.NUMPAD_5,
  KeyCode.NUMPAD_6,
  KeyCode.NUMPAD_7,
  KeyCode.NUMPAD_8,
  KeyCode.NUMPAD_9,
]
