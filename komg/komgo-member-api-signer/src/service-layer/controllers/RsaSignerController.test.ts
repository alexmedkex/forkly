import { generateKey, encrypt, sign, IJWKObject, IJSONPublicKey } from '@komgo/jose'
import 'reflect-metadata'

import { KeyPart } from '../../data-layer/constants/KeyPart'
import { MICROSERVICE_NAME as API_ORIGIN } from '../responses'

import { RsaSignerController } from './RsaSignerController'
import { ErrorCode } from '@komgo/error-utilities'

process.env.CONTAINER_HOSTNAME = 'api-signer'

const error500Message = 'Internal Server Error'

// generate company rsa key
const key = generateKey()
const getKey = (): Promise<IJWKObject> => {
  return key
}

describe('RsaSignerController', () => {
  let controller: RsaSignerController
  const companyKeyProvider = {
    initialize: null,
    getETHKey: null,
    getRSAKey: async (part: KeyPart) => {
      const k = await getKey()
      return part === 'public' ? k.toJSON() : k
    }
  }

  beforeEach(() => {
    controller = new RsaSignerController(companyKeyProvider)
  })

  it('should return JWK on get public key request', async () => {
    const resp = await controller.getPublicKey()
    expect(Object.keys(resp)).toMatchObject(['kty', 'kid', 'e', 'n'])
  }, 30e3)

  it('should return JWE on encryption', async () => {
    const resp = await controller.encrypt({
      payload: 'my message',
      jwk: (await getKey()).toJSON()
    })
    expect(resp.jwe.split('.').length).toBe(5)
  }, 30e3)

  it('should throw on encryption when key is invalid', async () => {
    const jwk = (await getKey()).toJSON()
    jwk.kty = 'invalid kty'

    const resp = controller.encrypt({
      payload: 'my message',
      jwk
    })

    const errorObject = {
      message: 'Failed to encrypt',
      origin: API_ORIGIN,
      fields: {
        jwk: ['unsupported key type']
      },
      errorCode: ErrorCode.ValidationHttpContent
    }

    await expect(resp).rejects.toMatchObject({
      message: errorObject.message,
      status: 400,
      errorObject
    })
  }, 30e3)

  it('should decrypt data successfully', async () => {
    // encrypted with public key
    const pubkey = (await companyKeyProvider.getRSAKey('public')) as IJSONPublicKey
    const jwe = await encrypt(pubkey, 'my secret string')
    const resp = await controller.decrypt({ jwe })
    expect(resp.message).toEqual('my secret string')
  }, 30e3)

  it('should throw on decryption when JWE is invalid', async () => {
    const pubkey = (await companyKeyProvider.getRSAKey('public')) as IJSONPublicKey
    const jwe = await encrypt(pubkey, 'my secret string')
    const resp = controller.decrypt({ jwe: `${jwe}000` })

    const errorObject = {
      origin: API_ORIGIN,
      errorCode: ErrorCode.ValidationHttpContent
    }

    await expect(resp).rejects.toMatchObject({
      message: error500Message,
      status: 500,
      errorObject
    })
  }, 30e3)

  it('should return JWS on signing', async () => {
    const resp = await controller.sign({
      payload: 'my message'
    })
    expect(resp.jws.split('.').length).toBe(3)
  }, 30e3)

  it('should verify signed message sucessfully', async () => {
    const key = await getKey()
    const jws = await sign(key, 'my signed string')
    const resp = await controller.verify({ jws, jwk: key.toJSON() })
    expect(resp.payload).toEqual('my signed string')
  }, 30e3)

  it('should throw on verification when key is invalid', async () => {
    const key = await getKey()
    const resp = controller.verify({
      jws: '1.2.3',
      jwk: key.toJSON()
    })

    const errorObject = {
      message: 'Failed to verify',
      origin: API_ORIGIN,
      fields: {
        jws: ['Invalid signature']
      },
      errorCode: ErrorCode.ValidationHttpContent
    }

    await expect(resp).rejects.toMatchObject({
      message: errorObject.message,
      status: 400,
      errorObject
    })
  }, 30e3)
})
