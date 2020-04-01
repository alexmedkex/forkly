import { Config } from '../../config'
import { axiosRetry, exponentialDelay } from '../../utils/retry'
import { logger } from '../../utils'
import axios from 'axios'
import querystring from 'querystring'

export const getKeycloakToken = async (config: Config, keycloakURL: string, retryDelay: number): Promise<any> => {
  const tokenData = {
    grant_type: 'password',
    client_id: 'web-app',
    username: config.get('keycloak.user'),
    password: config.get('keycloak.password')
  }
  let keycloakReturn
  const realmName = config.get('keycloak.realm')
  try {
    keycloakReturn = await axiosRetry(
      async () =>
        axios.post(
          `${keycloakURL}/auth/realms/${realmName}/protocol/openid-connect/token`,
          querystring.stringify(tokenData)
        ),
      exponentialDelay(retryDelay)
    )
  } catch (e) {
    logger.error('Error calling keycloak to retrieve a token', e)
    process.exit(1)
  }
  if (!keycloakReturn.data.access_token) {
    logger.error('Error calling keycloak, input introduced: ', JSON.stringify(tokenData, null, 2))
    process.exit(1)
  }

  const authStr: string = 'Bearer '.concat(keycloakReturn.data.access_token)

  return {
    headers: {
      Authorization: authStr,
      'Content-Type': 'application/json'
    }
  }
}
