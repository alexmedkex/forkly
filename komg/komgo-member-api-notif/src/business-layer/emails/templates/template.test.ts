import { buildEmailTemplate, EmailType } from './template'

describe('buildEmailTemplate', () => {
  it('compiles', () => {
    const link = 'http://example.com'
    const linkTitle = 'http://example.com'
    const email = buildEmailTemplate({ link, linkTitle, type: EmailType.Task })
    expect(email).toContain(link)
    expect(email).toContain(linkTitle)
  })
})
