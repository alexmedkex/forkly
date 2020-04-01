import { goBackOrFallBackTo } from './goBackOrFallback'

describe('goBackOrFallback', () => {
  beforeEach(() => {
    beforeEach(() => jest.resetModules())
  })

  it('goBack', () => {
    jest.mock('../../../store', () => ({
      history: {
        length: 2,
        push: jest.fn(),
        goBack: jest.fn()
      }
    }))

    const { history } = require('../../../store')
    const { goBackOrFallBackTo } = require('./goBackOrFallback')
    goBackOrFallBackTo({ defaultHistoryLength: 1, fallbackURL: '/foo' })
    expect(history.goBack).toHaveBeenCalled()
    expect(history.push).not.toHaveBeenCalled()
  })

  it('push', () => {
    jest.mock('../../../store', () => ({
      history: {
        length: 1,
        push: jest.fn(),
        goBack: jest.fn()
      }
    }))

    const { history } = require('../../../store')
    const { goBackOrFallBackTo } = require('./goBackOrFallback')
    goBackOrFallBackTo({ defaultHistoryLength: 1, fallbackURL: '/foo' })
    expect(history.goBack).not.toHaveBeenCalled()
    expect(history.push).toHaveBeenCalledWith('/foo')
  })
})
