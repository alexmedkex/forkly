import validateMessagingPublicKey from './validateMessagingPublicKey'

describe('validateMessagingPublicKey', () => {
  it('should return error when value is empty', () => {
    expect(validateMessagingPublicKey('')).toEqual("'Messaging Public Key' should not be empty")
  })

  it('should return error when value is not valid JSON', () => {
    expect(validateMessagingPublicKey('{ key: value }')).toEqual('Invalid JSON')
  })

  it('should return nothing when value is valid JSON', () => {
    const value = `
      {
        "validFrom": "validFrom",
        "validTo": "validTo",
        "key": {
          "kty": "kty",
          "kid": "kid",
          "n": "n",
          "e": "e"
        }
      }
    `
    expect(validateMessagingPublicKey(value)).toBeUndefined()
  })

  it('should return error when value is not valid schema', () => {
    const value = `
      {
        "validTo": "validTo",
        "key": {
          "kty": "kty",
          "kid": "kid",
          "n": "n",
          "e": "e"
        }
      }
    `
    expect(validateMessagingPublicKey(value)).toEqual("'validFrom' is required")
  })
})
