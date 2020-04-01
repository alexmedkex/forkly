import { getLogger } from '@komgo/logging'
import { IEmail } from '@komgo/types'
import nodemailer = require('nodemailer')
const logger = getLogger('mailSender')

export class MailSender {
  private transporter: any
  private isLocalEnv: boolean
  private transport: {}

  public async transporterSetup(): Promise<void> {
    this.isLocalEnv = process.env.SMTP_HOST === 'mailcatcher'
    const smtpAuth = !!process.env.SMTP_AUTH || false
    this.transport = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: !!process.env.SMTP_TLS || false,
      auth: undefined
    }

    if (smtpAuth && !!process.env.SMTP_AUTH_USER && !!process.env.SMTP_AUTH_PASS) {
      this.transport = {
        ...this.transport,
        auth: {
          user: process.env.SMTP_AUTH_USER,
          pass: process.env.SMTP_AUTH_PASS
        }
      }
    }

    // Replace mailcatcher smtp with ethereal
    if (this.isLocalEnv) {
      const testAccount = await nodemailer.createTestAccount()
      this.transport = {
        ...this.transport,
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass // generated ethereal password
        }
      }
    }

    this.transporter = nodemailer.createTransport(this.transport)
  }

  public async send(emailPayload: IEmail): Promise<void> {
    const info = await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: emailPayload.recipients,
      subject: `[KOMGO] [${emailPayload.subject}]`,
      html: emailPayload.body
    })
    logger.info('Message sent: %s', info.messageId)
    if (this.isLocalEnv) {
      logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    }
  }
}
