import { getLogger } from '@komgo/logging'
import { injectable, inject } from 'inversify'
import { IMessagePublisher } from '@komgo/messaging-library'
import { TYPES } from '../../inversify/types'
import { IEmailTemplateData, IEmail, IUser } from '@komgo/types'
import { ITask } from '../../service-layer/request/task'
import { INotification } from '../../service-layer/responses/notification'
import { getUserSettingsById } from '../../data-layer/utils/getUserSettingsById'
import { buildEmailTemplate, EmailType } from './templates/template'

export interface IEmailService {
  sendTaskEmail(users: IUser[], emailData: IEmailTemplateData, task: ITask): Promise<void>
  sendNotificationEmail(userId: IUser[], emailData: IEmailTemplateData, notification: INotification): Promise<void>
  isEmailEnabled(id: string): Promise<boolean>
}

@injectable()
export class EmailService implements IEmailService {
  private readonly logger = getLogger('EmailService')

  constructor(
    @inject(TYPES.InternalMQPublisher) private readonly internalMQmessagePublisher: IMessagePublisher,
    @inject('metrics-and-email-activated') private readonly metricsAndEmailActivated: boolean
  ) {}

  public async sendTaskEmail(users: IUser[], emailData: IEmailTemplateData, task?: ITask): Promise<void> {
    if (!this.isEmailActivated(emailData)) {
      return
    }

    const email: IEmail = {
      subject: emailData.subject,
      body: buildEmailTemplate({
        link: `${emailData.taskLink}/${task._id}`,
        linkTitle: emailData.taskTitle,
        type: EmailType.Task
      }),
      recipients: null
    }

    await this.sendEmail(users, email)
  }

  public async sendNotificationEmail(
    users: IUser[],
    emailData: IEmailTemplateData,
    notification: INotification
  ): Promise<void> {
    if (!this.isEmailActivated(emailData)) {
      return
    }

    const email: IEmail = {
      subject: emailData.subject,
      body: buildEmailTemplate({
        link: `${emailData.taskLink}/${notification._id}`,
        linkTitle: emailData.taskTitle,
        type: EmailType.Notification
      }),
      recipients: null
    }

    await this.sendEmail(users, email)
  }

  public async isEmailEnabled(id: string): Promise<boolean> {
    const settings = await getUserSettingsById(id)
    return settings.sendTaskNotificationsByEmail
  }

  private async sendEmail(users: IUser[], email: IEmail): Promise<void> {
    this.logger.info(`Sending e-mail...`)

    users.forEach(async user => {
      const taskNotificationsEnabled = await this.isEmailEnabled(user.id)
      if (!taskNotificationsEnabled) {
        return
      }

      this.logger.info(`About to push e-mail message to MQ`)
      email.recipients = [user.email]

      this.logger.info(JSON.stringify(email))
      await this.internalMQmessagePublisher.publish('komgo.email-notification', email, {
        recipientPlatform: 'email-notification'
      })
    })

    this.logger.info(`e-mail pushed to internalMQ`)
  }

  private isEmailActivated(emailData: IEmailTemplateData) {
    if (!emailData || !this.metricsAndEmailActivated) {
      return false
    }
    return true
  }
}
