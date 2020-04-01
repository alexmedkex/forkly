import 'reflect-metadata'
import { IEvent } from '../../common/IEvent'
import { SBLCDataUpdated } from './SBLCEvents'
import { SBLCDataUpdatedEventService } from './SBLCDataUpdatedEventService'
import { buildFakeStandByLetterOfCredit, IStandbyLetterOfCredit } from '@komgo/types'
import { sblcMockDataAgent } from './testMocks'

const rawEvent: IEvent = {
  transactionHash: '0x123456',
  address: '0x0',
  blockNumber: 1,
  data: '0x123',
  topics: ['0x69']
}

const decodedEventDocumentHash = {
  fieldName: SBLCDataUpdated.SWIFT_SBLC_DOCUMENT,
  data: 'docHash'
}

const decodedEventIssuingBankReference = {
  fieldName: SBLCDataUpdated.ISSUING_REFERENCE,
  data: 'issuingBankRef'
}

const decodedEventDataIssuingBank = {
  fieldName: SBLCDataUpdated.DATA_ISSUING_BANK_COMMENTS,
  data: 'issuingBankRef'
}

const decodedEventIssiongBankPostalAddress = {
  fieldName: SBLCDataUpdated.ISSUING_BANK_POSTAL_ADDRESS,
  data: 'issuingBankAddress'
}

const decodedEventUnknown = {
  fieldName: 'I have no idea what is this lol'
}

describe('SBLCDataUpdatedEventService', () => {
  let sblcDataUpdatedEventService: SBLCDataUpdatedEventService
  beforeEach(() => {
    sblcDataUpdatedEventService = new SBLCDataUpdatedEventService(sblcMockDataAgent)
  })

  it('Document hash', async () => {
    const sblc: IStandbyLetterOfCredit = buildFakeStandByLetterOfCredit()
    await sblcDataUpdatedEventService.doEvent(sblc, decodedEventDocumentHash, rawEvent)
    sblc.documentHash = decodedEventDocumentHash.data
    expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
  })

  it('Issuing bank reference', async () => {
    const sblc: IStandbyLetterOfCredit = buildFakeStandByLetterOfCredit()
    await sblcDataUpdatedEventService.doEvent(sblc, decodedEventIssuingBankReference, rawEvent)
    sblc.issuingBankReference = decodedEventDocumentHash.data
    expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
  })

  it('Issuing bank postal address', async () => {
    const sblc: IStandbyLetterOfCredit = buildFakeStandByLetterOfCredit()
    await sblcDataUpdatedEventService.doEvent(sblc, decodedEventIssiongBankPostalAddress, rawEvent)
    sblc.issuingBankPostalAddress = decodedEventDocumentHash.data
    expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
  })

  it('Issuing bank rejects', async () => {
    const sblc: IStandbyLetterOfCredit = buildFakeStandByLetterOfCredit()
    await sblcDataUpdatedEventService.doEvent(sblc, decodedEventDataIssuingBank, rawEvent)
    sblc.issuingBankReference = decodedEventDocumentHash.data
    expect(sblcMockDataAgent.update).toHaveBeenCalledWith({ staticId: sblc.staticId }, sblc)
  })
})
