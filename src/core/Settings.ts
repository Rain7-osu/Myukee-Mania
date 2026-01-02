import { KeyCode } from './KeyCode'
import { safeGetStorage, safeParseJson, safeSetStorage } from './utils'

interface KeyBinds {
  keys4: Record<number, string>
  keys5: Record<number, string>
  keys6: Record<number, string>
  keys7: Record<number, string>
  keys8: Record<number, string>
}

export interface SettingsValue {
  backgroundDark: number
  speed: number
  hideObjects: boolean
  maniaKeyBinds: KeyBinds
  judgementDelay: number
  offset: number
}

export type SettingsKey = keyof SettingsValue

const DEFAULT_SPEED = 34

export const DEFAULT_SETTINGS: SettingsValue = {
  backgroundDark: 80,
  speed: DEFAULT_SPEED,
  hideObjects: false,
  judgementDelay: 0,
  offset: 0,
  maniaKeyBinds: {
    keys4: {
      0: KeyCode.D,
      1: KeyCode.F,
      2: KeyCode.J,
      3: KeyCode.K,
    },
    keys5: {
      0: KeyCode.D,
      1: KeyCode.F,
      2: KeyCode.SPACE,
      3: KeyCode.J,
      4: KeyCode.K,
    },
    keys6: {
      0: KeyCode.S,
      1: KeyCode.D,
      2: KeyCode.F,
      3: KeyCode.J,
      4: KeyCode.K,
      5: KeyCode.L,
    },
    keys7: {
      0: KeyCode.S,
      1: KeyCode.D,
      2: KeyCode.F,
      3: KeyCode.SPACE,
      4: KeyCode.J,
      5: KeyCode.K,
      6: KeyCode.L,
    },
    keys8: {
      0: KeyCode.S,
      1: KeyCode.D,
      2: KeyCode.F,
      3: KeyCode.SPACE,
      4: KeyCode.J,
      5: KeyCode.K,
      6: KeyCode.L,
      7: KeyCode.SEMICOLON,
    },
  },
}

const DEFAULT_SETTINGS_VALUE = JSON.stringify(DEFAULT_SETTINGS)

const LOCAL_STORAGE_KEY = 'myukee-mania-settings'

/**
 * @class
 */
export class Settings {
  private static _instance: Settings | null = null

  private readonly _value: SettingsValue

  private constructor() {
    const savedSettings = safeGetStorage(LOCAL_STORAGE_KEY) || ''
    this._value = safeParseJson(savedSettings) || JSON.parse(DEFAULT_SETTINGS_VALUE)
  }

  static getInstance(): Settings {
    if (!Settings._instance) {
      Settings._instance = new Settings()
    }
    return Settings._instance
  }

  get<T extends SettingsKey>(key: T): SettingsValue[T] {
    return this._value[key]
  }

  set<T extends keyof SettingsValue>(key: T, value: SettingsValue[T]): void {
    this._value[key] = value
    safeSetStorage(LOCAL_STORAGE_KEY, JSON.stringify(this._value))
  }
}
