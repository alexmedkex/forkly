import { ISBLCDataAgent } from '../../../data-layer/data-agents'
import { ICompanyRegistryService } from '../../../service-layer/ICompanyRegistryService'
import { ISBLCDocumentManager } from './SBLCDocumentManager'

export const sblcMockDataAgent: ISBLCDataAgent = {
  getByContractAddress: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  getNonce: jest.fn(),
  count: jest.fn()
}

export const taskManagerMock: any = {
  createTask: jest.fn(),
  getTasks: jest.fn(),
  updateTaskStatus: jest.fn(),
  notifBaseUrl: ''
}

export const notificationManagerMock: any = {
  createNotification: jest.fn()
}

export const companyRegistryServiceMock: ICompanyRegistryService = {
  getMember: jest.fn(),
  getMembersByNode: jest.fn(),
  getNodeKeys: jest.fn(),
  getMembers: jest.fn()
}

export const documentManagerMock: ISBLCDocumentManager = {
  deleteDocument: jest.fn(),
  shareDocument: jest.fn()
}
