import AWS from 'aws-sdk'
import { logger } from '../../utils'
import { Config } from '../../config'
import { CredentialsContainer } from './generate-credentials'

export const onboardMemberAWS = async (config: Config, container: CredentialsContainer) => {
  // Skipping AWS step if required:
  if (config.get('aws.enabled') !== true) {
    logger.info('Skipping AWS step due to "aws.enabled" config parameter...')
    return
  }

  // Connection to AWS:
  logger.info('Setting up AWS connection...')
  const aws = new AWS.SecretsManager({
    region: config.get('aws.config.region'),
    accessKeyId: config.get('aws.config.id'),
    secretAccessKey: config.get('aws.config.key')
  })

  // Secret data:
  const name = `${config.get('aws.env.type')}/${config.get('aws.env.name')}/${container.mnid}`
  const data = JSON.stringify(container.credentials)

  // Checking if such secret exists:
  let secretExists = false
  const current = await aws.listSecrets().promise()
  if (current.SecretList) {
    for (const secret of current.SecretList) {
      if (secret.Name === name) {
        secretExists = true
        break
      }
    }
  }

  // Updating secret if it exists:
  if (secretExists) {
    logger.info('Secret storage on AWS exists, updating...')
    await aws
      .updateSecret({
        SecretId: name,
        SecretString: data
      })
      .promise()
  }

  // Or creating new:
  else {
    logger.info('Secret storage on AWS does not exists, creating...')
    await aws
      .createSecret({
        Name: name,
        SecretString: data
      })
      .promise()
  }
}
