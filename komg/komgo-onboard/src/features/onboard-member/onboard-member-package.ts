import { Config } from '../../config'
import { generatePw, HarborCredentials } from './generate-credentials'
import { v4 as uuid4 } from 'uuid'
import { logger } from '../../utils'
import { onboardMemberHarbor } from './onboard-member-harbor'

interface X500Name {
  CN: string
  O: string
  C: string
  L: string
  STREET: string
  PC: string
}

interface PrePackageCompany {
  x500Name: X500Name
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  komgoProducts: any
  isMember: boolean
  isFMS: boolean
}

export interface PackageCompany {
  x500Name: X500Name
  hasSWIFTKey: boolean
  isFinancialInstitution: boolean
  isMember: boolean
  isFMS: boolean
  staticId: string
  komgoMnid: string
  rabbitMQCommonUser: string
  rabbitMQCommonPassword: string
  harborUser: string
  harborEmail: string
  harborPassword: string
  ensAddress: string
  komgoProducts: any
}

export const generateMemberPackage = async (
  prePackage: PrePackageCompany[],
  config: Config
): Promise<PackageCompany[]> => {
  const memberPackage: PackageCompany[] = []
  let staticId: string
  let komgoMnid: string

  for (const i of Object.keys(prePackage)) {
    const company = prePackage[i]
    try {
      validatePrePackage(company)
    } catch (e) {
      logger.error(`Object at position #${0} has the following errors:\n  * ${e.errors.join('\n  * ')}`)
      process.exit(1)
    }

    staticId = uuid4()
    komgoMnid = uuid4()

    const userInfo: HarborCredentials = {
      harborUser: generatePw(12),
      harborEmail: generatePw(12) + '@komgo.io',
      harborPassword: generatePw(12)
    }

    await onboardMemberHarbor(config, userInfo)

    const companyFull: PackageCompany = {
      x500Name: company.x500Name,
      hasSWIFTKey: company.hasSWIFTKey,
      isFinancialInstitution: company.isFinancialInstitution,
      isMember: company.isMember,
      isFMS: company.isFMS,
      staticId,
      komgoMnid,
      rabbitMQCommonUser: komgoMnid + '-USER',
      rabbitMQCommonPassword: generatePw(),
      komgoProducts: company.komgoProducts,
      harborUser: userInfo.harborUser,
      harborEmail: userInfo.harborEmail,
      harborPassword: userInfo.harborPassword,
      ensAddress: config.get('ens.address')
    }
    memberPackage.push(companyFull)
  }
  return memberPackage
}

const validatePrePackageX500Name = (prePackage: PrePackageCompany): void => {
  const requiredX500NameFields = ['CN', 'O', 'C', 'L', 'STREET', 'PC']
  const errors = []

  if (prePackage.x500Name) {
    for (const field of requiredX500NameFields) {
      if (prePackage.x500Name[field] === undefined || prePackage.x500Name[field] === null) {
        errors.push(`Field "x500Name.${field}" is not defined`)
      }
    }
  }

  if (errors.length) {
    throw { errors }
  }
}

const validatePrePackageFields = (prePackage: PrePackageCompany): void => {
  const requiredFields = ['x500Name', 'hasSWIFTKey', 'isFinancialInstitution', 'isMember', 'isFMS']
  const booleans = ['hasSWIFTKey', 'isFinancialInstitution', 'isMember', 'isFMS']
  const errors = []

  for (const field of requiredFields) {
    if (prePackage[field] === undefined || prePackage[field] === null) {
      errors.push(`Field "${field}" is not defined`)
    }
  }

  for (const field of booleans) {
    if (prePackage[field] !== true && prePackage[field] !== false) {
      errors.push(`Field "${field}" must be a boolean`)
    }
  }

  if (errors.length) {
    throw { errors }
  }
}

const validatePrePackage = (prePackage: PrePackageCompany): void => {
  validatePrePackageFields(prePackage)
  validatePrePackageX500Name(prePackage)
}
