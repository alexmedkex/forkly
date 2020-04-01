import 'reflect-metadata'
import { LCPresentationNotificationProcessor } from './LCPresentationNotificationProcessor'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { LCPresentationStatus } from '@komgo/types'
import { LCPresentationRole } from '../events/LCPresentation/LCPresentationRole'

const mockPresentation: any = {
  _id: 'lcPresId',
  reference: '1234',
  issuingBankId: 'issuingBankId-1',
  nominatedBankId: 'nominatedBankId-1'
}

const mockLC: any = {
  _id: 'lcId'
}

const mockNotifManager: any = {
  createNotification: jest.fn()
}

const mockRegistryService: ICompanyRegistryService = {
  getMember: jest.fn(id => ({ data: [{ x500Name: { CN: id } }] })),
  getNodeKeys: jest.fn(),
  getMembersByNode: jest.fn(),
  getMembers: jest.fn()
}

describe('LCPresentationNotificationProcessor', () => {
  let notificationProcessor: LCPresentationNotificationProcessor

  beforeEach(() => {
    notificationProcessor = new LCPresentationNotificationProcessor('company1', mockNotifManager, mockRegistryService)
  })

  it('should send notification for nominated bank', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsCompliantByNominatedBank,
      LCPresentationRole.NominatedBank
    )
    expect(mockNotifManager.createNotification).toBeCalled()
  })

  it('should get proper message for ReleasedToApplicantState', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsReleasedToApplicant,
      LCPresentationRole.IssuingBank
    )

    expect(mockNotifManager.createNotification).toBeCalledWith(
      expect.objectContaining({
        message: `LC presentation ${mockPresentation.reference} documents have been released to applicant by ${
          mockPresentation.issuingBankId
        }`
      })
    )
  })

  it('should get proper message for DocumentsCompliantByNominatedBank', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsCompliantByNominatedBank,
      LCPresentationRole.NominatedBank
    )

    expect(mockNotifManager.createNotification).toBeCalledWith(
      expect.objectContaining({
        message: `LC presentation ${mockPresentation.reference} has been marked compliant by nominated bank ${
          mockPresentation.nominatedBankId
        }`
      })
    )
  })

  it('should get proper message for DocumentsCompliantByIssuingBank', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsCompliantByIssuingBank,
      LCPresentationRole.IssuingBank
    )

    expect(mockNotifManager.createNotification).toBeCalledWith(
      expect.objectContaining({
        message: `LC presentation ${mockPresentation.reference} has been marked compliant by ${
          mockPresentation.issuingBankId
        }`
      })
    )
  })

  it('should get proper message for DocumentsDiscrepantByIssuingBank', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsDiscrepantByIssuingBank,
      LCPresentationRole.IssuingBank
    )

    expect(mockNotifManager.createNotification).toBeCalledWith(
      expect.objectContaining({
        message: `LC presentation ${mockPresentation.reference} has been marked as discrepant by ${
          mockPresentation.issuingBankId
        }`
      })
    )
  })

  it('should get proper message for DocumentsDiscrepantByNominatedBank', async () => {
    await notificationProcessor.sendStateUpdatedNotification(
      mockPresentation,
      mockLC,
      LCPresentationStatus.DocumentsDiscrepantByNominatedBank,
      LCPresentationRole.NominatedBank
    )

    expect(mockNotifManager.createNotification).toBeCalledWith(
      expect.objectContaining({
        message: `LC presentation ${mockPresentation.reference} has been marked as discrepant by ${
          mockPresentation.nominatedBankId
        }`
      })
    )
  })
})
