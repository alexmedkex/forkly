import { getLogger } from '@komgo/logging'

import { UpdateType } from '../../types'

import { getSectionName } from './getSectionName'

describe('getSectionName', () => {
  const logger = getLogger('getSectionNameTest')

  it('should return the section name successfully', async () => {
    const result = getSectionName(UpdateType.ReceivablesDiscounting, logger)
    expect(result).toEqual('Receivable discounting data')
  })

  it('should return the section name successfully', async () => {
    const result = getSectionName(UpdateType.FinalAgreedTermsData, logger)
    expect(result).toEqual('Agreed terms')
  })

  it('should return the section name successfully', async () => {
    const result = getSectionName(UpdateType.TradeSnapshot, logger)
    expect(result).toEqual('Trade')
  })

  it('should return Unknown if section name is not found', async () => {
    const result = getSectionName('unknownSection' as any, logger)
    expect(result).toEqual('Unknown section')
  })
})
