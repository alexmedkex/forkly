import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { ErrorUtils } from '@komgo/microservice-config'
import { availablePermittedActions } from '@komgo/permissions'
import { ProductProxy, productLC, productKYC, productRD } from '@komgo/products'
import memoize = require('memoizee')

const logger = getLogger('checkLicenses')
const productsMapping = {
  kyc: productKYC.productId,
  tradeFinance: productLC.productId,
  rd: productRD.productId
}

const productRegexp = /products\/(\w+)/i

export default async (tenantStaticID: string, permissionsString: string[], path: string): Promise<void> => {
  const isProductIdInPath: boolean = productRegexp.test(path)
  let licenseIds: string[]
  if (!isProductIdInPath) {
    licenseIds = permissionsString.reduce(
      (res: string[], productString: string) =>
        !availablePermittedActions[productString] ||
        res.some((licenseId: string) => licenseId === availablePermittedActions[productString].licenseId)
          ? res
          : [...res, availablePermittedActions[productString].licenseId],
      []
    )
  } else {
    const productName = productRegexp.exec(path)[1]
    licenseIds = productsMapping[productName] ? [productsMapping[productName]] : []
  }

  if (!licenseIds.some(licenseId => !!licenseId)) {
    // for [] or [undefined] don't need check license
    logger.debug('No license to check')
    return
  }

  if (licenseIds.length > 1) {
    const errMessage = licenseIds.some(licenseId => licenseId === undefined)
      ? 'permissions with licenseId should not be combined with permissions without it'
      : 'all permissions should have the same licenseId'
    throw new Error(errMessage)
  }

  const isAvailable = await memoizedIsLicenseEnabled(tenantStaticID, licenseIds[0])
  logger.info(`Is license enabled: ${isAvailable}`, { permissionsString, path })

  if (!isAvailable) {
    throw ErrorUtils.forbiddenException(
      ErrorCode.Authorization,
      `Your company does not have a license for ${licenseIds[0]} product`
    )
  }
}

export const isLicenseEnabled = (staticId: string, productId: string): Promise<boolean> => {
  const registryBaseUrl = process.env.API_REGISTRY_BASE_URL
  logger.info(`Check license for company ${staticId} and product ${productId}`, { registryBaseUrl })
  const productProxy = new ProductProxy(registryBaseUrl)
  return productProxy.isLicenseEnabled(staticId, productId)
}

const defaultCachePeriod = 30e3
export const memoizedIsLicenseEnabled = memoize(isLicenseEnabled, {
  primitive: true, // use a hash map instead of an array for cache storage
  promise: true,
  maxAge: defaultCachePeriod,
  preFetch: true // silently pre-fetch a new value in order to keep a public key up-to-date
})
