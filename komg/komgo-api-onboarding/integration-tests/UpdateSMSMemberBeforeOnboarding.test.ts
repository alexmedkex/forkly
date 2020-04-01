import { Status } from '@komgo/types'
import axios from 'axios'
import { v4 as uuid4 } from 'uuid'
import waitForExpect from 'wait-for-expect'

import { ICompanyModel } from '../src/interfaces'

import * as config from './config'
import * as testData from './testData'
import { getCompany } from './utils'

const tenMin = 600e3
waitForExpect.defaults.timeout = 2e3
waitForExpect.defaults.interval = 1e3
jest.setTimeout(tenMin)

/**
 *                               README
 *
 * In order to run these tests, start member=2 with kg and api-onboarding MS
 * then run 'npm run test:integration'
 */

describe('Update SMS Member before onboarding', () => {
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

  it('adds vakt keys to the company', async () => {
    const requestData = {
      ...smsCompanyCreateRequest,
      bottomsheetId: uuid4(),
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

    const updateResp = await axios.patch<ICompanyModel>(
      `${config.apiBaseUrl}/companies/${company.staticId}`,
      requestData,
      testData.generateHeadersWithAuthorization('user-id')
    )
    expect(updateResp.status).toBe(204)

    await waitForExpect(async () => {
      company = await getCompany(company.staticId)
      expect(company).toMatchObject({ status: Status.Pending })
    })

    expect(company).toMatchObject({ vakt: requestData.vakt })
  })
})
