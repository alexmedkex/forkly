import { ErrorCode } from '@komgo/error-utilities'
import { getLogger } from '@komgo/logging'
import { IProduct } from '@komgo/products'
import { injectable } from 'inversify'
import { MongoError } from 'mongodb'

import { ICustomerDataAgent } from '../../data-layer/data-agent/CustomerDataAgent'
import { ILastProcessedBlockDataAgent } from '../../data-layer/data-agent/LastProcessedBlockDataAgent'
import { inject } from '../../inversify/ioc'
import { TYPES } from '../../inversify/types'
import { ErrorName } from '../../utils/ErrorName'

import ICustomerProductManager from './ICustomerProductManager'
import ISmartContract from './ISmartContract'

const MONGO_DUPLICATE_KEY = 'E11000'

@injectable()
export default class CustomerProductManager implements ICustomerProductManager {
  private eventPollingTimer: any
  private eventPolling: boolean = false
  private logger = getLogger('CustomerProductManager')
  constructor(
    @inject(TYPES.Web3) private readonly web3,
    @inject('pull-interval') private readonly pullInterval,
    @inject(TYPES.CustomerDataAgent) private readonly customerDataAgent: ICustomerDataAgent,
    @inject(TYPES.SmartContract) private readonly smartContract: ISmartContract,
    @inject(TYPES.LastProcessedBlockDataAgent)
    private readonly lastProcessedBlockDataAgent: ILastProcessedBlockDataAgent
  ) {
    this.processEvent = this.processEvent.bind(this)
  }

  public async startEventListener() {
    this.eventPolling = true
    try {
      await this.processEvents()
    } catch (e) {
      this.logger.error(ErrorCode.UnexpectedError, ErrorName.UnexpectedError, e.message, { stacktrace: e.stack })
    }

    if (!this.eventPolling) {
      return
    }

    this.eventPollingTimer = setTimeout(async () => {
      if (!this.eventPolling) {
        return
      }
      await this.startEventListener()
    }, this.pullInterval)
  }

  public stopEventListener() {
    this.eventPolling = false
    clearTimeout(this.eventPollingTimer)
  }

  async setProducts(staticId: string, products: IProduct[]): Promise<void> {
    this.logger.debug('setProducts', {
      staticId,
      products
    })
    const onboarderContract = await this.smartContract.komgoOnboarder()
    await onboarderContract.addTextEntries(staticId, [{ key: 'komgoProducts', value: JSON.stringify(products) }], {
      from: (await this.web3.web3Instance.eth.getAccounts())[0]
    })
  }

  async processEvents() {
    this.logger.debug('Reading events...')
    const metaResolver = await this.smartContract.komgoMetaResolver()
    const komgoProductsChangedTopic = [this.web3.web3Instance.utils.soliditySha3('TextChanged(bytes32,string,string)')]
    const lastProcessedBlock = await this.lastProcessedBlockDataAgent.getLastProcessedBlock()
    const toBlock = await this.web3.web3Instance.eth.getBlockNumber()
    const fromBlock = lastProcessedBlock ? lastProcessedBlock.lastProcessedBlock + 1 : 1
    this.logger.info(`Reading block from ${fromBlock} to ${toBlock}`)
    let pastEvents
    try {
      pastEvents = await metaResolver.getPastEvents('TextChanged', {
        topics: komgoProductsChangedTopic,
        fromBlock,
        toBlock
      })
    } catch (e) {
      this.logger.error(ErrorCode.BlockchainTransaction, ErrorName.GetPastEventsError, e.message, {
        stacktrace: e.stack,
        komgoProductsChangedTopic,
        fromBlock
      })
      return
    }

    this.logger.info(`Got ${pastEvents.length} past events from ${metaResolver.address}`)
    await Promise.all(pastEvents.map(this.processEvent))
    await this.lastProcessedBlockDataAgent.setLastProcessedBlock(toBlock)
  }

  private async processEvent(event: any) {
    try {
      if (event.args._key !== 'komgoProducts') {
        return
      }
      const nodeId = event.args._node
      const products = event.args._value
      this.logger.info('Process event', {
        nodeId,
        products,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash
      })
      const komgoMetaResolver = await this.smartContract.komgoMetaResolver()
      const staticId = await komgoMetaResolver.staticId(nodeId)
      this.logger.info('Found member staticId', { nodeId, staticId })
      const productIds = JSON.parse(products).map(p => p.productId)
      await this.customerDataAgent.updateCustomer({
        products: productIds,
        memberNodeId: nodeId,
        memberStaticId: staticId,
        blockHeight: event.blockNumber
      })
    } catch (e) {
      if (!(e instanceof MongoError) || (!!e.stack && e.stack.indexOf(MONGO_DUPLICATE_KEY) === -1)) {
        this.logger.error(ErrorCode.DatabaseInvalidData, ErrorName.EventPersistenceError, e.message, {
          stacktrace: e.stack,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
          eventArgs: event.args
        })
      }
    }
  }
}
