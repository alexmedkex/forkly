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

describe('Onboard and update a non-member', () => {
  const apiRegistry = new CompanyRegistryService(config.apiRegistryBaseUrl)
  const smsCompanyCreateRequest = testData.getSmsCompanyCreateRequest({
    companyType: testData.CompanyType.NonMember
  })
  let company: ICompanyModel

  it('creates a company', async () => {
    const createResp = await axios.post<ICompanyModel>(`${config.apiBaseUrl}/companies`, smsCompanyCreateRequest)
    company = createResp.data
    expect(company).toMatchObject({ status: Status.Ready, isMember: false })
  })

  it('adds company to ENS', async () => {
    try {
      await axios.put<ICompanyModel>(
        `${config.apiBaseUrl}/companies/${company.staticId}/ens`,
        {
          bottomsheetId: uuid4()
        },
        testData.generateHeadersWithAuthorization('user-id')
      )
    } catch (e) {
      throw new Error(JSON.stringify(e.response.data))
    }

    await waitForExpect(async () => {
      company = await getCompany(company.staticId)
      expect(company).toMatchObject({ status: Status.Registered })
    })

    await waitForExpect(async () => {
      const companyFromENS = await apiRegistry.getCompany(company.staticId)
      expect(companyFromENS).toMatchObject(testData.getExpectedNonMemberCompanyFromENS(company))
    })
  })

  it('updates a non-member company', async () => {
    const requestData = {
      ...smsCompanyCreateRequest,
      hasSWIFTKey: false
    }

    let updateResp
    try {
      updateResp = await axios.patch<ICompanyModel>(
        `${config.apiBaseUrl}/companies/${company.staticId}`,
        {
          ...requestData,
          bottomsheetId: uuid4()
        },
        testData.generateHeadersWithAuthorization('user-id')
      )
    } catch (e) {
      throw new Error(`${e.message}: ${e.response && JSON.stringify(e.response.data, null, 2)}`)
    }
    expect(updateResp.status).toBe(204)

    await waitForExpect(async () => {
      company = await getCompany(company.staticId)
      expect(company.hasSWIFTKey).toBeFalsy()
    })
  })
})
