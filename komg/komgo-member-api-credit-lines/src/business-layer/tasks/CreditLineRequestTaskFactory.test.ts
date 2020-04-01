import { ICreditLineRequest, CreditLineRequestType, CreditLineRequestStatus } from '@komgo/types'
import 'reflect-metadata'

import { ICompany } from '../clients/ICompany'
import { ICompanyClient } from '../clients/ICompanyClient'
import { CONFIG } from '../../inversify/config'
import { PRODUCT_ID, SUB_PRODUCT_ID } from '../notifications'

import { CreditLineRequestTaskFactory } from './CreditLineRequestTaskFactory'
import { CreditLineRequestTaskType } from './CreditLineRequestTaskType'

let companyClient: ICompanyClient

const data: ICreditLineRequest = {
  comment: 'comment',
  companyStaticId: 'companyStaticId',
  context: {
    productId: PRODUCT_ID.TradeFinance,
    subProductId: SUB_PRODUCT_ID.RiskCover
  },
  counterpartyStaticId: 'counterpartyStaticId',
  createdAt: undefined,
  requestType: CreditLineRequestType.Received,
  staticId: 'staticId',
  status: CreditLineRequestStatus.Pending,
  updatedAt: undefined
}

const creditLineCounterparty: ICompany = {
  staticId: 'staticId',
  hasSWIFTKey: true,
  isFinancialInstitution: false,
  isMember: true,
  komgoMnid: '',
  status: '',
  x500Name: {
    C: 'C',
    CN: 'CN',
    L: 'L',
    O: 'O',
    PC: 'PC',
    STREET: 'STREET'
  }
}

describe('CreditLineRequestTaskFactory', () => {
  let taskFactory: CreditLineRequestTaskFactory

  beforeEach(() => {
    companyClient = {
      getCompanies: jest.fn(),
      getCompanyByStaticId: jest.fn()
    }

    taskFactory = new CreditLineRequestTaskFactory(companyClient, CONFIG.KapsuleUrl)
  })

  it('should create ReviewCLR task', async () => {
    companyClient.getCompanyByStaticId = jest.fn().mockImplementation(() => creditLineCounterparty)

    const task = await taskFactory.getTask(
      CreditLineRequestTaskType.ReviewCLR,
      data,
      creditLineCounterparty,
      null,
      null
    )

    expect(task).toBeDefined()
  })
})
