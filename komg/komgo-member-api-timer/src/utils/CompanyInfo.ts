import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import axios from 'axios'

import { ErrorName } from './Constants'

const { API_REGISTRY_BASE_URL } = process.env

const logger = getLogger('healthcheck')

export const getCompanyNameByStaticId = async (staticId: string): Promise<string> => {
  const companyInfo = await getCompanyInfoById(staticId)
  const companyName = companyInfo && companyInfo.x500Name && companyInfo.x500Name.O

  return companyName || ''
}

export const getCompanyInfoById = async (staticId: string): Promise<any> => {
  const url = getApiRegistryUrlByStaticId(staticId)
  let result = ''

  try {
    const response = await axios.get(url)
    result = response.data[0]
  } catch (error) {
    logger.warn(
      ErrorCode.ConnectionMicroservice,
      ErrorName.GenericRegistryError,
      'Error thrown on getCompanyInfoById',
      { staticId, errorMessage: error.message, stacktrace: error.stack }
    )
  }
  return result
}

export const getApiRegistryUrlByStaticId = (staticId: string) => {
  const query = `{"staticId" : "${staticId}" }`

  return `${API_REGISTRY_BASE_URL}/v0/registry/cache?companyData=${encodeURIComponent(query)}`
}
