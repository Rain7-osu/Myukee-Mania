import { KeyCode } from '../Enums/KeyCode';
import { safeGetStorage, safeParseJson, safeSetStorage } from '../_common/utils';
import type { ISettings } from '../Interfaces/ISettings';

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
  masterVolume: number
}

export type SettingsKey = keyof SettingsValue

const DEFAULT_SPEED = 34

export const DEFAULT_SETTINGS: SettingsValue = {
  backgroundDark: 80,
  speed: DEFAULT_SPEED,
  hideObjects: false,
  judgementDelay: 0,
  offset: 0,
  masterVolume: 1,
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

type SettingsHook = <T extends keyof SettingsValue>(key: T, value: SettingsValue[T]) => SettingsValue[T]

/**
 * @class
 */
export class Settings implements ISettings {
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

  private readonly _hooks: SettingsHook[] = []

  private readonly _specialHooks: Partial<Record<keyof SettingsValue, SettingsHook[]>> = {}

  get<T extends SettingsKey>(key: T): SettingsValue[T] {
    return this._value[key] || DEFAULT_SETTINGS[key]
  }

  set<T extends keyof SettingsValue>(key: T, value: SettingsValue[T]): void {
    this._value[key] = value
    safeSetStorage(LOCAL_STORAGE_KEY, JSON.stringify(this._value))
  }

  change<T extends keyof SettingsValue>(key: T, value: SettingsValue[T]) {
    let updatedValue = value
    if (this._hooks.length) {
      updatedValue = this._hooks.reduce((prev, hook) => hook(key, prev), updatedValue as SettingsValue[T])
    }
    if (Array.isArray(this._specialHooks[key])) {
      const hooks: SettingsHook[] = this._specialHooks[key];
      updatedValue = hooks.reduce((prev, hook) => hook(key, prev), updatedValue as SettingsValue[T])
    }
    this.set(key, updatedValue)
  }

  use(...args) {
    if (args.length > 1) {
      const [key, hook] = args as [keyof SettingsValue, SettingsHook]
      if (!Array.isArray(this._specialHooks[key])) {
        this._specialHooks[key] = [] as SettingsHook[]
      }
      this._specialHooks[key]!.push(hook)
    } else {
      const [hook] = args as [SettingsHook]
      this._hooks.push(hook)
    }
  }
}
