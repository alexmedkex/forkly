import { getLogger } from '@komgo/logging'
import { injectable } from 'inversify'

import { ContractAddressStatus, ContractAddress } from '../models/contract-address'

import { logAndThrowMongoError, checkAddress, checksumAddress } from './utils'

@injectable()
export class ContractAddressDataAgent {
  private readonly logger = getLogger('ContractAddressDataAgent')

  async blacklist(address: string, txHash: string): Promise<void> {
    checkAddress(address, this.logger)

    try {
      const formattedAddress = checksumAddress(address)

      await ContractAddress.updateOne(
        { address: formattedAddress },
        { $set: { address: formattedAddress, txHash, status: ContractAddressStatus.Blacklisted } },
        { upsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ContractAddress model: blacklist')
    }
  }

  async whitelist(address: string, txHash?: string): Promise<void> {
    checkAddress(address, this.logger)

    try {
      const formattedAddress = checksumAddress(address)

      await ContractAddress.updateOne(
        { address: formattedAddress },
        { $set: { address: formattedAddress, txHash, status: ContractAddressStatus.Whitelisted } },
        { upsert: true }
      ).exec()
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ContractAddress model: whitelist')
    }
  }

  async getStatus(address: string): Promise<ContractAddressStatus> {
    checkAddress(address, this.logger)

    try {
      const listed = await ContractAddress.findOne({ address: checksumAddress(address) }, 'status').exec()
      return listed && listed.status
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ContractAddress model: getStatus')
    }
  }

  async getTxHash(address: string): Promise<string> {
    checkAddress(address, this.logger)

    try {
      const listed = await ContractAddress.findOne({ address: checksumAddress(address) }, 'txHash').exec()
      return listed && listed.txHash
    } catch (error) {
      logAndThrowMongoError(this.logger, error, 'Unable to perform Mongo action on ContractAddress model: getTxHash')
    }
  }
}
