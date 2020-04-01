import 'reflect-metadata'

import requestIdHandlerInstance from './RequestIdHandler'

describe('requestIdHandlerInstance', () => {
  it('should get undefined requestId if is not generated for the current Async context', async () => {
    expect(requestIdHandlerInstance.get()).toBeUndefined()
  })

  it('should get a requestId if generated for the current Async context', async () => {
    requestIdHandlerInstance.generate()

    const requestId = requestIdHandlerInstance.get()

    expect(requestId).toBeDefined()
  })

  it('should set a custom RequestId for the current Async context', async () => {
    const customRequestId = 'customRequestId'
    requestIdHandlerInstance.set(customRequestId)

    const requestId = requestIdHandlerInstance.get()

    expect(requestId).toBeDefined()
    expect(requestId).toEqual(customRequestId)
  })

  it('should pass requestId to internal async calls', async () => {
    requestIdHandlerInstance.generate()
    const asyncFunction = async () => {
      return requestIdHandlerInstance.get()
    }

    const ownRequestId = requestIdHandlerInstance.get()
    const functionRequestId = await asyncFunction()

    expect(ownRequestId).toBeDefined()
    expect(functionRequestId).toBeDefined()
    expect(functionRequestId).toEqual(ownRequestId)
  })

  it('should use requestId if is in the same context', async () => {
    requestIdHandlerInstance.generate()

    const ownRequestId = requestIdHandlerInstance.get()
    const sameRequestId = requestIdHandlerInstance.get()

    expect(ownRequestId).toBeDefined()
    expect(sameRequestId).toBeDefined()
    expect(sameRequestId).toEqual(ownRequestId)
  })

  it('should generate requestId per context', async () => {
    requestIdHandlerInstance.generate()
    const asyncFunction = async () => {
      requestIdHandlerInstance.generate()
      return requestIdHandlerInstance.get()
    }

    const ownRequestId = requestIdHandlerInstance.get()
    const functionRequestId = await asyncFunction()

    expect(ownRequestId).toBeDefined()
    expect(functionRequestId).toBeDefined()
    expect(functionRequestId).not.toEqual(ownRequestId)
  })

  it('should generate requestId per context and equal in subsequent async calls', async () => {
    requestIdHandlerInstance.generate()
    const asyncFunction = async () => {
      requestIdHandlerInstance.generate()
      return requestIdHandlerInstance.get()
    }

    const ownRequestId = requestIdHandlerInstance.get()
    const functionRequestId = await asyncFunction()
    const ownRequestIdAfter = requestIdHandlerInstance.get()

    expect(ownRequestId).toBeDefined()
    expect(functionRequestId).toBeDefined()
    expect(ownRequestIdAfter).toBeDefined()
    expect(functionRequestId).not.toEqual(ownRequestId)
    expect(ownRequestIdAfter).toEqual(functionRequestId)
  })

  it('should generate requestId per context and equal in subsequent async calls with nextTick()', async done => {
    requestIdHandlerInstance.generate()
    const asyncFunction = async () => {
      requestIdHandlerInstance.generate()
      return requestIdHandlerInstance.get()
    }

    const ownRequestId = requestIdHandlerInstance.get()
    const functionRequestId = await asyncFunction()

    process.nextTick(() => {
      const ownRequestIdAfter = requestIdHandlerInstance.get()

      expect(ownRequestId).toBeDefined()
      expect(functionRequestId).toBeDefined()
      expect(ownRequestIdAfter).toBeDefined()
      expect(functionRequestId).not.toEqual(ownRequestId)
      expect(ownRequestIdAfter).toEqual(functionRequestId)

      done()
    })
  })
})
