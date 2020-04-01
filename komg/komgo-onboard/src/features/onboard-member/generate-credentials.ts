import crypto from 'crypto'
import bip39 from 'bip39'

export interface Credentials {
  readonly rabbitMQCommonUser: string
  readonly rabbitMQCommonPassword: string
  readonly apiSignerPassphrase?: string
  readonly apiSignerMnemonic?: string
  readonly rabbitMQInternalAdmin?: string
  readonly rabbitMQInternalPassword?: string
  readonly rabbitMQInternalCookie?: string
  readonly keycloackAdmin?: string
  readonly keycloackPassword?: string
  readonly keycloackPostgresqlPassword?: string
  readonly harborUser?: string
  readonly harborEmail?: string
  readonly harborPassword?: string
  readonly postgresqlAdmin?: string
  readonly postgresqlPassword?: string
}

export interface HarborCredentials {
  readonly harborUser: string
  readonly harborEmail: string
  readonly harborPassword: string
}

export interface CredentialsContainer {
  readonly mnid: string
  readonly credentials: Credentials
}

export const randomString = (length, chars) => {
  let result = ''
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

export const generatePw = (length: number = 32) => {
  return randomString(length, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
}

export const generateCredentials = (mnid: string, isQA: boolean): Credentials => {
  return {
    rabbitMQCommonUser: `${mnid}-USER`,
    rabbitMQCommonPassword: generatePw(),
    apiSignerPassphrase: generatePw(),
    apiSignerMnemonic: bip39.generateMnemonic(),
    rabbitMQInternalAdmin: 'admin',
    rabbitMQInternalCookie: generatePw(),
    rabbitMQInternalPassword: generatePw(),
    keycloackAdmin: 'admin',
    keycloackPassword: isQA ? 'ptbJ5FolUFi4O2yBnycUfukhxJXGlcnH' : generatePw(),
    keycloackPostgresqlPassword: generatePw(),
    harborUser: generatePw(12),
    harborEmail: generatePw(12) + '@komgo.io',
    harborPassword: generatePw(12),
    postgresqlAdmin: 'Mmst07',
    postgresqlPassword: generatePw(8)
  }
}
