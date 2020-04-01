import { inject, injectable } from 'inversify'
import moment = require('moment')

import { getLogger } from '@komgo/logging'
import { ReferenceType, IReference } from '@komgo/types'
import { ErrorCode } from '@komgo/error-utilities'

import { TYPES } from '../../inversify/types'
import { ICompanyRegistryService } from '../../service-layer/ICompanyRegistryService'
import { ErrorNames } from '../../exceptions/utils'
import { ContentNotFoundException } from '../../exceptions'
import { ICounterDataAgent } from '../../data-layer/data-agents'
import { ICounterService } from './ICounterService'

@injectable()
export class CounterService implements ICounterService {
  private logger = getLogger('CounterService')
  private readonly registryService: ICompanyRegistryService
  private readonly counterDataAgent: ICounterDataAgent
  constructor(
    @inject(TYPES.CompanyRegistryService) registryService: ICompanyRegistryService,
    @inject(TYPES.CounterDataAgent) counterDataAgent: ICounterDataAgent
  ) {
    this.registryService = registryService
    this.counterDataAgent = counterDataAgent
  }

  async calculateNewReferenceObject(referenceType: ReferenceType, staticId: string): Promise<IReference> {
    this.logger.info(`Getting new reference ID for ${referenceType}`)

    let year
    let trigram
    let value

    const member = await this.getMember(staticId)
    const CN = member.x500Name.CN
    trigram = CN.substring(0, 3).toUpperCase()
    year = parseInt(moment().format('YY'), 10)

    const counterContext = {
      company: trigram
    }

    value = await this.counterDataAgent.getCounterAndUpdate(referenceType, counterContext)
    return {
      trigram,
      year,
      value
    }
  }

  async calculateNewReferenceId(referenceType: ReferenceType, staticId: string) {
    this.logger.info(`Getting new reference ID for ${referenceType}`)

    const { year, trigram, value } = await this.calculateNewReferenceObject(referenceType, staticId)
    return `${referenceType}-${trigram}-${year}-${value}`
  }

  private async getMember(staticId: string) {
    const queryResult = await this.registryService.getMember(staticId)
    const [member] = queryResult.data
    if (!member) {
      this.logger.error(
        ErrorCode.DatabaseMissingData,
        ErrorNames.MemberNotFound,
        'Member not found.',
        { staticId },
        new Error().stack
      )
      throw new ContentNotFoundException('Member not found')
    }
    return member
  }
}
