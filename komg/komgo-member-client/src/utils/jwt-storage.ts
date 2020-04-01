import { stringOrNull } from './types'
import { LocalStorageItem } from './storage-item'
import { KeycloakInstance } from 'keycloak-js'

export class JwtStorage {
  pToken: LocalStorageItem
  pRefreshToken: LocalStorageItem
  pIdToken: LocalStorageItem
  pTimeSkew: LocalStorageItem

  constructor() {
    this.pToken = new LocalStorageItem('JWT_token')
    this.pRefreshToken = new LocalStorageItem('JWT_refreshToken')
    this.pIdToken = new LocalStorageItem('JWT_idToken')
    this.pTimeSkew = new LocalStorageItem('JWT_timeSkew')
  }

  get token(): stringOrNull {
    return this.pToken.get()
  }

  set token(token: stringOrNull) {
    const typedToken = token || ''
    this.pToken.add(typedToken)
  }

  get refreshToken(): stringOrNull {
    return this.pRefreshToken.get()
  }

  set refreshToken(token: stringOrNull) {
    const typedToken = token || ''
    this.pRefreshToken.add(typedToken)
  }

  get idToken(): stringOrNull {
    return this.pIdToken.get()
  }

  set idToken(token: stringOrNull) {
    const typedToken = token || ''
    this.pIdToken.add(typedToken)
  }

  get timeSkew(): number {
    return parseInt(this.pTimeSkew.get() || '0', 10)
  }

  set timeSkew(timeSkew: number) {
    this.pTimeSkew.add(`${timeSkew || 0}`)
  }

  setAll(keycloak: KeycloakInstance) {
    this.token = keycloak.token || null
    this.refreshToken = keycloak.refreshToken || null
    this.idToken = keycloak.idToken || null
    this.timeSkew = keycloak.timeSkew || 0
  }

  clearAll(): void {
    this.pToken.remove()
    this.pRefreshToken.remove()
    this.pIdToken.remove()
    this.pTimeSkew.remove()
  }
}

export const JWT = new JwtStorage()
