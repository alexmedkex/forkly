import Keycloak from 'keycloak-js'

let kcInstance
export const getKeycloakInstance = (realmName: string) => {
  if (kcInstance) {
    return kcInstance
  }
  kcInstance = Keycloak({
    realm: realmName,
    redirectUri: '/',
    url: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
    'ssl-required': 'external',
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
    resource: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
    'public-client': true
  })
  return kcInstance
}

// keycloak Promise to ES6 Promise
export const keycloakPromise = <TSuccess>(myKeycloakPromise: Keycloak.KeycloakPromise<TSuccess, any>) =>
  new Promise<TSuccess>((resolve, reject) =>
    myKeycloakPromise.success((result: TSuccess) => resolve(result)).error((e: string) => reject(e))
  )

export const getUserAdministrationPageUrl = (realmName: string): string =>
  `${process.env.REACT_APP_KEYCLOAK_AUTH_URL}/admin/${realmName}/console/#/realms/${realmName}/users/`
