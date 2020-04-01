import { JWT, JwtStorage } from './jwt-storage'
import decode from 'jwt-decode'
import { keccak256 } from 'web3-utils'

interface IStorage {
  getItem: <T extends string | object>(id: string) => T
  setItem: <T extends string | object>(id: string, value: T) => void
}

export default interface IDecodedJWTPayload {
  iss: string
  email: string
}

export const createUserSpecificStorage = (jwt: JwtStorage, storage: Storage): IStorage => {
  let uniqueId: string
  const getUniqueId = () => {
    try {
      const { email } = decode(jwt.idToken)
      uniqueId = keccak256(email)
      return uniqueId
    } catch (e) {
      // Failed to initialize user storage but sonarqube -> no console.warn
    }
  }

  const userSpecificId = id => {
    return `${uniqueId || getUniqueId()}-${id}`
  }
  const setItem = (id: string, data: string | object) => {
    storage.setItem(userSpecificId(id), JSON.stringify(data))
  }
  const getItem = <T extends string | object>(id: string): T | undefined => {
    try {
      const item = storage.getItem(userSpecificId(id))
      return item && JSON.parse(item)
    } catch (e) {
      return null
    }
  }
  return { setItem, getItem }
}

const { setItem, getItem } = createUserSpecificStorage(JWT, localStorage)
export { setItem, getItem }

/**
 * Realm name is in the issuer claim after the last slash
 * Example: http://localhost:10070/auth/realms/<realm-name>
 */
export const getRealmNameFromJWT = (): string => {
  const token = localStorage.getItem('JWT_token')
  if (!token) {
    return ''
  }
  const { iss } = decode(token) as IDecodedJWTPayload
  return iss.split('/').pop()
}

/**
 * Returns realm name for login or logout
 * @param realmOverride - Can be used for authorization in a custom realm Example: http://localhost:3010/login/<static-id>
 */
export const getRealmName = (realmOverride?: string) => {
  const isLmsNode = `${process.env.REACT_APP_IS_LMS_NODE}` === 'true'
  if (!isLmsNode) {
    return `${process.env.REACT_APP_KEYCLOAK_REALM_NAME}`
  }

  return realmOverride || getRealmNameFromJWT()
}
