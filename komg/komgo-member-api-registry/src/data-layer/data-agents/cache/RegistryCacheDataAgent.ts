import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { inject, injectable } from 'inversify'

import { DatabaseConnectionException, ContentNotFoundException } from '../../../exceptions'
import { ErrorNames } from '../../../exceptions/utils'
import { TYPES } from '../../../inversify/types'
import { IMemberDAO } from '../../dao/IMemberDAO'
import { IRegistryEventManagerDAO } from '../../dao/IRegistryEventManagerDAO'

import { IEventDataAgent } from './IEventDataAgent'
import { IRegistryCacheDataAgent } from './IRegistryCacheDataAgent'
@injectable()
export class RegistryCacheDataAgent implements IRegistryCacheDataAgent {
  private logger = getLogger('EventsProcessor')
  private eventsDataAgents = {}
  private memberDao: IMemberDAO
  private registryEventDao: IRegistryEventManagerDAO

  constructor(
    @inject(TYPES.MemberDAO) memberDao: IMemberDAO,
    @inject(TYPES.RegistryEventManagerDAO) eventDao: IRegistryEventManagerDAO,
    @inject(TYPES.NewOwnerDataAgent) newOwner: IEventDataAgent,
    @inject(TYPES.TransferDataAgent) transfer: IEventDataAgent,
    @inject(TYPES.NewResolverDataAgent) newResolver: IEventDataAgent,
    @inject(TYPES.AddrChangedDataAgent) address: IEventDataAgent,
    @inject(TYPES.EthPubKeyAddedDataAgent) ethPubKeyAdded: IEventDataAgent,
    @inject(TYPES.EthPubKeyRevokedDataAgent) ethPubKeyRevoked: IEventDataAgent,
    @inject(TYPES.KomgoMessagingPubKeyAddedDataAgent) komgoMessagingPubKeyAdded: IEventDataAgent,
    @inject(TYPES.KomgoMessagingPubKeyRevokedDataAgent) komgoMessagingPubKeyRevoked: IEventDataAgent,
    @inject(TYPES.VaktMessagingPubKeyAddedDataAgent) vaktMessagingPubKeyAdded: IEventDataAgent,
    @inject(TYPES.VaktMessagingPubKeyRevokedDataAgent) vaktMessagingPubKeyRevoked: IEventDataAgent,
    @inject(TYPES.TextChangedDataAgent) textChanged: IEventDataAgent,
    @inject(TYPES.ReverseNodeChangedDataAgent) reverseNodeChanged: IEventDataAgent,
    @inject(TYPES.ABIChangedDataAgent) abiChangedDataAgent: IEventDataAgent
  ) {
    this.memberDao = memberDao
    this.registryEventDao = eventDao
    // tslint:disable
    this.eventsDataAgents['NewOwner'] = newOwner
    this.eventsDataAgents['Transfer'] = transfer
    this.eventsDataAgents['NewResolver'] = newResolver
    this.eventsDataAgents['AddrChanged'] = address
    this.eventsDataAgents['ABIChanged'] = abiChangedDataAgent
    this.eventsDataAgents['EthPubKeyAdded'] = ethPubKeyAdded
    this.eventsDataAgents['EthPubKeyRevoked'] = ethPubKeyRevoked
    this.eventsDataAgents['KomgoMessagingPubKeyAdded'] = komgoMessagingPubKeyAdded
    this.eventsDataAgents['KomgoMessagingPubKeyRevoked'] = komgoMessagingPubKeyRevoked
    this.eventsDataAgents['VaktMessagingPubKeyAdded'] = vaktMessagingPubKeyAdded
    this.eventsDataAgents['VaktMessagingPubKeyRevoked'] = vaktMessagingPubKeyRevoked
    this.eventsDataAgents['TextChanged'] = textChanged
    this.eventsDataAgents['ReverseNodeChanged'] = reverseNodeChanged
    // tslint:enable
  }

  async clearCache(): Promise<any> {
    try {
      await this.memberDao.clearAll()
      await this.registryEventDao.clearAll()
    } catch (error) {
      this.logger.error(ErrorCode.ConnectionDatabase, ErrorNames.ClearCacheFailed, error.message, new Error().stack)
      throw new DatabaseConnectionException(`Failed to clear database.`)
    }
  }

  async saveSingleEvent(event: any): Promise<any> {
    const eventDataAgent = this.eventsDataAgents[event.name]
    if (eventDataAgent) {
      try {
        await eventDataAgent.saveEvent(event)
      } catch (error) {
        this.logger.error(
          ErrorCode.ConnectionDatabase,
          ErrorNames.SaveSingleEventFailed,
          error.message,
          { event },
          new Error().stack
        )
        throw new DatabaseConnectionException(`Failed to save event ${event}`)
      }
    }
  }

  async getMembers(companyData: string): Promise<any> {
    const members = await this.memberDao.getMembers(companyData)
    if (members) {
      return members
    } else {
      this.logger.error(ErrorCode.DatabaseMissingData, ErrorNames.GetMembersFailed, { companyData }, new Error().stack)
      throw new ContentNotFoundException('No member matching the inquiry was found.')
    }
  }

  async getProducts(companyData: string): Promise<any> {
    const members = await this.memberDao.getMembers(companyData)
    if (members[0] && members[0].komgoProducts !== undefined) {
      return members[0].komgoProducts
    } else {
      return []
    }
  }
}
