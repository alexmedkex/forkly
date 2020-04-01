import { hri } from 'human-readable-ids'
import * as jwt from 'jsonwebtoken'

import { ICompany } from '../src/interfaces'
import { ICompanyRequest } from '../src/business-layer/onboard-member-ens/interfaces'

export enum CompanyType {
  SMS = 'SMS',
  FMS = 'FMS',
  LMS = 'LMS',
  NonMember = 'NonMember'
}
interface ICreateCompanyRequestOptions {
  includeVakt?: boolean
  companyType?: CompanyType
}
const defaultOptions: ICreateCompanyRequestOptions = {
  includeVakt: true,
  companyType: CompanyType.SMS
}

export const getSmsCompanyCreateRequest = (options?: ICreateCompanyRequestOptions): ICompanyRequest => {
  options = {
    ...defaultOptions,
    ...(options || {})
  }
  const companyName = hri.random()
  return {
    x500Name: {
      O: companyName,
      CN: companyName,
      C: 'AL',
      L: 'city name',
      STREET: 'street name',
      PC: '1001'
    },
    hasSWIFTKey: true,
    isFinancialInstitution: true,
    isMember: options.companyType !== CompanyType.NonMember,
    companyAdminEmail: options.companyType === CompanyType.SMS ? `${companyName}@komgo.io` : undefined,
    memberType: options.companyType === CompanyType.NonMember ? undefined : options.companyType,
    vakt:
      options.includeVakt && options.companyType === CompanyType.SMS
        ? {
            staticId: `${companyName}-vakt`,
            mnid: `${companyName}-mnid`,
            messagingPublicKey: {
              key: {
                kty: 'RSA',
                kid: 'kGsQES01QZxZp9wpd5Qx1oxT0SqG6NoQ4MfvLvt9acc',
                e: 'AQAB',
                n:
                  'iU3w5GX4X_V-NyOWrjHeYFkbh8GzAxZC-OQT-SLt3BO4-h86-QHg6W9VW8bbHmpe7CMRvrRICJOBgQawne-D1RVi6kiPCMImw4_gAKAwjJ15o8yUMFbjUPZ57cPvwNod-vmTlcRzoedJuuv0pj55GoGnNqkulnn-CX4ApVikuuEKixiM2BzFSLpFm_Jg78zCpxD5Lq__HdjKzbZfpJFgrgOB8DqedD1K3V3W2jGeuv2YDs--ni79TZhXEh2SA29e6U6ryCM8RljMGYHoYjYkeyTUBYhRnVQZSp6OokWbolqMsp98YWFzNvbkGkPqISikTomKPq3mimNX_pbfa4wm7w'
              },
              validFrom: '2019-06-24T13:43:55Z',
              validTo: '2020-06-24T16:43:55Z'
            }
          }
        : undefined
  }
}

export const generateDummyJWT = (userId: string): string => {
  return jwt.sign({}, 'secret', {
    subject: userId
  })
}

export const generateHeadersWithAuthorization = (userId: string) => ({
  headers: {
    Authorization: `Bearer ${generateDummyJWT(userId)}`
  }
})

export const getPublicKeysRequest = () => ({
  messagingPublicKey: {
    key: {
      kty: 'RSA',
      kid: 'kGsQES01QZxZp9wpd5Qx1oxT0SqG6NoQ4MfvLvt9acc',
      e: 'AQAB',
      n:
        'iU3w5GX4X_V-NyOWrjHeYFkbh8GzAxZC-OQT-SLt3BO4-h86-QHg6W9VW8bbHmpe7CMRvrRICJOBgQawne-D1RVi6kiPCMImw4_gAKAwjJ15o8yUMFbjUPZ57cPvwNod-vmTlcRzoedJuuv0pj55GoGnNqkulnn-CX4ApVikuuEKixiM2BzFSLpFm_Jg78zCpxD5Lq__HdjKzbZfpJFgrgOB8DqedD1K3V3W2jGeuv2YDs--ni79TZhXEh2SA29e6U6ryCM8RljMGYHoYjYkeyTUBYhRnVQZSp6OokWbolqMsp98YWFzNvbkGkPqISikTomKPq3mimNX_pbfa4wm7w'
    },
    validFrom: '2019-06-24T13:43:55Z',
    validTo: '2020-06-24T16:43:55Z'
  },
  ethereumPublicKey: {
    key:
      '0x5238f246d9d4a9d9d8cd88a277b1cd089302d3c6e8e5e9436f2ab2a5cd041e8dcac0e8d8bff2ac0e99732a9d61630243322afd93220ca9dabad4384776db3e6e',
    address: '0x5DC71e671D57DCa87766DEff783E22f67ED140A8',
    validFrom: '2019-06-24T13:43:55Z',
    validTo: '2020-06-24T16:43:55Z'
  },
  nodeKeys: 'my node key'
})

export const getExpectedNonMemberCompanyFromENS = (company: ICompany) => ({
  x500Name: {
    O: company.x500Name.O,
    C: 'AL',
    L: 'city name',
    STREET: 'street name',
    PC: '1001',
    CN: company.x500Name.O
  },
  ethPubKeys: [],
  komgoMessagingPubKeys: [],
  vaktMessagingPubKeys: [],
  hasSWIFTKey: true,
  isFinancialInstitution: true,
  isMember: false,
  staticId: company.staticId,
  komgoMnid: company.komgoMnid
})

export const getExpectedCompanyFromENS = (company: ICompany, checkVakt = true) => ({
  ...getExpectedNonMemberCompanyFromENS(company),
  isMember: true,
  ethPubKeys: [
    {
      key: company.ethereumPublicKey.key,
      termDate: expect.any(Number),
      address: expect.any(String),
      current: true,
      revoked: false
    }
  ],
  komgoMessagingPubKeys: [
    {
      key: JSON.stringify(company.messagingPublicKey.key),
      termDate: expect.any(Number),
      current: true,
      revoked: false
    }
  ],
  vaktMessagingPubKeys: checkVakt
    ? [
        {
          key: JSON.stringify(company.vakt.messagingPublicKey.key),
          termDate: expect.any(Number),
          current: true,
          revoked: false
        }
      ]
    : [],
  komgoProducts: [
    { productName: 'KYC', productId: 'KYC' },
    { productName: 'LC / SBLC', productId: 'LC' },
    { productName: 'Receivables discounting', productId: 'RD' },
    { productName: 'Credit Appetite', productId: 'CA' }
  ],
  nodeKeys: '["my node key"]',
  memberType: 'SMS',
  ...(checkVakt
    ? {
        vaktStaticId: company.vakt.staticId,
        vaktMnid: company.vakt.mnid
      }
    : {})
})
