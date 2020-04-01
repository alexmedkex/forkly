import IntegrationEnvironment from './IntegrationEnvironment'

export const mockSuccessAPIRegistry = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock
    // for this.companyRegistryAgent.getMnidFromStaticId(staticId) inside CommonMessagingAgent
    .onGet(/api-registry.*/)
    .replyOnce(200, [
      {
        komgoMnid: iEnv.mockedIds.recipientMNID
      }
    ])
    // for this.companyRegistryAgent.getPropertyFromMnid(mnidType, senderMnid, keyType) inside CommonToInternalForwardingService
    .onGet(/api-registry.*/)
    .reply(200, [
      {
        komgoMessagingPubKeys: [
          {
            current: true,
            key: JSON.stringify({
              kty: 'a',
              kid: 'a',
              e: 'a',
              n: 'a'
            })
          }
        ]
      }
    ])
}

export const mockSuccessAPISigner = (iEnv: IntegrationEnvironment, returnPayload: object) => {
  iEnv.axiosMock
    // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
    .onPost(/rsa-signer\/decrypt.*/)
    .reply(200, {
      thrown: false
    })
    // this.signerAgent.verify(jws.message, jwk) inside EnvelopeAgent
    .onPost(/rsa-signer\/verify.*/)
    .reply(200, {
      payload: JSON.stringify(returnPayload)
    })
}

export const mockPassthroughAnyRequest = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock.onAny().passThrough()
}

/**
 * This is replicating a situation whereby the api-signer is failing for a period of time
 * and then comes back up and responds sucessfully
 */
export const mockMultipleApiSignerErrorsBeforeSuccess = (iEnv: IntegrationEnvironment, message: string) => {
  iEnv.axiosMock
    // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
    .onPost(/rsa-signer\/decrypt.*/)
    .replyOnce(500, undefined)
    .onPost(/rsa-signer\/decrypt.*/)
    .replyOnce(500, undefined)
    .onPost(/rsa-signer\/decrypt.*/)
    .replyOnce(500, undefined)
  mockSuccessAPISigner(iEnv, message)
}

export const mockFailThrownDecryptOnceAPISigner = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock
    // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
    .onPost(/rsa-signer\/decrypt.*/)
    .replyOnce(200, {
      thrown: true
    })
}

export const mockFailBadRequestDecryptOnceAPISigner = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock
    // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
    .onPost(/rsa-signer\/decrypt.*/)
    .replyOnce(400, {
      thrown: true
    })
}

export const mockFailBadRequestVerifyOnceAPISigner = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock
    // this.signerAgent.verify(jws.message, jwk) inside EnvelopeAgent
    .onPost(/rsa-signer\/verify.*/)
    .replyOnce(400, {
      payload: undefined
    })
}

export const mockFailServerErrorDecryptAlwaysAPISigner = (iEnv: IntegrationEnvironment) => {
  iEnv.axiosMock
    // this.signerAgent.decrypt(encryptedEnvelope) inside EnvelopeAgent
    .onPost(/rsa-signer\/decrypt.*/)
    .reply(500, undefined)
}
