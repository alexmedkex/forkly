import { Config } from '../../config'
import { logger } from '../../utils'
import { axiosRetry, exponentialDelay } from '../../utils/retry'
import querystring from 'querystring'
import axios from 'axios'
import { plainToClass } from 'class-transformer'
import { AddressBookEntity } from '../../entities/address-book-entity'
import { ApiRegistryMemberEntity } from '../../entities/member-entity-from-registry'
import { validation } from '../../features/onboard-member/validate-input'
import { RegistryMessagePublicKeyEntity } from '../../entities/registry-mess-pub-key-entity'
import { MessagePublicKeyEntity } from '../../entities'

export const onboardGenAddrBook = async (
  config: Config,
  apiRegistryURL: string,
  keycloakURL: string
): Promise<AddressBookEntity[]> => {
  const registryURL: string = apiRegistryURL || config.get('api.registry.url')
  const kcURL: string = keycloakURL || config.get('keycloak.url')
  const retryDelay: number = config.get('delay')

  let headers = null
  if (kcURL) {
    headers = await getKeycloakToken(config, kcURL, retryDelay)
  }

  const result = await axiosRetry(
    async () => axios.get(`${registryURL}/v0/registry/cache?companyData=%7B%7D`, headers),
    exponentialDelay(retryDelay)
  )

  if (result.status !== 200) {
    logger.error('Error calling api-registry to GET the ENS company data')
    process.exit(1)
  }

  const komgoMembers = await Promise.all(result.data.filter(member => isMember(member)))

  return Promise.all(
    komgoMembers.map(member =>
      toAddressBookFormat(plainToClass(ApiRegistryMemberEntity, member as ApiRegistryMemberEntity))
    )
  )
}

async function toAddressBookFormat(member: ApiRegistryMemberEntity): Promise<AddressBookEntity> {
  await validation(member)
  const e = {
    staticId: member.staticId,
    businessName: JSON.stringify(member.x500Name),
    mnid: member.komgoMnid,
    updated: getTodayISODate(),
    publicKeyInfoHistory: await fromRegistryKeyToAddrBookFormat(member.komgoMessagingPubKeys)
  }
  const addressBookEntity = plainToClass(AddressBookEntity, e as AddressBookEntity)
  await validation(addressBookEntity)

  return addressBookEntity
}

async function getKeycloakToken(config: Config, keycloakURL: string, retryDelay: number) {
  const tokenData = {
    grant_type: 'password',
    client_id: 'web-app',
    username: process.env.KEYCLOAK_USER || config.get('keycloak.user'),
    password: process.env.KEYCLOAK_PASSWORD || config.get('keycloak.password')
  }

  const keycloakReturn = await axiosRetry(
    async () => axios.post(`${keycloakURL}`, querystring.stringify(tokenData)),
    exponentialDelay(retryDelay)
  )

  if (keycloakReturn.status !== 200) {
    logger.error('Error calling keycloak to retrieve a JWT token')
    process.exit(1)
  }

  const authStr: string = 'Bearer '.concat(keycloakReturn.data.access_token)

  return { headers: { Authorization: authStr, 'Content-Type': 'application/json' } }
}

async function fromRegistryKeyToAddrBookFormat(
  keys: RegistryMessagePublicKeyEntity[]
): Promise<MessagePublicKeyEntity[]> {
  return keys.map(k => {
    return {
      validFrom: getYesterdayISODate(),
      validTo: convertTimestampToISODate(k.termDate),
      key: JSON.parse(k.key),
      current: k.current,
      revoked: k.revoked
    }
  })
}

function isMember(member: ApiRegistryMemberEntity) {
  return member.isMember === true
}

function convertTimestampToISODate(timeStamp: number) {
  return new Date(timeStamp).toISOString()
}

function getTodayISODate(): string {
  return new Date().toISOString()
}

function getYesterdayISODate(): string {
  const toDate = new Date()
  toDate.setDate(toDate.getDate() - 1)
  return toDate.toISOString()
}
