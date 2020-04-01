import { isLmsNode } from './isLmsNode'

describe('isLmsNode', () => {
  it('should return true if IS_LMS_NODE = true', () => {
    process.env.IS_LMS_NODE = 'true'
    expect(isLmsNode()).toEqual(true)
  })
  it('should return false if IS_LMS_NODE != true', () => {
    process.env.IS_LMS_NODE = ''
    expect(isLmsNode()).toEqual(false)
  })
})
