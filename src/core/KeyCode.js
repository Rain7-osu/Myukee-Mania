/**
 * @readonly
 * @enum {string}
 */
export const KeyCode = {
  // 字母键 (A-Z)
  A: 'KeyA',
  B: 'KeyB',
  C: 'KeyC',
  D: 'KeyD',
  E: 'KeyE',
  F: 'KeyF',
  G: 'KeyG',
  H: 'KeyH',
  I: 'KeyI',
  J: 'KeyJ',
  K: 'KeyK',
  L: 'KeyL',
  M: 'KeyM',
  N: 'KeyN',
  O: 'KeyO',
  P: 'KeyP',
  Q: 'KeyQ',
  R: 'KeyR',
  S: 'KeyS',
  T: 'KeyT',
  U: 'KeyU',
  V: 'KeyV',
  W: 'KeyW',
  X: 'KeyX',
  Y: 'KeyY',
  Z: 'KeyZ',

  // 数字键 (0-9)
  DIGIT0: 'Digit0',
  DIGIT1: 'Digit1',
  DIGIT2: 'Digit2',
  DIGIT3: 'Digit3',
  DIGIT4: 'Digit4',
  DIGIT5: 'Digit5',
  DIGIT6: 'Digit6',
  DIGIT7: 'Digit7',
  DIGIT8: 'Digit8',
  DIGIT9: 'Digit9',

  // 功能键 (F1-F12)
  F1: 'F1', // pause
  F2: 'F2', // quit
  F3: 'F3', // speed --
  F4: 'F4', // speed ++
  F5: 'F5', // - pause music
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',

  // 控制键
  ESCAPE: 'Escape',
  TAB: 'Tab',
  CAPS_LOCK: 'CapsLock',
  SHIFT_LEFT: 'ShiftLeft',
  SHIFT_RIGHT: 'ShiftRight',
  CONTROL_LEFT: 'ControlLeft',
  CONTROL_RIGHT: 'ControlRight',
  ALT_LEFT: 'AltLeft',
  ALT_RIGHT: 'AltRight',
  META_LEFT: 'MetaLeft',  // Windows键或Command键
  META_RIGHT: 'MetaRight', // Windows键或Command键
  CONTEXT_MENU: 'ContextMenu', // 右键菜单键
  ENTER: 'Enter',
  SPACE: 'Space',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  INSERT: 'Insert',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',

  // 方向键
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',

  // 符号键
  BACKQUOTE: 'Backquote', // ~
  TILED: 'Backquote', // retry (别名)
  MINUS: 'Minus', // -
  EQUAL: 'Equal', // =
  BRACKET_LEFT: 'BracketLeft', // [
  BRACKET_RIGHT: 'BracketRight', // ]
  BACKSLASH: 'Backslash', // \
  SEMICOLON: 'Semicolon', // ;
  APOSTROPHE: 'Apostrophe', // '
  COMMA: 'Comma', // ,
  PERIOD: 'Period', // .
  SLASH: 'Slash', // /

  // 数字键盘 (Windows 108键盘布局)
  NUMPAD_0: 'Numpad0',
  NUMPAD_1: 'Numpad1',
  NUMPAD_2: 'Numpad2',
  NUMPAD_3: 'Numpad3',
  NUMPAD_4: 'Numpad4',
  NUMPAD_5: 'Numpad5',
  NUMPAD_6: 'Numpad6',
  NUMPAD_7: 'Numpad7',
  NUMPAD_8: 'Numpad8',
  NUMPAD_9: 'Numpad9',
  NUMPAD_ENTER: 'NumpadEnter',
  NUMPAD_ADD: 'NumpadAdd', // +
  NUMPAD_SUBTRACT: 'NumpadSubtract', // -
  NUMPAD_MULTIPLY: 'NumpadMultiply', // *
  NUMPAD_DIVIDE: 'NumpadDivide', // /
  NUMPAD_DECIMAL: 'NumpadDecimal', // .
  NUMPAD_NUM_LOCK: 'NumLock',

  // Windows特殊键
  SCROLL_LOCK: 'ScrollLock',
  PAUSE: 'Pause',

  // Mac特殊键
  // Mac键盘上的特殊键在物理上可能不同，但KeyboardEvent.code值与标准键盘兼容
  // 以下是Mac特有的功能键名称（可选，用于提高可读性）
  MAC_COMMAND_LEFT: 'MetaLeft',
  MAC_COMMAND_RIGHT: 'MetaRight',
  MAC_OPTION_LEFT: 'AltLeft',
  MAC_OPTION_RIGHT: 'AltRight',
  MAC_CONTROL_LEFT: 'ControlLeft',
  MAC_CONTROL_RIGHT: 'ControlRight',
}
