import { getLogger } from '@komgo/logging'
import { IMessagePublisher } from '@komgo/messaging-library'
import axios from 'axios'
import * as schedule from 'node-schedule'

import { iocContainer } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { getCompanyNameByStaticId } from '../../utils/CompanyInfo'
import { getVerifStatus, getAllServiceURLs } from '../../utils/HealthcheckHelpers'

interface IServiceHealthStatus {
  ready: number
  readinessStatus?: { [key: string]: string }
}

interface IServicesHealthStatus {
  [key: string]: IServiceHealthStatus
}

interface IKapsuleHealthReport {
  timestamp: number
  platformVersion: string
  companyStaticId: string
  companyName: string
  totalCount: number // total number of microservices
  readyCount: number
  notReadyCount: number
  services: IServicesHealthStatus
}

const {
  HEALTH_REPORT_INTERVAL = '1', // minutes
  READINESS_REQUEST_TIMEOUT = '5000', // ms
  PLATFORM_VERSION = '0.0.0',
  COMPANY_STATIC_ID,
  IS_KOMGO_NODE
} = process.env

export const checkService = async (service: string, url: string): Promise<IServicesHealthStatus> => {
  try {
    const result = await axios.get(url, {
      validateStatus: getVerifStatus, // disable throwing exceptions because we need response data in any case
      timeout: +READINESS_REQUEST_TIMEOUT
    })
    const readinessStatus = result.data
    const ready = result.status >= 200 && result.status < 300 ? 1 : 0
    return { [service]: { ready, readinessStatus } }
  } catch (e) {
    return {
      [service]: {
        ready: 0,
        readinessStatus: { error: e.message }
      }
    }
  }
}

const logger = getLogger('healthcheck')
const messagePublisher = iocContainer.get<IMessagePublisher>(TYPES.MessagePublisher)

export const reportHealthStatus = async () => {
  const urls = getAllServiceURLs(IS_KOMGO_NODE)

  const res = await Promise.all(Object.keys(urls).map(msName => checkService(msName, urls[msName])))
  const services = res.reduce((result, item) => ({ ...result, ...item }), {})

  const readyCount = Object.values(services).filter(service => service.ready).length
  const notReady = Object.keys(services).filter(name => !services[name].ready)
  const notReadyCount = notReady.length
  const companyName = await getCompanyNameByStaticId(COMPANY_STATIC_ID)

  const report: IKapsuleHealthReport = {
    timestamp: Math.floor(Date.now() / 1000),
    companyStaticId: COMPANY_STATIC_ID,
    companyName,
    platformVersion: PLATFORM_VERSION,
    totalCount: res.length,
    readyCount,
    notReadyCount,
    services
  }

  logger.info('Publishing a health report', { readyCount, notReadyCount, notReady })
  await messagePublisher.publish('komgo.monitoring', report, {
    recipientPlatform: 'monitoring'
  })
}

export const startHealthReporter = () => {
  return schedule.scheduleJob(`*/${HEALTH_REPORT_INTERVAL} * * * *`, reportHealthStatus)
}
