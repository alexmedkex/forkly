import { Status } from '@komgo/types'
import axios from 'axios'
import { v4 as uuid4 } from 'uuid'
import waitForExpect from 'wait-for-expect'

import CompanyRegistryService from '../src/infrastructure/api-registry/CompanyRegistryService'
import { ICompanyModel } from '../src/interfaces'

import * as config from './config'
import * as testData from './testData'
import { getCompany } from './utils'

const oneMin = 60e3
const tenMin = 600e3
waitForExpect.defaults.timeout = oneMin
waitForExpect.defaults.interval = 2e3
jest.setTimeout(tenMin)

/**
 *                               README
 *
 * In order to run these tests, start member=2 with kg and api-onboarding MS
 * then run 'npm run test:integration'
 */

describe('Add VAKT After Onboarding', () => {
  const apiRegistry = new CompanyRegistryService(config.apiRegistryBaseUrl)
  const smsCompanyCreateRequest = testData.getSmsCompanyCreateRequest({ includeVakt: false })
  let company: ICompanyModel

  it('creates a company', async () => {
    const createResp = await axios.post<ICompanyModel>(`${config.apiBaseUrl}/companies`, smsCompanyCreateRequest)
    company = createResp.data
    expect(company).toMatchObject({ status: Status.Draft })
  })

  it('generates a member package', async () => {
    const generateMemberPackageResp = await axios.post<ICompanyModel>(
      `${config.apiBaseUrl}/companies/${company.staticId}/member-package`
    )
    company = generateMemberPackageResp.data

    expect(company).toMatchObject({ status: Status.Pending })
  })

  it('adds public keys', async () => {
    const sendPublicKeysResp = await axios.put<void>(
      `${config.apiBaseUrl}/members/public-keys`,
      testData.getPublicKeysRequest(),
      testData.generateHeadersWithAuthorization(company.keycloakUserId)
    )
    expect(sendPublicKeysResp.status).toBe(204)
  })

  it('adds company to Common MQ', async () => {
    const onboardMemberResp = await axios.post<ICompanyModel>(
      `${config.apiBaseUrl}/companies/${company.staticId}/configure-mq`,
      { bottomsheetId: uuid4() },
      testData.generateHeadersWithAuthorization(company.keycloakUserId)
    )
    expect(onboardMemberResp.status).toBe(204)

    await waitForExpect(async () => {
      company = await getCompany(company.staticId)
      expect(company).toMatchObject({
        rabbitMQCommonUser: expect.any(String),
        rabbitMQCommonPassword: expect.any(String)
      })
    })
  })

  it('adds company to ENS', async () => {
    const onboardMemberResp = await axios.put<ICompanyModel>(
      `${config.apiBaseUrl}/companies/${company.staticId}/ens`,
      { bottomsheetId: uuid4() },
      testData.generateHeadersWithAuthorization(company.keycloakUserId)
    )
    expect(onboardMemberResp.status).toBe(204)

    await waitForExpect(async () => {
      company = await getCompany(company.staticId)
      expect(company).toMatchObject({ status: Status.Onboarded })
    })
  })

  it('has correct values in ENS', async () => {
    await waitForExpect(async () => {
      const companyFromENS = await apiRegistry.getCompany(company.staticId)
      expect(companyFromENS).toMatchObject(testData.getExpectedCompanyFromENS(company, false))
    })
  })

  it('adds vakt keys to a company', async () => {
    const requestData = {
      ...smsCompanyCreateRequest,
      x500Name: company.x500Name,
      hasSWIFTKey: company.hasSWIFTKey,
      isFinancialInstitution: company.isFinancialInstitution,
      vakt: {
        staticId: `new-vakt-staticId`,
        mnid: `new-vakt-mnid`,
        messagingPublicKey: {
          key: {
            kty: 'RSA',
            kid: 'new kid',
            e: 'AQAB',
            n: 'new-n'
          },
          validFrom: '2019-06-24T13:43:55Z',
          validTo: '2020-06-24T16:43:55Z'
        }
      }
    }

    let updateResp
    try {
      updateResp = await axios.patch<ICompanyModel>(
        `${config.apiBaseUrl}/companies/${company.staticId}`,
        {
          ...requestData,
          bottomsheetId: uuid4()
        },
        testData.generateHeadersWithAuthorization(company.keycloakUserId)
      )
    } catch (e) {
      throw new Error(`${e.message}: ${e.response && JSON.stringify(e.response.data, null, 2)}`)
    }
    expect(updateResp.status).toBe(204)

    await waitForExpect(async () => {
      const companyFromENS = await apiRegistry.getCompany(company.staticId)
      expect(companyFromENS).toMatchObject({
        vaktStaticId: 'new-vakt-staticId',
        vaktMnid: 'new-vakt-mnid',
        vaktMessagingPubKeys: [
          {
            key: JSON.stringify(requestData.vakt.messagingPublicKey.key),
            current: true,
            revoked: false
          }
        ]
      })
    })
  })
})
