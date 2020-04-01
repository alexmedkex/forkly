import fetch from 'node-fetch'
import { logger } from '../../utils'
import { Config } from '../../config'
import { CredentialsContainer, HarborCredentials } from './generate-credentials'

const harborRequest = async (config: Config, methodName: string, route: string, payload?: object) => {
  const auth = Buffer.from(`${config.get('harbor.username')}:${config.get('harbor.password')}`).toString('base64')
  return fetch(`${config.get('harbor.url')}${route}`, {
    method: methodName,
    body: JSON.stringify(payload || undefined),
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + auth
    }
  })
}

export const onboardMemberHarbor = async (config: Config, credentials: HarborCredentials) => {
  const project = config.get('harbor.project')

  // Skipping Harbor step if required:
  if (config.get('harbor.enabled') !== 'true') {
    logger.info('Skipping Harbor step due to "harbor.enabled" config parameter...')
    return
  }

  // Creating new user:
  logger.info('Creating user...')
  let resp = await harborRequest(config, 'POST', '/api/users', {
    Username: credentials.harborUser,
    Email: credentials.harborEmail,
    Password: credentials.harborPassword,
    RealName: credentials.harborUser,
    Comment: 'N/A'
  })

  logger.info(`Got response status: ${resp.status}`)

  // Retriving ID:
  logger.info('Retrieving User ID...')
  const userReq = await harborRequest(config, 'GET', '/api/users?username=' + credentials.harborUser)
  const userId = (await userReq.json())[0].user_id
  logger.info(`User ID: ${userId}`)

  // Retrieving Project Name:
  logger.info('Retrieving Project ID...')
  const projectReq = await harborRequest(config, 'GET', `/api/projects/${project}`)
  const projectName = (await projectReq.json()).name
  logger.info(`Project name: ${projectName}`)

  // Assigning it to the project:
  logger.info('Assigning it to the project...')
  const guestRole = 3
  resp = await harborRequest(config, 'POST', `/api/projects/${project}/members`, {
    role_id: guestRole,
    member_user: {
      user_id: userId,
      username: credentials.harborUser
    },
    member_group: {
      id: parseInt(project, 10),
      group_name: projectName
    }
  })
  logger.info(`Got response status: ${resp.status}`)
}
