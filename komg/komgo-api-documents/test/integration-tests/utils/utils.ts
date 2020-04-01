import { AMQPConfig, AMQPUtility } from '@komgo/integration-test-utilities'
import Axios from 'axios'
import * as dotenv from 'dotenv'
import * as logger from 'winston'

import { IMockedIds } from './types'

const fs = require('fs')

export const generateRandomString = (length: number, prefix: string = '') => {
  let text = ''
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return `${prefix}${text}`
}

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function createInternalQueues(mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) {
  await setupInternalQueues(mockedIds, amqpConfig)

  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()
  await connection.close()
}

async function setupInternalQueues(mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  const { eventConsumerId, eventToPublisherId, eventFromPublisherId } = mockedIds

  await channel.assertExchange(`${eventFromPublisherId}`, 'topic')
  await channel.assertExchange(`${eventFromPublisherId}.dead`, 'topic')
  await channel.assertExchange(`${eventToPublisherId}`, 'topic')
  await channel.assertExchange(`${eventToPublisherId}.dead`, 'topic')

  logger.info('Asserting queue: ', `${eventConsumerId}.${eventFromPublisherId}.queue`)
  await channel.assertQueue(`${eventConsumerId}.${eventFromPublisherId}.queue`, {
    deadLetterExchange: `${eventFromPublisherId}.dead`
  })
  logger.info('Asserting queue: ', `${eventConsumerId}.${eventToPublisherId}.queue`)
  await channel.assertQueue(`${eventConsumerId}.${eventToPublisherId}.queue`, {
    deadLetterExchange: `${eventToPublisherId}.dead`
  })

  await channel.bindQueue(`${eventConsumerId}.${eventFromPublisherId}.queue`, eventFromPublisherId, '#')

  await channel.bindQueue(`${eventConsumerId}.${eventToPublisherId}.queue`, eventToPublisherId, '#')

  await channel.close()

  await connection.close()
}

export const deleteInternalMQs = async (mockedIds: IMockedIds, amqpConfig = new AMQPConfig()) => {
  const amqpUtility = new AMQPUtility(amqpConfig)
  const connection = await amqpUtility.getConnection()
  const channel = await connection.createChannel()

  const { eventConsumerId, eventToPublisherId, eventFromPublisherId } = mockedIds

  await channel.deleteQueue(`${eventConsumerId}.${eventToPublisherId}.queue`, {
    ifEmpty: true
  })
  await channel.deleteQueue(`${eventToPublisherId}.dead`, { ifEmpty: true })
  await channel.deleteQueue(`${eventFromPublisherId}.dead`, { ifEmpty: true })

  await channel.deleteExchange(eventToPublisherId)
  await channel.deleteExchange(eventFromPublisherId)
  await channel.deleteExchange(`${eventToPublisherId}.dead`)
  await channel.deleteExchange(`${eventFromPublisherId}.dead`)

  await connection.close()
}

/**
 * Allow only one process to execute this function successfully.
 *
 * Atomicity is achieved by exclusively creating a new file. If a file
 * already exists any other process that attempts to run this method
 * will fail.
 *
 * If multiple processes tries to create the same file only one will
 * succeed. To create multiple "locks" processes should use different
 * file names.
 *
 * @param path name of a file a process will attempt to write.
 */
export async function singleProcessBarrier(path: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path, '', { flag: 'wx' }, function(err) {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

export function createMockedIds(serverPort: string): IMockedIds {
  const publisherId = `api-documents-${serverPort}`
  const eventFromPublisherId = `from-event-mgnt-${serverPort}`
  const eventToPublisherId = `to-event-mgnt-${serverPort}`
  return {
    recipientMNID: `recipientBank-${serverPort}`,
    senderMNID: `senderBank-${serverPort}`,
    eventConsumerId: `event-mgnt-consumer-${serverPort}`,
    eventFromPublisherId,
    eventToPublisherId,
    publisherId,
    companyStaticId: `recipientBankStaticId-${serverPort}`,
    outboundRoutingKey: `outboundRoutingKey-${serverPort}`,
    eventFromPublisherDeadExchange: `${eventFromPublisherId}.dead`,
    eventFromPublisherDeadQueue: `${eventFromPublisherId}.dead`,
    eventToPublisherDeadExchange: `${eventToPublisherId}.dead`,
    eventToPublisherDeadQueue: `${eventToPublisherId}.dead`
  }
}

export async function waitUntilServerIsUp(baseURL: string): Promise<void> {
  const axiosInstance = Axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  })

  for (let i = 0; i < 30; i++) {
    try {
      const { data } = await axiosInstance.get(`${baseURL}/ready`)

      if (data.mongo === 'OK' && data.blockchain === 'OK') {
        logger.info('Server running with all services with status OK')
        return
      }
    } catch (error) {
      logger.info('Waiting for Server to start. Error message: ', error.message)
      await sleep(2000)
    }
  }
}

export async function loadEnvironmentVariables() {
  // Before other imports Load and list the integration tests environment variables loaded from .env
  const result = dotenv.config({ path: __dirname + '/../.env' })
  if (result.error) {
    throw result.error
  }
  logger.info(result.parsed)
}

/**
 * Makes axios error message more verbose
 */
export const enhancedAxiosErrorMessage = e => {
  if (!e.response) {
    return Promise.reject(e)
  }
  e.message = `${e.message}.
Request: ${e.request.method} ${e.request.path}
Response: ${JSON.stringify(e.response.data)}`
  return Promise.reject(e)
}
