import { nextTick } from 'process'

import { runAsyncAndExit } from './runAsync'

const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined)

describe('runAsyncAndExit', () => {
  it('exits with code 0 if everything is fine', done => {
    runAsyncAndExit(() => Promise.resolve())

    nextTick(() => {
      expect(mockExit).toHaveBeenCalledWith(0)
      done()
    })
  })

  it('exits with code 1 if error occurs', done => {
    runAsyncAndExit(() => Promise.reject('Oops'))

    nextTick(() => {
      expect(mockExit).toHaveBeenCalledWith(1)
      done()
    })
  })
})
