import { PollingService } from './PollingService'

describe('PollingService', () => {
  let subject: PollingService
  jest.useFakeTimers()

  beforeEach(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: any) => cb())
  })

  afterEach(() => {
    ;(window.requestAnimationFrame as any).mockRestore()
    subject.stop()
  })

  it('is defined', () => {
    subject = new PollingService()
    expect(subject).toBeInstanceOf(PollingService)
  })

  it('sets default options', () => {
    const actions: Array<() => any> = []
    const interval = 4000
    subject = new PollingService(interval, [])
    expect(subject.interval).toEqual(interval)
    expect(subject.actions).toEqual(actions)
  })

  describe('actions', () => {
    it('called', () => {
      const foo = jest.fn()
      const actions: Array<() => any> = [foo]
      const interval = 25
      subject = new PollingService(interval, actions)
      subject.start()
      jest.runOnlyPendingTimers()
      subject.actions.forEach((action: () => any) => {
        expect(action).toHaveBeenCalled()
      })
    })

    it('not called', () => {
      const foo = jest.fn()
      const actions: Array<() => any> = [foo]
      const interval = 25
      const subject = new PollingService(interval, actions)
      jest.runOnlyPendingTimers()
      subject.actions.forEach((action: () => any) => {
        expect(action).not.toHaveBeenCalled()
      })
    })
  })

  describe('stop', () => {
    it('stops polling', () => {
      const foo = jest.fn()
      const actions: Array<() => any> = [foo]
      subject = new PollingService(25, actions)
      subject.start()
      jest.runOnlyPendingTimers()
      subject.stop()
      jest.runOnlyPendingTimers()
      subject.actions.forEach((action: () => any) => {
        expect(action).toHaveBeenCalledTimes(1)
      })
    })
  })
})
