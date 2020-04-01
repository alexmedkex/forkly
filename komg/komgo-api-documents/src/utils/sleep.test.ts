import { sleep } from './sleep'

describe('sleep', () => {
  it('should sleep for 100ms', () => {
    jest.useFakeTimers()

    sleep(100)
    jest.runAllTimers()

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 100)

    jest.useRealTimers()
  })
})
