import type { SettingsValue } from '../Configs/Settings';

export interface ISettings {
  get<T extends keyof SettingsValue>(key: T): SettingsValue[T]

  // set settings value
  set<T extends keyof SettingsValue>(key: T, value: SettingsValue[T]): void

  // change settings value, and trigger hooks
  change<T extends keyof SettingsValue>(key: T, value: SettingsValue[T]): void

  use(hook: <T extends keyof SettingsValue>(key: T, value: SettingsValue[T]) => SettingsValue[T]): void

  use<T extends keyof SettingsValue>(key: T, hook: (value: SettingsValue[T]) => SettingsValue[T]): void
}
