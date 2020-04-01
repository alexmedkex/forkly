import Web3 from 'web3'
import { Log, TransactionReceipt } from 'web3-core'
import { Contract } from 'web3-eth-contract'

import { EventObject } from '../../../src/service-layer/EventObject'

export const ACCOUNT_PASSWORD = 'myPassword'
const defaultGasValues = {
  gasPrice: '0',
  gasLimitPerTransaction: 30000000
}

/**
 * In some cases there is no 'events' property and we must get the receipt
 * from the logs
 */
export function getEventObjectFromLog(log: Log): EventObject {
  const { data, logIndex, address: contractAddress, blockNumber, transactionIndex, transactionHash } = log
  return {
    contractAddress,
    data,
    blockNumber,
    transactionIndex,
    transactionHash,
    logIndex
  }
}

export function getEventObjectFromReceipt(receipt: TransactionReceipt, eventName: string, index?: number): EventObject {
  const events = receipt.events[eventName]

  const { raw, logIndex, address } = index !== undefined ? events[index] : events

  return {
    contractAddress: address,
    data: raw.data,
    blockNumber: receipt.blockNumber,
    transactionIndex: receipt.transactionIndex,
    transactionHash: receipt.transactionHash,
    logIndex
  }
}

export function getContract(abi: any, from: string, web3: Web3, address?: string) {
  return new web3.eth.Contract(abi, address, {
    data: undefined,
    from,
    gasPrice: defaultGasValues.gasPrice,
    gas: defaultGasValues.gasLimitPerTransaction
  })
}

export async function deploySmartContract(
  contract: Contract,
  data: string,
  web3: Web3,
  from: string,
  args: any[] = []
) {
  await web3.eth.personal.unlockAccount(from, ACCOUNT_PASSWORD, 2000)
  return new Promise<TransactionReceipt>((resolve, reject) => {
    contract
      .deploy({ data, arguments: args })
      .send({ from, gas: defaultGasValues.gasLimitPerTransaction, gasPrice: defaultGasValues.gasPrice })
      .once('receipt', receipt => resolve(receipt))
      .once('error', error => reject(error))
  })
}
