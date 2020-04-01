import generatePw from './generatePw'

describe('generatePw', () => {
  it('should return string with length 10', () => {
    const generatedStr = generatePw(10)
    expect(generatedStr.length).toBe(10)
  })

  it('should return string with length 32', () => {
    const generatedStr = generatePw()
    expect(generatedStr.length).toBe(32)
  })
})
