const sendMailMock = jest.fn(() => {
  return true
})
const createTransportMock = jest.fn(() => {
  return {
    sendMail: sendMailMock
  }
})
const createTestAccountMock = jest.fn(() => {
  return { user: 'user', password: 'password' }
})
const getTestMessageUrlMock = jest.fn()
jest.mock('nodemailer', () => ({
  createTransport: createTransportMock,
  createTestAccount: createTestAccountMock,
  getTestMessageUrl: getTestMessageUrlMock
}))

const logger = {
  info: jest.fn(),
  error: jest.fn()
}

jest.mock('@komgo/logging', () => ({
  getLogger: () => {
    {
      return logger
    }
  },
  configureLogging: jest.fn()
}))

import { MailSender } from './mailSender'

describe('Mail sender class', () => {
  let backupSmtpHost
  let backupSmtpPort
  let backupSmtpAuth
  let backupSmtpTls
  let backupSmtpSsl
  let backupSmtpAuthUser
  let backupSmtpAuthPass
  let backupMailFrom
  beforeEach(async () => {
    jest.clearAllMocks()
    backupSmtpHost = process.env.SMTP_HOST
    backupSmtpPort = process.env.SMTP_PORT
    backupSmtpAuth = process.env.SMTP_AUTH
    backupSmtpTls = process.env.SMTP_TLS
    backupSmtpSsl = process.env.SMTP_SSL
    backupSmtpAuthUser = process.env.SMTP_AUTH_USER
    backupSmtpAuthPass = process.env.SMTP_AUTH_PASS
    backupMailFrom = process.env.MAIL_FROM
  })

  afterEach(async () => {
    process.env.SMTP_HOST = backupSmtpHost
    process.env.SMTP_PORT = backupSmtpPort
    process.env.SMTP_AUTH = backupSmtpAuth
    process.env.SMTP_TLS = backupSmtpTls
    process.env.SMTP_SSL = backupSmtpSsl
    process.env.SMTP_AUTH_USER = backupSmtpAuthUser
    process.env.SMTP_AUTH_PASS = backupSmtpAuthPass
    process.env.MAIL_FROM = backupMailFrom
  })

  it('transporterSetup use env correctly when mailcacther', async () => {
    const sut = new MailSender()
    process.env.SMTP_HOST = 'mailcatcher'
    process.env.SMTP_PORT = '1028'
    process.env.SMTP_AUTH = 'true'
    process.env.SMTP_TLS = 'false'
    process.env.SMTP_SSL = 'true'
    process.env.SMTP_AUTH_USER = 'test user'
    process.env.SMTP_AUTH_PASS = 'password'
    await sut.transporterSetup()
    expect(createTestAccountMock).toHaveBeenCalled()
    const transport = {
      auth: {
        pass: undefined,
        user: 'user'
      },
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false
    }
    expect(createTransportMock).toHaveBeenCalledWith(transport)
  })

  it('transporterSetup use env correctly when non local Env', async () => {
    const sut = new MailSender()
    process.env.SMTP_HOST = 'smtp.komgo.com'
    process.env.SMTP_PORT = '503'
    process.env.SMTP_AUTH = 'true'
    process.env.SMTP_TLS = 'false'
    process.env.SMTP_SSL = 'true'
    process.env.SMTP_AUTH_USER = 'test user'
    process.env.SMTP_AUTH_PASS = 'password'
    await sut.transporterSetup()
    // @ts-ignore
    await sut.send({ taskType: 'LC Rquested', recipients: ['a@komgo.io'] })
    const transport = {
      auth: {
        pass: 'password',
        user: 'test user'
      },
      host: 'smtp.komgo.com',
      port: 503,
      secure: true
    }
    expect(createTransportMock).toHaveBeenCalledWith(transport)
  })

  it('transporterSetup use env correctly when non local Env and no auth', async () => {
    const sut = new MailSender()
    process.env.SMTP_HOST = 'smtp.komgo.com'
    process.env.SMTP_PORT = '503'
    process.env.SMTP_AUTH = ''
    process.env.SMTP_TLS = 'false'
    process.env.SMTP_SSL = 'true'
    process.env.SMTP_AUTH_USER = 'test user'
    process.env.SMTP_AUTH_PASS = 'password'
    await sut.transporterSetup()
    const transport = {
      host: 'smtp.komgo.com',
      port: 503,
      secure: true
    }
    expect(createTransportMock).toHaveBeenCalledWith(transport)
  })

  it('send email - happy path', async () => {
    const sut = new MailSender()
    process.env.SMTP_HOST = 'mailcatcher'
    process.env.MAIL_FROM = 'no-reply@komgo.io'
    await sut.transporterSetup()
    await sut.send({ subject: 'LC Rquested', body: 'http://komgo.io', recipients: ['a@komgo.io'] })
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'no-reply@komgo.io',
      html: `http://komgo.io`,
      subject: '[KOMGO] [LC Rquested]',
      to: ['a@komgo.io']
    })
    expect(getTestMessageUrlMock).toHaveBeenCalled()
    expect(logger.info.mock.calls).toEqual([['Message sent: %s', undefined], ['Preview URL: %s', undefined]])
  })
})
