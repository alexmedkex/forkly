import { JWT, JwtStorage } from './jwt-storage'
import { KeycloakInstance, KeycloakInitOptions } from 'keycloak-js'

import { getKeycloakInstance, keycloakPromise } from './keycloak'
import { JWT_MIN_VALIDITY, JWT_VALIDITY_CHECK_INTERVAL } from './constants'
import { PollingService } from './PollingService'

export class AutheticationService {
  private readonly pollingService: PollingService
  private readonly keycloak: KeycloakInstance
  private readonly jwtStorage: JwtStorage

  constructor(pollingService: PollingService, keycloak: KeycloakInstance, jwtStorage: JwtStorage) {
    this.startJWTRefresh = this.startJWTRefresh.bind(this)
    this.stopJWTRefresh = this.stopJWTRefresh.bind(this)
    this.refreshJWT = this.refreshJWT.bind(this)
    this.pollingService = pollingService
    this.keycloak = keycloak
    this.jwtStorage = jwtStorage
    pollingService.actions.push(this.refreshJWT)
  }

  public async authenticate() {
    const { token, refreshToken, idToken, timeSkew } = this.jwtStorage
    const options: KeycloakInitOptions =
      token && refreshToken && idToken
        ? {
            token,
            refreshToken,
            idToken,
            timeSkew
          }
        : { onLoad: 'check-sso' }

    const authenticated = await keycloakPromise<boolean>(this.keycloak.init(options))

    if (authenticated) {
      this.jwtStorage.setAll(this.keycloak)
    } else {
      this.jwtStorage.clearAll()
      this.keycloak.login()
    }
  }

  public startJWTRefresh() {
    this.pollingService.start()
  }

  public stopJWTRefresh() {
    this.pollingService.stop()
  }

  public async refreshJWT() {
    if (!this.keycloak.isTokenExpired(JWT_MIN_VALIDITY)) {
      return
    }

    try {
      await keycloakPromise<boolean>(this.keycloak.updateToken(JWT_MIN_VALIDITY))
      this.jwtStorage.setAll(this.keycloak)
    } catch (e) {
      this.jwtStorage.clearAll()
      await keycloakPromise<void>(this.keycloak.logout())
      throw e
    }
  }

  public async getJWT(): Promise<string> {
    await this.refreshJWT()
    return this.jwtStorage.token
  }
}

const sec = 1000
let instance
const getAuthService = (realmName: string): AutheticationService => {
  if (!instance) {
    instance = new AutheticationService(
      new PollingService(JWT_VALIDITY_CHECK_INTERVAL * sec),
      getKeycloakInstance(realmName),
      JWT
    )
  }
  return instance
}

export default getAuthService
