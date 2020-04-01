import 'reflect-metadata'

const create = jest.fn(({ staticId, sessionId }) => ({ staticId, sessionId }))

jest.mock('../models/Jti', () => ({
  Jti: { create }
}))

import JtiDataAgent from './JtiDataAgent'

describe('JtiDataAgent', () => {
  let jtiDataAgent
  beforeEach(() => {
    jtiDataAgent = new JtiDataAgent()
    create.mockClear()
  })

  it('should create jti', async () => {
    const result = await jtiDataAgent.createJti('jti')
    expect(create).toHaveBeenCalledWith({ jti: 'jti' })
  })

  it('should throw an error', async () => {
    create.mockImplementationOnce(() => {
      throw new Error('error')
    })
    try {
      await jtiDataAgent.createJti('jti')
    } catch (e) {
      expect(e.message).toEqual('Duplicate JTI claim')
    }
  })
})
