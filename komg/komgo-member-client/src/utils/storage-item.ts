import { stringOrNull } from './types'

export class LocalStorageItem {
  localStorageSupported: boolean
  storageKey: string

  constructor(key: string) {
    this.storageKey = key
    this.localStorageSupported = typeof window.localStorage !== 'undefined' && window.localStorage !== null
  }

  add(item: string): void {
    if (this.localStorageSupported) {
      localStorage.setItem(this.storageKey, item)
    }
  }

  get(): stringOrNull {
    return this.localStorageSupported ? localStorage.getItem(this.storageKey) : null
  }

  remove(): void {
    if (this.localStorageSupported) {
      localStorage.removeItem(this.storageKey)
    }
  }
}
