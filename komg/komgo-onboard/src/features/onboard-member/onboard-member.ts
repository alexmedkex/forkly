import { Config } from '../../config'
import { onboardMemberBroker } from './onboard-member-broker'
import { logger } from '../../utils'
import { generateCredentials, Credentials } from './generate-credentials'
import { onboardMemberAWS } from './onboard-member-aws'
import { onboardMemberHarbor } from './onboard-member-harbor'

export const onboardMember = async (config: Config, mnid: string) => {
  // Generating credentials
  let credentials: Credentials
  if (process.env.FMS === 'false') {
    credentials = {
      rabbitMQCommonUser: process.env.ONBOARD_COMMON_BROKER_USER,
      rabbitMQCommonPassword: process.env.ONBOARD_COMMON_BROKER_PASSWORD
    }
  } else {
    credentials = generateCredentials(mnid, config.get('aws.env.type') === 'qa')
    // Create harbor user
    await onboardMemberHarbor(config, {
      harborUser: credentials.harborUser,
      harborEmail: credentials.harborEmail,
      harborPassword: credentials.harborPassword
    })
  }

  const container = { mnid, credentials }

  // Building common broker:
  await onboardMemberBroker(config, container)

  // Sending AWS credentials:
  await onboardMemberAWS(config, container)

  // Output:
  logger.info('Credentials: ' + JSON.stringify(credentials, null, 2))
}
