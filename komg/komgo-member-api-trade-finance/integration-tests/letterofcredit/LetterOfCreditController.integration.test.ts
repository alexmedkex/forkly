import { IntegrationEnvironment } from '../utils/IntegrationEnvironment'
import Axios from 'axios'
import { LetterOfCreditRepo } from '../../src/data-layer/mongodb/letter-of-credit/LetterOfCreditRepo'
import {
  buildFakeLetterOfCreditBase,
  ILetterOfCreditBase,
  ILetterOfCredit,
  IDataLetterOfCreditBase,
  IDataLetterOfCredit,
  LetterOfCreditType
} from '@komgo/types'
import waitForExpect from 'wait-for-expect'
import MockAdapter from 'axios-mock-adapter'
import { AxiosMockUtils } from '../mocks/AxiosMockUtils'
import { CounterRepo } from '../../src/data-layer/mongodb/counter/CounterRepo'
import { LetterOfCreditTransactionManagerMock } from '../mocks/LetterOfCreditTransactionManagerMock'
import { TYPES } from '../../src/inversify'
import { IDocumentServiceClient } from '../../src/business-layer/documents/DocumentServiceClient'
import { DocumentServiceClientMock } from '../mocks/DocumentServiceClientMock'
import { getValidTemplate } from '../utils/getValidTemplate'

const FormData = require('form-data')
const fs = require('fs')

jest.setTimeout(50000)

const MOCK_ENCODED_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('LetterOfCredit integration test', () => {
  let iEnv: IntegrationEnvironment
  let axiosMockUtils: AxiosMockUtils
  let transactionManagerMock: LetterOfCreditTransactionManagerMock
  let documentClientMock: IDocumentServiceClient

  const axiosInstance = Axios.create({
    baseURL: 'http://localhost:8080/v0',
    headers: { Authorization: `Bearer ${MOCK_ENCODED_JWT}` }
  })

  beforeAll(async done => {
    transactionManagerMock = new LetterOfCreditTransactionManagerMock()
    documentClientMock = new DocumentServiceClientMock()
    iEnv = new IntegrationEnvironment()
    await iEnv.setup()
    iEnv
      .getIocContainer()
      .rebind(TYPES.LetterOfCreditTransactionManager)
      .toConstantValue(transactionManagerMock)
    iEnv
      .getIocContainer()
      .rebind(TYPES.DocumentServiceClient)
      .toConstantValue(documentClientMock)
    await iEnv.startServer()
    axiosMockUtils = new AxiosMockUtils(new MockAdapter(Axios))
    done()
  })

  beforeEach(async done => {
    transactionManagerMock.deploy = jest
      .fn()
      .mockImplementation(() => Promise.resolve(LetterOfCreditTransactionManagerMock.TRANSACTION_HASH))
    transactionManagerMock.requestReject = jest.fn()
    transactionManagerMock.issue = jest.fn()
    done()
  })

  afterAll(async done => {
    await iEnv.stopServer()
    await iEnv.tearDown()
    done()
  })

  afterEach(async done => {
    await iEnv.cleanCollection(LetterOfCreditRepo.collection)
    await iEnv.cleanCollection(CounterRepo.collection)
    axiosMockUtils.reset()
    done()
  })

  it('Should create LetterOfCredit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    delete letterOfCreditBase.templateInstance.data.beneficiaryBank
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const letterOfCreditCreated: ILetterOfCredit<IDataLetterOfCredit> = response.data
    expect(letterOfCreditCreated.reference).toMatch(/LC-COM-(.*)-1/)
    await assertLetterOfCreditInDB(letterOfCreditCreated.staticId, letterOfCreditBase)
  })

  it('Should fail on create LetterOfCredit when tx manager fails', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    transactionManagerMock.deploy = jest.fn().mockImplementation(() => Promise.reject(new Error('boom')))
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(500)
    }
  })

  it('Should fail on invalid request LetterOfCredit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    delete letterOfCreditBase.type
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(400)
    }
  })

  it('Should fail on invalid validation LetterOfCredit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    letterOfCreditBase.templateInstance.templateStaticId = 'notuuid'
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      expect(error.response.data.message).toBeDefined()
      expect(Object.keys(validationError).includes('templateInstance.templateStaticId')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Should fail on invalid validation of data in LetterOfCredit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    letterOfCreditBase.templateInstance.data.applicant.staticId = 'notuuid'
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      expect(error.response.data.message).toBeDefined()
      expect(Object.keys(validationError).includes('applicant.staticId')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Should fail if the trade is already associated to a letter of credit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.data.message).toEqual('A letterOfCredit with provided trade already exists')
      expect(error.response.status).toBe(422)
    }
  })

  it('Should not create LetterOfCredit, trade not found, return 404', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockMember(axiosMockUtils)
    mockMembers(axiosMockUtils, letterOfCreditBase)
    mockTradeNotFound(axiosMockUtils)
    delete letterOfCreditBase.templateInstance.data.beneficiaryBank
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Should not create LetterOfCredit, company not found, should return 404', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    axiosMockUtils.mockSuccessCompanyRegistryGetMember([])
    try {
      await axiosInstance.post('/letterofcredit', letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Should issue letter of credit - beneficiary in komgo', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    letterOfCreditBase.templateInstance.data = {
      ...letterOfCreditBase.templateInstance.data,
      amount: 6969
    }
    letterOfCreditBase.templateInstance.data.issuingBankReference = 'intref3'

    const lcIssuedResponse = await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase)
    const lcIssued: ILetterOfCredit<IDataLetterOfCredit> = lcIssuedResponse.data
    expect(lcIssued.reference).toMatch(/LC-COM-(.*)-1/)
    expect(lcIssued.templateInstance.data.amount).toEqual(6969)
    expect(lcIssued.templateInstance.data.issuingBankReference).toEqual('intref3')
    expect(lcIssued.issuingDocumentHash).toBeUndefined()
    await assertLetterOfCreditInDB(lcIssued.staticId, lcIssued)
  })

  it('Should issue letter of credit - beneficiary NOT in komgo', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    letterOfCreditBase.templateInstance.data = {
      ...letterOfCreditBase.templateInstance.data,
      amount: 6969
    }
    letterOfCreditBase.templateInstance.data.issuingBankReference = 'intref4'

    const lcIssuedResponse = await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase, true)
    const lcIssued: ILetterOfCredit<IDataLetterOfCredit> = lcIssuedResponse.data
    expect(lcIssued.reference).toMatch(/LC-COM-(.*)-1/)
    expect(lcIssued.templateInstance.data.amount).toEqual(6969)
    expect(lcIssued.templateInstance.data.issuingBankReference).toEqual('intref4')
    expect(lcIssued.issuingDocumentHash).toBeDefined()
    await assertLetterOfCreditInDB(lcIssued.staticId, lcIssued)
  })

  it('should fail to issue if an incomplete object is sent', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    delete letterOfCreditBase.templateInstance
    try {
      await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      console.log(error.response.data)
      expect(error.response.data.message).toBeDefined()
      expect(Object.keys(validationError).includes('templateInstance')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Should fail to issue letter of credit if model is wrong - beneficiary in komgo', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    letterOfCreditBase.templateInstance.templateStaticId = 'what'
    try {
      await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      console.log(error.response.data)
      expect(error.response.data.message).toBeDefined()
      expect(Object.keys(validationError).includes('templateInstance.templateStaticId')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Should fail to issue letter of credit if issuing bank reference not supplied - beneficiary in komgo', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    delete letterOfCreditBase.templateInstance.data.issuingBankReference
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    try {
      await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      const validationError = error.response.data.fields
      console.log(error.response.data)
      expect(error.response.data.message).toBeDefined()
      expect(Object.keys(validationError).includes('issuingBankReference')).toBeTruthy()
      expect(error.response.status).toBe(422)
    }
  })

  it('Should fail to issue letter of credit with 500 error if tx manager fails', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    letterOfCreditBase.templateInstance.data.issuingBankReference = 'intref5'

    transactionManagerMock.issue = jest.fn().mockImplementation(() => Promise.reject(new Error('boom')))
    try {
      await sendMultipart(`/letterofcredit/${createdStaticId}/issue`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(500)
    }
  })

  it('Should return 404 when issuing a letter of credit that does not exist', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    letterOfCreditBase.templateInstance.data.issuingBankReference = 'intref6'
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    try {
      await sendMultipart(`/letterofcredit/whateva/issue`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Should reject request letter of credit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    letterOfCreditBase.templateInstance.data = {
      ...letterOfCreditBase.templateInstance.data,
      amount: 6969
    }
    const lcRejectedResponse = await axiosInstance.post(
      `/letterofcredit/${createdStaticId}/rejectrequest`,
      letterOfCreditBase
    )
    const lcRejected: ILetterOfCredit<IDataLetterOfCredit> = lcRejectedResponse.data
    expect(lcRejected.reference).toMatch(/LC-COM-(.*)-1/)
    expect(lcRejected.templateInstance.data.amount).toEqual(6969)
    expect(lcRejected.issuingDocumentHash).toBeUndefined()
    await assertLetterOfCreditInDB(lcRejected.staticId, lcRejected)
  })

  it('Should return bad request reject request letter of credit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    try {
      await axiosInstance.post(`/letterofcredit/${createdStaticId}/rejectrequest`)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(400)
    }
  })

  it('Should fail reject request with 500 error if tx manager fails', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const lcCreated = response.data
    const createdStaticId = lcCreated.staticId
    transactionManagerMock.requestReject = jest.fn().mockImplementation(() => Promise.reject(new Error('boom')))
    try {
      await axiosInstance.post(`/letterofcredit/${createdStaticId}/rejectrequest`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(500)
    }
  })

  it('reject request letter of credit should fail if not found', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    try {
      await axiosInstance.post(`/letterofcredit/whateva/rejectrequest`, letterOfCreditBase)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Should get LetterOfCredit', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const letterOfCreditCreated: ILetterOfCredit<IDataLetterOfCredit> = response.data
    const response2 = await axiosInstance.get(`/letterofcredit/${letterOfCreditCreated.staticId}`)
    const savedLetterOfCredit = response2.data
    delete letterOfCreditCreated.updatedAt
    expect(savedLetterOfCredit).toMatchObject({
      ...letterOfCreditCreated,
      templateInstance: savedLetterOfCredit.templateInstance
    })
  })

  it('Should get 404 if staticId is not found', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    try {
      await axiosInstance.get(`/letterofcredit/doesntexist`)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(404)
    }
  })

  it('Should get all LettersOfCredit - documentary', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase({
      type: LetterOfCreditType.Documentary
    })
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    const response = await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const letterOfCreditCreated: ILetterOfCredit<IDataLetterOfCredit> = response.data
    const response2 = await axiosInstance.get(`/letterofcredit/type/documentary`)
    const savedLetterOfCredit = response2.data
    expect(savedLetterOfCredit.length).toEqual(1)
    expect(savedLetterOfCredit[0]).toMatchObject({
      ...letterOfCreditCreated,
      updatedAt: expect.anything(),
      templateInstance: savedLetterOfCredit[0].templateInstance
    })
  })

  it('Should get all LettersOfCredit - standby - empty', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase({
      type: LetterOfCreditType.Documentary
    })
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    const response = await axiosInstance.get(`/letterofcredit/type/standby`)
    const savedLetterOfCredit = response.data
    expect(savedLetterOfCredit.length).toEqual(0)
    expect(savedLetterOfCredit).toMatchObject([])
  })

  it('Should get all LettersOfCredit - bad type', async () => {
    const letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase> = buildFakeLetterOfCreditBase()
    letterOfCreditBase.templateInstance.template = getValidTemplate()
    mockApiCalls(axiosMockUtils, letterOfCreditBase)
    await axiosInstance.post('/letterofcredit', letterOfCreditBase)
    try {
      await axiosInstance.get(`/letterofcredit/type/whatever`)
      fail('Should not reach this point')
    } catch (error) {
      expect(error.response.status).toBe(422)
    }
  })

  const sendMultipart = async (route: string, data: any, sendFile?: boolean): Promise<any> => {
    const formData = new FormData()
    const config = { headers: formData.getHeaders() }
    formData.append('extraData', JSON.stringify(data))
    if (sendFile) {
      const doc = fs.createReadStream('integration-tests/data/sample.pdf')
      formData.append('fileData', doc)
    }
    const response = await axiosInstance.post(route, formData, config)
    return response
  }

  const assertLetterOfCreditInDB = async (
    staticId: string,
    letterOfCredit: ILetterOfCreditBase<IDataLetterOfCreditBase> | ILetterOfCredit<IDataLetterOfCredit>
  ) => {
    await waitForExpect(async () => {
      const savedLetterOfCredit: any = await LetterOfCreditRepo.findOne({ staticId: staticId })
      expect(JSON.parse(JSON.stringify(savedLetterOfCredit))).toMatchObject(
        JSON.parse(
          JSON.stringify({
            ...letterOfCredit,
            __v: savedLetterOfCredit.__v,
            createdAt: savedLetterOfCredit.createdAt,
            updatedAt: savedLetterOfCredit.updatedAt,
            templateInstance: {
              ...letterOfCredit.templateInstance,
              bindings: savedLetterOfCredit.templateInstance.bindings,
              template: savedLetterOfCredit.templateInstance.template,
              data: {
                ...letterOfCredit.templateInstance.data
              }
            },
            staticId,
            transactionHash: LetterOfCreditTransactionManagerMock.TRANSACTION_HASH
          })
        )
      )
    })
  }
})

function mockApiCalls(
  axiosMockUtils: AxiosMockUtils,
  letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>
) {
  mockMember(axiosMockUtils)
  mockMembers(axiosMockUtils, letterOfCreditBase)
  mockTrade(axiosMockUtils, letterOfCreditBase)
  mockCargo(axiosMockUtils, letterOfCreditBase)
}

function mockCargo(axiosMockUtils: AxiosMockUtils, letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>) {
  axiosMockUtils.mockSuccessGetSpecificTrade(`/tradeid/movements`, [
    {
      _id: 'cargoId',
      cargoId: letterOfCreditBase.templateInstance.data.cargo.cargoId,
      sourceId: letterOfCreditBase.templateInstance.data.cargo.sourceId,
      source: letterOfCreditBase.templateInstance.data.cargo.source
    }
  ])
}

function mockTrade(axiosMockUtils: AxiosMockUtils, letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>) {
  axiosMockUtils.mockSuccessGetSpecificTrade(
    `?filter%5Bquery%5D%5BsourceId%5D=E1542123&filter%5Bquery%5D%5Bsource%5D=KOMGO`,
    {
      items: [
        {
          _id: 'tradeid',
          sourceId: letterOfCreditBase.templateInstance.data.trade.sourceId,
          source: letterOfCreditBase.templateInstance.data.trade.source
        }
      ]
    }
  )
}

function mockTradeNotFound(axiosMockUtils: AxiosMockUtils) {
  axiosMockUtils.mockSuccessGetSpecificTrade(
    `?filter%5Bquery%5D%5BsourceId%5D=E1542123&filter%5Bquery%5D%5Bsource%5D=KOMGO`,
    undefined
  )
}

function mockTradeError(axiosMockUtils: AxiosMockUtils) {
  axiosMockUtils.mockErrorGetSpecificTrade(
    `?filter%5Bquery%5D%5BsourceId%5D=E1542123&filter%5Bquery%5D%5Bsource%5D=KOMGO`
  )
}

function mockMembers(axiosMockUtils: AxiosMockUtils, letterOfCreditBase: ILetterOfCreditBase<IDataLetterOfCreditBase>) {
  axiosMockUtils.mockSuccessCompanyRegistryGetSpecificMembers(
    `%7B%22staticId%22%3A%7B%22%24in%22%3A%5B%22cf63c1f8-1165-4c94-a8f8-9252eb4f0016%22%2C%2208e9f8e3-94e5-459e-8458-ab512bee6e2c%22%2C%22ecc3b179-00bc-499c-a2f9-f8d1cc58e9db%22%5D%7D%7D`,
    [
      {
        staticId: letterOfCreditBase.templateInstance.data.applicant.staticId,
        x500Name: { CN: 'Applicant' }
      },
      {
        staticId: letterOfCreditBase.templateInstance.data.issuingBank.staticId,
        x500Name: { CN: 'Issuing Bank' }
      },
      {
        staticId: letterOfCreditBase.templateInstance.data.beneficiary.staticId,
        x500Name: { CN: 'Beneficiary' }
      }
    ]
  )
}

function mockMember(axiosMockUtils: AxiosMockUtils) {
  axiosMockUtils.mockSuccessCompanyRegistryGetSpecificMembers(
    `%7B%22staticId%22%3A%22cf63c1f8-1165-4c94-a8f8-9252eb4f0016%22%7D`,
    [{ x500Name: { CN: 'CompanyName' } }]
  )
}
