import { keycloakPromise } from './keycloak'

const mockKeycloakPromise: any = {
  success: jest.fn(cb => {
    cb()
    return mockKeycloakPromise
  }),
  error: jest.fn(cb => cb())
}

describe('keycloakPromise', () => {
  it('should return resolved Promise', async () => {
    await keycloakPromise(mockKeycloakPromise)
    expect(mockKeycloakPromise.success).toBeCalled()
  })

  it('should return rejected Promise', async () => {
    await keycloakPromise(mockKeycloakPromise)
    expect(mockKeycloakPromise.error).toBeCalled()
  })
})
