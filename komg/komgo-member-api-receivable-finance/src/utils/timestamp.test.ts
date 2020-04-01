import { timestamp } from './timestamp'
describe('timestamp', () => {
  it('adds timestamps', () => {
    expect(timestamp({})).toEqual({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })
  })
})
