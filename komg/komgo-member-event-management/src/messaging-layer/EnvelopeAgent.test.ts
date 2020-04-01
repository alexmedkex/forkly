import 'reflect-metadata'

import EnvelopeAgent from './EnvelopeAgent'
import ISignerAgent from './ISignerAgent'
import { IEncryptedEnvelope, IDecryptedEnvelope } from './types'

const PAYLOAD = {
  message: 'value'
}
const PUBLIC_KEY = { key: `{"key" : "key"}` }

const SIGNATURE = 'sign'
const ENCRYPTED_ENVELOPE: IEncryptedEnvelope = {
  message: 'jwe'
}

const JWE = { jwe: 'jwe' }

const encryptMock = jest.fn()
const decryptMock = jest.fn()
const signMock = jest.fn()
const verifyMock = jest.fn()
const unsealPayloadMock = jest.fn()

const mockSignerAgent: ISignerAgent = {
  encrypt: encryptMock,
  decrypt: decryptMock,
  sign: signMock,
  verify: verifyMock
}

describe('Envelop messages', () => {
  let agent: EnvelopeAgent

  beforeEach(() => {
    agent = new EnvelopeAgent(mockSignerAgent)
  })

  it('should encapsulate', async () => {
    encryptMock.mockImplementationOnce(() => {
      return JWE
    })
    signMock.mockImplementationOnce(() => {
      return SIGNATURE
    })

    const envelope: IEncryptedEnvelope = await agent.encapsulate(PAYLOAD, PUBLIC_KEY)

    expect(encryptMock).toHaveBeenCalledTimes(1)
    expect(signMock).toHaveBeenCalledTimes(1)
    expect(envelope.message).toBe('jwe')
  })

  it('should desencapsulate', async () => {
    decryptMock.mockImplementationOnce(() => {
      return 'decrypted'
    })
    verifyMock.mockImplementationOnce(() => {
      return { payload: '{}' }
    })
    const unsealedPayload: IDecryptedEnvelope = await agent.desencapsulate(ENCRYPTED_ENVELOPE, PUBLIC_KEY)

    expect(decryptMock).toHaveBeenCalledTimes(1)
    expect(verifyMock).toHaveBeenCalledTimes(1)
    expect(unsealedPayload).toEqual({ error: false, message: {} })
  })
})
